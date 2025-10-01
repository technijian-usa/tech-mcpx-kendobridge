/*==============================================================================
  sp_Security_GetAllowedOrigins.sql
  Technijian MCPX – Return the DB-driven CORS allow-list

  Contract
    EXEC dbo.sp_Security_GetAllowedOrigins

  Behavior
    - Returns one row per allowed origin (single column: [Origin]).
    - Read-only; Admin API caches results for 5 minutes.
    - Intended to drive CORS dynamically across environments.

  Notes
    - Manage rows per environment via seed scripts or controlled changes.
==============================================================================*/
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Security_GetAllowedOrigins
AS
BEGIN
  SET NOCOUNT ON;

  SELECT [Origin]
  FROM dbo.Security_AllowedOrigin WITH (READCOMMITTED)
  ORDER BY [Origin];
END
GO

/* Optional least-privilege grant (uncomment and replace role/user as needed)
-- GRANT EXECUTE ON dbo.sp_Security_GetAllowedOrigins TO [mcpx_api_role];
*/
