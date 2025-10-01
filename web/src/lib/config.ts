/**
 * lib/config.ts
 * Fetches NON-SECRET public configuration from the Admin API.
 *
 * Endpoint
 *   GET /config/public
 *     - 200: { azureAd, sse, cors } object
 *     - 204: no content (treated as empty config)
 *
 * Notes
 *   - Credentials are included to support cookie-based scenarios (if any).
 *   - This helper never throws on 204; it returns an empty object instead.
 */

import type { PublicConfig } from '../types';

/**
 * Retrieves the SPA boot configuration from the API.
 *
 * @param signal Optional AbortSignal for caller-controlled cancellation.
 * @returns A PublicConfig object (possibly empty when API returns 204).
 * @throws Error if the HTTP request fails for reasons other than 204.
 */
export async function fetchPublicConfig(signal?: AbortSignal): Promise<PublicConfig> {
  const res = await fetch('/config/public', {
    signal,
    credentials: 'include' // safe; no secrets in this response
  });

  if (res.status === 204) {
    // API intentionally returns 204 when no data is available
    return {};
  }

  if (!res.ok) {
    // Bubble up a readable error for UI consumption
    const text = await safeText(res);
    throw new Error(`GET /config/public failed: ${res.status} ${res.statusText}${text ? ` — ${text}` : ''}`);
  }

  // Parse as JSON (shape validated at usage sites)
  return (await res.json()) as PublicConfig;
}

/** Attempts to read a short text body for diagnostic messages without throwing. */
async function safeText(res: Response): Promise<string | null> {
  try {
    const t = await res.text();
    return t && t.length <= 500 ? t : null;
  } catch {
    return null;
  }
}
