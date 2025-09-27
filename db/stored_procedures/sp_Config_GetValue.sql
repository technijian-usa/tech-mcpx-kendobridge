/* =======================================================================
   sp_Config_GetValue
   Purpose : Fetch a single non-secret configuration value by key
   Contract: @Key NVARCHAR(200) → NVARCHAR(MAX) (NULL if not found)
   Policy  : SP-only DAL; Add-only schema; No-Hard-Coding; secrets never in DB
   ======================================================================= */
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
