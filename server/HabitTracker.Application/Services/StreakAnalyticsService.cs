using HabitTracker.Application.DTOs.Streak;
using HabitTracker.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace HabitTracker.Application.Services
{
    public class StreakAnalyticsService : IStreakAnalyticsService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IStreakRepository _streakRepository;
        private readonly IStreakMilestoneService _milestoneService;
        private readonly ILogger<StreakAnalyticsService> _logger;

        public StreakAnalyticsService(
            IUnitOfWork unitOfWork,
            IStreakRepository streakRepository,
            IStreakMilestoneService milestoneService,
            ILogger<StreakAnalyticsService> logger)
        {
            _unitOfWork = unitOfWork;
            _streakRepository = streakRepository;
            _milestoneService = milestoneService;
            _logger = logger;
        }

        public async Task<StreakAnalyticsDto> GetStreakAnalyticsAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting streak analytics for tracker {TrackerId}", trackerId);

                var streaks = await _streakRepository.GetStreaksWithHabitsAsync(trackerId, cancellationToken);
                var streaksList = streaks.ToList();

                if (!streaksList.Any())
                {
                    return new StreakAnalyticsDto
                    {
                        TrackerId = trackerId,
                        TotalHabits = 0,
                        ActiveStreaks = 0,
                        AverageCurrentStreak = 0,
                        AverageLongestStreak = 0,
                        AverageCompletionRate = 0,
                        TotalCompletions = 0,
                        Trends = new List<StreakTrendDto>(),
                        TopStreaks = new List<StreakLeaderboardEntryDto>(),
                        StreaksAtRisk = new List<StreakResponseDto>(),
                        MilestoneAchievements = new Dictionary<string, int>()
                    };
                }

                var analytics = new StreakAnalyticsDto
                {
                    TrackerId = trackerId,
                    TotalHabits = streaksList.Count,
                    ActiveStreaks = streaksList.Count(s => s.CurrentStreak > 0),
                    AverageCurrentStreak = streaksList.Average(s => s.CurrentStreak),
                    AverageLongestStreak = streaksList.Average(s => s.LongestStreak),
                    AverageCompletionRate = (double)streaksList.Average(s => s.CompletionRate),
                    TotalCompletions = streaksList.Sum(s => s.TotalCompletions),
                    Trends = (await GetStreakTrendsAsync(trackerId, 30, cancellationToken)).ToList(),
                    TopStreaks = (await GetStreakLeaderboardAsync(trackerId, 5, true, cancellationToken)).ToList(),
                    StreaksAtRisk = (await GetStreaksAtRiskAsync(trackerId, cancellationToken)).ToList(),
                    MilestoneAchievements = await GetMilestoneStatisticsAsync(trackerId, cancellationToken)
                };

                _logger.LogInformation("Generated streak analytics for tracker {TrackerId}: {ActiveStreaks}/{TotalHabits} active streaks",
                    trackerId, analytics.ActiveStreaks, analytics.TotalHabits);

                return analytics;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting streak analytics for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<IEnumerable<StreakTrendDto>> GetStreakTrendsAsync(int trackerId, int days = 30, CancellationToken cancellationToken = default)
        {
            try
            {
                var trends = new List<StreakTrendDto>();
                var startDate = DateTime.UtcNow.AddDays(-days);

                for (int i = 0; i < days; i++)
                {
                    var date = startDate.AddDays(i);
                    var dayCompletions = await GetCompletionsForDateAsync(trackerId, DateOnly.FromDateTime(date), cancellationToken);

                    trends.Add(new StreakTrendDto
                    {
                        Date = date,
                        CompletionsCount = dayCompletions.Count(),
                        ActiveStreakCount = await CalculateActiveStreaksForDateAsync(trackerId, DateOnly.FromDateTime(date), cancellationToken),
                        AverageStreak = await CalculateAverageStreakForDateAsync(trackerId, DateOnly.FromDateTime(date), cancellationToken)
                    });
                }

                return trends.OrderBy(t => t.Date);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting streak trends for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<IEnumerable<StreakLeaderboardEntryDto>> GetStreakLeaderboardAsync(int trackerId, int count = 10, bool byCurrentStreak = true, CancellationToken cancellationToken = default)
        {
            try
            {
                var leaderboard = await _streakRepository.GetStreakLeaderboardAsync(trackerId, count, byCurrentStreak, cancellationToken);
                var entries = new List<StreakLeaderboardEntryDto>();

                foreach (var (habitId, streakValue, rank) in leaderboard)
                {
                    var habit = await _unitOfWork.Habits.GetByIdAsync(habitId, cancellationToken);
                    if (habit != null)
                    {
                        var streak = await _streakRepository.GetStreakByHabitIdAsync(habitId, cancellationToken);
                        entries.Add(new StreakLeaderboardEntryDto
                        {
                            HabitId = habitId,
                            HabitName = habit.Name,
                            CurrentStreak = streak?.CurrentStreak ?? 0,
                            LongestStreak = streak?.LongestStreak ?? 0,
                            Rank = rank,
                            Color = habit.Color,
                            Icon = habit.Icon
                        });
                    }
                }

                return entries;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting streak leaderboard for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<Dictionary<string, double>> GetStreakStatisticsAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                var stats = new Dictionary<string, double>
                {
                    ["averageCurrentStreak"] = await _streakRepository.GetAverageCurrentStreakAsync(trackerId, cancellationToken),
                    ["averageLongestStreak"] = await _streakRepository.GetAverageLongestStreakAsync(trackerId, cancellationToken),
                    ["averageCompletionRate"] = await _streakRepository.GetAverageCompletionRateAsync(trackerId, cancellationToken),
                    ["totalActiveStreaks"] = await _streakRepository.GetTotalActiveStreaksAsync(trackerId, 1, cancellationToken),
                    ["overallProgress"] = await GetOverallProgressAsync(trackerId, cancellationToken)
                };

                return stats;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting streak statistics for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<Dictionary<int, int>> GetStreakDistributionAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                var streaks = await _streakRepository.GetStreaksByTrackerIdAsync(trackerId, cancellationToken);
                var distribution = new Dictionary<int, int>();

                var ranges = new[] { 0, 7, 14, 30, 50, 100, 365, 1000 };

                for (int i = 0; i < ranges.Length; i++)
                {
                    var min = ranges[i];
                    var max = i < ranges.Length - 1 ? ranges[i + 1] - 1 : int.MaxValue;
                    
                    var count = streaks.Count(s => s.CurrentStreak >= min && s.CurrentStreak <= max);
                    distribution[min] = count;
                }

                return distribution;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting streak distribution for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<IEnumerable<StreakResponseDto>> GetTopPerformersAsync(int trackerId, int count = 5, CancellationToken cancellationToken = default)
        {
            try
            {
                var topStreaks = await _streakRepository.GetTopStreaksAsync(trackerId, count, true, cancellationToken);
                var performers = new List<StreakResponseDto>();

                foreach (var streak in topStreaks)
                {
                    var habit = await _unitOfWork.Habits.GetByIdAsync(streak.HabitId, cancellationToken);
                    if (habit != null)
                    {
                        performers.Add(new StreakResponseDto
                        {
                            Id = streak.Id,
                            HabitId = streak.HabitId,
                            HabitName = habit.Name,
                            CurrentStreak = streak.CurrentStreak,
                            LongestStreak = streak.LongestStreak,
                            LastCompletionDate = streak.LastCompletionDate,
                            TotalCompletions = streak.TotalCompletions,
                            CompletionRate = streak.CompletionRate,
                            UpdatedAt = streak.UpdatedAt,
                            AchievedMilestones = _milestoneService.GetMilestoneValues().Where(m => m <= streak.CurrentStreak).ToList(),
                            NextMilestone = await _milestoneService.GetNextMilestoneAsync(streak.CurrentStreak)
                        });
                    }
                }

                return performers;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting top performers for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<double> GetOverallProgressAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                var streaks = await _streakRepository.GetStreaksByTrackerIdAsync(trackerId, cancellationToken);
                var streaksList = streaks.ToList();

                if (!streaksList.Any()) return 0;

                var averageCompletionRate = (double)streaksList.Average(s => s.CompletionRate);
                var activeStreakPercentage = (double)streaksList.Count(s => s.CurrentStreak > 0) / streaksList.Count * 100;

                return (averageCompletionRate + activeStreakPercentage) / 2;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating overall progress for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<Dictionary<string, int>> GetMilestoneStatisticsAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                var milestones = await _milestoneService.GetAllMilestonesByTrackerAsync(trackerId, cancellationToken);
                var stats = new Dictionary<string, int>();

                var milestoneValues = _milestoneService.GetMilestoneValues();
                foreach (var milestone in milestoneValues)
                {
                    var count = milestones.Values.Count(habitMilestones => habitMilestones.Contains(milestone));
                    stats[milestone.ToString()] = count;
                }

                return stats;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting milestone statistics for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        private async Task<IEnumerable<object>> GetCompletionsForDateAsync(int trackerId, DateOnly date, CancellationToken cancellationToken)
        {
            var habits = await _unitOfWork.Habits.GetHabitsByTrackerIdAsync(trackerId, cancellationToken);
            var completions = new List<object>();

            foreach (var habit in habits)
            {
                var isCompleted = await _unitOfWork.HabitCompletions.IsHabitCompletedOnDateAsync(habit.Id, date, cancellationToken);
                if (isCompleted)
                {
                    completions.Add(new { HabitId = habit.Id, Date = date });
                }
            }

            return completions;
        }

        private async Task<int> CalculateActiveStreaksForDateAsync(int trackerId, DateOnly date, CancellationToken cancellationToken)
        {
            var habits = await _unitOfWork.Habits.GetHabitsByTrackerIdAsync(trackerId, cancellationToken);
            int activeStreaks = 0;

            foreach (var habit in habits)
            {
                var completions = await _unitOfWork.HabitCompletions.GetCompletionsByHabitAndDateRangeAsync(
                    habit.Id, date.AddDays(-30).ToDateTime(TimeOnly.MinValue), date.ToDateTime(TimeOnly.MaxValue), cancellationToken);

                if (completions.Any(c => DateOnly.FromDateTime(c.CompletionDate) <= date))
                {
                    activeStreaks++;
                }
            }

            return activeStreaks;
        }

        private async Task<double> CalculateAverageStreakForDateAsync(int trackerId, DateOnly date, CancellationToken cancellationToken)
        {
            var habits = await _unitOfWork.Habits.GetHabitsByTrackerIdAsync(trackerId, cancellationToken);
            if (!habits.Any()) return 0;

            double totalStreak = 0;
            int habitCount = 0;

            foreach (var habit in habits)
            {
                var streak = await _streakRepository.GetStreakByHabitIdAsync(habit.Id, cancellationToken);
                if (streak != null)
                {
                    totalStreak += streak.CurrentStreak;
                    habitCount++;
                }
            }

            return habitCount > 0 ? totalStreak / habitCount : 0;
        }

        private async Task<IEnumerable<StreakResponseDto>> GetStreaksAtRiskAsync(int trackerId, CancellationToken cancellationToken)
        {
            var streaksAtRisk = await _streakRepository.GetStreaksAtRiskAsync(trackerId, 1, cancellationToken);
            var results = new List<StreakResponseDto>();

            foreach (var streak in streaksAtRisk)
            {
                var habit = await _unitOfWork.Habits.GetByIdAsync(streak.HabitId, cancellationToken);
                if (habit != null)
                {
                    results.Add(new StreakResponseDto
                    {
                        Id = streak.Id,
                        HabitId = streak.HabitId,
                        HabitName = habit.Name,
                        CurrentStreak = streak.CurrentStreak,
                        LongestStreak = streak.LongestStreak,
                        LastCompletionDate = streak.LastCompletionDate,
                        TotalCompletions = streak.TotalCompletions,
                        CompletionRate = streak.CompletionRate,
                        UpdatedAt = streak.UpdatedAt,
                        IsAtRisk = true,
                        DaysSinceLastCompletion = streak.LastCompletionDate.HasValue ? 
                            (DateTime.UtcNow.Date - streak.LastCompletionDate.Value.Date).Days : null
                    });
                }
            }

            return results;
        }
    }
}