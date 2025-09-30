/*------------------------------------------------------------------------------
  Alpha bootstrap (non-secret). Update the GUID/URIs for your tenant/app IDs.
  These are NOT secrets; do not add any secrets to AppConfig.
------------------------------------------------------------------------------*/
BEGIN TRAN;

MERGE dbo.AppConfig AS t
USING (VALUES
  (N'AzureAd:TenantId',     N'YOUR_TENANT_GUID'),
  (N'AzureAd:ClientId',     N'YOUR_SPA_CLIENT_ID'),
  (N'AzureAd:RedirectUri',  N'http://localhost:5173'),
  (N'AzureAd:Scope',        N'api://YOUR_API_APP_ID/Access.Admin'),

  (N'Auth:Authority',       N'https://login.microsoftonline.com/YOUR_TENANT_GUID/v2.0'),
  (N'Auth:Audience',        N'api://YOUR_API_APP_ID'),
  (N'Auth:RequiredScope',   N'Access.Admin'),

  (N'Sse:HeartbeatSeconds', N'15'),
  (N'Security:SseRequireAuth', N'false')
) AS s([Key],[Value])
ON (t.[Key] = s.[Key])
WHEN MATCHED THEN UPDATE SET t.[Value] = s.[Value]
WHEN NOT MATCHED BY TARGET THEN INSERT ([Key],[Value]) VALUES (s.[Key], s.[Value]);

MERGE dbo.Security_AllowedOrigin AS t
USING (VALUES
  (N'http://localhost:5173', N'alpha dev')
) AS s([Origin],[Notes])
ON (t.[Origin] = s.[Origin])
WHEN NOT MATCHED BY TARGET THEN
  INSERT ([Origin],[Notes]) VALUES (s.[Origin], s.[Notes]);

COMMIT;
