/* Lookup by type/key. Returns zero rows when not found (DAL maps to null). */
SET ANSI_NULLS ON; SET QUOTED_IDENTIFIER ON; GO
CREATE OR ALTER PROCEDURE dbo.sp_Lookup_Get
  @Type NVARCHAR(100),
  @Key  NVARCHAR(200)
AS
BEGIN
  SET NOCOUNT ON;

  SELECT TOP (1) [Value]
  FROM dbo.[Lookup] WITH (READCOMMITTED)
  WHERE [Type] = @Type
    AND [Key]  = @Key;
END
GO
