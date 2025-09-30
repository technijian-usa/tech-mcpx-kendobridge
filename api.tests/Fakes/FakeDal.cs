using System.Data;
using Microsoft.Data.SqlClient;
using System.Collections.Concurrent;

namespace Technijian.MCPX.AdminApi.Tests;

public sealed class FakeDal : ISqlDal
{
    private readonly ConcurrentDictionary<string,string> _kv = new(StringComparer.OrdinalIgnoreCase);
    private readonly string[] _origins;

    public FakeDal(Dictionary<string,string>? seed = null, string[]? origins = null)
    {
        if (seed != null) foreach (var kv in seed) _kv[kv.Key] = kv.Value;
        _origins = origins ?? Array.Empty<string>();
    }

    public Task<int> ExecuteAsync(string name, CommandType type, IEnumerable<SqlParameter>? @params = null, CancellationToken ct = default)
        => Task.FromResult(1);

    public Task<List<Dictionary<string, object?>>> QueryAsync(string name, CommandType type, IEnumerable<SqlParameter>? @params = null, CancellationToken ct = default)
    {
        if (string.Equals(name, "dbo.sp_Security_GetAllowedOrigins", StringComparison.OrdinalIgnoreCase))
        {
            var list = _origins.Select(o => new Dictionary<string, object?> { ["Origin"] = o }).ToList();
            return Task.FromResult(list);
        }
        if (string.Equals(name, "dbo.sp_Config_GetAll", StringComparison.OrdinalIgnoreCase))
        {
            var list = _kv.Select(kv => new Dictionary<string, object?> { ["Key"] = kv.Key, ["Value"] = kv.Value }).ToList();
            return Task.FromResult(list);
        }
        return Task.FromResult(new List<Dictionary<string, object?>>());
    }

    public Task<string?> QueryStringAsync(string spName, params SqlParameter[] ps)
    {
        var key = ps.FirstOrDefault(p => p.ParameterName == "@Key")?.Value?.ToString();
        return Task.FromResult(key != null && _kv.TryGetValue(key, out var v) ? v : null);
    }
}
