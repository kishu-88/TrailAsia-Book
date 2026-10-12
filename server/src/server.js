'use strict';

require('dotenv').config();

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');

const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';
const PORT = Number.parseInt(process.env.PORT || '4100', 10);
const TRAILASIA_API_URL = process.env.TRAILASIA_API_URL || 'http://localhost:4000/api/v1';
// The client calls paths like `/api/v1/health` — already carrying the same
// `/api/v1` prefix TRAILASIA_API_URL ends in — so the proxy forwards them
// unchanged to the API's origin, rather than rewriting and risking a
// doubled-up `/api/v1/api/v1/...`.
const TRAILASIA_API_ORIGIN = new URL(TRAILASIA_API_URL).origin;

const app = express();

if (IS_PRODUCTION) app.set('trust proxy', 1);
app.disable('x-powered-by');

/**
 * `crossOriginResourcePolicy` off, not a wider CSP: this server has no
 * CORS configuration of its own to relax, because the browser only ever
 * talks to this one origin. Requests to the TrailAsia API happen server to
 * server, inside the proxy below — see the root README for why that
 * sidesteps CORS entirely rather than requiring the TrailAsia API's origin
 * allowlist to be widened.
 */
app.use(helmet({ crossOriginResourcePolicy: false }));

if (NODE_ENV !== 'test') app.use(morgan(IS_PRODUCTION ? 'combined' : 'dev'));

app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), proxying: TRAILASIA_API_URL });
});

/**
 * Everything under /api is forwarded to the real TrailAsia API, byte for
 * byte — including the traveller session cookie. Because the browser's only
 * connection is to this server, the Set-Cookie header that comes back is
 * stored against *this* origin, not the TrailAsia API's, with no Domain
 * rewriting needed: an ordinary reverse-proxy cookie, not a special case.
 */
app.use(
  '/api',
  createProxyMiddleware({
    target: TRAILASIA_API_ORIGIN,
    changeOrigin: true,
    // Express strips the `/api` mount prefix from req.url before this
    // middleware ever sees it, so `/api/v1/health` arrives here as
    // `/v1/health` — this puts it back before forwarding, rather than the
    // request silently losing its prefix on the way to the real API.
    pathRewrite: { '^/': '/api/' },
  })
);

// The built client, if it exists. In development there usually isn't one —
// `npm run dev` in client/ talks to the TrailAsia API through Vite's own
// proxy instead (see client/vite.config.js) and this server is only needed
// for /healthz and, if you want to exercise the production path locally,
// for `npm run build` in client/ first.
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) next();
  });
});

app.use((_req, res) => {
  res.status(404).json({ error: { message: 'Not found.' } });
});

if (require.main === module) {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`TrailAsia Book server listening on http://localhost:${PORT} (${NODE_ENV})`);
    // eslint-disable-next-line no-console
    console.log(`  proxying /api -> ${TRAILASIA_API_URL}`);
  });
}

module.exports = app;
