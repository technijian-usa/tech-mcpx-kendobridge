/*==============================================================================
  sp_Lookup_Get.sql
  Technijian MCPX – Return a typed lookup value

  Contract
    EXEC dbo.sp_Lookup_Get
      @Type = N'<lookup-type>',   -- e.g., 'Display', 'Format', 'Enum.SessionStatus'
      @Key  = N'<lookup-key>'     -- e.g., 'Session.Status.Active'

  Behavior
    - Returns at most one row with a single column: [Value] NVARCHAR(MAX).
    - Returns ZERO rows if the key is not present (caller interprets as NULL).
    - Leverages PK([Type],[Key]) on dbo.[Lookup] for efficient point reads.

  Notes
    - Default READ COMMITTED isolation (no dirty reads).
    - Keep lookup entries for NON-SECRET display/config values only.
==============================================================================*/
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

/* Optional least-privilege grant (uncomment and replace role/user as needed)
-- GRANT EXECUTE ON dbo.sp_Lookup_Get TO [mcpx_api_role];
*/
