# TrailAsia Book — server

Node/Express. Not a second database and not a second traveller-identity
system — a thin production layer that:

1. Serves the built client (`client/dist`, after `npm run build` there).
2. Proxies everything under `/api` to the real TrailAsia API
   (`TRAILASIA_API_URL`), forwarding the traveller session cookie
   unchanged. No business logic lives here; see
   `../TrailAsia/server/src/controllers/public.controller.js` for what the
   proxy is actually forwarding to.

Not needed for day-to-day development — `client/`'s own Vite dev server
proxies `/api` straight to the TrailAsia API, so `npm run dev` in `client/`
alone is enough while you're working on the UI. Run this when you want to
exercise the production path locally, or to actually deploy:

```
cd ../client && npm run build
cd ../server && npm install && npm start
```

`GET /healthz` reports what it's proxying to, for a quick sanity check.

Reserved dev port: **4100** (TrailAsia's own staff API uses 4000).
