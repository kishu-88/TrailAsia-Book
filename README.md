# TrailAsia Book

The public, traveller-facing booking website for TrailAsia — where someone
finds a trip and sends an enquiry, as opposed to `../TrailAsia/`, which is
the internal staff portal (consultants, coordinators, finance, admin) plus
the traveller safety/sign-in portal that already lives inside it.

**Status: first working slice, now with a real brand, richer destination
content, and a fuller traveller account area.** Browse published
destinations (photo, summary, highlights, price-from, fitness level, best
time to visit, packing list, culture notes, testimonials), submit a booking
enquiry with no account — optionally for more than one destination at once
— and (for someone who already has portal access from a confirmed booking)
sign in and see their trip: itinerary, payment status, and a place to add
their own documents. No payment *collection* yet — see **What's still
open** below.

## How it works

Bookings, destinations and travellers all live in the one TrailAsia
database, reached through the existing TrailAsia API
(`../TrailAsia/server`, default `http://localhost:4000/api/v1`). This repo
does not have a database of its own.

- **`client/`** — React + Vite. Talks to `/api/v1/*` on its own origin; in
  development that's proxied straight to the TrailAsia API by Vite (see
  `client/vite.config.js`), and in production by this repo's own server.
- **`server/`** — Node/Express. In production it serves the built client and
  proxies `/api/*` to the TrailAsia API, forwarding the traveller session
  cookie unchanged. It carries no business logic of its own — every rule
  (validation, notifications, what happens to the party or the itinerary)
  lives in the TrailAsia API, at `../TrailAsia/server/src/controllers/public.controller.js`
  and `.../services/booking.service.js` (`createPublicEnquiry`). This
  answers the open question the scaffold phase left unresolved: booking
  creation is a TrailAsia API concern, not something duplicated here.

Because the browser only ever talks to this site's own origin, no CORS
configuration on the TrailAsia API was needed to make this work.

## What a visitor can do

1. **Browse destinations** (`GET /public/destinations`) — no account
   needed. Each card and each destination page carries whatever marketing
   and travel-guide content staff have entered (photo, summary, highlights,
   duration, price-from, best time to visit, fitness level, what to pack,
   culture notes) plus, on the destination page, a list of popular tourist
   attractions within that country, a "things to know" quick-facts grid
   (currency, language, time zone, visa, plugs), and that destination's
   published testimonials.
2. **Send a booking enquiry** (`POST /public/booking-enquiries`) — name,
   email, a lead destination and a few optional details (rough dates,
   party size, a message, and up to four more destinations if they're
   planning a multi-leg trip). No password, no account created on the spot.
   On the TrailAsia API side this finds-or-creates a traveller record by
   email and opens a normal `enquiry`-stage booking, with one itinerary
   segment per destination chosen, in the same pipeline staff already
   work from — see `../TrailAsia/docs/api/public.md`. The form autosaves a
   draft to the browser's own storage as they type, so a closed tab doesn't
   cost them the form.
3. **Sign in**, if they already have portal access from a confirmed booking
   (issued by a consultant the normal way — see
   `../TrailAsia/docs/api/auth.md#traveller-sessions`) — and see their trip
   under "My trips": the itinerary, their payment plan and what's still
   owed (`GET /me/trips/:id/payments`), their document checklist, and a
   form to add their own documents — a real file upload (PDF/JPEG/PNG/WebP)
   or just a link, whichever's easier — via `POST /me/documents` (always
   lands as "submitted"; verifying it stays a staff job). This site does not
   add a second traveller identity system; it reuses TrailAsia's existing
   one.
4. **Raise an SOS and share their location**, once signed in. The red **SOS**
   link in the nav opens `/safety` from any page; the same panel sits on
   each trip's own page. This is the safety module TrailAsia already had —
   the same `/safety/me` endpoints, the same staff safety desk on the other
   end — reachable from this site for the first time. The rules are the
   module's own (`../TrailAsia/docs/api/safety.md`): the SOS takes two taps
   and is never refused, it sends a position if the phone gives one within
   a few seconds and goes without one if not, location sharing is off until
   the traveller turns it on for that trip, and a position is sent only when
   they tap. While an alert is open the page checks every 15 seconds, so the
   traveller sees when someone at the office has picked it up.
   Reading a position needs a secure page: `localhost` in development,
   HTTPS anywhere else. Over plain HTTP the browser refuses, and the SOS
   still goes out without one.
