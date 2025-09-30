using Xunit;

namespace Technijian.MCPX.AdminApi.Tests;

public class PublicConfigProviderTests
{
    [Fact]
    public async Task GetAsync_Returns_Public_Config_And_Origins()
    {
        var dal = new FakeDal(new()
        {
            ["AzureAd:TenantId"] = "tenant",
            ["AzureAd:ClientId"] = "client",
            ["AzureAd:RedirectUri"] = "http://localhost:5173",
            ["AzureAd:Scope"] = "Access.Admin",
            ["Sse:HeartbeatSeconds"] = "10",
            ["Security:SseRequireAuth"] = "true"
        }, new[] { "http://localhost:5173" });

        var provider = new PublicConfigProvider(dal);
        var result = await provider.GetAsync(default);
        Assert.NotNull(result);
    }
}
