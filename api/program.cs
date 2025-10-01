// ============================================================================
// Program.cs
// Technijian MCPX Admin API (ASP.NET Core 8)
// ----------------------------------------------------------------------------
// Purpose
//   Read-only Admin API that surfaces non-secret configuration for the SPA,
//   enforces Azure AD JWT (scope-based) authorization, serves an SSE endpoint,
//   and drives CORS from the DB allow-list (no hard-coded origins).
//
// Key design rules (per Technijian SDLC):
//   - NO hard-coded secrets or environment-specific literals in code.
//   - DB access via stored procedures only (thin DAL, parameterized).
//   - Four-environment pipeline handled outside code (CI/CD & DB seeds).
//   - Optional SSE auth: token carried via querystring for EventSource.
// ----------------------------------------------------------------------------
// Configuration (non-secret) expected in dbo.AppConfig:
//   AzureAd:TenantId           -> Tenant GUID (used to compute Authority if not set)
//   AzureAd:ClientId           -> SPA application (public client) ID
//   AzureAd:RedirectUri        -> SPA redirect URI
//   AzureAd:Scope              -> Scope requested by SPA (e.g., Access.Admin)
//   Auth:Authority             -> Optional explicit authority (https://login.microsoftonline.com/<tenant>/v2.0)
//   Auth:Audience              -> API App ID URI / client ID (ValidAudience)
//   Auth:RequiredScope         -> Scope required by protected endpoints
//   Sse:HeartbeatSeconds       -> Heartbeat cadence for keepalive events (default 15)
//   Security:SseRequireAuth    -> "true"/"false" to guard SSE route with auth
//
// Other schema elements (see migrations):
//   dbo.Security_AllowedOrigin(Origin NVARCHAR(512) PK, Notes NVARCHAR(200) NULL)
// ----------------------------------------------------------------------------
// Runtime requirements:
//   - Connection string supplied via environment variable SQL_CONN_STRING
//   - Deployed behind reverse proxy that preserves headers (nginx config provided)
// ============================================================================

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using System.Data;
using System.Linq;

// Build DI container and configuration
var builder = WebApplication.CreateBuilder(args);

// In-memory caching (used for allow-list)
builder.Services.AddMemoryCache();

// --------------------------------------------------------------------------
// Connection string: NEVER hard-code. Provided by environment or user-secrets.
// --------------------------------------------------------------------------
var sqlConnString = new SqlConnectionStringBuilder(
    Environment.GetEnvironmentVariable("SQL_CONN_STRING")
    ?? builder.Configuration.GetConnectionString("Default")
    ?? throw new InvalidOperationException("SQL_CONN_STRING / ConnectionStrings__Default must be set.")
).ConnectionString;

// Core services
builder.Services.AddSingleton(sqlConnString);
builder.Services.AddSingleton<ISqlDal, SqlDal>();
builder.Services.AddSingleton<PublicConfigProvider>();
builder.Services.AddSingleton<AllowedOriginsProvider>();

// Structured logging (Serilog) – sinks configured via appsettings and/or env
builder.Host.UseSerilog((ctx, cfg) => cfg.ReadFrom.Configuration(ctx.Configuration));

// --------------------------------------------------------------------------
// Load non-secret boot auth config from DB to configure JWT & policies
// --------------------------------------------------------------------------
var boot = await AuthBootConfig.LoadAsync(sqlConnString);

// Azure AD JWT bearer validation
builder.Services
  .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
  .AddJwtBearer(options =>
  {
      options.Authority = boot.Authority; // e.g., https://login.microsoftonline.com/<tenant>/v2.0
      options.TokenValidationParameters = new TokenValidationParameters
      {
          ValidateIssuer = true,
          ValidAudience = boot.Audience,   // e.g., api://<api-app-id>
          ValidateAudience = true,
          ValidateLifetime = true
      };

      // Allow EventSource to supply token as query param (?access_token=...)
      options.Events = new JwtBearerEvents
      {
          OnMessageReceived = ctx =>
          {
              var token = ctx.Request.Query["access_token"].ToString();
              if (!string.IsNullOrWhiteSpace(token)
                  && ctx.HttpContext.Request.Path.StartsWithSegments("/sessions/stream", StringComparison.OrdinalIgnoreCase))
              {
                  ctx.Token = token;
              }
              return Task.CompletedTask;
          }
      };
  });

