/**
 * global.d.ts
 * Ambient type declarations for window-scoped MSAL helpers.
 *
 * Why this file exists:
 *  - Non-React helpers (src/lib/api.ts, src/lib/sse.ts) read MSAL instance
 *    and accounts from globals that we set in msalApp.tsx.
 *  - Declaring them here keeps TypeScript happy (no "any"/implicit any).
 *
 * IMPORTANT:
 *  - This file is included by tsconfig.json ("include": ["src"]), so do not
 *    move it out of /src without updating the config.
 */

export {};

declare global {
  interface Window {
    /**
     * Injected by msalApp.tsx after MSAL initializes.
     * Holds the MSAL PublicClientApplication instance and the current accounts.
     */
    __MSAL__?: {
      /** MSAL PublicClientApplication instance */
      instance: any;
      /** Array of MSAL accounts (usually 0 or 1 for SPAs) */
      accounts: any[];
    };

    /**
     * Injected by msalApp.tsx to indicate which scope the SPA requests.
     * Used by api.ts and sse.ts to acquire tokens silently.
     */
    __MSAL_SCOPE__?: string;
  }
}
