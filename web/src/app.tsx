import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TopBar from './components/TopBar';
import SideNav from './components/SideNav';
import Dashboard from './routes/Dashboard';
import Sessions from './routes/Sessions';
import ConfigView from './routes/Config';
import AccessView from './routes/Access';
import { fetchPublicConfig } from './lib/config';
import type { PublicConfig } from './types';
import { MsalBoot } from './lib/msalApp';

export default function App() {
  const [cfg, setCfg] = useState<PublicConfig | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    fetchPublicConfig(ac.signal).then(setCfg).catch(e => setErr(e.message));
    return () => ac.abort();
  }, []);

  if (err) return <div style={{ padding: 24 }}>Failed to load config: {err}</div>;
  if (!cfg) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <MsalBoot cfg={cfg}>
      <BrowserRouter>
        <TopBar />
        <SideNav>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/config" element={<ConfigView cfg={cfg} />} />
            <Route path="/access" element={<AccessView cfg={cfg} />} />
          </Routes>
        </SideNav>
      </BrowserRouter>
    </MsalBoot>
  );
}
