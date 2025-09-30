import React, { useEffect, useRef, useState } from 'react';
import { Grid, GridColumn as Column } from '@progress/kendo-react-grid';
import { connectSse } from '../lib/sse';

type Row = { id: number; time: string; event: string };

export default function Sessions() {
  const [rows, setRows] = useState<Row[]>([]);
  const ref = useRef<EventSource | null>(null);
  const push = (event: string, timeIso: string) =>
    setRows(prev => [{ id: Date.now(), event, time: new Date(timeIso).toLocaleString() }, ...prev].slice(0, 100));

  useEffect(() => {
    ref.current = connectSse('/sessions/stream', {
      onOpen: () => push('open', new Date().toISOString()),
      onMessage: (_, data) => push('keepalive', data),
      onError: () => push('error', new Date().toISOString())
    });
    return () => ref.current?.close();
  }, []);

  return (
    <>
      <h2>Sessions (SSE)</h2>
      <Grid data={rows}>
        <Column field="time" title="Time" width="220px" />
        <Column field="event" title="Event" />
      </Grid>
    </>
  );
}
