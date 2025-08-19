using AutoMapper;
using FluentAssertions;
using HabitTracker.Application.Configurations;
using HabitTracker.Application.DTOs.Tracker;
using HabitTracker.Domain.Entities;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace HabitTracker.Tests.Unit.Configurations
{
    public class AutoMapperConfigTests
    {
        [Fact]
        public void ConfigureAutoMapper_Should_RegisterMapperInDI()
        {
            // Arrange
            var services = new ServiceCollection();

            // Act
            services.ConfigureAutoMapper();
            var serviceProvider = services.BuildServiceProvider();
            var mapper = serviceProvider.GetService<IMapper>();

            // Assert
            mapper.Should().NotBeNull("AutoMapper should be registered in DI container");
        }

        [Fact]
        public void ConfigureAutoMapper_Should_LoadTrackerMappingProfile()
        {
            // Arrange
            var services = new ServiceCollection();
            services.ConfigureAutoMapper();
            var serviceProvider = services.BuildServiceProvider();
            var mapper = serviceProvider.GetRequiredService<IMapper>();

            // Act & Assert - Test that the mappings work
            var tracker = new Tracker
            {
                Id = 1,
                Name = "Test Tracker",
                Description = "Test Description",
                UserId = "user123",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true,
                Habits = new List<Habit>
                {
                    new Habit { IsActive = true },
                    new Habit { IsActive = true },
                    new Habit { IsActive = false }
                }
            };

            var dto = mapper.Map<TrackerResponseDto>(tracker);
            dto.Should().NotBeNull();
            dto.Id.Should().Be(1);
            dto.Name.Should().Be("Test Tracker");
            dto.HabitCount.Should().Be(2, "only active habits should be counted");
        }

        [Fact]
        public void ConfigureAutoMapper_Should_MapCreateTrackerDtoToTracker()
        {
            // Arrange
            var services = new ServiceCollection();
            services.ConfigureAutoMapper();
            var serviceProvider = services.BuildServiceProvider();
            var mapper = serviceProvider.GetRequiredService<IMapper>();

            var createDto = new CreateTrackerDto
            {
                Name = "New Tracker",
                Description = "New Description"
            };

            // Act
            var tracker = mapper.Map<Tracker>(createDto);

            // Assert
            tracker.Should().NotBeNull();
            tracker.Name.Should().Be("New Tracker");
            tracker.Description.Should().Be("New Description");
            tracker.IsActive.Should().BeTrue("new trackers should be active by default");
            tracker.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
            tracker.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        }

        [Fact]
        public void ConfigureAutoMapper_Should_ReturnServiceCollection_ForChaining()
        {
            // Arrange
            var services = new ServiceCollection();

            // Act
            var result = services.ConfigureAutoMapper();

            // Assert
            result.Should().BeSameAs(services, "method should return the service collection for fluent chaining");
        }
    }
}