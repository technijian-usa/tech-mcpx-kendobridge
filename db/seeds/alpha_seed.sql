/*==============================================================================
  alpha_seed.sql
  Technijian MCPX – Non-secret bootstrap values for the ALPHA environment

  Purpose
    - Seed ONLY non-secret configuration keys used by the Admin API + SPA.
    - Establish initial CORS allow-list (origins that may call the API).
    - Provide Azure AD identifiers & SPA scope (client-side safe values).
    - Configure SSE heartbeat and optional SSE auth toggle.

  IMPORTANT
    - DO NOT place secrets here (no passwords, client secrets, conn strings).
    - Provide real IDs/URIs for your ALPHA environment below.
    - Re-run is safe (MERGE upserts). Keep per-environment copies (alpha/beta/rtm/prod).
==============================================================================*/
SET XACT_ABORT ON;
BEGIN TRAN;

-------------------------------------------------------------------------------
-- Azure AD (client-visible identifiers; non-secret)
-- Replace the sample values with your actual ALPHA tenant/app identifiers.
-------------------------------------------------------------------------------
MERGE dbo.AppConfig AS t
USING (VALUES
  (N'AzureAd:TenantId',     N'11111111-2222-3333-4444-555555555555'),   -- AAD tenant GUID
  (N'AzureAd:ClientId',     N'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'),   -- SPA (public client) app ID
  (N'AzureAd:RedirectUri',  N'http://localhost:5173'),                   -- SPA redirect URI for ALPHA
  (N'AzureAd:Scope',        N'Access.Admin')                             -- scope requested by SPA
) AS s([Key],[Value])
ON (t.[Key] = s.[Key])
WHEN MATCHED THEN UPDATE SET t.[Value] = s.[Value]
WHEN NOT MATCHED BY TARGET THEN INSERT ([Key],[Value]) VALUES (s.[Key], s.[Value]);

-------------------------------------------------------------------------------
-- API auth surface (non-secret)
-- Authority can be computed from TenantId if omitted; Audience is required.
-------------------------------------------------------------------------------
MERGE dbo.AppConfig AS t
USING (VALUES
  (N'Auth:Authority',    N'https://login.microsoftonline.com/11111111-2222-3333-4444-555555555555/v2.0'),
  (N'Auth:Audience',     N'api://ffffffff-1111-2222-3333-444444444444'),  -- API App ID URI or API app clientId
  (N'Auth:RequiredScope',N'Access.Admin')                                  -- scope enforced by API policy
) AS s([Key],[Value])
ON (t.[Key] = s.[Key])
WHEN MATCHED THEN UPDATE SET t.[Value] = s.[Value]
WHEN NOT MATCHED BY TARGET THEN INSERT ([Key],[Value]) VALUES (s.[Key], s.[Value]);

-------------------------------------------------------------------------------
-- SSE behavior (non-secret)
-------------------------------------------------------------------------------
MERGE dbo.AppConfig AS t
USING (VALUES
  (N'Sse:HeartbeatSeconds', N'15'),    -- keepalive every 15 seconds
  (N'Security:SseRequireAuth', N'false') -- set to 'true' in higher envs if desired
) AS s([Key],[Value])
ON (t.[Key] = s.[Key])
WHEN MATCHED THEN UPDATE SET t.[Value] = s.[Value]
WHEN NOT MATCHED BY TARGET THEN INSERT ([Key],[Value]) VALUES (s.[Key], s.[Value]);

-------------------------------------------------------------------------------
-- CORS allow-list (origins permitted to call the API)
-- Add additional rows per environment as needed.
-------------------------------------------------------------------------------
MERGE dbo.Security_AllowedOrigin AS t
USING (VALUES
  (N'http://localhost:5173', N'ALPHA dev SPA')
) AS s([Origin],[Notes])
ON (t.[Origin] = s.[Origin])
WHEN MATCHED THEN UPDATE SET t.[Notes] = s.[Notes]
WHEN NOT MATCHED BY TARGET THEN INSERT ([Origin],[Notes]) VALUES (s.[Origin], s.[Notes]);

COMMIT;
GO
