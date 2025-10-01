/*==============================================================================
  V20250928_2230__baseline.sql
  Technijian MCPX – DB baseline (add-only, idempotent)

  Purpose
    - Establish core, non-secret configuration tables used by the Admin API.
    - Enforce “no hard-coding” by centralizing runtime values in AppConfig.
    - Provide a DB-driven CORS allow-list.
    - Keep schema minimal and stable; all access is via stored procedures.

  Notes
    - Idempotent: guarded by IF OBJECT_ID … IS NULL.
    - Locking: rely on default READ COMMITTED isolation; writers are rare.
    - Keys/Indexes:
        * AppConfig: PK(Key)
        * FeatureFlag: PK(Name)
        * Lookup:    PK(Type, Key)
        * Security_AllowedOrigin: PK(Origin)
==============================================================================*/
SET XACT_ABORT ON;
BEGIN TRAN;

-------------------------------------------------------------------------------
-- AppConfig: non-secret key/value configuration consumed by the API/UI
-------------------------------------------------------------------------------
IF OBJECT_ID(N'dbo.AppConfig', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.AppConfig
  (
    [Key]   NVARCHAR(200) NOT NULL CONSTRAINT PK_AppConfig PRIMARY KEY,
    [Value] NVARCHAR(MAX) NOT NULL
      -- Store only NON-SECRET values here (e.g., AzureAd:TenantId, ClientId,
      -- RedirectUri, public scopes, CORS settings, SSE heartbeat, toggles).
  );
END;
-- (No default values here; seed per-environment with separate scripts.)

-------------------------------------------------------------------------------
-- FeatureFlag: coarse-grained feature toggles
-------------------------------------------------------------------------------
IF OBJECT_ID(N'dbo.FeatureFlag', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.FeatureFlag
  (
    [Name]    NVARCHAR(200) NOT NULL CONSTRAINT PK_FeatureFlag PRIMARY KEY,
    [Enabled] BIT NOT NULL CONSTRAINT DF_FeatureFlag_Enabled DEFAULT (0)
  );
END;

-------------------------------------------------------------------------------
-- Lookup: typed key/value store for display strings, enumerations, etc.
-- Example rows:
--   Type = 'Display', Key = 'Session.Status.Active', Value = 'Active'
-------------------------------------------------------------------------------
IF OBJECT_ID(N'dbo.[Lookup]', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[Lookup]
  (
    [Type]  NVARCHAR(100) NOT NULL,
    [Key]   NVARCHAR(200) NOT NULL,
    [Value] NVARCHAR(MAX) NOT NULL,
    CONSTRAINT PK_Lookup PRIMARY KEY CLUSTERED ([Type], [Key])
  );
END;

-------------------------------------------------------------------------------
-- Security_AllowedOrigin: DB-driven CORS allow-list used by the API middleware
-------------------------------------------------------------------------------
IF OBJECT_ID(N'dbo.Security_AllowedOrigin', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.Security_AllowedOrigin
  (
    [Origin] NVARCHAR(512) NOT NULL CONSTRAINT PK_Security_AllowedOrigin PRIMARY KEY,
    [Notes]  NVARCHAR(200) NULL
  );
END;

COMMIT;
GO
