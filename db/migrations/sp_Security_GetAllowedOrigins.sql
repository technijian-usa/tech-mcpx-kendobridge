/* Return DB-driven CORS allow-list. */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO
CREATE OR ALTER PROCEDURE dbo.sp_Security_GetAllowedOrigins
AS
BEGIN
  SET NOCOUNT ON;
  SELECT [Origin]
  FROM dbo.Security_AllowedOrigin WITH (READCOMMITTED)
  ORDER BY [Origin];
END
GO
