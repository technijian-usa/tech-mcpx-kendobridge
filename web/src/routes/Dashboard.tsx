/**
 * routes/Dashboard.tsx
 * MCPX Admin Web — Overview screen
 *
 * Responsibilities
 *  - Show live SSE connectivity status and last keepalive timestamp.
 *  - Provide a simple, glanceable health summary without mock data.
 *
 * Notes
 *  - Uses the shared SSE helper (src/lib/sse.ts) to connect to /sessions/stream.
 *  - Keeps UI dependencies minimal (Kendo Layout/Card for structure).
 */

import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@progress/kendo-react-layout';
import { connectSse } from '../lib/sse';

export default function Dashboard(): JSX.Element {
  const [connected, setConnected] = useState<boolean>(false);
  const [lastIso, setLastIso] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Establish SSE connection; helper will add ?access_token= when available.
    esRef.current = connectSse('/sessions/stream', {
      onOpen: () => setConnected(true),
      onMessage: (_, data) => setLastIso(String(data)),
      onError: () => setConnected(false)
    });

    return () => {
      // Ensure the stream is closed on unmount to avoid leaks.
      esRef.current?.close();
      esRef.current = null;
    };
  }, []);

  return (
    <section aria-labelledby="dashboard-title">
      <h2 id="dashboard-title" style={{ marginBottom: 12 }}>Dashboard</h2>

      <Card style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', rowGap: 8 }}>
          <span style={{ opacity: 0.75 }}>SSE Connection</span>
          <strong aria-live="polite">{connected ? 'Connected' : 'Disconnected'}</strong>

          <span style={{ opacity: 0.75 }}>Last keepalive</span>
          <span>
            {lastIso ? new Date(lastIso).toLocaleString() : '—'}
          </span>
        </div>
      </Card>

      <p style={{ opacity: 0.8 }}>
        The Admin API emits lightweight <code>keepalive</code> events on a cadence defined by
        <code> Sse:HeartbeatSeconds</code> (see DB AppConfig). When disconnected, check network,
        CORS allow-list, and API readiness.
      </p>
    </section>
  );
}
