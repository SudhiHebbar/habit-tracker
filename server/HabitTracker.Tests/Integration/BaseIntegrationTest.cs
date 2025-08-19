using Microsoft.Extensions.DependencyInjection;
using HabitTracker.Infrastructure.Data;
using HabitTracker.Tests.TestHelpers;
using HabitTracker.Api;

namespace HabitTracker.Tests.Integration
{
    public abstract class BaseIntegrationTest : IClassFixture<HabitTrackerWebApplicationFactory<Program>>
    {
        protected readonly HabitTrackerWebApplicationFactory<Program> Factory;
        protected readonly HttpClient Client;

        protected BaseIntegrationTest(HabitTrackerWebApplicationFactory<Program> factory)
        {
            Factory = factory;
            Client = factory.CreateClient();
        }

        protected async Task<HabitTrackerDbContext> GetDbContextAsync()
        {
            var scope = Factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<HabitTrackerDbContext>();
            await context.Database.EnsureCreatedAsync();
            return context;
        }

        protected async Task CleanupDatabaseAsync()
        {
            using var context = await GetDbContextAsync();
            await context.Database.EnsureDeletedAsync();
            await context.Database.EnsureCreatedAsync();
        }
    }
}