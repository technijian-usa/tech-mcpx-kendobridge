/**
 * routes/Config.tsx
 * MCPX Admin Web — Read-only configuration view
 *
 * Responsibilities
 *  - Fetch and display the NON-SECRET key/value pairs from the API (/config).
 *  - Keep strictly read-only (no edits/writes in the Admin portal).
 *
 * Design notes
 *  - Uses the shared API helper (src/lib/api.ts) which attaches Authorization
 *    when MSAL tokens are available (scope-driven).
 *  - The API endpoint is scope-gated server-side by "RequireScope".
 *  - We call useExposeMsal() so the API helper can acquire tokens silently.
 */

import React, { useEffect, useState } from 'react';
import { Grid, GridColumn as Column } from '@progress/kendo-react-grid';
import type { PublicConfig } from '../types';
import { createApi, useExposeMsal } from '../lib/api';

type Row = {
  Key: string;
  Value: string | null;
};

export default function ConfigView({ cfg }: { cfg: PublicConfig }): JSX.Element {
  const api = createApi(cfg);
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Make MSAL instance/accounts discoverable by the API helper
  useExposeMsal();

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api
      .get<Row[]>('/config')
      .then((data) => {
        if (!alive) return;
        // Defensive normalization: ensure array of { Key, Value }
        const normalized = Array.isArray(data)
          ? data.map((r: any) => ({
              Key: String(r.Key ?? r.key ?? ''),
              Value: r.Value ?? r.value ?? null
            }))
          : [];
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
    <section aria-labelledby="config-title">
      <h2 id="config-title" style={{ marginBottom: 12 }}>Configuration (read-only)</h2>

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
          <strong>Failed to load configuration.</strong>
          <div style={{ marginTop: 6, whiteSpace: 'pre-wrap' }}>{err}</div>
        </div>
      )}

      <Grid
        data={rows}
        style={{ maxHeight: 560 }}
        loading={loading}
      >
        <Column field="Key" title="Key" width="360px" />
        <Column field="Value" title="Value" />
      </Grid>

      <p style={{ opacity: 0.75, marginTop: 12 }}>
        Values are sourced from <code>dbo.AppConfig</code> via stored procedures and are intentionally non-secret.
        Secrets belong in environment configuration (e.g., GitHub Environments, Key Vault) and never appear here.
      </p>
    </section>
  );
}
