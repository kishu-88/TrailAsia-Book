# TrailAsia Book — client

React + Vite. The public booking UI: browse destinations, submit an enquiry,
sign in if you already have portal access, view your trip.

Talks to the TrailAsia API at `VITE_API_BASE_URL` (default `/api/v1`,
proxied to `http://localhost:4000` by `vite.config.js` in development — see
the root README for how that works in production).

## Pages

| Route | What it does |
| --- | --- |
| `/` , `/destinations` | Browse published destinations |
| `/destinations/:id` | Destination detail + the enquiry form |
| `/enquiry-sent` | Confirmation, with the booking reference |
| `/sign-in` | Traveller sign-in (existing portal access only) |
| `/activate?token=…` | First-time password setup from a consultant's invite link |
| `/trips`, `/trips/:id` | The signed-in traveller's own bookings — requires sign-in |

`src/api.js` is the one place that talks to the network; every page goes
through it. `src/context/TravellerAuthContext.jsx` holds the sign-in state
and silently refreshes the access token from the traveller cookie on load.

## Local development

```
npm install
npm run dev
```

Reserved dev port: **5174** (TrailAsia's own staff client uses 5173).
