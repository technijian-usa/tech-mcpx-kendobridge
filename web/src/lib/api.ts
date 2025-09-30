import { useMsal } from '@azure/msal-react';
import type { PublicConfig } from '../types';

export function createApi(cfg: PublicConfig) {
  const base = '';
  const scope = cfg.azureAd?.scope;

  async function authHeader(): Promise<HeadersInit> {
    if (!scope) return {};
    const { instance, accounts } = window.__MSAL__ ?? {};
    // __MSAL__ is injected by App at runtime (see App.tsx)
    if (!instance || !accounts?.length) return {};
    try {
      const res = await instance.acquireTokenSilent({ account: accounts[0], scopes: [scope] });
      return { Authorization: `Bearer ${res.accessToken}` };
    } catch {
      return {};
    }
  }

  return {
    async get<T>(url: string): Promise<T> {
      const headers = await authHeader();
      const res = await fetch(base + url, { headers, credentials: 'include' });
      if (!res.ok) throw new Error(`${url} -> ${res.status}`);
      return res.json();
    }
  };
}

// Hook to expose msal instance & accounts via a global (for api.ts)
export function useExposeMsal() {
  const ctx = useMsal();
  (window as any).__MSAL__ = { instance: ctx.instance, accounts: ctx.accounts };
}
