using Microsoft.Extensions.Caching.Memory;
using Xunit;

namespace Technijian.MCPX.AdminApi.Tests;

public class AllowedOriginsProviderTests
{
    [Fact]
    public async Task Caches_Origins_For_5_Minutes()
    {
        var dal = new FakeDal(null, new[] { "http://localhost:5173" });
        var cache = new MemoryCache(new MemoryCacheOptions());
        var provider = new AllowedOriginsProvider(dal, cache);

        var a = await provider.GetAsync(default);
        var b = await provider.GetAsync(default);

        Assert.Single(a);
        Assert.Same(a, b); // same instance due to cache
    }
}