// Scope-based authorization policy (checks "scp" claim)
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireScope", policy =>
    {
        policy.RequireAssertion(ctx =>
        {
            // If no scope required, allow (non-Prod can operate without strict scp)
            var required = boot.RequiredScope;
            if (string.IsNullOrWhiteSpace(required)) return true;

            // Azure AD places scopes in the "scp" claim as a space-delimited list
            var scp = ctx.User.FindFirst("scp")?.Value ?? string.Empty;
            var scopes = scp.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            return scopes.Contains(required, StringComparer.Ordinal);
        });
    });
});

var app = builder.Build();

// --------------------------------------------------------------------------
// Minimal security headers (adjust or extend in reverse proxy if needed)
// --------------------------------------------------------------------------
app.Use(async (ctx, next) =>
{
    ctx.Response.Headers["X-Content-Type-Options"] = "nosniff";
    ctx.Response.Headers["Referrer-Policy"] = "no-referrer";
    ctx.Response.Headers["X-Frame-Options"] = "DENY";
    await next();
});

// --------------------------------------------------------------------------
// Dynamic CORS from DB allow-list. Handles preflight and simple requests.
// --------------------------------------------------------------------------
app.Use(async (ctx, next) =>
{
    var origin = ctx.Request.Headers.Origin.ToString();
    if (!string.IsNullOrEmpty(origin))
    {
        var allowed = await ctx.RequestServices
                               .GetRequiredService<AllowedOriginsProvider>()
                               .IsAllowedAsync(origin, ctx.RequestAborted);

        if (allowed)
        {
            ctx.Response.Headers["Access-Control-Allow-Origin"] = origin;
            ctx.Response.Headers["Vary"] = "Origin";
            ctx.Response.Headers["Access-Control-Allow-Credentials"] = "true";
            ctx.Response.Headers["Access-Control-Allow-Headers"] = "authorization,content-type";
            ctx.Response.Headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,PATCH,DELETE,OPTIONS";
        }
    }

    if (ctx.Request.Method.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase))
    {
        ctx.Response.StatusCode = 200;
        await ctx.Response.CompleteAsync();
        return;
    }

    await next();
});

app.UseAuthentication();
app.UseAuthorization();

// --------------------------------------------------------------------------
// Public endpoints (no auth)
// --------------------------------------------------------------------------
app.MapGet("/health", () =>
{
    // Keep lightweight: if the process is up, return OK.
    return Results.Ok(new { status = "ok", service = "Technijian.MCPX.AdminApi" });
});

app.MapGet("/readiness", async (ISqlDal dal, CancellationToken ct) =>
{
    // Minimal DB touch to ensure connectivity & SP availability.
    await dal.ExecuteAsync("dbo.sp_Config_GetAll", CommandType.StoredProcedure, ct: ct);
    return Results.Ok(new { ready = true });
});

app.MapGet("/config/public", async (PublicConfigProvider cfg, CancellationToken ct) =>
{
    // Only non-secret boot values for SPA initialization.
    var payload = await cfg.GetAsync(ct);
    return payload is null ? Results.NoContent() : Results.Ok(payload);
});

// --------------------------------------------------------------------------
// Authenticated endpoints (scope-gated)
// --------------------------------------------------------------------------
app.MapGet("/config", async (ISqlDal dal, CancellationToken ct) =>
{
    // Read-only view for operational visibility (no secrets).
    var rows = await dal.QueryAsync("dbo.sp_Config_GetAll", CommandType.StoredProcedure, ct: ct);
    return Results.Ok(rows);
}).RequireAuthorization("RequireScope");

app.MapGet("/access/allowlist", async (AllowedOriginsProvider provider, CancellationToken ct) =>
{
    var origins = await provider.GetAsync(ct);
    return Results.Ok(origins);
}).RequireAuthorization("RequireScope");

// --------------------------------------------------------------------------
// Server-Sent Events: keepalive/telemetry channel.
// If Security:SseRequireAuth = true, the route requires JWT (supports ?access_token=).
// --------------------------------------------------------------------------
var sseEndpoint = app.MapGet("/sessions/stream", async (HttpContext ctx, PublicConfigProvider cfg, CancellationToken ct) =>
{
    ctx.Response.Headers.Append("Cache-Control", "no-cache");
    ctx.Response.Headers.Append("Content-Type", "text/event-stream");
    ctx.Response.Headers.Append("X-Accel-Buffering", "no"); // disable proxy buffering (nginx)

    var heartbeat = await cfg.GetHeartbeatAsync(ct) ?? 15;
    while (!ct.IsCancellationRequested)
    {
        var data = $"event: keepalive\ndata: {DateTime.UtcNow:O}\n\n";
        await ctx.Response.WriteAsync(data, ct);
        await ctx.Response.Body.FlushAsync(ct);
        await Task.Delay(TimeSpan.FromSeconds(heartbeat), ct);
    }
});
if (boot.SseRequireAuth)
{
    sseEndpoint.RequireAuthorization("RequireScope");
}

