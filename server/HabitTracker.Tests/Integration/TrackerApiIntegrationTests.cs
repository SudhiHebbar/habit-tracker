using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using HabitTracker.Application.DTOs.Tracker;
using HabitTracker.Tests.TestHelpers;
using HabitTracker.Api;

namespace HabitTracker.Tests.Integration;

public class TrackerApiIntegrationTests : BaseIntegrationTest
{
    public TrackerApiIntegrationTests(HabitTrackerWebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetTrackers_ShouldReturnEmptyList_WhenNoTrackersExist()
    {
        // Arrange - ensure clean database
        await CleanupDatabaseAsync();

        // Act
        var response = await Client.GetAsync("/api/trackers");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var trackers = await response.Content.ReadFromJsonAsync<List<TrackerResponseDto>>();
        trackers.Should().NotBeNull();
        trackers!.Should().BeEmpty();
    }

    [Fact]
    public async Task CreateTracker_ShouldCreateTracker_WhenValidRequest()
    {
        // Arrange
        await CleanupDatabaseAsync();
        var createDto = new CreateTrackerDto
        {
            Name = "Fitness Tracker",
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
    }

    [Fact]
    public async Task GetTrackerById_ShouldReturnTracker_WhenTrackerExists()
    {
        // Arrange - create a tracker first
        await CleanupDatabaseAsync();
        var createDto = new CreateTrackerDto { Name = "Test Tracker", Description = "Test Description" };
        var createResponse = await Client.PostAsJsonAsync("/api/trackers", createDto);
        createResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        var createdTracker = await createResponse.Content.ReadFromJsonAsync<TrackerResponseDto>();

        // Act
        var response = await Client.GetAsync($"/api/trackers/{createdTracker!.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var retrievedTracker = await response.Content.ReadFromJsonAsync<TrackerResponseDto>();
        retrievedTracker.Should().NotBeNull();
        retrievedTracker!.Name.Should().Be("Test Tracker");
        retrievedTracker.Description.Should().Be("Test Description");
    }

    [Fact]
    public async Task GetTrackerById_ShouldReturnNotFound_WhenTrackerDoesNotExist()
    {
        // Arrange
        await CleanupDatabaseAsync();

        // Act
        var response = await Client.GetAsync("/api/trackers/999");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task UpdateTracker_ShouldUpdateTracker_WhenValidRequest()
    {
        // Arrange - create a tracker first
        await CleanupDatabaseAsync();
        var createDto = new CreateTrackerDto { Name = "Original", Description = "Original Description" };
        var createResponse = await Client.PostAsJsonAsync("/api/trackers", createDto);
        var createdTracker = await createResponse.Content.ReadFromJsonAsync<TrackerResponseDto>();

        var updateDto = new UpdateTrackerDto
        {
            Name = "Updated Tracker",
            Description = "Updated Description"
        };

        // Act
        var response = await Client.PutAsJsonAsync($"/api/trackers/{createdTracker!.Id}", updateDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var updatedTracker = await response.Content.ReadFromJsonAsync<TrackerResponseDto>();
        updatedTracker.Should().NotBeNull();
        updatedTracker!.Name.Should().Be(updateDto.Name);
        updatedTracker.Description.Should().Be(updateDto.Description);
    }

    [Fact]
    public async Task UpdateTracker_ShouldReturnNotFound_WhenTrackerDoesNotExist()
    {
        // Arrange
        await CleanupDatabaseAsync();
        var updateDto = new UpdateTrackerDto { Name = "Updated", Description = "Updated" };

        // Act
        var response = await Client.PutAsJsonAsync("/api/trackers/999", updateDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeleteTracker_ShouldSoftDeleteTracker_WhenTrackerExists()
    {
        // Arrange - create a tracker first
        await CleanupDatabaseAsync();
        var createDto = new CreateTrackerDto { Name = "To Delete", Description = "Will be deleted" };
        var createResponse = await Client.PostAsJsonAsync("/api/trackers", createDto);
        var createdTracker = await createResponse.Content.ReadFromJsonAsync<TrackerResponseDto>();

        // Act
        var response = await Client.DeleteAsync($"/api/trackers/{createdTracker!.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Verify tracker is no longer in active list
        var getActiveResponse = await Client.GetAsync("/api/trackers?activeOnly=true");
        var activeTrackers = await getActiveResponse.Content.ReadFromJsonAsync<List<TrackerResponseDto>>();
        activeTrackers.Should().NotContain(t => t.Id == createdTracker.Id);
    }

    [Fact]
    public async Task DeleteTracker_ShouldReturnNotFound_WhenTrackerDoesNotExist()
    {
        // Arrange
        await CleanupDatabaseAsync();

        // Act
        var response = await Client.DeleteAsync("/api/trackers/999");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task CreateTracker_ShouldReturnBadRequest_WhenNameIsEmpty()
    {
        // Arrange
        await CleanupDatabaseAsync();
        var createDto = new CreateTrackerDto { Name = "", Description = "Valid description" };

        // Act
        var response = await Client.PostAsJsonAsync("/api/trackers", createDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateTracker_ShouldReturnConflict_WhenNameAlreadyExists()
    {
        // Arrange - create a tracker first
        await CleanupDatabaseAsync();
        var originalDto = new CreateTrackerDto { Name = "Duplicate Name", Description = "First tracker" };
        await Client.PostAsJsonAsync("/api/trackers", originalDto);

        var duplicateDto = new CreateTrackerDto { Name = "Duplicate Name", Description = "Second tracker" };

        // Act
        var response = await Client.PostAsJsonAsync("/api/trackers", duplicateDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task GetActiveTrackers_ShouldReturnOnlyActiveTrackers()
    {
        // Arrange - create and then delete a tracker
        await CleanupDatabaseAsync();
        
        // Create two trackers
        var tracker1 = new CreateTrackerDto { Name = "Active Tracker", Description = "Active" };
        var tracker2 = new CreateTrackerDto { Name = "To Delete", Description = "Will be inactive" };
        
        var response1 = await Client.PostAsJsonAsync("/api/trackers", tracker1);
        var response2 = await Client.PostAsJsonAsync("/api/trackers", tracker2);
        
        var created2 = await response2.Content.ReadFromJsonAsync<TrackerResponseDto>();
        
        // Delete the second tracker
        await Client.DeleteAsync($"/api/trackers/{created2!.Id}");

        // Act - get active trackers only
        var response = await Client.GetAsync("/api/trackers?activeOnly=true");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var activeTrackers = await response.Content.ReadFromJsonAsync<List<TrackerResponseDto>>();
        activeTrackers.Should().NotBeNull();
        activeTrackers!.Should().HaveCount(1);
        activeTrackers[0].Name.Should().Be("Active Tracker");
    }

    [Fact]
    public async Task GetAllTrackers_ShouldReturnAllTrackers_IncludingInactive()
    {
        // Arrange - create and then delete a tracker
        await CleanupDatabaseAsync();
        
        // Create two trackers
        var tracker1 = new CreateTrackerDto { Name = "Active Tracker", Description = "Active" };
        var tracker2 = new CreateTrackerDto { Name = "To Delete", Description = "Will be inactive" };
        
        var response1 = await Client.PostAsJsonAsync("/api/trackers", tracker1);
        var response2 = await Client.PostAsJsonAsync("/api/trackers", tracker2);
        
        var created2 = await response2.Content.ReadFromJsonAsync<TrackerResponseDto>();
        
        // Delete the second tracker
        await Client.DeleteAsync($"/api/trackers/{created2!.Id}");

        // Act - get all trackers (including inactive)
        var response = await Client.GetAsync("/api/trackers");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var allTrackers = await response.Content.ReadFromJsonAsync<List<TrackerResponseDto>>();
        allTrackers.Should().NotBeNull();
        allTrackers!.Should().HaveCount(2); // Both active and inactive
    }
}