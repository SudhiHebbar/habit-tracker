using HabitTracker.Domain.Entities;
using HabitTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HabitTracker.Infrastructure.SeedData
{
    public static class DatabaseSeeder
    {
        public static async Task SeedAsync(HabitTrackerDbContext context, ILogger logger)
        {
            try
            {
                // Check if data already exists
                if (await context.Trackers.AnyAsync())
                {
                    logger.LogInformation("Database already contains seed data. Skipping seeding.");
                    return;
                }

                logger.LogInformation("Starting database seeding...");

                // Create sample trackers
                var trackers = new List<Tracker>
                {
                    new Tracker
                    {
                        Name = "Health & Fitness",
                        Description = "Habits related to physical health and fitness",
                        UserId = "dev-user-1",
                        DisplayOrder = 1
                    },
                    new Tracker
                    {
                        Name = "Personal Growth",
                        Description = "Habits for self-improvement and learning",
                        UserId = "dev-user-1",
                        DisplayOrder = 2
                    },
                    new Tracker
                    {
                        Name = "Daily Routines",
                        Description = "Simple daily habits for better lifestyle",
                        UserId = "dev-user-1",
                        DisplayOrder = 3
                    }
                };

                await context.Trackers.AddRangeAsync(trackers);
                await context.SaveChangesAsync();
                logger.LogInformation("Created {Count} trackers", trackers.Count);

                // Create sample habits
                var habits = new List<Habit>
                {
                    // Health & Fitness tracker habits
                    new Habit
                    {
                        TrackerId = trackers[0].Id,
                        Name = "Morning Exercise",
                        Description = "30 minutes of physical exercise every morning",
                        TargetFrequency = "Daily",
                        TargetCount = 1,
                        Color = "#10B981", // Green
                        Icon = "fitness",
                        DisplayOrder = 1
                    },
                    new Habit
                    {
                        TrackerId = trackers[0].Id,
                        Name = "Drink Water",
                        Description = "Drink at least 8 glasses of water",
                        TargetFrequency = "Daily",
                        TargetCount = 8,
                        Color = "#06B6D4", // Cyan
                        Icon = "water",
                        DisplayOrder = 2
                    },
                    new Habit
                    {
                        TrackerId = trackers[0].Id,
                        Name = "Take Vitamins",
                        Description = "Daily vitamin supplements",
                        TargetFrequency = "Daily",
                        TargetCount = 1,
                        Color = "#F59E0B", // Amber
                        Icon = "pill",
                        DisplayOrder = 3
                    },

                    // Personal Growth tracker habits
                    new Habit
                    {
                        TrackerId = trackers[1].Id,
                        Name = "Read Books",
                        Description = "Read for at least 30 minutes",
                        TargetFrequency = "Daily",
                        TargetCount = 1,
                        Color = "#8B5CF6", // Purple
                        Icon = "book",
                        DisplayOrder = 1
                    },
                    new Habit
                    {
                        TrackerId = trackers[1].Id,
                        Name = "Practice Coding",
                        Description = "Work on personal coding projects",
                        TargetFrequency = "Daily",
                        TargetCount = 1,
                        Color = "#3B82F6", // Blue
                        Icon = "code",
                        DisplayOrder = 2
                    },
                    new Habit
                    {
                        TrackerId = trackers[1].Id,
                        Name = "Meditation",
                        Description = "10 minutes of mindfulness meditation",
                        TargetFrequency = "Daily",
                        TargetCount = 1,
                        Color = "#EC4899", // Pink
                        Icon = "meditation",
                        DisplayOrder = 3
                    },

                    // Daily Routines tracker habits
                    new Habit
                    {
                        TrackerId = trackers[2].Id,
                        Name = "Make Bed",
                        Description = "Make bed immediately after waking up",
                        TargetFrequency = "Daily",
                        TargetCount = 1,
                        Color = "#84CC16", // Lime
                        Icon = "bed",
                        DisplayOrder = 1
                    },
                    new Habit
                    {
                        TrackerId = trackers[2].Id,
                        Name = "Plan Tomorrow",
                        Description = "Spend 10 minutes planning the next day",
                        TargetFrequency = "Daily",
                        TargetCount = 1,
                        Color = "#F97316", // Orange
                        Icon = "calendar",
                        DisplayOrder = 2
                    }
                };

                await context.Habits.AddRangeAsync(habits);
                await context.SaveChangesAsync();
                logger.LogInformation("Created {Count} habits", habits.Count);

                // Create sample completions for the past 30 days
                var completions = new List<HabitCompletion>();
                var random = new Random(42); // Fixed seed for consistent data
                var startDate = DateTime.Today.AddDays(-30);

                foreach (var habit in habits)
                {
                    // Create streak record
                    var streak = new Streak
                    {
                        HabitId = habit.Id,
                        CurrentStreak = 0,
                        LongestStreak = 0,
                        TotalCompletions = 0,
                        CompletionRate = 0,
                        UpdatedAt = DateTime.UtcNow
                    };

                    var currentStreak = 0;
                    var longestStreak = 0;
                    var totalCompletions = 0;
                    var consecutiveDays = 0;
                    DateTime? lastCompletionDate = null;

                    // Generate completions for the past 30 days with realistic patterns
                    for (int i = 0; i < 30; i++)
                    {
                        var date = startDate.AddDays(i);
                        
                        // Different completion probabilities for different habits
                        double completionProbability = habit.Name switch
                        {
                            "Make Bed" => 0.95, // Very consistent
                            "Drink Water" => 0.85, // Pretty consistent
                            "Morning Exercise" => 0.70, // Moderately consistent
                            "Take Vitamins" => 0.80, // Consistent
                            "Read Books" => 0.60, // Less consistent
                            "Practice Coding" => 0.50, // Challenging habit
                            "Meditation" => 0.65, // Moderately consistent
                            "Plan Tomorrow" => 0.75, // Fairly consistent
                            _ => 0.60
                        };

                        if (random.NextDouble() < completionProbability)
                        {
                            completions.Add(new HabitCompletion
                            {
                                HabitId = habit.Id,
                                CompletionDate = date,
                                IsCompleted = true,
                                CreatedAt = date.AddHours(random.Next(6, 22)),
                                UpdatedAt = date.AddHours(random.Next(6, 22))
                            });

                            totalCompletions++;
                            consecutiveDays++;
                            lastCompletionDate = date;
                            
                            // Update streaks
                            if (consecutiveDays > longestStreak)
                                longestStreak = consecutiveDays;
                        }
                        else
                        {
                            if (date == DateTime.Today.AddDays(-1))
                                currentStreak = consecutiveDays;
                            consecutiveDays = 0;
                        }
                    }

                    // If habit was completed yesterday, current streak continues
                    if (lastCompletionDate == DateTime.Today.AddDays(-1))
                        currentStreak = consecutiveDays;
                    else
                        currentStreak = 0;

                    // Update streak data
                    streak.CurrentStreak = currentStreak;
                    streak.LongestStreak = longestStreak;
                    streak.LastCompletionDate = lastCompletionDate;
                    streak.TotalCompletions = totalCompletions;
                    streak.CompletionRate = Math.Round((decimal)totalCompletions / 30 * 100, 2);

                    await context.Streaks.AddAsync(streak);
                }

                await context.HabitCompletions.AddRangeAsync(completions);
                await context.SaveChangesAsync();
                logger.LogInformation("Created {Count} habit completions", completions.Count);
                logger.LogInformation("Created streak records for all habits");

                logger.LogInformation("Database seeding completed successfully!");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while seeding the database");
                throw;
            }
        }

        public static async Task SeedAsync(HabitTrackerDbContext context)
        {
            var loggerFactory = LoggerFactory.Create(builder => { });
            var logger = loggerFactory.CreateLogger(typeof(DatabaseSeeder));
            await SeedAsync(context, logger);
        }
    }
}