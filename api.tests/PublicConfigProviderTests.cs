// ============================================================================
// PublicConfigProviderTests.cs
// Unit tests for the PublicConfigProvider using the FakeDal test double.
// ----------------------------------------------------------------------------
// What this verifies
//  - Provider returns a non-null object when seeded config exists.
//  - The object contains expected fields (azureAd, sse, cors).
//  - Heartbeat helper parses integer values correctly.
//  - Allowed origins are surfaced in the JSON payload.
// ============================================================================

using System.Text.Json;
using Xunit;

namespace Technijian.MCPX.AdminApi.Tests;

public class PublicConfigProviderTests
{
    [Fact(DisplayName = "GetAsync returns azureAd, sse, and cors with values")]
    public async Task GetAsync_Returns_Public_Config_And_Origins()
    {
        // Arrange: seed the in-memory DAL with NON-SECRET config and one origin.
        var dal = new FakeDal(
            seed: new()
            {
                ["AzureAd:TenantId"]        = "tenant-guid-1234",
                ["AzureAd:ClientId"]        = "client-guid-5678",
                ["AzureAd:RedirectUri"]     = "http://localhost:5173",
                ["AzureAd:Scope"]           = "Access.Admin",
                ["Sse:HeartbeatSeconds"]    = "10",
                ["Security:SseRequireAuth"] = "true"
            },
            origins: new[] { "http://localhost:5173" }
        );

        var provider = new PublicConfigProvider(dal);

        // Act
        var payload = await provider.GetAsync(default);

        // Assert: payload exists
        Assert.NotNull(payload);

        // We don't have a strong type (provider returns an anonymous object),
        // so verify via JSON to keep this test independent of object shapes.
        var json = JsonSerializer.Serialize(payload);
        using var doc = JsonDocument.Parse(json);

        // azureAd presence + values
        Assert.True(doc.RootElement.TryGetProperty("azureAd", out var azureAd), "azureAd missing");
        Assert.Equal("tenant-guid-1234", azureAd.GetProperty("tenantId").GetString());
        Assert.Equal("client-guid-5678", azureAd.GetProperty("clientId").GetString());
        Assert.Equal("http://localhost:5173", azureAd.GetProperty("redirectUri").GetString());
        Assert.Equal("Access.Admin", azureAd.GetProperty("scope").GetString());

        // sse presence + values
        Assert.True(doc.RootElement.TryGetProperty("sse", out var sse), "sse missing");
        Assert.Equal(10, sse.GetProperty("heartbeatSeconds").GetInt32());
        Assert.True(sse.GetProperty("requireAuth").GetBoolean());

        // cors presence + values
        Assert.True(doc.RootElement.TryGetProperty("cors", out var cors), "cors missing");
        var origins = cors.GetProperty("allowedOrigins").EnumerateArray().Select(e => e.GetString()).ToArray();
        Assert.Single(origins);
        Assert.Contains("http://localhost:5173", origins);
    }

    [Fact(DisplayName = "GetHeartbeatAsync parses integer heartbeat or returns null")]
    public async Task GetHeartbeatAsync_Parses_Int_Or_Null()
    {
        // 1) With a valid integer
        var dal1 = new FakeDal(seed: new() { ["Sse:HeartbeatSeconds"] = "25" });
        var provider1 = new PublicConfigProvider(dal1);
        var hb1 = await provider1.GetHeartbeatAsync(default);
        Assert.NotNull(hb1);
        Assert.Equal(25, hb1!.Value);

        // 2) With a missing key -> null
        var dal2 = new FakeDal(seed: new());
        var provider2 = new PublicConfigProvider(dal2);
        var hb2 = await provider2.GetHeartbeatAsync(default);
        Assert.Null(hb2);

        // 3) With a non-numeric value -> null
        var dal3 = new FakeDal(seed: new() { ["Sse:HeartbeatSeconds"] = "not-a-number" });
        var provider3 = new PublicConfigProvider(dal3);
        var hb3 = await provider3.GetHeartbeatAsync(default);
        Assert.Null(hb3);
    }
}
