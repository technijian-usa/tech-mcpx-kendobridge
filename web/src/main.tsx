/**
 * main.tsx
 * MCPX Admin Web — application entrypoint for Vite + React 18.
 *
 * Responsibilities:
 *  - Load the ThemeBuilder-generated Fluent 2 theme (single source of truth).
 *  - Mount the root React component (`App`) into #root.
 *
 * Notes:
 *  - Do NOT import any other Kendo base-theme here. The generated package
 *    already includes the base Fluent theme + your overrides.
 *  - Keep this file minimal; application wiring lives in src/app.tsx.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';

// Load the ThemeBuilder output (Fluent 2 base + your overrides).
// This import must exist somewhere under /src for CI's theme-guard to pass.
import 'mcpx-kendobridge/dist/scss/index.scss';

// Root application (router, auth boot, layout, routes).
import App from './app';

// Mount React into the HTML shell (see /web/index.html)
const container = document.getElementById('root');
if (!container) {
  // This should never happen unless index.html changed.
  throw new Error('Root element #root not found. Check /web/index.html.');
}

createRoot(container).render(<App />);
