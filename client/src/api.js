// Thin fetch wrapper around the TrailAsia API.
//
// In development the Vite dev server proxies `/api` straight to the
// TrailAsia API (see vite.config.js); in production this repo's own
// server/ does the same job (see server/src/server.js). Either way the
// browser only ever talks to this site's own origin, which is what lets
// the traveller refresh cookie (`trailasia_rt_traveller`) work without any
// CORS configuration on the TrailAsia API at all.
//
// The access token is kept in memory only — never localStorage — mirroring
// the staff client's own approach (see TrailAsia/docs/api/auth.md). Losing
// it on a page reload is fine: `bootstrap()` calls /auth/traveller/refresh
// on load and gets a new one from the cookie.

const BASE = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');

let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

class ApiRequestError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request(path, { method = 'GET', body, auth = false, retry = true } = {}) {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const headers = {};
  // Never set Content-Type for FormData — the browser has to add the
  // multipart boundary itself, and a hand-set header here would be missing it.
  if (!isFormData) headers['Content-Type'] = 'application/json';
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const response = await fetch(`${BASE}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    // A 204 has no body — that's fine, payload stays null.
  }

  if (response.ok) return payload ? payload.data : null;

  const error = payload && payload.error ? payload.error : { message: 'Something went wrong.' };

  // An expired traveller access token is refreshed once, transparently, the
  // same way the staff client does it — the caller never sees the 401.
  if (auth && retry && error.code === 'ACCESS_TOKEN_EXPIRED') {
    const refreshed = await refreshTravellerSession();
    if (refreshed) return request(path, { method, body, auth, retry: false });
  }

  throw new ApiRequestError(error.message, { status: response.status, code: error.code, details: error.details });
}

// --- Public site (no account needed) ----------------------------------------

export function listDestinations(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/public/destinations${query ? `?${query}` : ''}`);
}

export function getDestination(id) {
  return request(`/public/destinations/${id}`);
}

export function submitEnquiry(payload) {
  return request('/public/booking-enquiries', { method: 'POST', body: payload });
}

