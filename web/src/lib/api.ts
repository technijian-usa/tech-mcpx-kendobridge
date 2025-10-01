/**
 * lib/api.ts
 * Minimal, typed API helper for the MCPX Admin Web.
 *
 * Responsibilities
 *  - Attach Authorization: Bearer <access_token> when MSAL is available.
 *  - Keep fetch calls small, predictable, and credentials-aware.
 *  - Never hard-code API base URLs (Vite dev proxy/nginx handle routing).
 *
 * Design
 *  - The SPA requests a single scope (cfg.azureAd.scope). If present, this
 *    helper silently acquires a token and adds it to requests.
 *  - When tokens are not available (e.g., scope not configured), calls
 *    gracefully proceed without the Authorization header.
 */

import { useMsal } from '@azure/msal-react';
import type { PublicConfig } from '../types';

/** Runtime global set by msalApp.tsx so non-React helpers can acquire tokens. */
declare global {
  interface Window {
    __MSAL__?: { instance: any; accounts: any[] };
    __MSAL_SCOPE__?: string;
  }
}

/**
 * Factory that creates a tiny API client bound to the current public config.
 * @param cfg Public, NON-SECRET client config fetched from /config/public
 */
export function createApi(cfg: PublicConfig) {
  const scope = cfg.azureAd?.scope;

  /**
   * Attempts to build an Authorization header using MSAL.
   * Returns {} if a token cannot be acquired (e.g., no scope configured).
   */
  async function authHeader(): Promise<HeadersInit> {
    if (!scope) return {};
    const g = window as any;
    const msal = g.__MSAL__;
    if (!msal?.instance || !Array.isArray(msal?.accounts) || msal.accounts.length === 0) return {};
    try {
      const res = await msal.instance.acquireTokenSilent({ account: msal.accounts[0], scopes: [scope] });
      return { Authorization: `Bearer ${res.accessToken}` };
    } catch {
      // Fall through without Authorization header; the server will reject if required.
      return {};
    }
  }

  /**
   * GET helper that parses JSON responses and throws on non-2xx.
   * Credentials are included (cookies, if any).
   */
  async function get<T = unknown>(url: string): Promise<T> {
    const headers = await authHeader();
    const res = await fetch(url, { method: 'GET', headers, credentials: 'include' });
    if (!res.ok) {
      const snippet = await safeText(res);
      throw new Error(`${url} -> ${res.status} ${res.statusText}${snippet ? ` — ${snippet}` : ''}`);
    }
    return res.json() as Promise<T>;
  }

  // Future extension: POST/PUT/PATCH if you ever add write endpoints (not planned for Admin).
  // async function post<TOut, TIn = unknown>(url: string, body: TIn): Promise<TOut> { ... }

  return { get };
}

/**
 * Hook that exposes MSAL instance & accounts on window so non-React helpers
 * (createApi/connectSse) can acquire tokens without prop-drilling.
 *
 * Usage: call once near the root of any route that does API calls.
 */
export function useExposeMsal(): void {
  const ctx = useMsal();
  (window as any).__MSAL__ = { instance: ctx.instance, accounts: ctx.accounts };
}

/** Best-effort short response body for error messages (<=500 chars). */
async function safeText(res: Response): Promise<string | null> {
  try {
    const t = await res.text();
    return t && t.length <= 500 ? t : null;
  } catch {
    return null;
  }
}
