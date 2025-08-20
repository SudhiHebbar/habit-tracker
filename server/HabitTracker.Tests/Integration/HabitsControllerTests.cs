using System.Net;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using HabitTracker.Api;
using HabitTracker.Application.DTOs;
using HabitTracker.Domain.Entities;
using HabitTracker.Infrastructure.Data;

namespace HabitTracker.Tests.Integration;

public class HabitsControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions;

    public HabitsControllerTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Testing");
            builder.ConfigureServices(services =>
            {
                // Remove the existing DbContext registration
                var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<HabitTrackerDbContext>));
                if (descriptor != null)
                    services.Remove(descriptor);

                // Add in-memory database for testing
                services.AddDbContext<HabitTrackerDbContext>(options =>
                {
                    options.UseInMemoryDatabase("HabitsControllerTestDb");
                });

                // Ensure the database is created
                var serviceProvider = services.BuildServiceProvider();
                using var scope = serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<HabitTrackerDbContext>();
                context.Database.EnsureCreated();
            });
        });

        _client = _factory.CreateClient();
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
    }

    private async Task<HabitTrackerDbContext> GetDbContextAsync()
    {
        var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<HabitTrackerDbContext>();
        await context.Database.EnsureCreatedAsync();
        return context;
    }

    private async Task<Tracker> SeedTrackerAsync()
    {
        using var context = await GetDbContextAsync();
        var tracker = new Tracker
        {
            Name = "Test Tracker",
            Description = "Test Description",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Trackers.Add(tracker);
        await context.SaveChangesAsync();
        return tracker;
    }

    private async Task<Habit> SeedHabitAsync(int trackerId)
    {
        using var context = await GetDbContextAsync();
        var habit = new Habit
        {
            TrackerId = trackerId,
            Name = "Test Habit",
            Description = "Test Description",
            TargetFrequency = "Daily",
            TargetCount = 1,
            Color = "#FF0000",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            DisplayOrder = 0
        };

        context.Habits.Add(habit);
        await context.SaveChangesAsync();
        return habit;
    }

    private StringContent CreateJsonContent(object obj)
    {
        var json = JsonSerializer.Serialize(obj, _jsonOptions);
        return new StringContent(json, Encoding.UTF8, "application/json");
    }

    #region GET /api/habits/tracker/{trackerId} Tests

    [Fact]
    public async Task GetHabitsByTracker_WithValidTrackerId_ShouldReturnHabits()
    {
        // Arrange
        var tracker = await SeedTrackerAsync();
        var habit1 = await SeedHabitAsync(tracker.Id);
        var habit2 = await SeedHabitAsync(tracker.Id);

        // Act
        var response = await _client.GetAsync($"/api/habits/tracker/{tracker.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var habits = JsonSerializer.Deserialize<List<HabitResponseDto>>(responseContent, _jsonOptions);
        
        habits.Should().HaveCount(2);
        habits.Should().AllSatisfy(h => h.TrackerId.Should().Be(tracker.Id));
    }

    [Fact]
    public async Task GetHabitsByTracker_WithNonExistentTrackerId_ShouldReturnEmptyList()
    {
        // Act
        var response = await _client.GetAsync("/api/habits/tracker/999");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var habits = JsonSerializer.Deserialize<List<HabitResponseDto>>(responseContent, _jsonOptions);
        
        habits.Should().BeEmpty();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public async Task GetHabitsByTracker_WithInvalidTrackerId_ShouldReturnBadRequest(int trackerId)
    {
        // Act
        var response = await _client.GetAsync($"/api/habits/tracker/{trackerId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region POST /api/habits Tests

    [Fact]
    public async Task CreateHabit_WithValidData_ShouldCreateHabitAndReturnCreated()
    {
        // Arrange
        var tracker = await SeedTrackerAsync();
        var createDto = new CreateHabitDto
        {
            Name = "New Test Habit",
            Description = "New test description",
            TargetFrequency = "Daily",
            TargetCount = 1,
            Color = "#00FF00",
            DisplayOrder = 0
        };

        // Act
        var response = await _client.PostAsync(
            $"/api/habits?trackerId={tracker.Id}",
            CreateJsonContent(createDto)
        );

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var createdHabit = JsonSerializer.Deserialize<HabitResponseDto>(responseContent, _jsonOptions);
        
        createdHabit.Should().NotBeNull();
        createdHabit.Name.Should().Be(createDto.Name);
        createdHabit.Description.Should().Be(createDto.Description);
        createdHabit.TrackerId.Should().Be(tracker.Id);
        
        // Verify it was actually saved to the database
        using var context = await GetDbContextAsync();
        var savedHabit = await context.Habits.FirstOrDefaultAsync(h => h.Name == createDto.Name);
        savedHabit.Should().NotBeNull();
    }

    [Fact]
    public async Task CreateHabit_WithInvalidData_ShouldReturnBadRequest()
    {
        // Arrange
        var tracker = await SeedTrackerAsync();
        var createDto = new CreateHabitDto
        {
            Name = "", // Invalid: empty name
            TargetFrequency = "Daily",
            TargetCount = 1
        };

        // Act
        var response = await _client.PostAsync(
            $"/api/habits?trackerId={tracker.Id}",
            CreateJsonContent(createDto)
        );

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateHabit_WithNonExistentTracker_ShouldReturnBadRequest()
    {
        // Arrange
        var createDto = new CreateHabitDto
        {
            Name = "Test Habit",
            TargetFrequency = "Daily",
            TargetCount = 1
        };

        // Act
        var response = await _client.PostAsync(
            "/api/habits?trackerId=999",
            CreateJsonContent(createDto)
        );

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateHabit_WithDuplicateName_ShouldReturnConflict()
    {
        // Arrange
        var tracker = await SeedTrackerAsync();
        await SeedHabitAsync(tracker.Id); // Creates habit with name "Test Habit"
        
        var createDto = new CreateHabitDto
        {
            Name = "Test Habit", // Duplicate name
            TargetFrequency = "Daily",
            TargetCount = 1
        };

        // Act
        var response = await _client.PostAsync(
            $"/api/habits?trackerId={tracker.Id}",
            CreateJsonContent(createDto)
        );

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    #endregion

    #region PUT /api/habits/{id} Tests

    [Fact]
    public async Task UpdateHabit_WithValidData_ShouldUpdateHabitAndReturnOk()
    {
        // Arrange
        var tracker = await SeedTrackerAsync();
        var habit = await SeedHabitAsync(tracker.Id);
        
        var updateDto = new UpdateHabitDto
        {
            Name = "Updated Habit Name",
            Description = "Updated description",
            TargetFrequency = "Weekly",
            TargetCount = 2,
            Color = "#0000FF",
            DisplayOrder = 1,
            IsActive = true
        };

        // Act
        var response = await _client.PutAsync(
            $"/api/habits/{habit.Id}",
            CreateJsonContent(updateDto)
        );

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var updatedHabit = JsonSerializer.Deserialize<HabitResponseDto>(responseContent, _jsonOptions);
        
        updatedHabit.Name.Should().Be(updateDto.Name);
        updatedHabit.Description.Should().Be(updateDto.Description);
        updatedHabit.TargetFrequency.Should().Be(updateDto.TargetFrequency);
        
        // Verify it was actually updated in the database
        using var context = await GetDbContextAsync();
        var savedHabit = await context.Habits.FindAsync(habit.Id);
        savedHabit.Name.Should().Be(updateDto.Name);
    }

    [Fact]
    public async Task UpdateHabit_WithNonExistentId_ShouldReturnNotFound()
    {
        // Arrange
        var updateDto = new UpdateHabitDto
        {
            Name = "Updated Name",
            TargetFrequency = "Daily",
            TargetCount = 1,
            IsActive = true
        };

        // Act
        var response = await _client.PutAsync(
            "/api/habits/999",
            CreateJsonContent(updateDto)
        );

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task UpdateHabit_WithInvalidData_ShouldReturnBadRequest()
    {
        // Arrange
        var tracker = await SeedTrackerAsync();
        var habit = await SeedHabitAsync(tracker.Id);
        
        var updateDto = new UpdateHabitDto
        {
            Name = "", // Invalid: empty name
            TargetFrequency = "Daily",
            TargetCount = 1,
            IsActive = true
        };

        // Act
        var response = await _client.PutAsync(
            $"/api/habits/{habit.Id}",
            CreateJsonContent(updateDto)
        );

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region DELETE /api/habits/{id} Tests

    [Fact]
    public async Task DeleteHabit_WithValidId_ShouldDeleteHabitAndReturnNoContent()
    {
        // Arrange
        var tracker = await SeedTrackerAsync();
        var habit = await SeedHabitAsync(tracker.Id);

        // Act
        var response = await _client.DeleteAsync($"/api/habits/{habit.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
        
        // Verify it was actually deleted from the database
        using var context = await GetDbContextAsync();
        var deletedHabit = await context.Habits.FindAsync(habit.Id);
        deletedHabit.Should().BeNull();
    }

    [Fact]
    public async Task DeleteHabit_WithNonExistentId_ShouldReturnNotFound()
    {
        // Act
        var response = await _client.DeleteAsync("/api/habits/999");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public async Task DeleteHabit_WithInvalidId_ShouldReturnBadRequest(int habitId)
    {
        // Act
        var response = await _client.DeleteAsync($"/api/habits/{habitId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region GET /api/habits/{id} Tests

    [Fact]
    public async Task GetHabitById_WithValidId_ShouldReturnHabit()
    {
        // Arrange
        var tracker = await SeedTrackerAsync();
        var habit = await SeedHabitAsync(tracker.Id);

        // Act
        var response = await _client.GetAsync($"/api/habits/{habit.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var returnedHabit = JsonSerializer.Deserialize<HabitResponseDto>(responseContent, _jsonOptions);
        
        returnedHabit.Should().NotBeNull();
        returnedHabit.Id.Should().Be(habit.Id);
        returnedHabit.Name.Should().Be(habit.Name);
        returnedHabit.TrackerId.Should().Be(habit.TrackerId);
    }

    [Fact]
    public async Task GetHabitById_WithNonExistentId_ShouldReturnNotFound()
    {
        // Act
        var response = await _client.GetAsync("/api/habits/999");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    #endregion

    #region Business Logic Integration Tests

    [Fact]
    public async Task CreateMultipleHabits_InSameTracker_ShouldMaintainUniqueNames()
    {
        // Arrange
        var tracker = await SeedTrackerAsync();
        var habit1Dto = new CreateHabitDto { Name = "Unique Habit 1", TargetFrequency = "Daily", TargetCount = 1 };
        var habit2Dto = new CreateHabitDto { Name = "Unique Habit 2", TargetFrequency = "Weekly", TargetCount = 1 };

        // Act
        var response1 = await _client.PostAsync(
            $"/api/habits?trackerId={tracker.Id}",
            CreateJsonContent(habit1Dto)
        );
        var response2 = await _client.PostAsync(
            $"/api/habits?trackerId={tracker.Id}",
            CreateJsonContent(habit2Dto)
        );

        // Assert
        response1.StatusCode.Should().Be(HttpStatusCode.Created);
        response2.StatusCode.Should().Be(HttpStatusCode.Created);
        
        // Verify both habits exist in the database
        using var context = await GetDbContextAsync();
        var habits = await context.Habits.Where(h => h.TrackerId == tracker.Id).ToListAsync();
        habits.Should().HaveCount(2);
        habits.Select(h => h.Name).Should().BeEquivalentTo(new[] { "Unique Habit 1", "Unique Habit 2" });
    }

    [Fact]
    public async Task UpdateHabit_ChangeFrequency_ShouldMaintainOtherProperties()
    {
        // Arrange
        var tracker = await SeedTrackerAsync();
        var habit = await SeedHabitAsync(tracker.Id);
        var originalName = habit.Name;
        var originalDescription = habit.Description;
        
        var updateDto = new UpdateHabitDto
        {
            Name = originalName,
            Description = originalDescription,
            TargetFrequency = "Weekly", // Changed from Daily
            TargetCount = 1,
            Color = habit.Color,
            DisplayOrder = habit.DisplayOrder,
            IsActive = habit.IsActive
        };

        // Act
        var response = await _client.PutAsync(
            $"/api/habits/{habit.Id}",
            CreateJsonContent(updateDto)
        );

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        using var context = await GetDbContextAsync();
        var updatedHabit = await context.Habits.FindAsync(habit.Id);
        updatedHabit.Name.Should().Be(originalName);
        updatedHabit.Description.Should().Be(originalDescription);
        updatedHabit.TargetFrequency.Should().Be("Weekly");
    }

    [Fact]
    public async Task HabitLifecycle_CreateUpdateDelete_ShouldWorkEndToEnd()
    {
        // Arrange
        var tracker = await SeedTrackerAsync();
        var createDto = new CreateHabitDto
        {
            Name = "Lifecycle Test Habit",
            Description = "Testing full lifecycle",
            TargetFrequency = "Daily",
            TargetCount = 1,
            Color = "#FF00FF"
        };

        // Act 1: Create
        var createResponse = await _client.PostAsync(
            $"/api/habits?trackerId={tracker.Id}",
            CreateJsonContent(createDto)
        );
        createResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var createdHabit = JsonSerializer.Deserialize<HabitResponseDto>(
            await createResponse.Content.ReadAsStringAsync(), _jsonOptions);

        // Act 2: Update
        var updateDto = new UpdateHabitDto
        {
            Name = "Updated Lifecycle Habit",
            Description = "Updated description",
            TargetFrequency = "Weekly",
            TargetCount = 2,
            Color = "#00FFFF",
            DisplayOrder = 1,
            IsActive = true
        };
        
        var updateResponse = await _client.PutAsync(
            $"/api/habits/{createdHabit.Id}",
            CreateJsonContent(updateDto)
        );
        updateResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // Act 3: Delete
        var deleteResponse = await _client.DeleteAsync($"/api/habits/{createdHabit.Id}");
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Assert: Verify deletion
        var getResponse = await _client.GetAsync($"/api/habits/{createdHabit.Id}");
        getResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    #endregion

    public void Dispose()
    {
        _client?.Dispose();
    }
}