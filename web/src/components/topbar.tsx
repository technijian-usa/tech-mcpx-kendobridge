import React from 'react';
import { AppBar, AppBarSection, AppBarSpacer } from '@progress/kendo-react-layout';

export default function TopBar() {
  return (
    <AppBar>
      <AppBarSection>
        <strong>MCPX Admin</strong>
      </AppBarSection>
      <AppBarSpacer style={{ width: 32 }} />
      <AppBarSection>
        <span style={{ opacity: .7 }}>Read-only Admin Portal</span>
      </AppBarSection>
    </AppBar>
  );
}