app.Run();


// ============================================================================
// Supporting types
// ============================================================================

/// <summary>
/// Boot-time authorization/config values pulled from the database.
/// </summary>
public sealed record AuthBootConfig(string Authority, string Audience, bool SseRequireAuth, string? RequiredScope)
{
    /// <summary>
    /// Loads Authority/Audience/SSE toggle/RequiredScope from dbo.AppConfig.
    /// Computes Authority from AzureAd:TenantId if not explicitly set.
    /// </summary>
    public static async Task<AuthBootConfig> LoadAsync(string connectionString)
    {
        static async Task<string?> GetAsync(string cs, string key)
        {
            await using var conn = new SqlConnection(cs);
            await conn.OpenAsync();
            await using var cmd = new SqlCommand("dbo.sp_Config_GetValue", conn)
            {
                CommandType = CommandType.StoredProcedure
            };
            cmd.Parameters.AddWithValue("@Key", key);
            var val = await cmd.ExecuteScalarAsync();
            return val?.ToString();
        }

        var authority = await GetAsync(connectionString, "Auth:Authority");
        var audience  = await GetAsync(connectionString, "Auth:Audience");
        var sseAuth   = await GetAsync(connectionString, "Security:SseRequireAuth");
        var scope     = await GetAsync(connectionString, "Auth:RequiredScope");

        if (string.IsNullOrWhiteSpace(authority))
        {
            var tenant = await GetAsync(connectionString, "AzureAd:TenantId")
                         ?? throw new InvalidOperationException("AzureAd:TenantId missing; cannot compute Authority.");
            authority = $"https://login.microsoftonline.com/{tenant}/v2.0";
        }

        if (string.IsNullOrWhiteSpace(audience))
            throw new InvalidOperationException("Auth:Audience missing; set the API App ID URI or Client ID in AppConfig.");

        var require = bool.TryParse(sseAuth, out var b) && b;
        return new AuthBootConfig(authority, audience, require, string.IsNullOrWhiteSpace(scope) ? null : scope);
    }
}

/// <summary>
/// Contract for SQL DAL to enable unit testing (fake/mocked implementations).
/// </summary>
public interface ISqlDal
{
    /// <summary>Executes a command (SP-only) that does not return rows.</summary>
    Task<int> ExecuteAsync(string name, CommandType type, IEnumerable<SqlParameter>? @params = null, CancellationToken ct = default);

    /// <summary>Executes a command (SP-only) and returns rows as dictionaries.</summary>
    Task<List<Dictionary<string, object?>>> QueryAsync(string name, CommandType type, IEnumerable<SqlParameter>? @params = null, CancellationToken ct = default);

    /// <summary>Convenience method that returns the first column of the first row as string (or null).</summary>
    Task<string?> QueryStringAsync(string spName, params SqlParameter[] ps);
}

/// <summary>
/// Thin, parameterized SqlClient DAL that calls stored procedures only.
/// CommandTimeout defaults to 30 seconds.
/// </summary>
public sealed class SqlDal : ISqlDal
{
    private readonly string _cs;
    public SqlDal(string connectionString) => _cs = connectionString;

    public async Task<int> ExecuteAsync(string name, CommandType type, IEnumerable<SqlParameter>? @params = null, CancellationToken ct = default)
    {
        await using var conn = new SqlConnection(_cs);
        await conn.OpenAsync(ct);
        await using var cmd = new SqlCommand(name, conn) { CommandType = type, CommandTimeout = 30 };
        if (@params is not null) cmd.Parameters.AddRange(@params.ToArray());
        return await cmd.ExecuteNonQueryAsync(ct);
    }

    public async Task<List<Dictionary<string, object?>>> QueryAsync(string name, CommandType type, IEnumerable<SqlParameter>? @params = null, CancellationToken ct = default)
    {
        await using var conn = new SqlConnection(_cs);
        await conn.OpenAsync(ct);
        await using var cmd = new SqlCommand(name, conn) { CommandType = type, CommandTimeout = 30 };
        if (@params is not null) cmd.Parameters.AddRange(@params.ToArray());
        await using var rdr = await cmd.ExecuteReaderAsync(CommandBehavior.SequentialAccess, ct);

        var rows = new List<Dictionary<string, object?>>();
        while (await rdr.ReadAsync(ct))
        {
            var row = new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase);
            for (var i = 0; i < rdr.FieldCount; i++)
            {
                row[rdr.GetName(i)] = await rdr.IsDBNullAsync(i, ct) ? null : rdr.GetValue(i);
            }
            rows.Add(row);
        }
        return rows;
    }

    public async Task<string?> QueryStringAsync(string spName, params SqlParameter[] ps)
    {
        var rows = await QueryAsync(spName, CommandType.StoredProcedure, ps);
        if (rows.Count == 0) return null;
        var first = rows[0].Values.FirstOrDefault();
        return first?.ToString();
    }
}

