IF OBJECT_ID(N'dbo.sp_Feature_IsEnabled', N'P') IS NOT NULL
  DROP PROCEDURE dbo.sp_Feature_IsEnabled;
GO
CREATE PROCEDURE dbo.sp_Feature_IsEnabled @Name NVARCHAR(200)
AS
BEGIN
  SET NOCOUNT ON;
  SELECT CAST(CASE WHEN EXISTS (
    SELECT 1 FROM dbo.FeatureFlag WITH (NOLOCK)
    WHERE [Name] = @Name AND [Enabled] = 1
  ) THEN 1 ELSE 0 END AS bit) AS [Enabled];
END
GO
