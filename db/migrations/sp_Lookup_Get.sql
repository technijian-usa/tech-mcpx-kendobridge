IF OBJECT_ID(N'dbo.sp_Lookup_Get', N'P') IS NOT NULL
  DROP PROCEDURE dbo.sp_Lookup_Get;
GO
CREATE PROCEDURE dbo.sp_Lookup_Get
  @Type NVARCHAR(100),
  @Key  NVARCHAR(200)
AS
BEGIN
  SET NOCOUNT ON;
  SELECT TOP (1) [Value] FROM dbo.[Lookup] WITH (NOLOCK)
  WHERE [Type] = @Type AND [Key] = @Key;
END
GO
