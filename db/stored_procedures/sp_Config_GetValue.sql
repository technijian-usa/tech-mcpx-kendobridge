/*==============================================================================
  sp_Config_GetValue.sql
  Technijian MCPX – Return a single non-secret configuration value

  Contract
    EXEC dbo.sp_Config_GetValue @Key = N'<key>'

  Notes
    - Uses the AppConfig PK([Key]) for an efficient point lookup.
    - Returns exactly one scalar row when present; returns zero rows if missing.
    - Keeps default READ COMMITTED isolation (no NOLOCK/dirty reads).
==============================================================================*/
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Config_GetValue
  @Key NVARCHAR(200)  -- Configuration key to fetch (case-insensitive collation recommended at DB level)
AS
BEGIN
  SET NOCOUNT ON;

  SELECT TOP (1) [Value]
  FROM dbo.AppConfig
  WHERE [Key] = @Key;
END
GO

/* Optional least-privilege grant (uncomment and replace role/user as needed)
-- GRANT EXECUTE ON dbo.sp_Config_GetValue TO [mcpx_api_role];
*/
