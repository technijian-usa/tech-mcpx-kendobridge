/*=====================================================================
  ALPHA non-secret bootstrap values. Update GUIDs/URIs per environment.
=====================================================================*/
BEGIN TRAN;

MERGE dbo.AppConfig AS t
USING (VALUES
  (N'AzureAd:TenantId',     N'YOUR_TENANT_GUID'),
  (N'AzureAd:ClientId',     N'YOUR_SPA_APP_CLIENT_ID'),
  (N'AzureAd:RedirectUri',  N'http://localhost:5173'),
  (N'AzureAd:Scope',        N'Access.Admin'),                -- SPA scope to request
  (N'Auth:Authority',       N'https://login.microsoftonline.com/YOUR_TENANT_GUID/v2.0'),
  (N'Auth:Audience',        N'api://YOUR_API_APP_ID'),       -- API App ID URI
  (N'Auth:RequiredScope',   N'Access.Admin'),                -- API policy (scp)
  (N'Sse:HeartbeatSeconds', N'15'),
  (N'Security:SseRequireAuth', N'false')                     -- true in higher envs if desired
) AS s([Key],[Value])
ON (t.[Key] = s.[Key])
WHEN MATCHED THEN UPDATE SET t.[Value] = s.[Value]
WHEN NOT MATCHED BY TARGET THEN INSERT ([Key],[Value]) VALUES (s.[Key], s.[Value]);

MERGE dbo.Security_AllowedOrigin AS t
USING (VALUES
  (N'http://localhost:5173', N'alpha dev')
) AS s([Origin],[Notes])
ON (t.[Origin] = s.[Origin])
WHEN NOT MATCHED BY TARGET THEN INSERT ([Origin],[Notes]) VALUES (s.[Origin], s.[Notes]);

COMMIT;
