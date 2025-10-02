/**
 * TopBar.tsx
 * Global application header.
 *
 * Responsibilities
 *  - Provide a consistent brand/header area for the Admin portal.
 *  - Keep the header lightweight (no business logic here).
 *  - Remain purely presentational; navigation lives in SideNav.
 *
 * Notes
 *  - Uses KendoReact AppBar for accessible, responsive structure.
 *  - Keep inline styles minimal to avoid fighting ThemeBuilder tokens.
 */

import React from 'react';
import { AppBar, AppBarSection, AppBarSpacer } from '@progress/kendo-react-layout';

export default function TopBar(): JSX.Element {
  return (
    <AppBar>
      {/* Left section: brand/title */}
      <AppBarSection>
        <strong aria-label="Application title">MCPX Admin</strong>
      </AppBarSection>

      {/* Spacer pushes the right section to the edge */}
      <AppBarSpacer style={{ width: 16 }} />

      {/* Right section: short descriptor */}
      <AppBarSection>
        <span style={{ opacity: 0.75 }}>Read-only Operations Console</span>
      </AppBarSection>
    </AppBar>
  );
}
