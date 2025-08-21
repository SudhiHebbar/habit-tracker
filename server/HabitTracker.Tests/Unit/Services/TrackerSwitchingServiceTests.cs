using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Caching.Memory;
using FluentAssertions;
using HabitTracker.Application.Services;
using HabitTracker.Application.Interfaces;
using HabitTracker.Application.DTOs.Tracker;
using HabitTracker.Domain.Entities;

namespace HabitTracker.Tests.Unit.Services;

public class TrackerSwitchingServiceTests
{
    private readonly MemoryCache _cache;
    private readonly ILogger<TrackerSwitchingService> _logger;

    public TrackerSwitchingServiceTests()
    {
        _cache = new MemoryCache(new MemoryCacheOptions());
        _logger = new LoggerFactory().CreateLogger<TrackerSwitchingService>();
    }

    [Fact]
    public async Task GetTrackerSummariesAsync_ShouldReturnCachedData_WhenCacheHit()
    {
        // Arrange
        var userId = "test-user";
        var cacheKey = $"tracker_summaries_{userId}";
        var expectedSummaries = new List<TrackerSummaryDto>
        {
            new() { Id = 1, Name = "Test Tracker 1" },
            new() { Id = 2, Name = "Test Tracker 2" }
        };

        _cache.Set(cacheKey, expectedSummaries, TimeSpan.FromMinutes(5));

        var mockTrackerRepo = new Mock<ITrackerRepository>();
        var mockHabitRepo = new Mock<IHabitRepository>();
        var mockCompletionRepo = new Mock<IHabitCompletionRepository>();
        var mockMapper = new Mock<AutoMapper.IMapper>();

        var service = new TrackerSwitchingService(
            mockTrackerRepo.Object,
            mockHabitRepo.Object,
            mockCompletionRepo.Object,
            mockMapper.Object,
            _cache,
            _logger);

        // Act
        var result = await service.GetTrackerSummariesAsync(userId);

        // Assert
        result.Should().BeEquivalentTo(expectedSummaries);
        mockTrackerRepo.Verify(x => x.GetActiveTrackersByUserIdAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task RecordTrackerAccessAsync_ShouldUpdateCache_WhenCalled()
    {
        // Arrange
        var userId = "test-user";
        var trackerId = 1;
        var cacheKey = $"tracker_access_{userId}";

        var mockTrackerRepo = new Mock<ITrackerRepository>();
        var mockHabitRepo = new Mock<IHabitRepository>();
        var mockCompletionRepo = new Mock<IHabitCompletionRepository>();
        var mockMapper = new Mock<AutoMapper.IMapper>();

        var service = new TrackerSwitchingService(
            mockTrackerRepo.Object,
            mockHabitRepo.Object,
            mockCompletionRepo.Object,
            mockMapper.Object,
            _cache,
            _logger);

        // Act
        await service.RecordTrackerAccessAsync(trackerId, userId);

        // Assert
        var cachedAccess = _cache.Get<List<(int TrackerId, DateTime AccessedAt)>>(cacheKey);
        cachedAccess.Should().NotBeNull();
        cachedAccess.Should().HaveCount(1);
        cachedAccess![0].TrackerId.Should().Be(trackerId);
    }

    [Fact]
    public async Task GetTrackerSwitchDataAsync_ShouldReturnCorrectNavigationData()
    {
        // Arrange
        var userId = "test-user";
        var currentTrackerId = 2;
        
        var trackerSummaries = new List<TrackerSummaryDto>
        {
            new() { Id = 1, Name = "Tracker 1", DisplayOrder = 1 },
            new() { Id = 2, Name = "Tracker 2", DisplayOrder = 2 },
            new() { Id = 3, Name = "Tracker 3", DisplayOrder = 3 }
        }.AsEnumerable();

        var mockTrackerRepo = new Mock<ITrackerRepository>();
        var mockHabitRepo = new Mock<IHabitRepository>();
        var mockCompletionRepo = new Mock<IHabitCompletionRepository>();
        var mockMapper = new Mock<AutoMapper.IMapper>();

        // Mock the GetTrackerSummariesAsync to return our test data
        var summariesCacheKey = $"tracker_summaries_{userId}";
        _cache.Set(summariesCacheKey, trackerSummaries, TimeSpan.FromMinutes(5));

        var service = new TrackerSwitchingService(
            mockTrackerRepo.Object,
            mockHabitRepo.Object,
            mockCompletionRepo.Object,
            mockMapper.Object,
            _cache,
            _logger);

        // Act
        var result = await service.GetTrackerSwitchDataAsync(currentTrackerId, userId);

        // Assert
        result.Should().NotBeNull();
        result.CurrentTrackerId.Should().Be(currentTrackerId);
        result.PreviousTrackerId.Should().Be(1); // Tracker at index 0
        result.NextTrackerId.Should().Be(3);     // Tracker at index 2
    }

    [Fact]
    public async Task PreloadTrackerDataAsync_ShouldExecuteInBackground()
    {
        // Arrange
        var userId = "test-user";
        var trackerId = 1;

        var mockTrackerRepo = new Mock<ITrackerRepository>();
        var mockHabitRepo = new Mock<IHabitRepository>();
        var mockCompletionRepo = new Mock<IHabitCompletionRepository>();
        var mockMapper = new Mock<AutoMapper.IMapper>();

        var service = new TrackerSwitchingService(
            mockTrackerRepo.Object,
            mockHabitRepo.Object,
            mockCompletionRepo.Object,
            mockMapper.Object,
            _cache,
            _logger);

        // Act & Assert - should not throw and should complete quickly
        await service.PreloadTrackerDataAsync(trackerId, userId);
        
        // The method should complete without error
        // Background task will run separately
    }
}