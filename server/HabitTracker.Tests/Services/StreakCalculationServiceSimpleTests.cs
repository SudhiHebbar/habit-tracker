using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using HabitTracker.Application.Services;
using HabitTracker.Domain.Entities;
using HabitTracker.Infrastructure.Data;
using HabitTracker.Infrastructure.Repositories;

namespace HabitTracker.Tests.Services;

public class StreakCalculationServiceSimpleTests : IDisposable
{
    private readonly HabitTrackerDbContext _context;
    private readonly StreakRepository _streakRepository;
    private readonly StreakCalculationService _service;

    public StreakCalculationServiceSimpleTests()
    {
        var options = new DbContextOptionsBuilder<HabitTrackerDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new HabitTrackerDbContext(options);
        _streakRepository = new StreakRepository(_context);
        _service = new StreakCalculationService(_streakRepository, _context);
    }

    [Fact]
    public async Task CalculateCurrentStreakAsync_WithDailyHabit_ShouldCalculateCorrectStreak()
    {
        // Arrange
        var habit = CreateTestHabit("Daily");
        var completions = new List<HabitCompletion>
        {
            CreateCompletion(habit.Id, DateTime.Today.AddDays(-2)),
            CreateCompletion(habit.Id, DateTime.Today.AddDays(-1)),
            CreateCompletion(habit.Id, DateTime.Today)
        };

        await SeedDatabase(habit, completions);

        // Act
        var result = await _service.CalculateCurrentStreakAsync(habit.Id);

        // Assert
        result.Should().Be(3);
    }

    [Fact]
    public async Task CalculateCurrentStreakAsync_WithBrokenStreak_ShouldReturnCorrectCount()
    {
        // Arrange
        var habit = CreateTestHabit("Daily");
        var completions = new List<HabitCompletion>
        {
            CreateCompletion(habit.Id, DateTime.Today.AddDays(-5)),
            CreateCompletion(habit.Id, DateTime.Today.AddDays(-4)),
            // Gap on day -3 (broken streak)
            CreateCompletion(habit.Id, DateTime.Today.AddDays(-2)),
            CreateCompletion(habit.Id, DateTime.Today.AddDays(-1))
        };

        await SeedDatabase(habit, completions);

        // Act
        var result = await _service.CalculateCurrentStreakAsync(habit.Id);

        // Assert
        result.Should().Be(2); // Only the last two consecutive days
    }

    [Fact]
    public async Task UpdateStreakOnCompletionAsync_WithNewCompletion_ShouldUpdateStreak()
    {
        // Arrange
        var habit = CreateTestHabit("Daily");
        var existingCompletions = new List<HabitCompletion>
        {
            CreateCompletion(habit.Id, DateTime.Today.AddDays(-1))
        };

        await SeedDatabase(habit, existingCompletions);

        var newCompletion = CreateCompletion(habit.Id, DateTime.Today);
        await _context.HabitCompletions.AddAsync(newCompletion);
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.UpdateStreakOnCompletionAsync(habit.Id, newCompletion.CompletionDate);

        // Assert
        result.CurrentStreak.Should().Be(2);
        result.LongestStreak.Should().BeGreaterOrEqualTo(2);
    }

    [Fact]
    public async Task RecalculateStreakAsync_ShouldRecalculateCorrectly()
    {
        // Arrange
        var habit = CreateTestHabit("Daily");
        var completions = new List<HabitCompletion>
        {
            CreateCompletion(habit.Id, DateTime.Today.AddDays(-4)),
            CreateCompletion(habit.Id, DateTime.Today.AddDays(-3)),
            CreateCompletion(habit.Id, DateTime.Today.AddDays(-2)),
            CreateCompletion(habit.Id, DateTime.Today.AddDays(-1))
        };

        await SeedDatabase(habit, completions);

        // Act
        var result = await _service.RecalculateStreakAsync(habit.Id);

        // Assert
        result.CurrentStreak.Should().Be(4);
        result.LongestStreak.Should().Be(4);
    }

