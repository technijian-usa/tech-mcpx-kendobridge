// ============================================================================
// Technijian MCPX Admin API (ASP.NET Core 8, Minimal API style)
// - SP-only DAL (SqlClient) aligns with "no hard-coding / SP-only" rule
// - JWT (Azure AD) with RequireScope policy; SSE supports ?access_token=
// - Dynamic CORS from DB allow-list; non-secret public config endpoint
// ============================================================================

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using System.Data;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddMemoryCache();

// Connection string provided via env / GitHub Environments (NEVER hard-code)
var sqlConnString = new SqlConnectionStringBuilder(
    Environment.GetEnvironmentVariable("SQL_CONN_STRING")
    ?? builder.Configuration.GetConnectionString("Default")
    ?? throw new InvalidOperationException("SQL_CONN_STRING / ConnectionStrings__Default not set.")
).ConnectionString;

// DI registrations
builder.Services.AddSingleton(sqlConnString);
builder.Services.AddSingleton<ISqlDal, SqlDal>();
builder.Services.AddSingleton<PublicConfigProvider>();
builder.Services.AddSingleton<AllowedOriginsProvider>();

// Boot auth config (non-secret) out of DB
var boot = await AuthBootConfig.LoadAsync(sqlConnString);

// JWT Bearer (Azure AD)
builder.Services
  .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
  .AddJwtBearer(options =>
  {
      options.Authority = boot.Authority;           // e.g., https://login.microsoftonline.com/<tenant>/v2.0
      options.TokenValidationParameters = new TokenValidationParameters
      {
          ValidateIssuer = true,
          ValidAudience = boot.Audience,            // e.g., api://<api-app-id>
          ValidateAudience = true,
          ValidateLifetime = true,
      };
      // Allow SSE to pass token via query parameter
      options.Events = new JwtBearerEvents
      {
          OnMessageReceived = ctx =>
          {
              var token = ctx.Request.Query["access_token"].ToString();
              if (!string.IsNullOrWhiteSpace(token) &&
                  ctx.HttpContext.Request.Path.StartsWithSegments("/sessions/stream", StringComparison.OrdinalIgnoreCase))
              {
                  ctx.Token = token;
              }
              return Task.CompletedTask;
          }
      };
  });

// Authorization: scope-based (scp claim). If no required scope is set in DB, allow.
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireScope", policy =>
    {
        policy.RequireAssertion(ctx =>
        {
            var required = boot.RequiredScope;
            if (string.IsNullOrWhiteSpace(required)) return true;
            var scopes = (ctx.User.FindFirst("scp")?.Value ?? "")
                        .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            return scopes.Contains(required, StringComparer.Ordinal);
        });
    });
});

// Structured logging
builder.Host.UseSerilog((ctx, cfg) => cfg.ReadFrom.Configuration(ctx.Configuration));

var app = builder.Build();

// Minimal security headers
app.Use(async (ctx, next) =>
{
    ctx.Response.Headers["X-Content-Type-Options"] = "nosniff";
    ctx.Response.Headers["Referrer-Policy"] = "no-referrer";
    await next();
});

