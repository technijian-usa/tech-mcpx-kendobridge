/* Lookup a value by (Type, Key). Returns zero rows if missing. */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO
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
