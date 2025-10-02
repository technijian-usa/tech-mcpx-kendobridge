/**
 * routes/Access.tsx
 * MCPX Admin Web — DB-driven CORS allow-list (read-only)
 *
 * Responsibilities
 *  - Fetch and display the list of allowed origins from the API (/access/allowlist).
 *  - Keep strictly read-only (no editing in Admin portal).
 *
 * Design notes
 *  - Uses the shared API helper (src/lib/api.ts) which attaches Authorization
 *    when MSAL tokens are available (scope-driven).
 *  - The API endpoint is scope-gated by the server policy ("RequireScope").
 *  - We call useExposeMsal() so the API helper can acquire tokens silently.
 */

import React, { useEffect, useState } from 'react';
import { Grid, GridColumn as Column } from '@progress/kendo-react-grid';
import type { PublicConfig } from '../types';
import { createApi, useExposeMsal } from '../lib/api';

type Row = { Origin: string };

export default function AccessView({ cfg }: { cfg: PublicConfig }): JSX.Element {
  const api = createApi(cfg);
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Make MSAL instance/accounts discoverable by the API helper.
  useExposeMsal();

  useEffect(() => {
    let alive = true;
    setLoading(true);

    api
      .get<string[]>('/access/allowlist')
      .then((list) => {
        if (!alive) return;
        const normalized = Array.isArray(list) ? list.map((o) => ({ Origin: String(o) })) : [];
        setRows(normalized);
        setErr(null);
      })
      .catch((e: unknown) => {
        if (!alive) return;
        setErr(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // fetch once on mount

  return (
    <section aria-labelledby="access-title">
      <h2 id="access-title" style={{ marginBottom: 12 }}>Access Allowlist (read-only)</h2>

      {err && (
        <div
          role="alert"
          style={{
            margin: '8px 0 16px',
            padding: '8px 12px',
            borderLeft: '4px solid #b00020',
            background: '#fde7e9'
          }}
        >
          <strong>Failed to load allow-list.</strong>
          <div style={{ marginTop: 6, whiteSpace: 'pre-wrap' }}>{err}</div>
        </div>
      )}

      <Grid data={rows} loading={loading} style={{ maxHeight: 560 }}>
        <Column field="Origin" title="Origin" />
      </Grid>

      <p style={{ opacity: 0.75, marginTop: 12 }}>
        Origins are stored in <code>dbo.Security_AllowedOrigin</code> and served via stored procedures.
        Update the list via DB migrations/seeds per environment. The API applies this list dynamically
        to CORS (no code changes required).
      </p>
    </section>
  );
}
