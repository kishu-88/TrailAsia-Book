import { useCallback, useEffect, useRef, useState } from 'react';
import {
  mySafety,
  raiseMySos,
  sendMyPosition,
  setMyLocationSharing,
  withdrawMySos,
} from '../api';

/**
 * SOS and location sharing for one trip.
 *
 * The rules here are the ones the safety module was built on, and they are
 * worth reading before changing anything.
 *
 * The SOS button never waits on anything. It renders before the safety
 * summary has loaded and stays there if that load fails — a traveller on a
 * bad connection must not be looking at a spinner where the button should
 * be. The position is a best effort with a short deadline, and the alert
 * goes out with or without it.
 *
 * It takes two taps. Not a browser confirm dialog, which blocks the page and
 * is easy to dismiss by accident, but a button that turns into a second,
 * differently worded one for a few seconds. One tap is too easy in a pocket.
 *
 * Location sharing is off until the traveller turns it on, per trip, and a
 * position is sent only when they tap. Nothing runs on a timer: a web page
 * cannot track in the background, and one that claimed to would quietly stop
 * the moment the screen locked.
 */

const ARM_SECONDS = 8;
const POLL_MS = 15000;
// How long an SOS waits for a position before going without one.
const SOS_FIX_DEADLINE_MS = 6000;

function readPosition({ timeout = 15000 } = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('This device cannot report its position.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        resolve({
          latitude: Number(coords.latitude.toFixed(6)),
          longitude: Number(coords.longitude.toFixed(6)),
          accuracyMetres: coords.accuracy ? Math.round(coords.accuracy) : undefined,
          altitudeMetres:
            coords.altitude !== null && coords.altitude !== undefined
              ? Math.round(coords.altitude)
              : undefined,
        }),
      (error) =>
        reject(
          new Error(
            error.code === 1
              ? 'Location permission is blocked for this site. Allow it in your browser settings and try again.'
              : 'Could not get your position. Move somewhere with a clearer view of the sky and try again.'
          )
        ),
      { enableHighAccuracy: true, timeout, maximumAge: 60000 }
    );
  });
}

/** A position if one arrives in time, otherwise nothing. Never rejects. */
function positionForSos() {
  const fix = readPosition({ timeout: SOS_FIX_DEADLINE_MS }).then(
    ({ latitude, longitude, accuracyMetres }) => ({ latitude, longitude, accuracyMetres }),
    () => ({})
  );
  const deadline = new Promise((resolve) => {
    setTimeout(() => resolve({}), SOS_FIX_DEADLINE_MS + 500);
  });
  return Promise.race([fix, deadline]);
}

