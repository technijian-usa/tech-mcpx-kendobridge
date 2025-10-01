/**
 * app.tsx
 * MCPX Admin Web — root application component.
 *
 * Responsibilities
 *  - Fetch non-secret public config from the API (/config/public).
 *  - Boot MSAL (Azure AD) with the fetched settings (no hard-coded IDs).
 *  - Mount app layout (TopBar + SideNav) and register routes.
 *  - Keep UI read-only and free of placeholder data.
 *
 * Design notes
 *  - If /config/public returns 204 (no content), we show a friendly message.
 *  - CORS allow-list is enforced on the API; here we optionally surface a hint
 *    if the current origin is not present in the allow-list.
 *  - Route components are small, focused screens; anything auth/token-aware
 *    goes through the helpers in src/lib/* (api.ts, msalApp.tsx, sse.ts).
 */

import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import TopBar from './components/TopBar';
import SideNav from './components/SideNav';

import Dashboard from './routes/Dashboard';
import Sessions from './routes/Sessions';
import ConfigView from './routes/Config';
import AccessView from './routes/Access';

import { fetchPublicConfig } from './lib/config';
import { MsalBoot } from './lib/msalApp';
import type { PublicConfig } from './types';

export default function App() {
  const [cfg, setCfg] = useState<PublicConfig | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Fetch public (non-secret) boot configuration exactly once.
  useEffect(() => {
    const ac = new AbortController();
    fetchPublicConfig(ac.signal)
      .then(setCfg)
      .catch((e) => setErr(e instanceof Error ? e.message : String(e)));
    return () => ac.abort();
  }, []);

  // Optional UX hint: detect when current origin isn't in the allow-list.
  const corsHint = useMemo(() => {
    if (!cfg?.cors?.allowedOrigins?.length) return null;
    try {
      const current = window.location.origin.toLowerCase();
      const list = cfg.cors.allowedOrigins.map((o) => String(o).toLowerCase());
      return list.includes(current) ? null : `This origin (${current}) is not yet in the API allow-list.`;
    } catch {
      return null;
    }
  }, [cfg]);

  // Error / loading states kept intentionally simple and obvious.
  if (err) {
    return (
      <div style={{ padding: 24, color: '#b00020' }}>
        <h3>Failed to load configuration</h3>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{err}</pre>
        <p>
          Ensure the API is reachable and that <code>dbo.AppConfig</code> contains the expected keys
          (see seed script), then refresh this page.
        </p>
      </div>
    );
  }

  if (!cfg) {
    return (
      <div style={{ padding: 24 }}>
        <h3>Loading…</h3>
        <p>Fetching public configuration from the API.</p>
      </div>
    );
  }

  // If API returned 204 (we map it to empty object), guide the operator.
  const isEmpty =
    !cfg.azureAd?.tenantId &&
    !cfg.azureAd?.clientId &&
    !cfg.sse?.heartbeatSeconds &&
    !(cfg.cors?.allowedOrigins && cfg.cors.allowedOrigins.length > 0);

  if (isEmpty) {
    return (
      <div style={{ padding: 24 }}>
        <h3>Configuration not found</h3>
        <p>
          The API responded without public configuration. Verify your database seeds for
          <code> AzureAd:TenantId</code>, <code>AzureAd:ClientId</code>, <code>AzureAd:RedirectUri</code>,{' '}
          <code>AzureAd:Scope</code>, <code>Sse:HeartbeatSeconds</code> and the CORS allow-list, then reload.
        </p>
      </div>
    );
  }

  return (
    <MsalBoot cfg={cfg}>
      <BrowserRouter>
        <TopBar />
        <SideNav>
          {corsHint && (
            <div
              role="note"
              style={{
                margin: '8px 0 16px',
                padding: '8px 12px',
                borderLeft: '4px solid #ffb020',
                background: '#fff7e6'
              }}
            >
              {corsHint}
            </div>
          )}

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/config" element={<ConfigView cfg={cfg} />} />
            <Route path="/access" element={<AccessView cfg={cfg} />} />

            {/* Fallback: keep routing clean */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SideNav>
      </BrowserRouter>
    </MsalBoot>
  );
}
