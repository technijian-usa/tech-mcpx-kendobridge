/* =======================================================================
   sp_Lookup_Get
   Purpose : Fetch a typed lookup value without ad-hoc SQL
   Contract: @Type NVARCHAR(100), @Key NVARCHAR(200) → NVARCHAR(MAX) (NULL if none)
   Policy  : SP-only DAL; Add-only schema; No-Hard-Coding
   ======================================================================= */
CREATE OR ALTER PROCEDURE dbo.sp_Lookup_Get
    @Type NVARCHAR(100),
    @Key  NVARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;

    /* Placeholder implementation (returns NULL).
       Define type-specific lookups in future add-only migrations. */
    SELECT CAST(NULL AS NVARCHAR(MAX)) AS [Value];
END
GO
