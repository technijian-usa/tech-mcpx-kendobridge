/*==============================================================================
  sp_Feature_IsEnabled.sql
  Technijian MCPX – Check if a feature flag is enabled

  Contract
    EXEC dbo.sp_Feature_IsEnabled @Name = N'<feature-name>'

  Behavior
    - Returns a single-row, single-column result set:
        [Enabled] BIT  -- 1 if enabled, 0 otherwise
    - Uses an EXISTS probe against dbo.FeatureFlag (PK(Name)).

  Notes
    - Keep feature flags coarse-grained (guard major UI/API features only).
    - READ COMMITTED isolation (default) is sufficient for flags.
==============================================================================*/
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Feature_IsEnabled
  @Name NVARCHAR(200)   -- Feature flag name (e.g., 'SSE.Enabled', 'ReadOnlyMode')
AS
BEGIN
  SET NOCOUNT ON;

  SELECT CAST(CASE WHEN EXISTS (
           SELECT 1
           FROM dbo.FeatureFlag WITH (READCOMMITTED)
           WHERE [Name] = @Name
             AND [Enabled] = 1
         )
         THEN 1 ELSE 0 END AS bit) AS [Enabled];
END
GO

/* Optional least-privilege grant (uncomment and replace role/user as needed)
-- GRANT EXECUTE ON dbo.sp_Feature_IsEnabled TO [mcpx_api_role];
*/
