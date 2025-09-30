export type PublicConfig = {
  azureAd?: {
    tenantId?: string;
    clientId?: string;
    redirectUri?: string;
    scope?: string;
  };
  sse?: { heartbeatSeconds?: number };
  cors?: { allowedOrigins?: string[] };
};
