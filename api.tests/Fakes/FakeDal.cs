// ============================================================================
// FakeDal.cs
// Test double for ISqlDal used by unit tests to avoid real DB access.
// ----------------------------------------------------------------------------
// Design
//  - Implements ISqlDal with an in-memory store for AppConfig and a simple
//    list for Security_AllowedOrigin.
//  - Recognizes the stored procedures the API calls in tests:
//      * dbo.sp_Config_GetAll
//      * dbo.sp_Config_GetValue (@Key)
//      * dbo.sp_Security_GetAllowedOrigins
//  - Thread-safe enough for unit tests via ConcurrentDictionary.
//
// Usage
//  var dal = new FakeDal(
//      seed: new() { ["AzureAd:TenantId"] = "tenant", ... },
//      origins: new[] { "http://localhost:5173" }
//  );
//
// Notes
//  - This is intentionally minimal; extend as tests require.
//  - Keep behavior aligned with production SP contracts (e.g., zero rows when
//    missing keys, not NULL rows).
// ============================================================================

using System.Collections.Concurrent;
using System.Data;
using Microsoft.Data.SqlClient;

namespace Technijian.MCPX.AdminApi.Tests;

public sealed class FakeDal : ISqlDal
{
    // In-memory AppConfig key/value store (case-insensitive keys)
    private readonly ConcurrentDictionary<string, string> _kv =
        new(StringComparer.OrdinalIgnoreCase);

    // In-memory list of allowed origins
    private readonly string[] _origins;

    public FakeDal(
        Dictionary<string, string>? seed = null,
        string[]? origins = null)
    {
        if (seed != null)
        {
            foreach (var kv in seed)
                _kv[kv.Key] = kv.Value;
        }
        _origins = origins ?? Array.Empty<string>();
    }

    /// <summary>
    /// No-op for unit tests; returns 1 to indicate success.
    /// </summary>
    public Task<int> ExecuteAsync(string name, CommandType type, IEnumerable<SqlParameter>? @params = null, CancellationToken ct = default)
        => Task.FromResult(1);

    /// <summary>
    /// Returns rows keyed by the recognized stored procedures.
    /// </summary>
    public Task<List<Dictionary<string, object?>>> QueryAsync(string name, CommandType type, IEnumerable<SqlParameter>? @params = null, CancellationToken ct = default)
    {
        if (string.Equals(name, "dbo.sp_Security_GetAllowedOrigins", StringComparison.OrdinalIgnoreCase))
        {
            var list = _origins
                .Select(o => new Dictionary<string, object?> { ["Origin"] = o })
                .ToList();
            return Task.FromResult(list);
        }

        if (string.Equals(name, "dbo.sp_Config_GetAll", StringComparison.OrdinalIgnoreCase))
        {
            var list = _kv
                .Select(kv => new Dictionary<string, object?> { ["Key"] = kv.Key, ["Value"] = kv.Value })
                .OrderBy(d => d["Key"])
                .ToList();
            return Task.FromResult(list);
        }

        // Default: no rows for unknown SPs in tests
        return Task.FromResult(new List<Dictionary<string, object?>>());
    }

    /// <summary>
    /// Mimics sp_Config_GetValue by returning a single scalar (or null).
    /// </summary>
    public Task<string?> QueryStringAsync(string spName, params SqlParameter[] ps)
    {
        if (!string.Equals(spName, "dbo.sp_Config_GetValue", StringComparison.OrdinalIgnoreCase))
            return Task.FromResult<string?>(null);

        var key = ps.FirstOrDefault(p => p.ParameterName == "@Key")?.Value?.ToString();
        if (key is null) return Task.FromResult<string?>(null);

        return Task.FromResult(_kv.TryGetValue(key, out var v) ? v : null);
    }
}
