using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using HabitTracker.Application.DTOs.Tracker;
using HabitTracker.Domain.Entities;
using HabitTracker.Infrastructure.Data;
using HabitTracker.Tests.TestHelpers;
using HabitTracker.Api;
using Microsoft.Extensions.DependencyInjection;

namespace HabitTracker.Tests.Integration;

public class TrackerApiTests : BaseIntegrationTest
{
    public TrackerApiTests(HabitTrackerWebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetTrackers_ShouldReturnEmptyList_WhenNoTrackersExist()
    {
        // Act
        var response = await Client.GetAsync("/api/trackers");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var trackers = await response.Content.ReadFromJsonAsync<List<TrackerResponseDto>>();
        trackers.Should().NotBeNull();
        trackers!.Should().BeEmpty();
    }

    [Fact]
    public async Task GetTrackers_ShouldReturnUserTrackers_WhenTrackersExist()
    {
        // Arrange
        using var scope = Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<HabitTrackerDbContext>();
        
        var tracker1 = new Tracker 
        { 
            Name = "Fitness", 
            Description = "Track fitness", 
            UserId = null, 
            IsActive = true, 
            DisplayOrder = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        var tracker2 = new Tracker 
        { 
            Name = "Study", 
            Description = "Track study", 
            UserId = null, 
            IsActive = true, 
            DisplayOrder = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
        context.Trackers.AddRange(tracker1, tracker2);
        await context.SaveChangesAsync();

        // Act
        var response = await Client.GetAsync("/api/trackers");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var trackers = await response.Content.ReadFromJsonAsync<List<TrackerResponseDto>>();
        trackers.Should().NotBeNull();
        trackers!.Should().HaveCount(2);
        trackers.Should().Contain(t => t.Name == "Fitness");
        trackers.Should().Contain(t => t.Name == "Study");
    }

    [Fact]
    public async Task GetTrackers_WithActiveOnly_ShouldReturnOnlyActiveTrackers()
    {
        // Arrange
        using var scope = Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<HabitTrackerDbContext>();
        
        var activeTracker = new Tracker 
        { 
            Name = "Active Fitness", 
            Description = "Active tracker", 
            UserId = null, 
            IsActive = true,
            DisplayOrder = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        var inactiveTracker = new Tracker 
        { 
            Name = "Inactive Study", 
            Description = "Inactive tracker", 
            UserId = null, 
            IsActive = false,
            DisplayOrder = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
        context.Trackers.AddRange(activeTracker, inactiveTracker);
        await context.SaveChangesAsync();

        // Act
        var response = await Client.GetAsync("/api/trackers?activeOnly=true");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var trackers = await response.Content.ReadFromJsonAsync<List<TrackerResponseDto>>();
        trackers.Should().NotBeNull();
        trackers!.Should().HaveCount(1);
        trackers[0].Name.Should().Be("Active Fitness");
        trackers[0].IsActive.Should().BeTrue();
    }

    [Fact]
    public async Task GetTrackerById_ShouldReturnTracker_WhenTrackerExists()
    {
        // Arrange
        using var scope = Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<HabitTrackerDbContext>();
        
        var tracker = new Tracker 
        { 
            Name = "Fitness", 
            Description = "Track fitness", 
            UserId = null, 
            IsActive = true,
            DisplayOrder = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
        context.Trackers.Add(tracker);
        await context.SaveChangesAsync();

        // Act
        var response = await Client.GetAsync($"/api/trackers/{tracker.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var retrievedTracker = await response.Content.ReadFromJsonAsync<TrackerResponseDto>();
        retrievedTracker.Should().NotBeNull();
        retrievedTracker!.Name.Should().Be("Fitness");
        retrievedTracker.Description.Should().Be("Track fitness");
    }

    [Fact]
    public async Task GetTrackerById_ShouldReturnNotFound_WhenTrackerDoesNotExist()
    {
        // Act
        var response = await Client.GetAsync("/api/trackers/999");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task CreateTracker_ShouldCreateTracker_WhenValidRequest()
    {
        // Arrange
        var createDto = new CreateTrackerDto
        {
            Name = "New Fitness Tracker",
            Description = "Track my fitness journey"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/trackers", createDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var createdTracker = await response.Content.ReadFromJsonAsync<TrackerResponseDto>();
        createdTracker.Should().NotBeNull();
        createdTracker!.Name.Should().Be(createDto.Name);
        createdTracker.Description.Should().Be(createDto.Description);
        createdTracker.IsActive.Should().BeTrue();
        createdTracker.HabitCount.Should().Be(0);

        // Verify Location header
        response.Headers.Location.Should().NotBeNull();
        response.Headers.Location!.ToString().Should().Contain($"/api/trackers/{createdTracker.Id}");

        // Verify tracker was actually created in database
        using var scope = Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<HabitTrackerDbContext>();
        var dbTracker = await context.Trackers.FindAsync(createdTracker.Id);
        dbTracker.Should().NotBeNull();
        dbTracker!.Name.Should().Be(createDto.Name);
    }

    [Fact]
    public async Task CreateTracker_ShouldReturnBadRequest_WhenNameIsEmpty()
    {
        // Arrange
        var createDto = new CreateTrackerDto
        {
            Name = "", // Invalid: empty name
            Description = "Track fitness"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/trackers", createDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateTracker_ShouldReturnBadRequest_WhenNameIsTooLong()
    {
        // Arrange
        var createDto = new CreateTrackerDto
        {
            Name = new string('A', 101), // Invalid: too long
            Description = "Track fitness"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/trackers", createDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateTracker_ShouldReturnConflict_WhenNameAlreadyExists()
    {
        // Arrange
        using var scope = Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<HabitTrackerDbContext>();
        
        var existingTracker = new Tracker 
        { 
            Name = "Fitness", 
            Description = "Existing tracker", 
            UserId = null, 
            IsActive = true,
            DisplayOrder = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
        context.Trackers.Add(existingTracker);
        await context.SaveChangesAsync();

        var createDto = new CreateTrackerDto
        {
            Name = "Fitness", // Same name as existing tracker
            Description = "New fitness tracker"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/trackers", createDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task UpdateTracker_ShouldUpdateTracker_WhenValidRequest()
    {
        // Arrange
        using var scope = Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<HabitTrackerDbContext>();
        
        var tracker = new Tracker 
        { 
            Name = "Fitness", 
            Description = "Track fitness", 
            UserId = null, 
            IsActive = true,
            DisplayOrder = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
        context.Trackers.Add(tracker);
        await context.SaveChangesAsync();

        var updateDto = new UpdateTrackerDto
        {
            Name = "Updated Fitness",
            Description = "Updated description"
        };

        // Act
        var response = await Client.PutAsJsonAsync($"/api/trackers/{tracker.Id}", updateDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var updatedTracker = await response.Content.ReadFromJsonAsync<TrackerResponseDto>();
        updatedTracker.Should().NotBeNull();
        updatedTracker!.Name.Should().Be(updateDto.Name);
        updatedTracker.Description.Should().Be(updateDto.Description);

        // Verify tracker was actually updated in database
        await context.Entry(tracker).ReloadAsync();
        tracker.Name.Should().Be(updateDto.Name);
        tracker.Description.Should().Be(updateDto.Description);
    }

    [Fact]
    public async Task UpdateTracker_ShouldReturnNotFound_WhenTrackerDoesNotExist()
    {
        // Arrange
        var updateDto = new UpdateTrackerDto
        {
            Name = "Updated Fitness",
            Description = "Updated description"
        };

        // Act
        var response = await Client.PutAsJsonAsync("/api/trackers/999", updateDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task UpdateTracker_ShouldReturnBadRequest_WhenNameIsEmpty()
    {
        // Arrange
        using var scope = Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<HabitTrackerDbContext>();
        
        var tracker = new Tracker 
        { 
            Name = "Fitness", 
            Description = "Track fitness", 
            UserId = null, 
            IsActive = true,
            DisplayOrder = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
        context.Trackers.Add(tracker);
        await context.SaveChangesAsync();

        var updateDto = new UpdateTrackerDto
        {
            Name = "", // Invalid: empty name
            Description = "Updated description"
        };

        // Act
        var response = await Client.PutAsJsonAsync($"/api/trackers/{tracker.Id}", updateDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task DeleteTracker_ShouldSoftDeleteTracker_WhenTrackerExists()
    {
        // Arrange
        using var scope = Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<HabitTrackerDbContext>();
        
        var tracker = new Tracker 
        { 
            Name = "Fitness", 
            Description = "Track fitness", 
            UserId = null, 
            IsActive = true,
            DisplayOrder = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
        context.Trackers.Add(tracker);
        await context.SaveChangesAsync();

        // Act
        var response = await Client.DeleteAsync($"/api/trackers/{tracker.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Verify tracker was soft deleted (still exists but inactive)
        await context.Entry(tracker).ReloadAsync();
        tracker.IsActive.Should().BeFalse();
    }

    [Fact]
    public async Task DeleteTracker_ShouldReturnNotFound_WhenTrackerDoesNotExist()
    {
        // Act
        var response = await Client.DeleteAsync("/api/trackers/999");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetSharedTrackers_ShouldReturnOnlySharedTrackers()
    {
        // Arrange
        using var scope = Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<HabitTrackerDbContext>();
        
        var sharedTracker = new Tracker 
        { 
            Name = "Public Fitness", 
            Description = "Shared fitness tracker", 
            UserId = "user1", 
            IsActive = true,
            IsShared = true,
            DisplayOrder = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        var privateTracker = new Tracker 
        { 
            Name = "Private Study", 
            Description = "Private study tracker", 
            UserId = "user1", 
            IsActive = true,
            IsShared = false,
            DisplayOrder = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
        context.Trackers.AddRange(sharedTracker, privateTracker);
        await context.SaveChangesAsync();

        // Act
        var response = await Client.GetAsync("/api/trackers/shared");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var trackers = await response.Content.ReadFromJsonAsync<List<TrackerResponseDto>>();
        trackers.Should().NotBeNull();
        trackers!.Should().HaveCount(1);
        trackers[0].Name.Should().Be("Public Fitness");
        trackers[0].IsShared.Should().BeTrue();
    }

    [Fact]
    public async Task UpdateDisplayOrder_ShouldUpdateOrder_WhenValidRequest()
    {
        // Arrange
        using var scope = Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<HabitTrackerDbContext>();
        
        var tracker1 = new Tracker 
        { 
            Name = "Fitness", 
            Description = "Track fitness", 
            UserId = null, 
            IsActive = true,
            DisplayOrder = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        var tracker2 = new Tracker 
        { 
            Name = "Study", 
            Description = "Track study", 
            UserId = null, 
            IsActive = true,
            DisplayOrder = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
        context.Trackers.AddRange(tracker1, tracker2);
        await context.SaveChangesAsync();

        var orderUpdates = new[]
        {
            new { TrackerId = tracker2.Id, DisplayOrder = 0 },
            new { TrackerId = tracker1.Id, DisplayOrder = 1 }
        };

        // Act
        var response = await Client.PutAsJsonAsync("/api/trackers/reorder", orderUpdates);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Verify order was updated
        await context.Entry(tracker1).ReloadAsync();
        await context.Entry(tracker2).ReloadAsync();
        tracker1.DisplayOrder.Should().Be(1);
        tracker2.DisplayOrder.Should().Be(0);
    }

    [Fact]
    public async Task UpdateDisplayOrder_ShouldReturnBadRequest_WhenEmptyRequest()
    {
        // Act
        var response = await Client.PutAsJsonAsync("/api/trackers/reorder", Array.Empty<object>());

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Api_ShouldHandleJsonSerializationProperly()
    {
        // This test ensures our API handles JSON serialization/deserialization correctly
        // especially with the DateTime/DateOnly properties

        // Arrange
        var createDto = new CreateTrackerDto
        {
            Name = "JSON Test Tracker",
            Description = "Testing JSON serialization"
        };

        // Act - Create
        var createResponse = await Client.PostAsJsonAsync("/api/trackers", createDto);
        createResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var createdTracker = await createResponse.Content.ReadFromJsonAsync<TrackerResponseDto>();
        createdTracker.Should().NotBeNull();
        
        // Act - Get by ID
        var getResponse = await Client.GetAsync($"/api/trackers/{createdTracker!.Id}");
        getResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var retrievedTracker = await getResponse.Content.ReadFromJsonAsync<TrackerResponseDto>();

        // Assert - Verify all properties are properly serialized/deserialized
        retrievedTracker.Should().NotBeNull();
        retrievedTracker!.Id.Should().Be(createdTracker.Id);
        retrievedTracker.Name.Should().Be(createDto.Name);
        retrievedTracker.Description.Should().Be(createDto.Description);
        retrievedTracker.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromMinutes(1));
        retrievedTracker.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromMinutes(1));
        retrievedTracker.IsActive.Should().BeTrue();
        retrievedTracker.IsShared.Should().BeFalse();
        retrievedTracker.HabitCount.Should().Be(0);
        retrievedTracker.DisplayOrder.Should().Be(0);
    }
}