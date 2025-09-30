import React, { useEffect, useMemo, useState } from 'react';
import { PublicClientApplication, EventType, SilentRequest } from '@azure/msal-browser';
import { MsalProvider, useMsal, AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import type { PublicConfig } from '../types';

export function MsalBoot({ cfg, children }: { cfg: PublicConfig; children: React.ReactNode }) {
  const pca = useMemo(() => {
    const tenant = cfg.azureAd?.tenantId!;
    const clientId = cfg.azureAd?.clientId!;
    const redirectUri = cfg.azureAd?.redirectUri ?? window.location.origin;
    return new PublicClientApplication({
      auth: { authority: `https://login.microsoftonline.com/${tenant}`, clientId, redirectUri },
      cache: { cacheLocation: 'localStorage' }
    });
  }, [cfg]);

  // Expose instance + scope for SSE token helper
  useEffect(() => {
    (window as any).__MSAL_SCOPE__ = cfg.azureAd?.scope;
  }, [cfg]);

  return (
    <MsalProvider instance={pca}>
      <MsalGate scope={cfg.azureAd?.scope}>{children}</MsalGate>
    </MsalProvider>
  );
}

function MsalGate({ scope, children }: { scope?: string; children: React.ReactNode }) {
  const { instance, accounts } = useMsal();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (window as any).__MSAL__ = { instance, accounts };
    const sub = instance.addEventCallback((e) => {
      if (e.eventType === EventType.LOGIN_SUCCESS || e.eventType === EventType.ACQUIRE_TOKEN_SUCCESS) {
        (window as any).__MSAL__ = { instance, accounts: instance.getAllAccounts() };
        setReady(true);
      }
    });
    return () => { if (sub) instance.removeEventCallback(sub); };
  }, [instance, accounts]);

  useEffect(() => {
    (async () => {
      const acct = accounts[0];
      if (!acct) {
        await instance.loginRedirect({ scopes: scope ? [scope] : [] });
        return;
      }
      if (scope) {
        const req: SilentRequest = { account: acct, scopes: [scope] };
        await instance.acquireTokenSilent(req).catch(() => instance.loginRedirect(req));
      }
      setReady(true);
    })();
  }, [accounts, instance, scope]);

  if (!ready) return null;
  return (
    <>
      <AuthenticatedTemplate>{children}</AuthenticatedTemplate>
      <UnauthenticatedTemplate>{/* redirected by MSAL */}</UnauthenticatedTemplate>
    </>
  );
}
