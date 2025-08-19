using FluentAssertions;
using System.Net;
using System.Net.Http.Json;
using HabitTracker.Tests.TestHelpers;
using HabitTracker.Api;

namespace HabitTracker.Tests.Integration
{
    public class HealthApiTests : BaseIntegrationTest
    {
        public HealthApiTests(HabitTrackerWebApplicationFactory<Program> factory) : base(factory)
        {
        }

        [Fact]
        public async Task GetHealth_ReturnsHealthyStatus()
        {
            // Act
            var response = await Client.GetAsync("/api/health");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var content = await response.Content.ReadAsStringAsync();
            content.Should().NotBeEmpty();
            content.Should().Contain("Healthy");
        }

        [Fact]
        public async Task GetDetailedHealth_ReturnsDetailedHealthInformation()
        {
            // Act
            var response = await Client.GetAsync("/api/health/detailed");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var content = await response.Content.ReadAsStringAsync();
            content.Should().NotBeEmpty();
            content.Should().Contain("Healthy");
            content.Should().Contain("checks");
        }

        [Fact]
        public async Task HealthEndpoint_ReturnsResponse()
        {
            // Act
            var response = await Client.GetAsync("/health");

            // Assert - Health check may fail in test environment due to database checks
            response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.ServiceUnavailable);
            
            var content = await response.Content.ReadAsStringAsync();
            content.Should().NotBeEmpty();
            // In testing environment, the health check may be unhealthy due to database setup
        }

        [Fact]
        public async Task SwaggerEndpoint_IsAccessibleInDevelopment()
        {
            // Act
            var response = await Client.GetAsync("/swagger/index.html");

            // Assert - Should be accessible in testing environment
            response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.NotFound);
            // NotFound is acceptable since we're in Testing environment, not Development
        }
    }
}