/// <summary>
/// Provides the SPA with non-secret boot configuration (AAD + SSE + CORS allow-list).
/// </summary>
public sealed class PublicConfigProvider
{
    private readonly ISqlDal _dal;
    public PublicConfigProvider(ISqlDal dal) => _dal = dal;

    private static readonly string[] PublicKeys =
    {
        "AzureAd:TenantId", "AzureAd:ClientId", "AzureAd:RedirectUri", "AzureAd:Scope",
        "Sse:HeartbeatSeconds", "Security:SseRequireAuth"
    };

    /// <summary>
    /// Returns an object containing Azure AD client settings, SSE defaults, and allowed origins.
    /// Only non-secret keys are included.
    /// </summary>
    public async Task<object?> GetAsync(CancellationToken ct)
    {
        var dict = new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase);
        foreach (var key in PublicKeys)
        {
            var val = await _dal.QueryStringAsync("dbo.sp_Config_GetValue", new SqlParameter("@Key", key));
            if (!string.IsNullOrWhiteSpace(val)) dict[key] = val;
        }

        var origins = await _dal.QueryAsync("dbo.sp_Security_GetAllowedOrigins", CommandType.StoredProcedure, ct: ct);
        var allowedOrigins = origins
            .Select(r => r.TryGetValue("Origin", out var v) ? v?.ToString() : null)
            .Where(s => !string.IsNullOrWhiteSpace(s))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        if (dict.Count == 0 && allowedOrigins.Length == 0) return null;

        return new
        {
            azureAd = new
            {
                tenantId    = dict.GetValueOrDefault("AzureAd:TenantId"),
                clientId    = dict.GetValueOrDefault("AzureAd:ClientId"),
                redirectUri = dict.GetValueOrDefault("AzureAd:RedirectUri"),
                scope       = dict.GetValueOrDefault("AzureAd:Scope")
            },
            sse = new
            {
                heartbeatSeconds = int.TryParse(dict.GetValueOrDefault("Sse:HeartbeatSeconds"), out var s) ? s : 15,
                requireAuth      = bool.TryParse(dict.GetValueOrDefault("Security:SseRequireAuth"), out var b) && b
            },
            cors = new { allowedOrigins }
        };
    }

    /// <summary>
    /// Returns the SSE heartbeat seconds if set; otherwise null (caller applies default).
    /// </summary>
    public async Task<int?> GetHeartbeatAsync(CancellationToken ct)
    {
        var val = await _dal.QueryStringAsync("dbo.sp_Config_GetValue", new SqlParameter("@Key", "Sse:HeartbeatSeconds"));
        return int.TryParse(val, out var s) ? s : null;
    }
}

/// <summary>
/// Caches and exposes the DB-driven CORS allow-list.
/// </summary>
public sealed class AllowedOriginsProvider
{
    private readonly ISqlDal _dal;
    private readonly IMemoryCache _cache;

    public AllowedOriginsProvider(ISqlDal dal, IMemoryCache cache)
    {
        _dal = dal;
        _cache = cache;
    }

    /// <summary>
    /// Returns distinct origins, cached for 5 minutes to reduce DB load.
    /// </summary>
    public async Task<string[]> GetAsync(CancellationToken ct)
    {
        if (_cache.TryGetValue<string[]>("allowed-origins", out var cached))
            return cached;

        var rows = await _dal.QueryAsync("dbo.sp_Security_GetAllowedOrigins", CommandType.StoredProcedure, ct: ct);
        var origins = rows
            .Select(r => r.TryGetValue("Origin", out var v) ? v?.ToString() : null)
            .Where(s => !string.IsNullOrWhiteSpace(s))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        _cache.Set("allowed-origins", origins, TimeSpan.FromMinutes(5));
        return origins;
    }

    /// <summary>
    /// True if the given origin is present in the allow-list.
    /// </summary>
    public async Task<bool> IsAllowedAsync(string origin, CancellationToken ct)
    {
        var list = await GetAsync(ct);
        return list.Contains(origin, StringComparer.OrdinalIgnoreCase);
    }
}
