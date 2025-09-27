/* =======================================================================
   sp_Feature_IsEnabled
   Purpose : Check if a feature flag is enabled
   Contract: @Name NVARCHAR(200) → BIT (0 if missing)
   Policy  : SP-only DAL; Add-only schema; No-Hard-Coding
   ======================================================================= */
CREATE OR ALTER PROCEDURE dbo.sp_Feature_IsEnabled
    @Name NVARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT CAST(ISNULL([Enabled], 0) AS BIT)
    FROM dbo.FeatureFlag WITH (READCOMMITTED)
    WHERE [Name] = @Name;
END
GO
