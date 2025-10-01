/**
 * types.ts
 * Central TypeScript contracts for the MCPX Admin Web application.
 *
 * Keep this file lightweight and UI-oriented. Server-side shapes that are not
 * exposed to the SPA should not be declared here. Prefer narrow interfaces that
 * describe exactly what screens consume.
 */

/**
 * Public configuration returned by GET /config/public.
 * Only NON-SECRET values belong here. Secrets live in environment stores.
 */
export type PublicConfig = {
  /** Azure AD settings required to initialize MSAL in the browser. */
  azureAd?: {
    /** Tenant GUID (used to build the authority if not provided explicitly). */
    tenantId?: string;
    /** SPA (public client) application ID. */
    clientId?: string;
    /** Redirect URI for the SPA (per environment). */
    redirectUri?: string;
    /** Scope the SPA requests (e.g., "Access.Admin"). */
    scope?: string;
  };

  /** Server-Sent Events (SSE) behavior and toggles. */
  sse?: {
    /** Keepalive cadence in seconds; default applied client-side when missing. */
    heartbeatSeconds?: number;
    /**
     * If true, the API requires a JWT for the SSE endpoint. The client will
     * append ?access_token=… automatically when possible.
     */
    requireAuth?: boolean;
  };

  /** DB-driven CORS allow-list for operator visibility. */
  cors?: {
    /** List of origins allowed by the API. */
    allowedOrigins?: string[];
  };
};

/**
 * Generic key/value row as returned by GET /config.
 * The API returns an array of objects with Key/Value properties.
 */
export type ConfigRow = {
  Key: string;
  Value: string | null;
};
