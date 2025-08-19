using HabitTracker.Domain.Entities;
using HabitTracker.Infrastructure.Data;
using HabitTracker.Infrastructure.SeedData;
using HabitTracker.Tests.TestHelpers;
using HabitTracker.Api;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace HabitTracker.Tests.Integration
{
    public class DatabaseSchemaTests : BaseIntegrationTest
    {
        public DatabaseSchemaTests(HabitTrackerWebApplicationFactory<Program> factory) 
            : base(factory)
        {
        }

        [Fact]
        public async Task Database_Schema_ShouldBeCreatedCorrectly()
        {
            // Arrange & Act
            using var context = await GetDbContextAsync();

            // Assert
            Assert.True(await context.Database.CanConnectAsync());
            
            // Verify all tables exist by checking if we can query them
            var trackersCount = await context.Trackers.CountAsync();
            var habitsCount = await context.Habits.CountAsync();
            var completionsCount = await context.HabitCompletions.CountAsync();
            var streaksCount = await context.Streaks.CountAsync();

            // Tables should exist and be queryable (even if empty)
            Assert.True(trackersCount >= 0);
            Assert.True(habitsCount >= 0);
            Assert.True(completionsCount >= 0);
            Assert.True(streaksCount >= 0);
        }

        [Fact]
        public async Task Tracker_CRUD_Operations_ShouldWork()
        {
            // Arrange
            using var context = await GetDbContextAsync();

            var tracker = new Tracker
            {
                Name = "Test Tracker",
                Description = "A test tracker for validation",
                UserId = "test-user"
            };

            // Act - Create
            context.Trackers.Add(tracker);
            await context.SaveChangesAsync();
            Assert.True(tracker.Id > 0);

            // Act - Read
            var retrievedTracker = await context.Trackers.FindAsync(tracker.Id);
            Assert.NotNull(retrievedTracker);
            Assert.Equal("Test Tracker", retrievedTracker.Name);

            // Act - Update
            retrievedTracker.Name = "Updated Test Tracker";
            await context.SaveChangesAsync();

            var updatedTracker = await context.Trackers.FindAsync(tracker.Id);
            Assert.Equal("Updated Test Tracker", updatedTracker.Name);

            // Act - Delete
            context.Trackers.Remove(updatedTracker);
            await context.SaveChangesAsync();

            var deletedTracker = await context.Trackers.FindAsync(tracker.Id);
            Assert.Null(deletedTracker);
        }

        [Fact]
        public async Task Habit_With_Tracker_Relationship_ShouldWork()
        {
            // Arrange
            using var context = await GetDbContextAsync();

            var tracker = new Tracker
            {
                Name = "Relationship Test Tracker",
                UserId = "test-user"
            };
            context.Trackers.Add(tracker);
            await context.SaveChangesAsync();

            var habit = new Habit
            {
                TrackerId = tracker.Id,
                Name = "Test Habit",
                Description = "A test habit",
                Color = "#FF0000"
            };

            // Act
            context.Habits.Add(habit);
            await context.SaveChangesAsync();

            // Assert
            var retrievedHabit = await context.Habits
                .Include(h => h.Tracker)
                .FirstOrDefaultAsync(h => h.Id == habit.Id);

            Assert.NotNull(retrievedHabit);
            Assert.NotNull(retrievedHabit.Tracker);
            Assert.Equal("Relationship Test Tracker", retrievedHabit.Tracker.Name);

            // Cleanup
            context.Habits.Remove(retrievedHabit);
            context.Trackers.Remove(tracker);
            await context.SaveChangesAsync();
        }

        [Fact]
        public async Task HabitCompletion_UniqueConstraint_ShouldWork()
        {
            // Arrange
            using var context = await GetDbContextAsync();

            var tracker = new Tracker { Name = "Constraint Test Tracker", UserId = "test-user" };
            context.Trackers.Add(tracker);
            await context.SaveChangesAsync();

            var habit = new Habit
            {
                TrackerId = tracker.Id,
                Name = "Constraint Test Habit",
                Color = "#00FF00"
            };
            context.Habits.Add(habit);
            await context.SaveChangesAsync();

            var completion1 = new HabitCompletion
            {
                HabitId = habit.Id,
                CompletionDate = DateTime.Today
            };

            // Act - First completion should work
            context.HabitCompletions.Add(completion1);
            await context.SaveChangesAsync();

            // Act - Second completion for same habit and date should fail
            var completion2 = new HabitCompletion
            {
                HabitId = habit.Id,
                CompletionDate = DateTime.Today
            };
            context.HabitCompletions.Add(completion2);

            // Assert
            await Assert.ThrowsAsync<DbUpdateException>(async () => await context.SaveChangesAsync());

            // Cleanup
            context.HabitCompletions.Remove(completion1);
            context.Habits.Remove(habit);
            context.Trackers.Remove(tracker);
            await context.SaveChangesAsync();
        }

        [Fact]
        public async Task Cascade_Delete_ShouldWork()
        {
            // Arrange
            using var context = await GetDbContextAsync();

            var tracker = new Tracker { Name = "Cascade Test Tracker", UserId = "test-user" };
            context.Trackers.Add(tracker);
            await context.SaveChangesAsync();

            var habit = new Habit
            {
                TrackerId = tracker.Id,
                Name = "Cascade Test Habit",
                Color = "#0000FF"
            };
            context.Habits.Add(habit);
            await context.SaveChangesAsync();

            var completion = new HabitCompletion
            {
                HabitId = habit.Id,
                CompletionDate = DateTime.Today
            };
            context.HabitCompletions.Add(completion);

            var streak = new Streak
            {
                HabitId = habit.Id,
                CurrentStreak = 5,
                LongestStreak = 10
            };
            context.Streaks.Add(streak);
            await context.SaveChangesAsync();

            var habitId = habit.Id;
            var completionId = completion.Id;
            var streakId = streak.Id;

            // Act - Delete tracker should cascade delete habit, completion, and streak
            context.Trackers.Remove(tracker);
            await context.SaveChangesAsync();

            // Assert
            Assert.Null(await context.Habits.FindAsync(habitId));
            Assert.Null(await context.HabitCompletions.FindAsync(completionId));
            Assert.Null(await context.Streaks.FindAsync(streakId));
        }

        [Fact]
        public async Task Seed_Data_ShouldWork()
        {
            // Arrange
            using var context = await GetDbContextAsync();

            // Clear any existing data
            context.HabitCompletions.RemoveRange(context.HabitCompletions);
            context.Streaks.RemoveRange(context.Streaks);
            context.Habits.RemoveRange(context.Habits);
            context.Trackers.RemoveRange(context.Trackers);
            await context.SaveChangesAsync();

            // Act
            await DatabaseSeeder.SeedAsync(context);

            // Assert
            var trackers = await context.Trackers.ToListAsync();
            var habits = await context.Habits.ToListAsync();
            var completions = await context.HabitCompletions.ToListAsync();
            var streaks = await context.Streaks.ToListAsync();

            Assert.True(trackers.Count > 0);
            Assert.True(habits.Count > 0);
            Assert.True(completions.Count > 0);
            Assert.True(streaks.Count > 0);

            // Verify data relationships
            foreach (var habit in habits)
            {
                Assert.True(trackers.Any(t => t.Id == habit.TrackerId));
            }

            foreach (var completion in completions)
            {
                Assert.True(habits.Any(h => h.Id == completion.HabitId));
            }

            foreach (var streak in streaks)
            {
                Assert.True(habits.Any(h => h.Id == streak.HabitId));
            }
        }

        [Fact]
        public async Task Audit_Fields_ShouldUpdate_Automatically()
        {
            // Arrange
            using var context = await GetDbContextAsync();

            var tracker = new Tracker
            {
                Name = "Audit Test Tracker",
                UserId = "test-user"
            };

            // Act - Create
            context.Trackers.Add(tracker);
            await context.SaveChangesAsync();

            var originalUpdatedAt = tracker.UpdatedAt;
            
            // Wait a small amount to ensure time difference
            await Task.Delay(10);
            
            // Act - Update
            tracker.Description = "Updated description";
            await context.SaveChangesAsync();

            // Assert
            Assert.True(tracker.UpdatedAt > originalUpdatedAt);

            // Cleanup
            context.Trackers.Remove(tracker);
            await context.SaveChangesAsync();
        }
    }
}