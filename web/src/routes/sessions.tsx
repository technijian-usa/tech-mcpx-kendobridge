/**
 * routes/Sessions.tsx
 * MCPX Admin Web — Live SSE event trace
 *
 * Responsibilities
 *  - Subscribe to the API Server-Sent Events endpoint (/sessions/stream).
 *  - Render a read-only rolling log (most recent first) without mock data.
 *  - Keep the component resilient: auto-reconnect is handled by the browser’s
 *    EventSource; we simply show connected/disconnected state via events.
 *
 * Notes
 *  - Uses KendoReact Grid purely for display; no editing or client-side writes.
 *  - We cap the buffer to 100 rows to avoid unbounded growth.
 *  - Authentication for SSE is handled in src/lib/sse.ts by appending
 *    ?access_token= when Security:SseRequireAuth=true (DB-driven).
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Grid, GridColumn as Column } from '@progress/kendo-react-grid';
import { connectSse } from '../lib/sse';

type Row = {
  /** Monotonic id for React keying */
  id: number;
  /** ISO timestamp payload or local timestamp for non-payload events */
  time: string;
  /** Event name/category (open|keepalive|error) */
  event: string;
};

const MAX_ROWS = 100;

export default function Sessions(): JSX.Element {
  const [rows, setRows] = useState<Row[]>([]);
  const [connected, setConnected] = useState<boolean>(false);
  const idRef = useRef<number>(1);
  const esRef = useRef<EventSource | null>(null);

  const push = (event: string, iso: string) => {
    const row: Row = { id: idRef.current++, event, time: new Date(iso).toLocaleString() };
    // Most recent first; trim buffer
    setRows(prev => [row, ...prev].slice(0, MAX_ROWS));
  };

  useEffect(() => {
    // Establish SSE connection to the API; lib will attach ?access_token= if available.
    esRef.current = connectSse('/sessions/stream', {
      onOpen: () => {
        setConnected(true);
        push('open', new Date().toISOString());
      },
      onMessage: (_type, data) => {
        // API currently sends keepalive events with an ISO timestamp string
        push('keepalive', String(data));
      },
      onError: () => {
        setConnected(false);
        push('error', new Date().toISOString());
      }
    });

    return () => {
      esRef.current?.close();
      esRef.current = null;
    };
  }, []);

  const statusText = useMemo(() => (connected ? 'Connected' : 'Disconnected'), [connected]);

  return (
    <section aria-labelledby="sessions-title">
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12 }}>
        <h2 id="sessions-title" style={{ margin: 0 }}>Sessions (SSE)</h2>
        <span aria-live="polite" style={{ opacity: 0.75 }}>{statusText}</span>
        <span style={{ marginLeft: 'auto', opacity: 0.65 }}>
          Showing latest {Math.min(rows.length, MAX_ROWS)} events (cap {MAX_ROWS})
        </span>
      </div>

      <Grid
        data={rows}
        style={{ maxHeight: 560 }}
      >
        <Column field="time" title="Time" width="240px" />
        <Column field="event" title="Event" />
      </Grid>
    </section>
  );
}
