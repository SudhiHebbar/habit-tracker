using HabitTracker.Application.DTOs.Streak;
using HabitTracker.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace HabitTracker.Application.Services
{
    public class StreakMilestoneService : IStreakMilestoneService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IStreakRepository _streakRepository;
        private readonly ILogger<StreakMilestoneService> _logger;

        private static readonly List<int> MilestoneValues = new() { 7, 14, 21, 30, 50, 75, 100, 150, 200, 365, 500, 1000 };
        
        private static readonly Dictionary<int, string> MilestoneMessages = new()
        {
            { 7, "One week streak! You're building momentum!" },
            { 14, "Two weeks strong! Keep it up!" },
            { 21, "Three weeks! They say it takes 21 days to form a habit!" },
            { 30, "One month milestone! You're unstoppable!" },
            { 50, "50 days! Half way to a century!" },
            { 75, "75 days! Three quarters of the way to 100!" },
            { 100, "Century streak! 100 days of consistency!" },
            { 150, "150 days! You're a habit master!" },
            { 200, "200 days! Double century achieved!" },
            { 365, "One year! 365 days of dedication!" },
            { 500, "500 days! Half way to 1000!" },
            { 1000, "1000 days! You're a legend!" }
        };

        private static readonly Dictionary<int, string> CelebrationTypes = new()
        {
            { 7, "confetti" },
            { 14, "sparkle" },
            { 21, "pulse" },
            { 30, "confetti" },
            { 50, "glow" },
            { 75, "bounce" },
            { 100, "confetti" },
            { 150, "sparkle" },
            { 200, "confetti" },
            { 365, "confetti" },
            { 500, "confetti" },
            { 1000, "confetti" }
        };

        public StreakMilestoneService(
            IUnitOfWork unitOfWork,
            IStreakRepository streakRepository,
            ILogger<StreakMilestoneService> logger)
        {
            _unitOfWork = unitOfWork;
            _streakRepository = streakRepository;
            _logger = logger;
        }

        public async Task<MilestoneCheckResultDto> CheckMilestoneAchievementAsync(int habitId, int currentStreak, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Checking milestone achievement for habit {HabitId} with streak {Streak}", habitId, currentStreak);

                var result = new MilestoneCheckResultDto
                {
                    CurrentStreak = currentStreak,
                    NextMilestone = await GetNextMilestoneAsync(currentStreak),
                    HasNewMilestone = false,
                    Milestones = new List<MilestoneAchievementDto>()
                };

                if (!IsMilestone(currentStreak))
                {
                    return result;
                }

                var habit = await _unitOfWork.Habits.GetByIdAsync(habitId, cancellationToken);
                if (habit == null)
                {
                    return result;
                }

                var previousStreak = await GetPreviousStreakValueAsync(habitId, cancellationToken);
                var newMilestones = MilestoneValues.Where(m => m > previousStreak && m <= currentStreak).ToList();

                if (newMilestones.Any())
                {
                    result.HasNewMilestone = true;
                    foreach (var milestone in newMilestones)
                    {
                        result.Milestones.Add(new MilestoneAchievementDto
                        {
                            HabitId = habitId,
                            HabitName = habit.Name,
                            MilestoneValue = milestone,
                            AchievedAt = DateTime.UtcNow,
                            CelebrationType = await GetCelebrationTypeAsync(milestone),
                            Message = await GetMilestoneMessageAsync(milestone),
                            IsNew = true,
                            BadgeType = GetBadgeType(milestone)
                        });
                    }

                    _logger.LogInformation("New milestones achieved for habit {HabitId}: {Milestones}", 
                        habitId, string.Join(", ", newMilestones));
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking milestone achievement for habit {HabitId}", habitId);
                throw;
            }
        }

        public async Task<IEnumerable<MilestoneAchievementDto>> GetAchievedMilestonesAsync(int habitId, CancellationToken cancellationToken = default)
        {
            try
            {
                var streak = await _streakRepository.GetStreakWithHabitAsync(habitId, cancellationToken);
                if (streak == null || streak.CurrentStreak == 0)
                {
                    return new List<MilestoneAchievementDto>();
                }

                var achievements = new List<MilestoneAchievementDto>();
                var achievedMilestones = await _streakRepository.GetAchievedMilestonesAsync(habitId, MilestoneValues, cancellationToken);

                foreach (var milestone in achievedMilestones)
                {
                    achievements.Add(new MilestoneAchievementDto
                    {
                        HabitId = habitId,
                        HabitName = streak.Habit?.Name ?? string.Empty,
                        MilestoneValue = milestone,
                        AchievedAt = DateTime.UtcNow,
                        CelebrationType = await GetCelebrationTypeAsync(milestone),
                        Message = await GetMilestoneMessageAsync(milestone),
                        IsNew = false,
                        BadgeType = GetBadgeType(milestone)
                    });
                }

                return achievements;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting achieved milestones for habit {HabitId}", habitId);
                throw;
            }
        }

        public async Task<IEnumerable<MilestoneAchievementDto>> GetRecentMilestonesAsync(int trackerId, int days = 7, CancellationToken cancellationToken = default)
        {
            try
            {
                var recentDate = DateTime.UtcNow.AddDays(-days);
                var streaks = await _streakRepository.GetStreaksWithRecentActivityAsync(trackerId, days, cancellationToken);
                var milestones = new List<MilestoneAchievementDto>();

                foreach (var streak in streaks)
                {
                    if (streak.UpdatedAt >= recentDate)
                    {
                        var achievedMilestones = MilestoneValues.Where(m => m <= streak.CurrentStreak).ToList();
                        foreach (var milestone in achievedMilestones)
                        {
                            milestones.Add(new MilestoneAchievementDto
                            {
                                HabitId = streak.HabitId,
                                HabitName = streak.Habit?.Name ?? string.Empty,
                                MilestoneValue = milestone,
                                AchievedAt = streak.UpdatedAt,
                                CelebrationType = await GetCelebrationTypeAsync(milestone),
                                Message = await GetMilestoneMessageAsync(milestone),
                                IsNew = false,
                                BadgeType = GetBadgeType(milestone)
                            });
                        }
                    }
                }

                return milestones.OrderByDescending(m => m.AchievedAt);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent milestones for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public Task<int> GetNextMilestoneAsync(int currentStreak)
        {
            var nextMilestone = MilestoneValues.FirstOrDefault(m => m > currentStreak);
            return Task.FromResult(nextMilestone > 0 ? nextMilestone : 1000);
        }

        public Task<string> GetMilestoneMessageAsync(int milestoneValue)
        {
            return Task.FromResult(MilestoneMessages.GetValueOrDefault(milestoneValue, $"Amazing! {milestoneValue} day streak!"));
        }

        public Task<string> GetCelebrationTypeAsync(int milestoneValue)
        {
            return Task.FromResult(CelebrationTypes.GetValueOrDefault(milestoneValue, "confetti"));
        }

        public async Task<Dictionary<int, List<int>>> GetAllMilestonesByTrackerAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                var streaks = await _streakRepository.GetStreaksByTrackerIdAsync(trackerId, cancellationToken);
                var milestonesByHabit = new Dictionary<int, List<int>>();

                foreach (var streak in streaks)
                {
                    var achievedMilestones = MilestoneValues.Where(m => m <= streak.CurrentStreak).ToList();
                    milestonesByHabit[streak.HabitId] = achievedMilestones;
                }

                return milestonesByHabit;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all milestones for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public bool IsMilestone(int streakValue)
        {
            return MilestoneValues.Contains(streakValue);
        }

        public List<int> GetMilestoneValues()
        {
            return MilestoneValues;
        }

        private async Task<int> GetPreviousStreakValueAsync(int habitId, CancellationToken cancellationToken)
        {
            var completions = await _unitOfWork.HabitCompletions.GetCompletionsByHabitIdAsync(habitId, cancellationToken);
            var sortedCompletions = completions.OrderByDescending(c => c.CompletionDate).ToList();
            
            if (sortedCompletions.Count <= 1) return 0;

            return sortedCompletions.Count - 1;
        }

        private string GetBadgeType(int milestoneValue)
        {
            return milestoneValue switch
            {
                7 => "bronze",
                14 => "bronze",
                21 => "silver",
                30 => "silver",
                50 => "gold",
                75 => "gold",
                100 => "platinum",
                150 => "platinum",
                200 => "diamond",
                365 => "diamond",
                500 => "legendary",
                1000 => "legendary",
                _ => "bronze"
            };
        }
    }
}