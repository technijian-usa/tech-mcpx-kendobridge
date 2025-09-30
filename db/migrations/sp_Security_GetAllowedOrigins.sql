IF OBJECT_ID(N'dbo.sp_Security_GetAllowedOrigins', N'P') IS NOT NULL
  DROP PROCEDURE dbo.sp_Security_GetAllowedOrigins;
GO
CREATE PROCEDURE dbo.sp_Security_GetAllowedOrigins
AS
BEGIN
  SET NOCOUNT ON;
  SELECT [Origin] FROM dbo.Security_AllowedOrigin WITH (NOLOCK) ORDER BY [Origin];
END
GO
