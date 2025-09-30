/* Feature toggle check by name. */
SET ANSI_NULLS ON; SET QUOTED_IDENTIFIER ON; GO
CREATE OR ALTER PROCEDURE dbo.sp_Feature_IsEnabled
  @Name NVARCHAR(200)
AS
BEGIN
  SET NOCOUNT ON;
  SELECT CAST(CASE WHEN EXISTS (
    SELECT 1 FROM dbo.FeatureFlag WITH (READCOMMITTED)
    WHERE [Name] = @Name AND [Enabled] = 1
  ) THEN 1 ELSE 0 END AS bit) AS [Enabled];
END
GO
