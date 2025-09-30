IF OBJECT_ID(N'dbo.sp_Config_GetValue', N'P') IS NOT NULL
  DROP PROCEDURE dbo.sp_Config_GetValue;
GO
CREATE PROCEDURE dbo.sp_Config_GetValue @Key NVARCHAR(200)
AS
BEGIN
  SET NOCOUNT ON;
  SELECT [Value] FROM dbo.AppConfig WITH (NOLOCK) WHERE [Key] = @Key;
END
GO
