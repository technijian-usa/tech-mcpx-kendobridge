/* Returns the value for a given config key. */
SET ANSI_NULLS ON; SET QUOTED_IDENTIFIER ON; GO
CREATE OR ALTER PROCEDURE dbo.sp_Config_GetValue
  @Key NVARCHAR(200)
AS
BEGIN
  SET NOCOUNT ON;
  SELECT [Value]
  FROM dbo.AppConfig WITH (READCOMMITTED)
  WHERE [Key] = @Key;
END
GO
