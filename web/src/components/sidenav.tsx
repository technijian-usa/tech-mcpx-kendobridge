/**
 * SideNav.tsx
 * Left-hand navigation using KendoReact Drawer.
 *
 * Responsibilities
 *  - Provide primary app navigation (Dashboard, Sessions, Config, Access).
 *  - Reflect current route selection.
 *  - Stay presentational; no business logic beyond routing.
 *
 * Notes
 *  - Uses React Router for navigation; Drawer items map to routes.
 *  - Keep inline styles modest; ThemeBuilder controls visual identity.
 *  - File name is case-sensitive on Linux — keep as SideNav.tsx to match imports.
 */

import React, { useMemo } from 'react';
import { Drawer, DrawerContent, DrawerItem } from '@progress/kendo-react-layout';
import { useLocation, useNavigate } from 'react-router-dom';

type NavItem = { text: string; route: string };

const NAV_ITEMS: NavItem[] = [
  { text: 'Dashboard', route: '/' },
  { text: 'Sessions (SSE)', route: '/sessions' },
  { text: 'Config', route: '/config' },
  { text: 'Access Allowlist', route: '/access' }
];

export default function SideNav({ children }: { children: React.ReactNode }): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();

  // Compute which item should be marked selected for the current route.
  const selectedRoute = useMemo(() => {
    const path = location.pathname || '/';
    // "/" should only select Dashboard; other paths match by prefix.
    const match = NAV_ITEMS.find(i => (path === '/' ? i.route === '/' : path.startsWith(i.route)));
    return match?.route ?? '/';
  }, [location.pathname]);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)' }} aria-label="Primary navigation">
      <Drawer
        expanded
        mode="push"
        width={240}
        items={NAV_ITEMS.map((i) => ({
          ...i,
          selected: i.route === selectedRoute
        }))}
        onSelect={(e) => {
          // Kendo passes the React element via itemTarget.props; we forward to router.
          const props = (e.itemTarget?.props as Partial<NavItem>) ?? {};
          if (props.route) navigate(props.route);
        }}
        item={(props) => (
          <DrawerItem
            {...props}
            // Ensure the route prop is preserved for onSelect above.
            route={(props as any).route}
          >
            {props.item.text}
          </DrawerItem>
        )}
      >
        <DrawerContent>
          <main style={{ padding: 16 }}>{children}</main>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
