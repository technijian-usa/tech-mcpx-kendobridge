import React, { useEffect, useState } from 'react';
import { Grid, GridColumn as Column } from '@progress/kendo-react-grid';
import { createApi } from '../lib/api';
import type { PublicConfig } from '../types';
import { useExposeMsal } from '../lib/api';

export default function AccessView({ cfg }: { cfg: PublicConfig }) {
  const api = createApi(cfg);
  const [rows, setRows] = useState<{ Origin: string }[]>([]);
  useExposeMsal();

  useEffect(() => {
    api.get<string[]>('/access/allowlist')
      .then(list => setRows(list.map(o => ({ Origin: o }))))
      .catch(console.error);
  }, []); // eslint-disable-line

  return (
    <>
      <h2>Access Allowlist (read-only)</h2>
      <Grid data={rows}>
        <Column field="Origin" title="Origin" />
      </Grid>
    </>
  );
}