5. **Read about the brand, and send a general message.** `/about` is a hub
   linking to four brand pages — Our Story, Meet the Team, Why Choose Us,
   Responsible &amp; Sustainable Travel — plus a dedicated `/contact` page
   with a form wired to `POST /public/contact-messages` (see
   `../TrailAsia/docs/api/public.md`). A contact message is its own record,
   not a booking enquiry — it notifies the same trip-editor staff but never
   creates a `Traveller` or `Booking`. `/faq` (what's actually implemented
   today — how enquiries work, document verification, the opt-in safety
   check-in, and that there is no online payment yet) and `/terms` (what's
   collected through this site and how long it's kept, including the
   location-ping retention window) round out the footer.

## Brand

A cohesive visual identity applied across every page, not just the new
content pages — colors, type and a logo mark, defined once as CSS custom
properties in `client/src/index.css` and an inline-SVG `Logo.jsx`:

- **Palette.** A warm cream/charcoal base (`--paper`/`--ink`, carried over
  from the scaffold) with a forest-green primary accent (`--accent`,
  unchanged from earlier phases so nothing that already shipped had to be
  re-themed) plus two new accents: terracotta for secondary emphasis and
  callouts, and gold/sky for the fitness-level badges on destination cards.
- **Type.** Headings and the wordmark are set in Fraunces (a display serif,
  loaded from Google Fonts); body copy, forms and nav are Inter, for
  legibility in the enquiry and contact forms specifically.
- **Logo.** An inline SVG mountain mark (three overlapping peaks — the
  Himalaya focus the agency started with) plus the wordmark, one component
  (`Logo.jsx`) used in both the nav and the footer, so there's no image
  asset to keep in sync.

## Invitation links

For a traveller's activation link to open this site rather than the
phone-shaped screens inside the staff client, set
`TRAVELLER_PORTAL_URL` in `../TrailAsia/server/.env` to this site's address
(`http://localhost:5174` in development) and restart the API. The emailed
link and the one staff copy from the invite dialog both follow it.

## What's still open

Carried over from the scaffold phase, still genuinely undecided:

1. **Payments.** No provider is chosen. A traveller cannot pay a deposit or
   an instalment from this site yet — that is still a manual, staff-side
   ledger (see `../TrailAsia/docs/api/README.md`).
2. **Destination data caching.** Right now every page view calls the
   TrailAsia API live. Fine at this scale; worth revisiting if traffic ever
   makes that a real cost.
3. **Deployment target and domain** for this site.
4. **No admin UI for marketing or travel-guide content.** `summary`,
   `highlights`, `bestTimeToVisit`, `whatToPack`, etc. are all real columns
   on `destinations`, but staff can only set them by editing the database
   directly (or via a migration seed, as the six launch destinations are) —
   same gap already noted for testimonials.

## Layout

```
TrailAsia-Book/
├── client/          React + Vite — the public booking UI (port 5174 in dev)
└── server/          Node/Express — production static host + API proxy (port 4100)
```

## Local development

### Quick start (Windows)

```
start.bat      REM every day: opens the TrailAsia API and this site's client, each in its own window
```

`start.bat` starts the TrailAsia API first (from the sibling `../TrailAsia/server`
checkout) and waits for it to answer on `/health` before starting this site's
client — the same order-of-operations `../TrailAsia/start.bat` uses, and for
the same reason: this client calls the API the moment it loads. It assumes
`../TrailAsia` has already been set up once with its own `setup.bat` (see
`../TrailAsia/README.md`) and this site's own `client/node_modules` exists
(`cd client && npm install`, one time). It's also safe to run twice — a port
already answering the right thing is reused rather than fought over.

It does not start this repo's own `server/` — see why below — so opening
this site is just those two windows plus a browser tab.

### By hand

```
# Terminal 1 — the TrailAsia API this site depends on
cd ../TrailAsia/server && npm run dev

# Terminal 2 — this site's client (talks to the API above via Vite's proxy)
cd client && npm install && npm run dev
```

`server/` is not needed for day-to-day development — the client's own Vite
dev server proxies `/api` straight to the TrailAsia API. It exists for the
production path: `cd client && npm run build`, then `cd ../server && npm
install && npm start` to serve the built client and proxy `/api` for real.

Copy `client/.env.example` to `client/.env` and `server/.env.example` to
`server/.env` first; both default to sensible localhost values.
