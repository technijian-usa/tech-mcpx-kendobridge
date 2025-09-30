SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Lookup_Get
  @Type NVARCHAR(100),
  @Key  NVARCHAR(200)
AS
BEGIN
  SET NOCOUNT ON;

  /* Read-committed for correctness; change to WITH (NOLOCK) only if you truly want dirty reads */
  SELECT TOP (1) [Value]
  FROM dbo.[Lookup] WITH (READCOMMITTED)
  WHERE [Type] = @Type
    AND [Key]  = @Key;
END
GO

/* Optional: grant execute to a role/service principal you use for the API identity
-- GRANT EXECUTE ON dbo.sp_Lookup_Get TO [YourDbRoleOrUser];
*/