// Dynamic CORS from DB allow-list
app.Use(async (ctx, next) =>
{
    var origin = ctx.Request.Headers.Origin.ToString();
    if (!string.IsNullOrEmpty(origin))
    {
        var allowed = await ctx.RequestServices.GetRequiredService<AllowedOriginsProvider>()
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

// -------- Public endpoints --------
app.MapGet("/health", () => Results.Ok(new { status = "ok", service = "Technijian.MCPX.AdminApi" }));

app.MapGet("/readiness", async (ISqlDal dal, CancellationToken ct) =>
{
    // Touch DB by calling a safe SP; fail readiness if it errors
    await dal.ExecuteAsync("dbo.sp_Config_GetAll", CommandType.StoredProcedure, ct: ct);
    return Results.Ok(new { ready = true });
});

app.MapGet("/config/public", async (PublicConfigProvider cfg, CancellationToken ct) =>
{
    var result = await cfg.GetAsync(ct);
    return result is null ? Results.NoContent() : Results.Ok(result);
});

// -------- Authenticated endpoints (scope gated) --------
app.MapGet("/config", async (ISqlDal dal, CancellationToken ct) =>
{
    var table = await dal.QueryAsync("dbo.sp_Config_GetAll", CommandType.StoredProcedure, ct: ct);
    return Results.Ok(table);
}).RequireAuthorization("RequireScope");

app.MapGet("/access/allowlist", async (AllowedOriginsProvider p, CancellationToken ct) =>
{
    var origins = await p.GetAsync(ct);
    return Results.Ok(origins);
}).RequireAuthorization("RequireScope");

// -------- Server-Sent Events --------
// Optional auth per DB flag; clients can attach ?access_token= when required.
var sseRoute = app.MapGet("/sessions/stream", async (HttpContext ctx, PublicConfigProvider cfg, CancellationToken ct) =>
{
    ctx.Response.Headers.Append("Cache-Control", "no-cache");
    ctx.Response.Headers.Append("Content-Type", "text/event-stream");
    ctx.Response.Headers.Append("X-Accel-Buffering", "no");

    var heartbeat = await cfg.GetHeartbeatAsync(ct) ?? 15;
    while (!ct.IsCancellationRequested)
    {
        // Keepalive; replace/augment with business events as features grow
        var payload = $"event: keepalive\ndata: {DateTime.UtcNow:O}\n\n";
        await ctx.Response.WriteAsync(payload, ct);
        await ctx.Response.Body.FlushAsync(ct);
        await Task.Delay(TimeSpan.FromSeconds(heartbeat), ct);
    }
});
if (boot.SseRequireAuth) sseRoute.RequireAuthorization("RequireScope");

app.Run();


// ============================ helpers & providers ============================

/// <summary>Auth boot config, read from AppConfig (non-secret).</summary>
public sealed record AuthBootConfig(string Authority, string Audience, bool SseRequireAuth, string? RequiredScope)
{
    public static async Task<AuthBootConfig> LoadAsync(string connString)
    {
        static async Task<string?> GetAsync(string cs, string key)
        {
            await using var conn = new SqlConnection(cs);
            await conn.OpenAsync();
            await using var cmd = new SqlCommand("dbo.sp_Config_GetValue", conn) { CommandType = CommandType.StoredProcedure };
            cmd.Parameters.AddWithValue("@Key", key);
            var val = await cmd.ExecuteScalarAsync();
            return val?.ToString();
        }

        var authority = await GetAsync(connString, "Auth:Authority");
        var audience  = await GetAsync(connString, "Auth:Audience");
        var sseAuth   = await GetAsync(connString, "Security:SseRequireAuth");
        var scope     = await GetAsync(connString, "Auth:RequiredScope");

        if (string.IsNullOrWhiteSpace(authority))
        {
            var tenant = await GetAsync(connString, "AzureAd:TenantId")
                        ?? throw new InvalidOperationException("AzureAd:TenantId missing for Authority computation");
            authority = $"https://login.microsoftonline.com/{tenant}/v2.0";
        }
        if (string.IsNullOrWhiteSpace(audience))
            throw new InvalidOperationException("Auth:Audience is required");

        var require = bool.TryParse(sseAuth, out var b) && b;
        return new AuthBootConfig(authority, audience, require, string.IsNullOrWhiteSpace(scope) ? null : scope);
    }
}

/// <summary>SP-only DAL for executing stored procedures.</summary>
public interface ISqlDal
{
    Task<int> ExecuteAsync(string name, CommandType type, IEnumerable<SqlParameter>? @params = null, CancellationToken ct = default);
    Task<List<Dictionary<string, object?>>> QueryAsync(string name, CommandType type, IEnumerable<SqlParameter>? @params = null, CancellationToken ct = default);
    Task<string?> QueryStringAsync(string spName, params SqlParameter[] ps);
}

/// <inheritdoc/>
public sealed class SqlDal : ISqlDal
{
    private readonly string _cs;
    public SqlDal(string connectionString) => _cs = connectionString;

    public async Task<int> ExecuteAsync(string name, CommandType type, IEnumerable<SqlParameter>? @params = null, CancellationToken ct = default)
    {
        using var conn = new SqlConnection(_cs);
        await conn.OpenAsync(ct);
        using var cmd = new SqlCommand(name, conn) { CommandType = type, CommandTimeout = 30 };
        if (@params is not null) cmd.Parameters.AddRange(@params.ToArray());
        return await cmd.ExecuteNonQueryAsync(ct);
    }

    public async Task<List<Dictionary<string, object?>>> QueryAsync(string name, CommandType type, IEnumerable<SqlParameter>? @params = null, CancellationToken ct = default)
    {
        using var conn = new SqlConnection(_cs);
        await conn.OpenAsync(ct);
        using var cmd = new SqlCommand(name, conn) { CommandType = type, CommandTimeout = 30 };
        if (@params is not null) cmd.Parameters.AddRange(@params.ToArray());
        using var rdr = await cmd.ExecuteReaderAsync(CommandBehavior.SequentialAccess, ct);

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

/// <summary>Exposes only non-secret boot config to the SPA.</summary>
public sealed class PublicConfigProvider
{
    private readonly ISqlDal _dal;
    public PublicConfigProvider(ISqlDal dal) => _dal = dal;

    private static readonly string[] PublicKeys = new[]
    {
        "AzureAd:TenantId", "AzureAd:ClientId", "AzureAd:RedirectUri", "AzureAd:Scope",
        "Sse:HeartbeatSeconds", "Security:SseRequireAuth"
    };

    public async Task<object?> GetAsync(CancellationToken ct)
    {
        var dict = new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase);
        foreach (var key in PublicKeys)
        {
            var val = await _dal.QueryStringAsync("dbo.sp_Config_GetValue", new SqlParameter("@Key", key));
            if (!string.IsNullOrWhiteSpace(val)) dict[key] = val;
        }

        var origins = await _dal.QueryAsync("dbo.sp_Security_GetAllowedOrigins", CommandType.StoredProcedure, ct: ct);
        var allowedOrigins = origins.Select(r => r["Origin"]?.ToString()).Where(s => !string.IsNullOrWhiteSpace(s)).ToArray();

        if (dict.Count == 0 && allowedOrigins.Length == 0) return null;

        return new
        {
            azureAd = new {
                tenantId   = dict.GetValueOrDefault("AzureAd:TenantId"),
                clientId   = dict.GetValueOrDefault("AzureAd:ClientId"),
                redirectUri= dict.GetValueOrDefault("AzureAd:RedirectUri"),
                scope      = dict.GetValueOrDefault("AzureAd:Scope")
            },
            sse = new {
                heartbeatSeconds = int.TryParse(dict.GetValueOrDefault("Sse:HeartbeatSeconds"), out var s) ? s : 15,
                requireAuth = bool.TryParse(dict.GetValueOrDefault("Security:SseRequireAuth"), out var b) && b
            },
            cors = new { allowedOrigins }
        };
    }

    public async Task<int?> GetHeartbeatAsync(CancellationToken ct)
    {
        var val = await _dal.QueryStringAsync("dbo.sp_Config_GetValue", new SqlParameter("@Key", "Sse:HeartbeatSeconds"));
        return int.TryParse(val, out var s) ? s : null;
    }
}

/// <summary>DB-backed CORS allow-list with 5-minute memory cache.</summary>
public sealed class AllowedOriginsProvider
{
    private readonly ISqlDal _dal;
    private readonly IMemoryCache _cache;

    public AllowedOriginsProvider(ISqlDal dal, IMemoryCache cache) { _dal = dal; _cache = cache; }

    public async Task<string[]> GetAsync(CancellationToken ct)
    {
        if (_cache.TryGetValue<string[]>("allowed-origins", out var cached)) return cached!;

        var rows = await _dal.QueryAsync("dbo.sp_Security_GetAllowedOrigins", CommandType.StoredProcedure, ct: ct);
        var origins = rows.Select(r => r["Origin"]?.ToString())
                          .Where(s => !string.IsNullOrWhiteSpace(s))
                          .Distinct(StringComparer.OrdinalIgnoreCase)
                          .ToArray();

        _cache.Set("allowed-origins", origins, TimeSpan.FromMinutes(5));
        return origins;
    }

    public async Task<bool> IsAllowedAsync(string origin, CancellationToken ct)
    {
        var list = await GetAsync(ct);
        return list.Contains(origin, StringComparer.OrdinalIgnoreCase);
    }
}