function whenText(value) {
  if (!value) return null;
  const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export default function TripSafety({ bookingId }) {
  const [summary, setSummary] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [busy, setBusy] = useState(null);
  const [notice, setNotice] = useState(null);
  const [note, setNote] = useState('');
  const [armed, setArmed] = useState(null); // 'sos' | 'withdraw' | null

  const armTimer = useRef(null);
  // Set when this screen closes the alert itself, so the poll can tell "you
  // withdrew it" from "the agency closed it".
  const closedHere = useRef(false);
  const hadOpenAlert = useRef(false);

  const load = useCallback(async () => {
    try {
      const next = await mySafety(bookingId);
      if (hadOpenAlert.current && !next.openAlert && !closedHere.current) {
        setNotice({ tone: 'info', text: 'The agency has closed your alert.' });
      }
      hadOpenAlert.current = Boolean(next.openAlert);
      closedHere.current = false;
      setSummary(next);
      setLoadError(null);
    } catch (error) {
      setLoadError(error.message);
    }
  }, [bookingId]);

  useEffect(() => {
    setSummary(null);
    setNotice(null);
    hadOpenAlert.current = false;
    load();
    return () => clearTimeout(armTimer.current);
  }, [load]);

  const alertId = summary?.openAlert?.id;
  useEffect(() => {
    // Only while an alert is open: that is when "has anyone seen it yet" is
    // the one thing the traveller is waiting to find out.
    if (!alertId) return undefined;
    const timer = setInterval(load, POLL_MS);
    return () => clearInterval(timer);
  }, [alertId, load]);

  function arm(what) {
    clearTimeout(armTimer.current);
    setArmed(what);
    // Disarms itself, so a button left armed in a pocket does not stay armed.
    armTimer.current = setTimeout(() => setArmed(null), ARM_SECONDS * 1000);
  }

  async function sendSos() {
    clearTimeout(armTimer.current);
    setBusy('sos');
    setNotice(null);

    const position = await positionForSos();

    try {
      const alert = await raiseMySos(bookingId, {
        ...position,
        message: note.trim() || undefined,
      });
      setArmed(null);
      setNote('');
      hadOpenAlert.current = true;
      setSummary((current) => (current ? { ...current, openAlert: alert } : current));
      setNotice({
        tone: 'info',
        text:
          alert.latitude === null || alert.latitude === undefined
            ? 'Alert sent, but without your position. If you can, tell the agency where you are. Keep your phone with you.'
            : 'Alert sent with your position. The agency can see it now. Keep your phone with you.',
      });
      load();
    } catch (error) {
      setArmed(null);
      setNotice({
        tone: 'error',
        text: `The alert did not go through: ${error.message} Call local emergency services, then try again.`,
      });
    } finally {
      setBusy(null);
    }
  }

  async function withdrawSos() {
    clearTimeout(armTimer.current);
    setBusy('withdraw');
    try {
      closedHere.current = true;
      await withdrawMySos(summary.openAlert.id);
      setArmed(null);
      setNotice({ tone: 'info', text: 'Alert withdrawn. The agency has been told you are fine.' });
      await load();
    } catch (error) {
      closedHere.current = false;
      setNotice({ tone: 'error', text: error.message });
    } finally {
      setBusy(null);
    }
  }

  async function setSharing(granted) {
    setBusy('consent');
    setNotice(null);
    try {
      await setMyLocationSharing(bookingId, granted);
      await load();
      setNotice({
        tone: 'info',
        text: granted
          ? 'Sharing is on. Your position is sent only when you tap the button below.'
          : 'Sharing is off. Nothing more will be recorded.',
      });
    } catch (error) {
      setNotice({ tone: 'error', text: error.message });
    } finally {
      setBusy(null);
    }
  }

  async function shareNow() {
    setBusy('ping');
    setNotice(null);
    try {
      const position = await readPosition();
      await sendMyPosition(bookingId, position);
      await load();
      setNotice({ tone: 'info', text: 'Position sent to the agency.' });
    } catch (error) {
      setNotice({ tone: 'error', text: error.message });
    } finally {
      setBusy(null);
    }
  }

  const openAlert = summary?.openAlert;
  const sharing = Boolean(summary?.consent?.granted);

  return (
    <div className="safety">
      {/* --- SOS ----------------------------------------------------------- */}

      {openAlert ? (
        <div className="safety-alert" role="status">
          <p className="safety-alert__title">
            {openAlert.status === 'acknowledged'
              ? 'The agency has seen your alert'
              : 'Your alert has been sent'}
          </p>
          <p>
            Raised {whenText(openAlert.raisedAt)}.{' '}
            {openAlert.status === 'acknowledged'
              ? `${openAlert.acknowledgedBy?.fullName || 'Someone at the office'} is working on it.`
              : 'It is waiting to be picked up. This page checks again every few seconds.'}
          </p>
          <p className="meta">
            {openAlert.latitude === null || openAlert.latitude === undefined
              ? 'No position was sent with it.'
              : 'Your position was sent with it.'}
            {openAlert.message ? ` Your note: “${openAlert.message}”` : ''}
          </p>
          {armed === 'withdraw' ? (
            <button type="button" className="secondary" onClick={withdrawSos} disabled={busy === 'withdraw'}>
              {busy === 'withdraw' ? 'Withdrawing…' : 'Tap again to withdraw'}
            </button>
          ) : (
            <button type="button" className="secondary" onClick={() => arm('withdraw')}>
              I am safe — withdraw this alert
            </button>
          )}
        </div>
      ) : (
        <>
          {armed === 'sos' ? (
            <button
              type="button"
              className="sos-button sos-button--armed"
              onClick={sendSos}
              disabled={busy === 'sos'}
            >
              {busy === 'sos' ? 'Sending…' : 'Tap again to send the SOS'}
            </button>
          ) : (
            <button type="button" className="sos-button" onClick={() => arm('sos')}>
              SOS — I need help
            </button>
          )}
          <p className="safety__hint">
            Two taps, so it cannot go off in your pocket. It sends your position if your phone
            has one. Local emergency services are faster than we are — call them first if you
            can.
          </p>
          <label className="safety__note">
            <span>Add a few words (optional)</span>
            <input
              value={note}
              maxLength={500}
              placeholder="What is happening, or where you are"
              onChange={(event) => setNote(event.target.value)}
            />
          </label>
        </>
      )}

      {notice && (
        <p className={notice.tone === 'error' ? 'error' : 'notice'} role="status">
          {notice.text}
        </p>
      )}

      {/* --- Location sharing ---------------------------------------------- */}

      <div className="card safety-card">
        <div className="safety-card__header">
          <h3>Location sharing</h3>
          {summary && (
            <span className={`status-pill ${sharing ? 'status-pill--on' : ''}`}>
              {sharing ? 'On' : 'Off'}
            </span>
          )}
        </div>

        {!summary && !loadError && <p className="meta">Loading your settings…</p>}

        {loadError && (
          <>
            <p className="error">
              Could not load your sharing settings: {loadError} The SOS button above still works.
            </p>
            <button type="button" className="secondary" onClick={load}>
              Try again
            </button>
          </>
        )}

        {summary && (
          <>
            <p>{summary.consentStatement}</p>

            {sharing ? (
              <>
                <p className="meta">
                  Last position sent:{' '}
                  {summary.lastSeen ? whenText(summary.lastSeen.recordedAt) : 'not yet'}
                </p>
                <div className="safety-card__actions">
                  <button type="button" onClick={shareNow} disabled={busy === 'ping'}>
                    {busy === 'ping' ? 'Getting your position…' : 'Send my position now'}
                  </button>
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => setSharing(false)}
                    disabled={busy === 'consent'}
                  >
                    Stop sharing
                  </button>
                </div>
              </>
            ) : (
              <button type="button" onClick={() => setSharing(true)} disabled={busy === 'consent'}>
                {busy === 'consent' ? 'Turning on…' : 'Turn on location sharing'}
              </button>
            )}

            <p className="meta safety-card__foot">
              Sent once each time you tap, never in the background. Position records are deleted{' '}
              {summary.retentionDays} days after your trip ends. Pressing SOS sends your position
              whether sharing is on or off.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
