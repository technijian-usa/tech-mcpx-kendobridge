import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Forward API during local dev; in prod, serve behind same origin.
      '/health': 'http://localhost:5000',
      '/readiness': 'http://localhost:5000',
      '/config': 'http://localhost:5000',
      '/access': 'http://localhost:5000',
      '/sessions': 'http://localhost:5000'
    }
  },
  build: {
    sourcemap: false
  }
});
