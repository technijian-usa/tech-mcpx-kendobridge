/*=====================================================================
  Baseline schema (idempotent) for non-secret runtime config, feature
  flags, general lookups, and DB-driven CORS allow-list.
  - Tables contain NO secrets. Secrets belong in GitHub Env secrets.
  - Add-only evolution is enforced by Technijian SDLC.
=====================================================================*/
SET XACT_ABORT ON;
BEGIN TRAN;

IF OBJECT_ID(N'dbo.AppConfig', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.AppConfig (
    [Key]   NVARCHAR(200) NOT NULL CONSTRAINT PK_AppConfig PRIMARY KEY,
    [Value] NVARCHAR(MAX) NOT NULL
  );
END;

IF OBJECT_ID(N'dbo.FeatureFlag', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.FeatureFlag (
    [Name]    NVARCHAR(200) NOT NULL CONSTRAINT PK_FeatureFlag PRIMARY KEY,
    [Enabled] BIT NOT NULL CONSTRAINT DF_FeatureFlag_Enabled DEFAULT(0)
  );
END;

IF OBJECT_ID(N'dbo.[Lookup]', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.[Lookup] (
    [Type] NVARCHAR(100) NOT NULL,
    [Key]  NVARCHAR(200) NOT NULL,
    [Value] NVARCHAR(MAX) NOT NULL,
    CONSTRAINT PK_Lookup PRIMARY KEY ([Type],[Key])
  );
END;

IF OBJECT_ID(N'dbo.Security_AllowedOrigin', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.Security_AllowedOrigin (
    [Origin] NVARCHAR(512) NOT NULL CONSTRAINT PK_Security_AllowedOrigin PRIMARY KEY,
    [Notes]  NVARCHAR(200) NULL
  );
END;

COMMIT;