export function listTestimonials(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/public/testimonials${query ? `?${query}` : ''}`);
}

export function submitContactMessage(payload) {
  return request('/public/contact-messages', { method: 'POST', body: payload });
}

// --- Traveller sessions ------------------------------------------------------
//
// Reuses TrailAsia's existing traveller auth wholesale (see
// docs/api/auth.md#traveller-sessions) — this site does not stand up a
// second traveller identity system. A traveller only has an account once a
// consultant has confirmed their booking and invited them; someone
// enquiring for the first time uses the public form above instead.

export async function travellerLogin(email, password) {
  const data = await request('/auth/traveller/login', { method: 'POST', body: { email, password } });
  setAccessToken(data.accessToken);
  return data.traveller;
}

export async function travellerActivate(token, password) {
  const data = await request('/auth/traveller/activate', { method: 'POST', body: { token, password } });
  setAccessToken(data.accessToken);
  return data.traveller;
}

// One refresh at a time, shared by everyone who asks while it is running.
//
// Refresh tokens rotate, and the API treats a second use of the same one as
// theft: it ends every session the traveller has. Two callers refreshing at
// once are exactly that second use — and it happens without any attacker:
// React's StrictMode runs the boot effect twice in development, and whenever
// the 15-minute access token expires, the notification bell and whatever page
// is open both get a 401 in the same moment and both come here. Without this
// the traveller is signed out by their own browser, possibly on the SOS page.
let refreshInFlight = null;

export function refreshTravellerSession() {
  if (!refreshInFlight) {
    refreshInFlight = request('/auth/traveller/refresh', { method: 'POST' })
      .then(
        (data) => {
          setAccessToken(data.accessToken);
          return data.traveller;
        },
        () => {
          setAccessToken(null);
          return null;
        }
      )
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

export async function travellerLogout() {
  try {
    await request('/auth/traveller/logout', { method: 'POST' });
  } finally {
    setAccessToken(null);
  }
}

export function travellerMe() {
  return request('/auth/traveller/me', { auth: true });
}

// --- The signed-in traveller's own trips ------------------------------------

export function myTrips() {
  return request('/me/trips', { auth: true });
}

export function myTrip(bookingId) {
  return request(`/me/trips/${bookingId}`, { auth: true });
}

export function myTripPayments(bookingId) {
  return request(`/me/trips/${bookingId}/payments`, { auth: true });
}

/**
 * @param {object} fields  Document metadata (type, reference, issuer, dates, notes, filePath).
 * @param {File} [file]  An actual file to upload. When present the request is sent as
 *   multipart/form-data; when absent it's plain JSON — either way this is `POST /me/documents`.
 */
export function addMyDocument(fields, file) {
  if (!file) return request('/me/documents', { method: 'POST', body: fields, auth: true });

  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') form.append(key, value);
  });
  form.append('file', file);
  return request('/me/documents', { method: 'POST', body: form, auth: true });
}

/**
 * Downloads one of the traveller's own uploaded document files.
 *
 * Plain `<a href>` can't carry the bearer token, so this fetches the file
 * itself (refreshing the session first if needed, the same as any other
 * authed call) and hands back a `Blob` plus the filename the server sent —
 * the caller turns that into an object URL and clicks it, which is the only
 * way to trigger "Save As" for a fetched blob.
 */
export async function downloadMyDocumentFile(documentId) {
  const doFetch = async (retry = true) => {
    const response = await fetch(`${BASE}/me/documents/${documentId}/file`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      credentials: 'include',
    });
    if (response.status === 401 && retry) {
      const refreshed = await refreshTravellerSession();
      if (refreshed) return doFetch(false);
    }
    if (!response.ok) {
      let message = 'Could not download that file.';
      try {
        message = (await response.json()).error.message;
      } catch {
        // Fall back to the generic message above.
      }
      throw new ApiRequestError(message, { status: response.status });
    }
    const disposition = response.headers.get('Content-Disposition') || '';
    const match = disposition.match(/filename="?([^"]+)"?/);
    return { blob: await response.blob(), filename: match ? match[1] : 'document' };
  };
  return doFetch();
}

// --- Safety: SOS and location sharing, per trip ------------------------------
//
// The same `/safety/me` endpoints the staff client's phone-shaped preview
// uses. Everything is scoped to one booking, and the traveller's id always
// comes from the session, never from the request.

/** Consent state, last position sent, and any open alert — one call. */
export function mySafety(bookingId) {
  return request(`/safety/me?bookingId=${encodeURIComponent(bookingId)}`, { auth: true });
}

export function setMyLocationSharing(bookingId, granted) {
  return request('/safety/me/consent', { method: 'POST', body: { bookingId, granted }, auth: true });
}

/** Refused with a 403 unless sharing is on for this trip. */
export function sendMyPosition(bookingId, position) {
  return request('/safety/me/pings', { method: 'POST', body: { bookingId, ...position }, auth: true });
}

/**
 * Never gated on consent, and every field but the booking is optional — a
 * phone with no fix must still be able to raise one. Pressing it again while
 * an alert is open returns that alert rather than a second one.
 */
export function raiseMySos(bookingId, details = {}) {
  return request('/safety/me/sos', { method: 'POST', body: { bookingId, ...details }, auth: true });
}

export function withdrawMySos(alertId) {
  return request(`/safety/me/sos/${alertId}/cancel`, { method: 'POST', auth: true });
}

// --- The signed-in traveller's own documents, across every trip -------------

export function myDocuments() {
  return request('/me/documents', { auth: true });
}

// --- The signed-in traveller's own notifications -----------------------------
//
// The bell polls `unread-count` on an interval and opens the list on click —
// the same pattern the staff client uses for its own bell, just against the
// traveller-scoped endpoints under `/me` instead of `/notifications`.

export function myNotifications(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/me/notifications${query ? `?${query}` : ''}`, { auth: true });
}

export function myUnreadNotificationCount() {
  return request('/me/notifications/unread-count', { auth: true });
}

export function markMyNotificationRead(id) {
  return request(`/me/notifications/${id}/read`, { method: 'POST', auth: true });
}

export function markAllMyNotificationsRead() {
  return request('/me/notifications/read-all', { method: 'POST', auth: true });
}

export { ApiRequestError };