    [Fact]
    public async Task ValidateStreakConsistencyAsync_WithInconsistentData_ShouldReturnValidationErrors()
    {
        // Arrange
        var habit = CreateTestHabit("Daily");
        var streak = new Streak
        {
            HabitId = habit.Id,
            CurrentStreak = 10, // Incorrect - should be 2
            LongestStreak = 5,  // Incorrect - should be at least current
            LastUpdated = DateTime.Today
        };

        var completions = new List<HabitCompletion>
        {
            CreateCompletion(habit.Id, DateTime.Today.AddDays(-1)),
            CreateCompletion(habit.Id, DateTime.Today)
        };

        await SeedDatabase(habit, completions, streak);

        // Act
        var result = await _service.ValidateStreakConsistencyAsync(habit.Id);

        // Assert
        result.IsValid.Should().BeFalse();
        result.ValidationErrors.Should().NotBeEmpty();
    }

    [Theory]
    [InlineData("Daily")]
    [InlineData("Weekly")]
    [InlineData("Monthly")]
    public async Task CalculateCurrentStreakAsync_WithDifferentFrequencies_ShouldWork(string frequency)
    {
        // Arrange
        var habit = CreateTestHabit(frequency);
        var completions = new List<HabitCompletion>
        {
            CreateCompletion(habit.Id, DateTime.Today.AddDays(-1)),
            CreateCompletion(habit.Id, DateTime.Today)
        };

        await SeedDatabase(habit, completions);

        // Act
        var result = await _service.CalculateCurrentStreakAsync(habit.Id);

        // Assert
        result.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task CalculateCurrentStreakAsync_WithFutureCompletions_ShouldIgnoreFutureDates()
    {
        // Arrange
        var habit = CreateTestHabit("Daily");
        var completions = new List<HabitCompletion>
        {
            CreateCompletion(habit.Id, DateTime.Today.AddDays(-1)),
            CreateCompletion(habit.Id, DateTime.Today),
            CreateCompletion(habit.Id, DateTime.Today.AddDays(1)) // Future date
        };

        await SeedDatabase(habit, completions);

        // Act
        var result = await _service.CalculateCurrentStreakAsync(habit.Id);

        // Assert
        result.Should().Be(2); // Should ignore future completion
    }

    [Fact]
    public async Task CalculateCurrentStreakAsync_WithNoCompletions_ShouldReturnZero()
    {
        // Arrange
        var habit = CreateTestHabit("Daily");
        await SeedDatabase(habit, new List<HabitCompletion>());

        // Act
        var result = await _service.CalculateCurrentStreakAsync(habit.Id);

        // Assert
        result.Should().Be(0);
    }

    [Fact]
    public async Task UpdateStreakOnCompletionAsync_WithFirstCompletion_ShouldStartStreak()
    {
        // Arrange
        var habit = CreateTestHabit("Daily");
        await SeedDatabase(habit, new List<HabitCompletion>());

        var firstCompletion = CreateCompletion(habit.Id, DateTime.Today);
        await _context.HabitCompletions.AddAsync(firstCompletion);
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.UpdateStreakOnCompletionAsync(habit.Id, firstCompletion.CompletionDate);

        // Assert
        result.CurrentStreak.Should().Be(1);
        result.LongestStreak.Should().Be(1);
    }

    private Habit CreateTestHabit(string frequency = "Daily")
    {
        return new Habit
        {
            Id = Random.Shared.Next(1000, 9999),
            Name = "Test Habit",
            Description = "Test Description",
            TargetFrequency = frequency,
            TargetCount = 1,
            Color = "#6366F1",
            CreatedAt = DateTime.Today.AddMonths(-1),
            TrackerId = 1,
            IsActive = true
        };
    }

    private HabitCompletion CreateCompletion(int habitId, DateTime completionDate)
    {
        return new HabitCompletion
        {
            Id = Random.Shared.Next(10000, 99999),
            HabitId = habitId,
            CompletionDate = completionDate,
            IsCompleted = true,
            CreatedAt = completionDate
        };
    }

    private async Task SeedDatabase(Habit habit, List<HabitCompletion> completions, Streak? streak = null)
    {
        await _context.Habits.AddAsync(habit);
        await _context.HabitCompletions.AddRangeAsync(completions);
        
        if (streak != null)
        {
            await _context.Streaks.AddAsync(streak);
        }
        
        await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}