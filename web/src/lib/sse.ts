export type SseHandlers = {
  onOpen?: () => void;
  onMessage?: (type: string, data: string) => void;
  onError?: (ev: Event) => void;
};

async function buildSseUrl(path: string): Promise<string> {
  const g: any = window as any;
  const msal = g.__MSAL__;
  const scope: string | undefined = g.__MSAL_SCOPE__;
  let url = path;

  // If MSAL is present and a scope is defined, try to attach access_token for SSE
  if (msal?.instance && msal?.accounts?.length && scope) {
    try {
      const res = await msal.instance.acquireTokenSilent({ account: msal.accounts[0], scopes: [scope] });
      const token = encodeURIComponent(res.accessToken);
      const sep = url.includes('?') ? '&' : '?';
      url = `${url}${sep}access_token=${token}`;
    } catch {
      // ignore; SSE may still be allowed if requireAuth=false
    }
  }
  return url;
}

export function connectSse(path = '/sessions/stream', handlers: SseHandlers = {}) {
  // Fire-and-forget async; returns EventSource immediately, then reopens with token if needed.
  let es = new EventSource(path, { withCredentials: true });

  (async () => {
    const authedUrl = await buildSseUrl(path);
    if (authedUrl !== path) {
      es.close();
      es = new EventSource(authedUrl, { withCredentials: true });
      es.onopen = () => handlers.onOpen?.();
      es.onerror = (ev) => handlers.onError?.(ev);
      es.onmessage = (ev) => handlers.onMessage?.('message', ev.data);
    }
  })().catch(() => { /* noop */ });

  es.onopen = () => handlers.onOpen?.();
  es.onerror = (ev) => handlers.onError?.(ev);
  es.onmessage = (ev) => handlers.onMessage?.('message', ev.data);
  return es;
}
