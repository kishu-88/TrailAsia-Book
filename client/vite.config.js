import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Scaffold only — no src/main.jsx exists yet, so `npm run dev` has nothing to
// serve. Left here so the dev-server port and API proxy are decided and
// documented before the real app is built, not invented on the fly then.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      // Talks directly to the TrailAsia API for now (traveller sign-in and
      // read-only data). Whether booking-creation calls also go straight
      // here, or through this repo's own server/, is one of the open
      // questions in the root README.
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
