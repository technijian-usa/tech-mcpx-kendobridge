/* =======================================================================
   sp_Config_GetAll
   Purpose : List all non-secret configuration pairs
   Contract: () → TABLE [Key],[Value],[UpdatedAt]
   Policy  : SP-only DAL; Add-only schema; No-Hard-Coding; secrets never in DB
   ======================================================================= */
CREATE OR ALTER PROCEDURE dbo.sp_Config_GetAll
AS
BEGIN
    SET NOCOUNT ON;

    SELECT [Key], [Value], [UpdatedAt]
    FROM dbo.AppConfig WITH (READCOMMITTED)
    ORDER BY [Key];
END
GO
