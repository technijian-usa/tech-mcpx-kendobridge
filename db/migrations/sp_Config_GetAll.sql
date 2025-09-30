IF OBJECT_ID(N'dbo.sp_Config_GetAll', N'P') IS NOT NULL
  DROP PROCEDURE dbo.sp_Config_GetAll;
GO
CREATE PROCEDURE dbo.sp_Config_GetAll
AS
BEGIN
  SET NOCOUNT ON;
  SELECT [Key],[Value] FROM dbo.AppConfig WITH (NOLOCK) ORDER BY [Key];
END
GO
