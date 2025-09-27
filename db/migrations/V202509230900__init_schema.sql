/* =======================================================================
   Migration:  V202509230900__init_schema.sql
   Project:    MCPX-KendoBridge
   Purpose:    Initialize add-only configuration schema (non-secret)
               - dbo.AppConfig    : K/V configuration (non-secret)
               - dbo.FeatureFlag  : Feature toggles (non-secret)
   Policy:     Add-only schema; SP-only DAL; No-Hard-Coding; secrets never in DB
   Notes:      Idempotent: safe to apply multiple times.
   ======================================================================= */

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRANSACTION;
    /* -------------------------
       Create dbo.AppConfig
       ------------------------- */
    IF OBJECT_ID(N'dbo.AppConfig', N'U') IS NULL
    BEGIN
        CREATE TABLE dbo.AppConfig
        (
            [Key]       NVARCHAR(200) NOT NULL,
            [Value]     NVARCHAR(MAX) NULL,                 -- non-secret only
            [UpdatedAt] DATETIME2     NOT NULL
                CONSTRAINT DF_AppConfig_UpdatedAt DEFAULT SYSUTCDATETIME(),
            CONSTRAINT PK_AppConfig PRIMARY KEY CLUSTERED ([Key])
        );
    END;

    /* Ensure default constraint exists (idempotent check) */
    IF OBJECT_ID(N'dbo.AppConfig', N'U') IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM sys.default_constraints dc
        JOIN sys.columns c ON c.object_id = dc.parent_object_id AND c.column_id = dc.parent_column_id
        WHERE dc.parent_object_id = OBJECT_ID(N'dbo.AppConfig')
          AND c.name = N'UpdatedAt'
    )
    BEGIN
        ALTER TABLE dbo.AppConfig
        ADD CONSTRAINT DF_AppConfig_UpdatedAt DEFAULT SYSUTCDATETIME() FOR [UpdatedAt];
    END;

    /* Basic supporting index (optional, additive) */
    IF OBJECT_ID(N'dbo.AppConfig', N'U') IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_AppConfig_UpdatedAt' AND object_id = OBJECT_ID(N'dbo.AppConfig'))
    BEGIN
        CREATE NONCLUSTERED INDEX IX_AppConfig_UpdatedAt ON dbo.AppConfig ([UpdatedAt]);
    END;

    /* -------------------------
       Create dbo.FeatureFlag
       ------------------------- */
    IF OBJECT_ID(N'dbo.FeatureFlag', N'U') IS NULL
    BEGIN
        CREATE TABLE dbo.FeatureFlag
        (
            [Name]      NVARCHAR(200) NOT NULL,
            [Enabled]   BIT           NOT NULL,
            [UpdatedAt] DATETIME2     NOT NULL
                CONSTRAINT DF_FeatureFlag_UpdatedAt DEFAULT SYSUTCDATETIME(),
            CONSTRAINT PK_FeatureFlag PRIMARY KEY CLUSTERED ([Name])
        );
    END;

    /* Ensure default constraint exists (idempotent check) */
    IF OBJECT_ID(N'dbo.FeatureFlag', N'U') IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM sys.default_constraints dc
        JOIN sys.columns c ON c.object_id = dc.parent_object_id AND c.column_id = dc.parent_column_id
        WHERE dc.parent_object_id = OBJECT_ID(N'dbo.FeatureFlag')
          AND c.name = N'UpdatedAt'
    )
    BEGIN
        ALTER TABLE dbo.FeatureFlag
        ADD CONSTRAINT DF_FeatureFlag_UpdatedAt DEFAULT SYSUTCDATETIME() FOR [UpdatedAt];
    END;

    /* Supporting index for auditing/review (additive) */
    IF OBJECT_ID(N'dbo.FeatureFlag', N'U') IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_FeatureFlag_UpdatedAt' AND object_id = OBJECT_ID(N'dbo.FeatureFlag'))
    BEGIN
        CREATE NONCLUSTERED INDEX IX_FeatureFlag_UpdatedAt ON dbo.FeatureFlag ([UpdatedAt]);
    END;

COMMIT TRANSACTION;
GO

/* -------------------------
   Compliance banner (documentation comment)
   -------------------------
   DB COMPLIANCE:
   - Add-only schema: this script only creates tables/indexes/defaults if missing.
   - SP-only access: application principals will receive EXECUTE-only on whitelisted SPs,
     never table CRUD (granted in a separate migration).
   - No-Hard-Coding: dynamic values are read from these tables via stored procedures.
   - Secrets: NEVER store secrets here; secrets live only in GitHub Environments.
*/
