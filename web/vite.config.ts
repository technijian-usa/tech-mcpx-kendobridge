/**
 * vite.config.ts
 * MCPX Admin Web (React 18 + Vite)
 *
 * Why this setup:
 * - Dev server runs on 5173 to match alpha seed RedirectUri.
 * - Proxies API routes to http://localhost:5000 (your ASP.NET Core API).
 * - Special handling for SSE path (/sessions/stream): disables proxy buffering
 *   and keeps HTTP/1.1 so EventSource works reliably during local dev.
 * - No opinionated build tweaks beyond sane defaults; artifacts go to /dist.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Helper to create simple proxy entries.
function api(target: string) {
  return {
    target,
    changeOrigin: true,
    secure: false,
    // Ensure HTTP/1.1 for SSE, and avoid compression buffering
    headers: {
      'Cache-Control': 'no-cache',
      'Accept-Encoding': ''
    }
  } as const;
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Expose to LAN if you want to test from other devices:
    // host: true,
    proxy: {
      // Basic API routes
      '/health': api('http://localhost:5000'),
      '/readiness': api('http://localhost:5000'),
      '/config': api('http://localhost:5000'),
      '/access': api('http://localhost:5000'),
      // SSE stream (keep HTTP/1.1 and disable buffering)
      '/sessions/stream': {
        ...api('http://localhost:5000'),
        ws: false, // SSE is not WebSocket; keep false to avoid websocket upgrades
        configure: (proxy) => {
          // Node-http-proxy option: ensure connection header not forcing keep-alive upgrades
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Connection', '');
          });
        }
      }
    }
  },
  build: {
    sourcemap: false,
    target: 'es2020',
    outDir: 'dist',
    emptyOutDir: true
  },
  // Keep base at '/' so paths resolve when served from root via nginx
  base: '/'
});
