/* =======================================================================
   Migration:  V202509230905__seed_appconfig_featureflag.sql
   Project:    MCPX-KendoBridge
   Purpose:    Seed non-secret defaults for configuration and feature flags
   Policy:     Add-only; SP-only; No-Hard-Coding; secrets never in DB
               Values here are consumed via SPs (sp_Config_*, sp_Feature_IsEnabled)
               and surfaced read-only through /config/effective.
   Notes:      Idempotent (MERGE); safe to re-run.
   ======================================================================= */

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRANSACTION;

    /* -------------------------
       Seed AppConfig (non-secret)
       ------------------------- */
    MERGE dbo.AppConfig AS t
    USING (VALUES
        (N'Mcp:ChildCommand',           N'npx',                                             SYSUTCDATETIME()),
        (N'Mcp:ChildArgs',              N'-y @progress/kendo-react-mcp@latest',             SYSUTCDATETIME()),
        (N'Mcp:ChildCwd',               N'',                                                SYSUTCDATETIME()),
        /* Origin allow-list used by server policy (read-only surface) */
        (N'Security:AllowedOrigins',    N'https://chat.openai.com,https://platform.openai.com', SYSUTCDATETIME()),
        /* Network & streaming budgets (read by server; used for SSE heartbeats/timeouts) */
        (N'Network:SseKeepAliveSeconds',   N'15',                                           SYSUTCDATETIME()),
        (N'Network:RequestTimeoutSeconds', N'120',                                          SYSUTCDATETIME())
    ) AS s([Key],[Value],[UpdatedAt])
    ON (t.[Key] = s.[Key])
    WHEN MATCHED THEN
        UPDATE SET t.[Value] = s.[Value], t.[UpdatedAt] = s.[UpdatedAt]
    WHEN NOT MATCHED THEN
        INSERT ([Key],[Value],[UpdatedAt]) VALUES (s.[Key], s.[Value], s.[UpdatedAt]);

    /* -------------------------
       Seed FeatureFlag (non-secret)
       ------------------------- */
    MERGE dbo.FeatureFlag AS t
    USING (VALUES
        (N'EnableLegacyHttpSse', CAST(0 AS BIT), SYSUTCDATETIME())  -- OFF by default
    ) AS s([Name],[Enabled],[UpdatedAt])
    ON (t.[Name] = s.[Name])
    WHEN MATCHED THEN
        UPDATE SET t.[Enabled] = s.[Enabled], t.[UpdatedAt] = s.[UpdatedAt]
    WHEN NOT MATCHED THEN
        INSERT ([Name],[Enabled],[UpdatedAt]) VALUES (s.[Name], s.[Enabled], s.[UpdatedAt]);

COMMIT TRANSACTION;
GO

/* -------------------------
   Compliance banner (doc comment)
   -------------------------
   DB COMPLIANCE:
   - Add-only schema & seeds; no destructive DDL.
   - SP-only DAL: application principals receive EXECUTE-only on whitelisted SPs
     (sp_Config_GetValue, sp_Config_GetAll, sp_Feature_IsEnabled, sp_Lookup_Get).
   - No-Hard-Coding: runtime-varying values come from AppConfig/FeatureFlag via SPs.
   - Secrets: NEVER store secrets here; secrets live only in GitHub Environments.
*/
