import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@progress/kendo-react-layout';
import { Notification, NotificationGroup } from '@progress/kendo-react-notification';
import { connectSse } from '../lib/sse';

export default function Dashboard() {
  const [lastPing, setLastPing] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<EventSource | null>(null);

  useEffect(() => {
    ref.current = connectSse('/sessions/stream', {
      onOpen: () => setOpen(true),
      onMessage: (_, data) => setLastPing(new Date(data)),
      onError: () => setOpen(false)
    });
    return () => ref.current?.close();
  }, []);

  return (
    <>
      <Card style={{ padding: 16, marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Dashboard</h2>
        <p>Live connection: {open ? 'Connected' : 'Disconnected'}</p>
        <p>Last keepalive: {lastPing ? lastPing.toLocaleString() : '—'}</p>
      </Card>

      <NotificationGroup style={{ right: 16, bottom: 16, position: 'fixed' }}>
        {open ? <Notification type={{ style: 'success', icon: true }}>SSE connected</Notification>
              : <Notification type={{ style: 'warning', icon: true }}>SSE disconnected</Notification>}
      </NotificationGroup>
    </>
  );
}
