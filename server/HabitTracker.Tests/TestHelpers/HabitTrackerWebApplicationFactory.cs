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
                // Remove the existing DbContext registration
                var dbContextDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<HabitTrackerDbContext>));
                if (dbContextDescriptor != null)
                    services.Remove(dbContextDescriptor);

                // Remove the DbContext itself
                var dbContextServiceDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(HabitTrackerDbContext));
                if (dbContextServiceDescriptor != null)
                    services.Remove(dbContextServiceDescriptor);

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