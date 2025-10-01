/*==============================================================================
  sp_Config_GetAll.sql
  Technijian MCPX – Return all non-secret configuration key/value pairs

  Contract
    EXEC dbo.sp_Config_GetAll

  Behavior
    - Returns a read-only snapshot of all rows in dbo.AppConfig.
    - Sorted by [Key] for predictable client rendering and diffs.
    - Intended for operator visibility in the Admin UI; NEVER store secrets
      in AppConfig (use environment/Key Vault/GitHub Environments for those).

  Notes
    - Uses default READ COMMITTED isolation (no dirty reads).
    - If you need a stable snapshot across multiple related reads, consider
      wrapping calls in a transaction with SNAPSHOT isolation enabled at DB.
==============================================================================*/
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Config_GetAll
AS
BEGIN
  SET NOCOUNT ON;

  SELECT [Key], [Value]
  FROM dbo.AppConfig
  ORDER BY [Key];
END
GO

/* Optional least-privilege grant (uncomment and replace role/user as needed)
-- GRANT EXECUTE ON dbo.sp_Config_GetAll TO [mcpx_api_role];
*/
