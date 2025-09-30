BEGIN TRAN;

/* API auth (non-secret values) */
MERGE dbo.AppConfig AS t
USING (VALUES
  (N'Auth:Authority', N'https://login.microsoftonline.com/YOUR_TENANT_GUID/v2.0'), -- or compute from TenantId
  (N'Auth:Audience',  N'api://YOUR_API_APP_ID') -- the App ID URI (aud) for your API
) AS s([Key],[Value])
ON (t.[Key] = s.[Key])
WHEN MATCHED THEN UPDATE SET t.[Value] = s.[Value]
WHEN NOT MATCHED BY TARGET THEN INSERT ([Key],[Value]) VALUES (s.[Key], s.[Value]);

/* SSE behavior */
MERGE dbo.AppConfig AS t
USING (VALUES
  (N'Security:SseRequireAuth', N'false')  -- set true in higher envs if desired
) AS s([Key],[Value])
ON (t.[Key] = s.[Key])
WHEN MATCHED THEN UPDATE SET t.[Value] = s.[Value]
WHEN NOT MATCHED BY TARGET THEN INSERT ([Key],[Value]) VALUES (s.[Key], s.[Value]);

COMMIT;

BEGIN TRAN;

MERGE dbo.AppConfig AS t
USING (VALUES
  (N'Auth:RequiredScope', N'Access.Admin')  -- the SPA requests this in Azure
) AS s([Key],[Value])
ON (t.[Key] = s.[Key])
WHEN MATCHED THEN UPDATE SET t.[Value] = s.[Value]
WHEN NOT MATCHED BY TARGET THEN INSERT ([Key],[Value]) VALUES (s.[Key], s.[Value]);

COMMIT;

