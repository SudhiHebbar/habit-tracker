using AutoMapper;
using FluentAssertions;
using HabitTracker.Application.DTOs.Completion;
using HabitTracker.Application.Interfaces;
using HabitTracker.Application.Services;
using HabitTracker.Domain.Entities;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using NSubstitute;
using NSubstitute.ExceptionExtensions;

namespace HabitTracker.Tests.Unit.Services;

public class HabitCompletionServiceTests
{
    private readonly IUnitOfWork _mockUnitOfWork;
    private readonly IHabitRepository _mockHabitRepository;
    private readonly IHabitCompletionRepository _mockCompletionRepository;
    private readonly IStreakRepository _mockStreakRepository;
    private readonly IMapper _mockMapper;
    private readonly ILogger<HabitCompletionService> _mockLogger;
    private readonly IMemoryCache _mockCache;
    private readonly HabitCompletionService _service;

    public HabitCompletionServiceTests()
    {
        _mockUnitOfWork = Substitute.For<IUnitOfWork>();
        _mockHabitRepository = Substitute.For<IHabitRepository>();
        _mockCompletionRepository = Substitute.For<IHabitCompletionRepository>();
        _mockStreakRepository = Substitute.For<IStreakRepository>();
        _mockMapper = Substitute.For<IMapper>();
        _mockLogger = Substitute.For<ILogger<HabitCompletionService>>();
        _mockCache = Substitute.For<IMemoryCache>();

        _mockUnitOfWork.Habits.Returns(_mockHabitRepository);
        _mockUnitOfWork.HabitCompletions.Returns(_mockCompletionRepository);

        _service = new HabitCompletionService(
            _mockUnitOfWork,
            _mockMapper,
            _mockLogger,
            _mockCache,
            _mockStreakRepository);
    }

