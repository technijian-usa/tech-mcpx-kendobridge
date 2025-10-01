/**
 * lib/msalApp.tsx
 * MSAL bootstrapping for Azure AD authentication in the browser.
 *
 * Responsibilities
 *  - Initialize a PublicClientApplication using non-secret settings fetched
 *    from the API (/config/public) — no hard-coded IDs in code.
 *  - Ensure a signed-in account exists (redirect flow); silently acquire
 *    tokens when a scope is configured.
 *  - Expose the MSAL instance + accounts on window so non-React helpers
 *    (e.g., src/lib/api.ts, src/lib/sse.ts) can acquire tokens.
 *
 * Security notes
 *  - This SPA never stores secrets. The authority, clientId, redirectUri,
 *    and scope are NON-SECRET identifiers suitable for the client.
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  PublicClientApplication,
  EventType,
  SilentRequest
} from '@azure/msal-browser';
import {
  MsalProvider,
  useMsal,
  AuthenticatedTemplate,
  UnauthenticatedTemplate
} from '@azure/msal-react';
import type { PublicConfig } from '../types';

/**
 * Wraps children with an initialized MSAL context based on the fetched config.
 * Also exposes __MSAL_SCOPE__ globally for helpers that need it.
 */
export function MsalBoot({
  cfg,
  children
}: {
  cfg: PublicConfig;
  children: React.ReactNode;
}): JSX.Element {
  const pca = useMemo(() => {
    const tenantId = cfg.azureAd?.tenantId;
    const clientId = cfg.azureAd?.clientId;
    const redirectUri = cfg.azureAd?.redirectUri ?? window.location.origin;

    if (!tenantId || !clientId) {
      throw new Error(
        'Missing Azure AD settings (tenantId/clientId) in /config/public.'
      );
    }

    return new PublicClientApplication({
      auth: {
        authority: `https://login.microsoftonline.com/${tenantId}`,
        clientId,
        redirectUri
      },
      cache: {
        cacheLocation: 'localStorage' // keeps tokens across reloads
      }
    });
  }, [cfg]);

  // Make the requested scope globally available (used by api.ts and sse.ts).
  useEffect(() => {
    (window as any).__MSAL_SCOPE__ = cfg.azureAd?.scope;
  }, [cfg.azureAd?.scope]);

  return (
    <MsalProvider instance={pca}>
      <MsalGate scope={cfg.azureAd?.scope}>{children}</MsalGate>
    </MsalProvider>
  );
}

/**
 * Ensures the user is authenticated and that an access token is available
 * (when a scope is configured). Renders children only when ready.
 */
function MsalGate({
  scope,
  children
}: {
  scope?: string;
  children: React.ReactNode;
}): JSX.Element {
  const { instance, accounts } = useMsal();
  const [ready, setReady] = useState(false);

  // Keep a global reference to MSAL instance/accounts for non-React helpers.
  useEffect(() => {
    (window as any).__MSAL__ = { instance, accounts };
    const cb = instance.addEventCallback((event) => {
      if (
        event.eventType === EventType.LOGIN_SUCCESS ||
        event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS
      ) {
        (window as any).__MSAL__ = {
          instance,
          accounts: instance.getAllAccounts()
        };
        setReady(true);
      }
    });
    return () => {
      if (cb) instance.removeEventCallback(cb);
    };
  }, [instance, accounts]);

  // Kick off login and token acquisition (silent if possible).
  useEffect(() => {
    (async () => {
      const account = accounts[0];
      if (!account) {
        // Redirect-based login keeps the app simple and secure.
        await instance.loginRedirect({ scopes: scope ? [scope] : [] });
        return;
      }

      if (scope) {
        const req: SilentRequest = { account, scopes: [scope] };
        await instance
          .acquireTokenSilent(req)
          .catch(() => instance.loginRedirect(req));
      }

      setReady(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts, instance, scope]);

  if (!ready) return <></>; // render nothing until signed in / token ready

  return (
    <>
      <AuthenticatedTemplate>{children}</AuthenticatedTemplate>
      <UnauthenticatedTemplate>{/* Redirecting via MSAL */}</UnauthenticatedTemplate>
    </>
  );
}
