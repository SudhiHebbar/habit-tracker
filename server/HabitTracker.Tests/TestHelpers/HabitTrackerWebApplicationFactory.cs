using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using HabitTracker.Infrastructure.Data;

namespace HabitTracker.Tests.TestHelpers
{
    public class HabitTrackerWebApplicationFactory<TStartup> : WebApplicationFactory<TStartup> where TStartup : class
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.ConfigureServices(services =>
            {
                // Remove all existing DbContext registrations
                var descriptorsToRemove = services.Where(d => 
                    d.ServiceType == typeof(DbContextOptions<HabitTrackerDbContext>) ||
                    d.ServiceType == typeof(HabitTrackerDbContext) ||
                    d.ServiceType == typeof(DbContextOptions)).ToList();
                
                foreach (var descriptor in descriptorsToRemove)
                {
                    services.Remove(descriptor);
                }

                // Add in-memory database for testing
                services.AddDbContext<HabitTrackerDbContext>(options =>
                {
                    options.UseInMemoryDatabase("InMemoryDbForTesting");
                    options.EnableSensitiveDataLogging();
                });
            });

            builder.UseEnvironment("Testing");
        }

        private static void SeedTestData(HabitTrackerDbContext context)
        {
            // Seed test data will be implemented here when we have domain entities
            // For now, just ensure the database is clean
            context.Database.EnsureDeleted();
            context.Database.EnsureCreated();
        }
    }
}