/**
 * SideNav.tsx
 * Left-hand navigation using KendoReact Drawer.
 *
 * Responsibilities
 *  - Provide primary app navigation (Dashboard, Sessions, Config, Access).
 *  - Reflect current route selection.
 *  - Stay stateless (no business logic here).
 *
 * Notes
 *  - Uses React Router for navigation; Drawer items map to routes.
 *  - Keep padding/margins modest; ThemeBuilder controls most visuals.
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

  // Normalize selection ("/" vs "/route")
  const selectedKey = useMemo(() => {
    const path = location.pathname || '/';
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
          selected: i.route === selectedKey
        }))}
        onSelect={(e) => {
          const item = (e.itemTarget?.props as Partial<NavItem>) ?? {};
          if (item.route) navigate(item.route);
        }}
        item={(props) => (
          <DrawerItem
            {...props}
            // Ensure DrawerItem receives the route prop for onSelect handler
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
