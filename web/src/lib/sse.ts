/**
 * lib/sse.ts
 * Small helper for Server-Sent Events (SSE) with optional JWT passthrough.
 *
 * Responsibilities
 *  - Open an EventSource to the API (default: /sessions/stream).
 *  - When Security:SseRequireAuth=true (DB-driven), attempt to append
 *    ?access_token=<jwt> using the MSAL instance exposed on window.
 *  - Callers provide small lifecycle hooks (open/message/error).
 *
 * Security
 *  - This file never stores secrets. It opportunistically acquires a token
 *    through MSAL if the SPA is configured with a scope.
 */

declare global {
  interface Window {
    /** Injected by msalApp.tsx — allows non-React helpers to acquire tokens. */
    __MSAL__?: { instance: any; accounts: any[] };
    /** Injected by msalApp.tsx — tells us which scope to request. */
    __MSAL_SCOPE__?: string;
  }
}

/** Lightweight callback hooks for SSE events. */
export type SseHandlers = {
  /** Called when the connection is established by the browser. */
  onOpen?: () => void;
  /**
   * Called for each message. The first arg is a string event type
   * (we pass 'message' for default events), the second is the raw data string.
   */
  onMessage?: (type: string, data: string) => void;
  /** Called on any error (network/server). EventSource auto-reconnects. */
  onError?: (ev: Event) => void;
};

/**
 * Attempts to construct a URL with ?access_token=<jwt> if MSAL is available
 * and the SPA was configured with a scope. Otherwise returns the original path.
 */
async function buildSseUrl(path: string): Promise<string> {
  const msal = window.__MSAL__;
  const scope = window.__MSAL_SCOPE__;
  if (!msal?.instance || !Array.isArray(msal.accounts) || msal.accounts.length === 0 || !scope) {
    return path; // nothing to add
  }

  try {
    const res = await msal.instance.acquireTokenSilent({
      account: msal.accounts[0],
      scopes: [scope]
    });
    const token = encodeURIComponent(res.accessToken);
    const sep = path.includes('?') ? '&' : '?';
    return `${path}${sep}access_token=${token}`;
  } catch {
    // Token not available; fall back to unauthenticated stream (server may allow it)
    return path;
  }
}

/**
 * Opens an EventSource to the API and wires up basic handlers.
 * If a token is available, re-opens the stream with ?access_token=.
 *
 * @param path API SSE path (default: /sessions/stream)
 * @param handlers Lifecycle hooks for open/message/error
 * @returns The live EventSource instance
 */
export function connectSse(path = '/sessions/stream', handlers: SseHandlers = {}): EventSource {
  // Start unauthenticated immediately to provide quick feedback,
  // then upgrade to an authenticated URL if available.
  let es = new EventSource(path, { withCredentials: true });

  const applyHandlers = (target: EventSource) => {
    target.onopen = () => handlers.onOpen?.();
    target.onerror = (ev) => handlers.onError?.(ev);
    target.onmessage = (ev) => handlers.onMessage?.('message', ev.data);
  };

  applyHandlers(es);

  // Try to re-open with token when possible (non-blocking).
  (async () => {
    const authed = await buildSseUrl(path);
    if (authed !== path) {
      es.close();
      es = new EventSource(authed, { withCredentials: true });
      applyHandlers(es);
    }
  })().catch(() => {
    /* Swallow — unauthenticated stream may still be acceptable per DB toggle */
  });

  return es;
}