    [Fact]
    public async Task ToggleCompletionAsync_ShouldToggleCompletion_WhenValidRequest()
    {
        // Arrange
        const int habitId = 1;
        var habit = new Habit { Id = habitId, Name = "Test Habit" };
        var toggleDto = new ToggleCompletionDto { Notes = "Test notes" };
        var completion = new HabitCompletion
        {
            Id = 1,
            HabitId = habitId,
            CompletionDate = DateOnly.FromDateTime(DateTime.UtcNow),
            IsCompleted = true,
            Notes = "Test notes"
        };
        var streak = new Streak
        {
            Id = 1,
            HabitId = habitId,
            CurrentStreak = 5,
            LongestStreak = 10
        };
        var responseDto = new CompletionResponseDto
        {
            Id = 1,
            HabitId = habitId,
            Date = DateTime.UtcNow,
            IsCompleted = true,
            Notes = "Test notes",
            CurrentStreak = 5,
            LongestStreak = 10
        };

        _mockHabitRepository.GetByIdAsync(habitId, Arg.Any<CancellationToken>())
            .Returns(habit);
        _mockCompletionRepository.ToggleCompletionAsync(habitId, Arg.Any<DateOnly>(), "Test notes", Arg.Any<CancellationToken>())
            .Returns(completion);
        _mockStreakRepository.GetStreakByHabitIdAsync(habitId, Arg.Any<CancellationToken>())
            .Returns(streak);
        _mockMapper.Map<CompletionResponseDto>(completion)
            .Returns(responseDto);

        // Act
        var result = await _service.ToggleCompletionAsync(habitId, toggleDto);

        // Assert
        result.Should().NotBeNull();
        result.HabitId.Should().Be(habitId);
        result.IsCompleted.Should().BeTrue();
        result.Notes.Should().Be("Test notes");
        result.CurrentStreak.Should().Be(5);
        result.LongestStreak.Should().Be(10);

        await _mockUnitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
        await _mockCompletionRepository.Received(1).ToggleCompletionAsync(
            habitId, 
            Arg.Any<DateOnly>(), 
            "Test notes", 
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ToggleCompletionAsync_ShouldThrowArgumentException_WhenHabitNotFound()
    {
        // Arrange
        const int habitId = 999;
        var toggleDto = new ToggleCompletionDto();

        _mockHabitRepository.GetByIdAsync(habitId, Arg.Any<CancellationToken>())
            .Returns((Habit?)null);

        // Act & Assert
        await _service.Invoking(s => s.ToggleCompletionAsync(habitId, toggleDto))
            .Should().ThrowAsync<ArgumentException>()
            .WithMessage("*not found*");
    }

    [Fact]
    public async Task ToggleCompletionAsync_ShouldUseCurrentDateWhenNotProvided()
    {
        // Arrange
        const int habitId = 1;
        var habit = new Habit { Id = habitId };
        var toggleDto = new ToggleCompletionDto { Date = null };
        var completion = new HabitCompletion { Id = 1, HabitId = habitId };
        var responseDto = new CompletionResponseDto { Id = 1, HabitId = habitId };

        _mockHabitRepository.GetByIdAsync(habitId, Arg.Any<CancellationToken>())
            .Returns(habit);
        _mockCompletionRepository.ToggleCompletionAsync(Arg.Any<int>(), Arg.Any<DateOnly>(), Arg.Any<string>(), Arg.Any<CancellationToken>())
            .Returns(completion);
        _mockMapper.Map<CompletionResponseDto>(completion)
            .Returns(responseDto);

        var expectedDate = DateOnly.FromDateTime(DateTime.UtcNow.Date);

        // Act
        await _service.ToggleCompletionAsync(habitId, toggleDto);

        // Assert
        await _mockCompletionRepository.Received(1).ToggleCompletionAsync(
            habitId,
            Arg.Is<DateOnly>(d => d == expectedDate),
            Arg.Any<string>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CompleteHabitAsync_ShouldMarkAsCompleted_WhenIsCompletedTrue()
    {
        // Arrange
        const int habitId = 1;
        var habit = new Habit { Id = habitId };
        var completeDto = new CompleteHabitDto 
        { 
            Date = DateTime.UtcNow,
            IsCompleted = true,
            Notes = "Completed today"
        };
        var completion = new HabitCompletion { Id = 1, HabitId = habitId };
        var responseDto = new CompletionResponseDto { Id = 1, HabitId = habitId };

        _mockHabitRepository.GetByIdAsync(habitId, Arg.Any<CancellationToken>())
            .Returns(habit);
        _mockCompletionRepository.MarkAsCompletedAsync(
            habitId, 
            Arg.Any<DateOnly>(), 
            "Completed today", 
            Arg.Any<CancellationToken>())
            .Returns(completion);
        _mockMapper.Map<CompletionResponseDto>(completion)
            .Returns(responseDto);

        // Act
        var result = await _service.CompleteHabitAsync(habitId, completeDto);

        // Assert
        result.Should().NotBeNull();
        await _mockCompletionRepository.Received(1).MarkAsCompletedAsync(
            habitId,
            Arg.Any<DateOnly>(),
            "Completed today",
            Arg.Any<CancellationToken>());
        await _mockCompletionRepository.DidNotReceive().MarkAsIncompleteAsync(
            Arg.Any<int>(),
            Arg.Any<DateOnly>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CompleteHabitAsync_ShouldMarkAsIncomplete_WhenIsCompletedFalse()
    {
        // Arrange
        const int habitId = 1;
        var habit = new Habit { Id = habitId };
        var completeDto = new CompleteHabitDto 
        { 
            Date = DateTime.UtcNow,
            IsCompleted = false
        };
        var completion = new HabitCompletion { Id = 1, HabitId = habitId };
        var responseDto = new CompletionResponseDto { Id = 1, HabitId = habitId };

        _mockHabitRepository.GetByIdAsync(habitId, Arg.Any<CancellationToken>())
            .Returns(habit);
        _mockCompletionRepository.MarkAsIncompleteAsync(
            habitId, 
            Arg.Any<DateOnly>(), 
            Arg.Any<CancellationToken>())
            .Returns(completion);
        _mockMapper.Map<CompletionResponseDto>(completion)
            .Returns(responseDto);

        // Act
        var result = await _service.CompleteHabitAsync(habitId, completeDto);

        // Assert
        result.Should().NotBeNull();
        await _mockCompletionRepository.Received(1).MarkAsIncompleteAsync(
            habitId,
            Arg.Any<DateOnly>(),
            Arg.Any<CancellationToken>());
        await _mockCompletionRepository.DidNotReceive().MarkAsCompletedAsync(
            Arg.Any<int>(),
            Arg.Any<DateOnly>(),
            Arg.Any<string>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetCompletionsAsync_ShouldReturnCachedResult_WhenCacheHit()
    {
        // Arrange
        const int habitId = 1;
        var cachedResult = new List<CompletionResponseDto>
        {
            new() { Id = 1, HabitId = habitId },
            new() { Id = 2, HabitId = habitId }
        };

        _mockCache.TryGetValue<IEnumerable<CompletionResponseDto>>(Arg.Any<string>(), out Arg.Any<IEnumerable<CompletionResponseDto>>())
            .Returns(x =>
            {
                x[1] = cachedResult;
                return true;
            });

        // Act
        var result = await _service.GetCompletionsAsync(habitId);

        // Assert
        result.Should().BeEquivalentTo(cachedResult);
        await _mockCompletionRepository.DidNotReceive().GetCompletionsByHabitIdAsync(
            Arg.Any<int>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetCompletionsAsync_ShouldFetchFromRepository_WhenCacheMiss()
    {
        // Arrange
        const int habitId = 1;
        var completions = new List<HabitCompletion>
        {
            new() { Id = 1, HabitId = habitId },
            new() { Id = 2, HabitId = habitId }
        };
        var mappedResult = new List<CompletionResponseDto>
        {
            new() { Id = 1, HabitId = habitId },
            new() { Id = 2, HabitId = habitId }
        };

        _mockCache.TryGetValue<IEnumerable<CompletionResponseDto>>(Arg.Any<string>(), out Arg.Any<IEnumerable<CompletionResponseDto>>())
            .Returns(false);
        _mockCompletionRepository.GetCompletionsByHabitIdAsync(habitId, Arg.Any<CancellationToken>())
            .Returns(completions);
        _mockMapper.Map<IEnumerable<CompletionResponseDto>>(completions)
            .Returns(mappedResult);

        // Act
        var result = await _service.GetCompletionsAsync(habitId);

        // Assert
        result.Should().BeEquivalentTo(mappedResult);
        _mockCache.Received(1).Set(
            Arg.Any<string>(),
            mappedResult,
            Arg.Any<TimeSpan>());
    }

    [Fact]
    public async Task GetCompletionsAsync_ShouldUseDateRange_WhenProvided()
    {
        // Arrange
        const int habitId = 1;
        var startDate = DateTime.UtcNow.AddDays(-7);
        var endDate = DateTime.UtcNow;
        var completions = new List<HabitCompletion>();
        var mappedResult = new List<CompletionResponseDto>();

        _mockCache.TryGetValue<IEnumerable<CompletionResponseDto>>(Arg.Any<string>(), out Arg.Any<IEnumerable<CompletionResponseDto>>())
            .Returns(false);
        _mockCompletionRepository.GetCompletionsByHabitAndDateRangeAsync(
            habitId, 
            startDate, 
            endDate, 
            Arg.Any<CancellationToken>())
            .Returns(completions);
        _mockMapper.Map<IEnumerable<CompletionResponseDto>>(completions)
            .Returns(mappedResult);

        // Act
        await _service.GetCompletionsAsync(habitId, startDate, endDate);

        // Assert
        await _mockCompletionRepository.Received(1).GetCompletionsByHabitAndDateRangeAsync(
            habitId,
            startDate,
            endDate,
            Arg.Any<CancellationToken>());
        await _mockCompletionRepository.DidNotReceive().GetCompletionsByHabitIdAsync(
            Arg.Any<int>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetCompletionStatusAsync_ShouldReturnCorrectStatus()
    {
        // Arrange
        const int habitId = 1;
        var date = DateTime.UtcNow;
        var dateOnly = DateOnly.FromDateTime(date.Date);
        var streak = new Streak
        {
            HabitId = habitId,
            CurrentStreak = 3,
            LongestStreak = 7
        };
        var lastCompletion = new HabitCompletion
        {
            HabitId = habitId,
            CompletionDate = DateOnly.FromDateTime(date.AddDays(-1))
        };

        _mockCompletionRepository.IsHabitCompletedOnDateAsync(habitId, dateOnly, Arg.Any<CancellationToken>())
            .Returns(true);
        _mockStreakRepository.GetStreakByHabitIdAsync(habitId, Arg.Any<CancellationToken>())
            .Returns(streak);
        _mockCompletionRepository.GetLastCompletionAsync(habitId, Arg.Any<CancellationToken>())
            .Returns(lastCompletion);

        // Act
        var result = await _service.GetCompletionStatusAsync(habitId, date);

        // Assert
        result.Should().NotBeNull();
        result.HabitId.Should().Be(habitId);
        result.Date.Should().Be(date);
        result.IsCompleted.Should().BeTrue();
        result.CurrentStreak.Should().Be(3);
        result.LongestStreak.Should().Be(7);
        result.LastCompletedDate.Should().Be(lastCompletion.CompletionDate);
    }

    [Fact]
    public async Task BulkToggleCompletionsAsync_ShouldProcessAllHabits()
    {
        // Arrange
        var habitIds = new List<int> { 1, 2, 3 };
        var bulkDto = new BulkCompletionDto
        {
            HabitIds = habitIds,
            Date = DateTime.UtcNow,
            Notes = "Bulk completion"
        };
        
        var completions = habitIds.Select(id => new HabitCompletion { Id = id, HabitId = id }).ToList();
        var mappedCompletions = habitIds.Select(id => new CompletionResponseDto { Id = id, HabitId = id }).ToList();

        for (int i = 0; i < habitIds.Count; i++)
        {
            _mockCompletionRepository.ToggleCompletionAsync(
                habitIds[i], 
                Arg.Any<DateOnly>(), 
                "Bulk completion", 
                Arg.Any<CancellationToken>())
                .Returns(completions[i]);
            _mockMapper.Map<CompletionResponseDto>(completions[i])
                .Returns(mappedCompletions[i]);
        }

        // Act
        var result = await _service.BulkToggleCompletionsAsync(bulkDto);

        // Assert
        result.Should().NotBeNull();
        result.SuccessCount.Should().Be(3);
        result.FailureCount.Should().Be(0);
        result.Completions.Should().HaveCount(3);
        result.Errors.Should().BeEmpty();

        await _mockUnitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task BulkToggleCompletionsAsync_ShouldHandlePartialFailures()
    {
        // Arrange
        var habitIds = new List<int> { 1, 2, 3 };
        var bulkDto = new BulkCompletionDto
        {
            HabitIds = habitIds,
            Date = DateTime.UtcNow,
            Notes = "Bulk completion"
        };
        
        var completion1 = new HabitCompletion { Id = 1, HabitId = 1 };
        var completion3 = new HabitCompletion { Id = 3, HabitId = 3 };
        var mappedCompletion1 = new CompletionResponseDto { Id = 1, HabitId = 1 };
        var mappedCompletion3 = new CompletionResponseDto { Id = 3, HabitId = 3 };

        _mockCompletionRepository.ToggleCompletionAsync(1, Arg.Any<DateOnly>(), Arg.Any<string>(), Arg.Any<CancellationToken>())
            .Returns(completion1);
        _mockCompletionRepository.ToggleCompletionAsync(2, Arg.Any<DateOnly>(), Arg.Any<string>(), Arg.Any<CancellationToken>())
            .Throws(new InvalidOperationException("Habit 2 failed"));
        _mockCompletionRepository.ToggleCompletionAsync(3, Arg.Any<DateOnly>(), Arg.Any<string>(), Arg.Any<CancellationToken>())
            .Returns(completion3);

        _mockMapper.Map<CompletionResponseDto>(completion1).Returns(mappedCompletion1);
        _mockMapper.Map<CompletionResponseDto>(completion3).Returns(mappedCompletion3);

        // Act
        var result = await _service.BulkToggleCompletionsAsync(bulkDto);

        // Assert
        result.Should().NotBeNull();
        result.SuccessCount.Should().Be(2);
        result.FailureCount.Should().Be(1);
        result.Completions.Should().HaveCount(2);
        result.Errors.Should().ContainSingle().Which.Should().Contain("Habit 2 failed");
    }

    [Fact]
    public async Task GetCompletionHistoryAsync_ShouldReturnPagedResults()
    {
        // Arrange
        const int habitId = 1;
        const int page = 1;
        const int pageSize = 2;
        
        var completions = new List<HabitCompletion>
        {
            new() { Id = 1, HabitId = habitId },
            new() { Id = 2, HabitId = habitId },
            new() { Id = 3, HabitId = habitId }
        };

        var mappedCompletions = new List<CompletionResponseDto>
        {
            new() { Id = 1, HabitId = habitId },
            new() { Id = 2, HabitId = habitId }
        };

        _mockCompletionRepository.GetCompletionsByHabitIdAsync(habitId, Arg.Any<CancellationToken>())
            .Returns(completions);
        _mockCompletionRepository.GetCompletionRateAsync(habitId, cancellationToken: Arg.Any<CancellationToken>())
            .Returns(75.0);
        _mockMapper.Map<List<CompletionResponseDto>>(Arg.Any<IEnumerable<HabitCompletion>>())
            .Returns(mappedCompletions);

        // Act
        var result = await _service.GetCompletionHistoryAsync(habitId, page, pageSize);

        // Assert
        result.Should().NotBeNull();
        result.HabitId.Should().Be(habitId);
        result.TotalCompletions.Should().Be(3);
        result.CompletionRate.Should().Be(75.0);
        result.CurrentPage.Should().Be(1);
        result.TotalPages.Should().Be(2);
        result.Completions.Should().HaveCount(2);
    }

    [Fact]
    public async Task TriggerStreakCalculationAsync_ShouldCalculateAndUpdateStreak()
    {
        // Arrange
        const int habitId = 1;
        const int currentStreak = 5;
        var longestStreak = new StreakInfo { Length = 10 };
        const int completionCount = 20;
        const double completionRate = 80.5;
        var lastCompletion = new HabitCompletion
        {
            HabitId = habitId,
            CompletionDate = DateOnly.FromDateTime(DateTime.UtcNow)
        };

        _mockCompletionRepository.GetCurrentStreakLengthAsync(habitId, cancellationToken: Arg.Any<CancellationToken>())
            .Returns(currentStreak);
        _mockCompletionRepository.GetLongestStreakAsync(habitId, Arg.Any<CancellationToken>())
            .Returns(longestStreak);
        _mockCompletionRepository.GetCompletionCountAsync(habitId, cancellationToken: Arg.Any<CancellationToken>())
            .Returns(completionCount);
        _mockCompletionRepository.GetCompletionRateAsync(habitId, cancellationToken: Arg.Any<CancellationToken>())
            .Returns(completionRate);
        _mockCompletionRepository.GetLastCompletionAsync(habitId, Arg.Any<CancellationToken>())
            .Returns(lastCompletion);

        // Act
        await _service.TriggerStreakCalculationAsync(habitId);

        // Assert
        await _mockStreakRepository.Received(1).UpdateStreakAsync(
            habitId,
            currentStreak,
            10,
            lastCompletion.CompletionDate,
            completionCount,
            completionRate,
            Arg.Any<CancellationToken>());
        await _mockUnitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task TriggerStreakCalculationAsync_ShouldNotThrow_WhenCalculationFails()
    {
        // Arrange
        const int habitId = 1;
        _mockCompletionRepository.GetCurrentStreakLengthAsync(habitId, cancellationToken: Arg.Any<CancellationToken>())
            .Throws(new InvalidOperationException("Database error"));

        // Act & Assert
        await _service.Invoking(s => s.TriggerStreakCalculationAsync(habitId))
            .Should().NotThrowAsync();
    }

    [Fact]
    public async Task GetCompletionStatsAsync_ShouldReturnComprehensiveStats()
    {
        // Arrange
        const int habitId = 1;
        var streak = new Streak { CurrentStreak = 5, LongestStreak = 12 };
        var firstCompletion = new HabitCompletion { CompletionDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-30)) };
        var lastCompletion = new HabitCompletion { CompletionDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1)) };
        var dayOfWeekStats = new Dictionary<DayOfWeek, int>
        {
            { DayOfWeek.Monday, 5 },
            { DayOfWeek.Tuesday, 3 }
        };

        _mockCompletionRepository.GetCompletionCountAsync(habitId, cancellationToken: Arg.Any<CancellationToken>())
            .Returns(25);
        _mockStreakRepository.GetStreakByHabitIdAsync(habitId, Arg.Any<CancellationToken>())
            .Returns(streak);
        _mockCompletionRepository.GetCompletionRateAsync(habitId, cancellationToken: Arg.Any<CancellationToken>())
            .Returns(83.3);
        _mockCompletionRepository.GetFirstCompletionAsync(habitId, Arg.Any<CancellationToken>())
            .Returns(firstCompletion);
        _mockCompletionRepository.GetLastCompletionAsync(habitId, Arg.Any<CancellationToken>())
            .Returns(lastCompletion);
        _mockCompletionRepository.GetCompletionsByDayOfWeekAsync(habitId, cancellationToken: Arg.Any<CancellationToken>())
            .Returns(dayOfWeekStats);

        // Act
        var result = await _service.GetCompletionStatsAsync(habitId);

        // Assert
        result.Should().NotBeNull();
        result.HabitId.Should().Be(habitId);
        result.TotalCompletions.Should().Be(25);
        result.CurrentStreak.Should().Be(5);
        result.LongestStreak.Should().Be(12);
        result.CompletionRate.Should().Be(83.3);
        result.FirstCompletionDate.Should().Be(firstCompletion.CompletionDate);
        result.LastCompletionDate.Should().Be(lastCompletion.CompletionDate);
        result.CompletionsByDayOfWeek.Should().BeEquivalentTo(dayOfWeekStats);
    }

    [Fact]
    public async Task GetWeeklyCompletionsAsync_ShouldReturnWeeklyData()
    {
        // Arrange
        const int trackerId = 1;
        var weekStartDate = DateTime.UtcNow.AddDays(-6);
        var habits = new List<Habit>
        {
            new() { Id = 1, Name = "Habit 1", Color = "#FF0000", Icon = "icon1" },
            new() { Id = 2, Name = "Habit 2", Color = "#00FF00", Icon = "icon2" }
        };

        var weeklyCompletions = new Dictionary<DateOnly, List<HabitCompletion>>
        {
            {
                DateOnly.FromDateTime(weekStartDate),
                new List<HabitCompletion>
                {
                    new() { HabitId = 1, IsCompleted = true },
                    new() { HabitId = 2, IsCompleted = false }
                }
            }
        };

        _mockCompletionRepository.GetWeeklyCompletionsAsync(trackerId, Arg.Any<DateOnly>(), Arg.Any<CancellationToken>())
            .Returns(weeklyCompletions);
        _mockHabitRepository.GetActiveHabitsByTrackerIdAsync(trackerId, Arg.Any<CancellationToken>())
            .Returns(habits);

        // Act
        var result = await _service.GetWeeklyCompletionsAsync(trackerId, weekStartDate);

        // Assert
        result.Should().NotBeNull();
        result.TrackerId.Should().Be(trackerId);
        result.WeekStartDate.Should().Be(weekStartDate);
        result.CompletionsByDate.Should().ContainKey(weekStartDate);
        result.TotalCompletions.Should().Be(1); // Only one completion was true
        result.CompletionRate.Should().BeGreaterThan(0);
    }
}