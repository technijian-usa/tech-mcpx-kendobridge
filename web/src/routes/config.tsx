import React, { useEffect, useState } from 'react';
import { Grid, GridColumn as Column } from '@progress/kendo-react-grid';
import { createApi } from '../lib/api';
import type { PublicConfig } from '../types';
import { useMsal } from '@azure/msal-react';
import { useExposeMsal } from '../lib/api';

export default function ConfigView({ cfg }: { cfg: PublicConfig }) {
  const api = createApi(cfg);
  const [rows, setRows] = useState<any[]>([]);
  useExposeMsal();

  useEffect(() => {
    api.get<any[]>('/config').then(setRows).catch(console.error);
  }, []); // eslint-disable-line

  return (
    <>
      <h2>Config (read-only)</h2>
      <Grid data={rows}>
        <Column field="Key" title="Key" width="320px" />
        <Column field="Value" title="Value" />
      </Grid>
    </>
  );
}
