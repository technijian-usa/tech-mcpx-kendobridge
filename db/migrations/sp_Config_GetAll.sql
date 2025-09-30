/* Returns all non-secret config keys (read-only). */
SET ANSI_NULLS ON; SET QUOTED_IDENTIFIER ON; GO
CREATE OR ALTER PROCEDURE dbo.sp_Config_GetAll
AS
BEGIN
  SET NOCOUNT ON;
  SELECT [Key],[Value]
  FROM dbo.AppConfig WITH (READCOMMITTED)
  ORDER BY [Key];
END
GO
