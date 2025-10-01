// ============================================================================
// AllowedOriginsProviderTests.cs
// Unit tests for the DB-driven CORS allow-list provider.
// ----------------------------------------------------------------------------
// What this verifies
//  - Provider returns the distinct list of origins from the DAL.
//  - Results are cached for 5 minutes (same array instance returned).
//  - Case-insensitive comparisons work for IsAllowedAsync.
// ============================================================================

using Microsoft.Extensions.Caching.Memory;
using Xunit;

namespace Technijian.MCPX.AdminApi.Tests;

public class AllowedOriginsProviderTests
{
    [Fact(DisplayName = "GetAsync returns distinct origins and caches result")]
    public async Task GetAsync_Returns_Cached_Origins()
    {
        // Arrange: seed FakeDal with duplicates & mixed case.
        var dal = new FakeDal(
            origins: new[]
            {
                "http://localhost:5173",
                "http://LOCALHOST:5173", // duplicate, different case
                "https://app.example.com"
            }
        );

        using var cache = new MemoryCache(new MemoryCacheOptions());
        var provider = new AllowedOriginsProvider(dal, cache);

        // Act: first call builds and caches the list
        var a = await provider.GetAsync(default);

        // Act: second call should hit the cache and return the same instance
        var b = await provider.GetAsync(default);

        // Assert: distinct (2) and same object reference due to cache
        Assert.Equal(2, a.Length);
        Assert.Same(a, b);
        Assert.Contains("http://localhost:5173", a);
        Assert.Contains("https://app.example.com", a);
    }

    [Fact(DisplayName = "IsAllowedAsync compares origins case-insensitively")]
    public async Task IsAllowedAsync_Is_Case_Insensitive()
    {
        // Arrange
        var dal = new FakeDal(origins: new[] { "https://portal.example.com" });
        using var cache = new MemoryCache(new MemoryCacheOptions());
        var provider = new AllowedOriginsProvider(dal, cache);

        // Act + Assert
        Assert.True(await provider.IsAllowedAsync("https://PORTAL.EXAMPLE.COM", default));
        Assert.False(await provider.IsAllowedAsync("https://other.example.com", default));
    }
}
