import type { PublicConfig } from '../types';

export async function fetchPublicConfig(signal?: AbortSignal): Promise<PublicConfig> {
  const res = await fetch('/config/public', { signal, credentials: 'include' });
  if (res.status === 204) return {};
  if (!res.ok) throw new Error(`Public config failed: ${res.status}`);
  return res.json();
}
