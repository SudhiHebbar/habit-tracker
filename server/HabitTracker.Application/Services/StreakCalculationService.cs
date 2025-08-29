using AutoMapper;
using HabitTracker.Application.DTOs.Streak;
using HabitTracker.Application.Interfaces;
using HabitTracker.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace HabitTracker.Application.Services
{
    public class StreakCalculationService : IStreakCalculationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IStreakRepository _streakRepository;
        private readonly IStreakMilestoneService _milestoneService;
        private readonly IMapper _mapper;
        private readonly ILogger<StreakCalculationService> _logger;

        public StreakCalculationService(
            IUnitOfWork unitOfWork,
            IStreakRepository streakRepository,
            IStreakMilestoneService milestoneService,
            IMapper mapper,
            ILogger<StreakCalculationService> logger)
        {
            _unitOfWork = unitOfWork;
            _streakRepository = streakRepository;
            _milestoneService = milestoneService;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<Streak> CalculateStreakAsync(int habitId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Calculating streak for habit {HabitId}", habitId);

                var habit = await _unitOfWork.Habits.GetByIdAsync(habitId, cancellationToken);
                if (habit == null)
                {
                    throw new ArgumentException($"Habit with ID {habitId} not found");
                }

                var completions = await _unitOfWork.HabitCompletions.GetCompletionsByHabitIdAsync(habitId, cancellationToken);
                var orderedCompletions = completions.OrderByDescending(c => c.CompletionDate).ToList();

                if (!orderedCompletions.Any())
                {
                    return await _streakRepository.UpdateStreakAsync(habitId, 0, 0, null, 0, 0, cancellationToken);
                }

                var currentStreak = CalculateCurrentStreak(orderedCompletions, habit);
                var longestStreak = CalculateLongestStreak(orderedCompletions, habit);
                var lastCompletionDate = DateOnly.FromDateTime(orderedCompletions.First().CompletionDate);
                var totalCompletions = orderedCompletions.Count;
                var completionRate = CalculateCompletionRate(habit, totalCompletions);

                var streak = await _streakRepository.UpdateStreakAsync(
                    habitId,
                    currentStreak,
                    Math.Max(currentStreak, longestStreak),
                    lastCompletionDate.ToDateTime(TimeOnly.MinValue),
                    totalCompletions,
                    completionRate,
                    cancellationToken);

                _logger.LogInformation("Calculated streak for habit {HabitId}: Current={Current}, Longest={Longest}",
                    habitId, currentStreak, longestStreak);

                return streak;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating streak for habit {HabitId}", habitId);
                throw;
            }
        }

        public async Task<Streak> UpdateStreakOnCompletionAsync(int habitId, DateOnly completionDate, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Updating streak for habit {HabitId} after completion on {Date}", habitId, completionDate);

                var streak = await _streakRepository.GetOrCreateStreakAsync(habitId, cancellationToken);
                var habit = await _unitOfWork.Habits.GetByIdAsync(habitId, cancellationToken);
                
                if (habit == null)
                {
                    throw new ArgumentException($"Habit with ID {habitId} not found");
                }

                var lastCompletionDate = streak.LastCompletionDate?.Date;
                var today = DateTime.UtcNow.Date;
                var completionDateTime = completionDate.ToDateTime(TimeOnly.MinValue);

                int newCurrentStreak = streak.CurrentStreak;

                if (lastCompletionDate == null)
                {
                    newCurrentStreak = 1;
                }
                else if (IsStreakMaintained(lastCompletionDate.Value, completionDateTime, habit))
                {
                    if (completionDateTime > lastCompletionDate)
                    {
                        newCurrentStreak = streak.CurrentStreak + 1;
                    }
                }
                else
                {
                    newCurrentStreak = 1;
                }

                var newLongestStreak = Math.Max(newCurrentStreak, streak.LongestStreak);
                var newTotalCompletions = streak.TotalCompletions + 1;
                var newCompletionRate = CalculateCompletionRate(habit, newTotalCompletions);

                var updatedStreak = await _streakRepository.UpdateStreakAsync(
                    habitId,
                    newCurrentStreak,
                    newLongestStreak,
                    completionDateTime,
                    newTotalCompletions,
                    newCompletionRate,
                    cancellationToken);

                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Updated streak for habit {HabitId}: Current={Current}, Longest={Longest}",
                    habitId, newCurrentStreak, newLongestStreak);

                return updatedStreak;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating streak for habit {HabitId}", habitId);
                throw;
            }
        }

        public async Task<Streak> UpdateStreakOnDeletionAsync(int habitId, DateOnly deletionDate, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Updating streak for habit {HabitId} after deletion on {Date}", habitId, deletionDate);
                return await RecalculateStreakAsync(habitId, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating streak after deletion for habit {HabitId}", habitId);
                throw;
            }
        }

        public async Task<Streak> RecalculateStreakAsync(int habitId, CancellationToken cancellationToken = default)
        {
            return await CalculateStreakAsync(habitId, cancellationToken);
        }

        public async Task<IEnumerable<Streak>> RecalculateAllStreaksAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Recalculating all streaks for tracker {TrackerId}", trackerId);

                var habits = await _unitOfWork.Habits.GetHabitsByTrackerIdAsync(trackerId, cancellationToken);
                var streaks = new List<Streak>();

                foreach (var habit in habits)
                {
                    var streak = await CalculateStreakAsync(habit.Id, cancellationToken);
                    streaks.Add(streak);
                }

                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Recalculated {Count} streaks for tracker {TrackerId}", streaks.Count, trackerId);
                return streaks;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error recalculating streaks for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<bool> ValidateStreakConsistencyAsync(int habitId, CancellationToken cancellationToken = default)
        {
            try
            {
                var streak = await _streakRepository.GetStreakByHabitIdAsync(habitId, cancellationToken);
                if (streak == null) return true;

                var calculatedStreak = await CalculateStreakAsync(habitId, cancellationToken);

                return streak.CurrentStreak == calculatedStreak.CurrentStreak &&
                       streak.LongestStreak == calculatedStreak.LongestStreak &&
                       streak.TotalCompletions == calculatedStreak.TotalCompletions;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating streak consistency for habit {HabitId}", habitId);
                return false;
            }
        }

        public async Task<StreakResponseDto> GetStreakDetailsAsync(int habitId, CancellationToken cancellationToken = default)
        {
            try
            {
                var streak = await _streakRepository.GetStreakWithHabitAsync(habitId, cancellationToken);
                if (streak == null)
                {
                    streak = await _streakRepository.GetOrCreateStreakAsync(habitId, cancellationToken);
                }

                var response = _mapper.Map<StreakResponseDto>(streak);
                
                if (streak.Habit != null)
                {
                    response.HabitName = streak.Habit.Name;
                }

                response.IsAtRisk = IsStreakAtRisk(streak, streak.Habit);
                response.DaysSinceLastCompletion = CalculateDaysSinceLastCompletion(streak.LastCompletionDate);
                response.AchievedMilestones = GetAchievedMilestoneValues(streak.CurrentStreak);
                response.NextMilestone = await _milestoneService.GetNextMilestoneAsync(streak.CurrentStreak);

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting streak details for habit {HabitId}", habitId);
                throw;
            }
        }

        public async Task<IEnumerable<StreakResponseDto>> GetStreaksByTrackerAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                var streaks = await _streakRepository.GetStreaksWithHabitsAsync(trackerId, cancellationToken);
                var responses = new List<StreakResponseDto>();

                foreach (var streak in streaks)
                {
                    var response = _mapper.Map<StreakResponseDto>(streak);
                    if (streak.Habit != null)
                    {
                        response.HabitName = streak.Habit.Name;
                        response.IsAtRisk = IsStreakAtRisk(streak, streak.Habit);
                    }
                    response.DaysSinceLastCompletion = CalculateDaysSinceLastCompletion(streak.LastCompletionDate);
                    response.AchievedMilestones = GetAchievedMilestoneValues(streak.CurrentStreak);
                    response.NextMilestone = await _milestoneService.GetNextMilestoneAsync(streak.CurrentStreak);
                    responses.Add(response);
                }

                return responses;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting streaks for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<IEnumerable<StreakResponseDto>> GetStreaksAtRiskAsync(int trackerId, int warningDays = 1, CancellationToken cancellationToken = default)
        {
            try
            {
                var streaks = await _streakRepository.GetStreaksAtRiskAsync(trackerId, warningDays, cancellationToken);
                var responses = new List<StreakResponseDto>();

                foreach (var streak in streaks)
                {
                    var response = _mapper.Map<StreakResponseDto>(streak);
                    response.IsAtRisk = true;
                    response.DaysSinceLastCompletion = CalculateDaysSinceLastCompletion(streak.LastCompletionDate);
                    responses.Add(response);
                }

                return responses;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting streaks at risk for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<Dictionary<int, bool>> CheckStreakRisksAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                var streaks = await _streakRepository.GetStreaksWithHabitsAsync(trackerId, cancellationToken);
                var risks = new Dictionary<int, bool>();

                foreach (var streak in streaks)
                {
                    risks[streak.HabitId] = IsStreakAtRisk(streak, streak.Habit);
                }

                return risks;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking streak risks for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        private int CalculateCurrentStreak(List<HabitCompletion> orderedCompletions, Habit habit)
        {
            if (!orderedCompletions.Any()) return 0;

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var lastCompletion = DateOnly.FromDateTime(orderedCompletions.First().CompletionDate);

            if (!IsStreakMaintained(lastCompletion.ToDateTime(TimeOnly.MinValue), today.ToDateTime(TimeOnly.MinValue), habit))
            {
                return 0;
            }

            int currentStreak = 1;
            var previousDate = lastCompletion;

            for (int i = 1; i < orderedCompletions.Count; i++)
            {
                var currentDate = DateOnly.FromDateTime(orderedCompletions[i].CompletionDate);
                
                if (!IsStreakMaintained(currentDate.ToDateTime(TimeOnly.MinValue), previousDate.ToDateTime(TimeOnly.MinValue), habit))
                {
                    break;
                }

                currentStreak++;
                previousDate = currentDate;
            }

            return currentStreak;
        }

        private int CalculateLongestStreak(List<HabitCompletion> orderedCompletions, Habit habit)
        {
            if (!orderedCompletions.Any()) return 0;

            int longestStreak = 1;
            int currentStreak = 1;
            
            for (int i = 1; i < orderedCompletions.Count; i++)
            {
                var previousDate = DateOnly.FromDateTime(orderedCompletions[i - 1].CompletionDate);
                var currentDate = DateOnly.FromDateTime(orderedCompletions[i].CompletionDate);

                if (IsStreakMaintained(currentDate.ToDateTime(TimeOnly.MinValue), previousDate.ToDateTime(TimeOnly.MinValue), habit))
                {
                    currentStreak++;
                    longestStreak = Math.Max(longestStreak, currentStreak);
                }
                else
                {
                    currentStreak = 1;
                }
            }

            return longestStreak;
        }

        private bool IsStreakMaintained(DateTime previousDate, DateTime currentDate, Habit habit)
        {
            var daysDifference = (currentDate.Date - previousDate.Date).Days;

            return habit.TargetFrequency switch
            {
                "Daily" => daysDifference <= 1,
                "Weekly" => daysDifference <= 7,
                "Custom" => daysDifference <= habit.TargetCount,
                _ => daysDifference <= 1
            };
        }

        private bool IsStreakAtRisk(Streak streak, Habit? habit)
        {
            if (habit == null || streak.LastCompletionDate == null) return false;

            var daysSinceLastCompletion = (DateTime.UtcNow.Date - streak.LastCompletionDate.Value.Date).Days;

            return habit.TargetFrequency switch
            {
                "Daily" => daysSinceLastCompletion >= 1,
                "Weekly" => daysSinceLastCompletion >= 7,
                "Custom" => daysSinceLastCompletion >= habit.TargetCount,
                _ => daysSinceLastCompletion >= 1
            };
        }

        private double CalculateCompletionRate(Habit habit, int totalCompletions)
        {
            var daysSinceCreation = (DateTime.UtcNow.Date - habit.CreatedAt.Date).Days + 1;
            
            double expectedCompletions = habit.TargetFrequency switch
            {
                "Daily" => daysSinceCreation,
                "Weekly" => daysSinceCreation / 7.0,
                "Custom" => daysSinceCreation / (double)habit.TargetCount,
                _ => daysSinceCreation
            };

            return expectedCompletions > 0 ? (totalCompletions / expectedCompletions) * 100 : 0;
        }

        private int? CalculateDaysSinceLastCompletion(DateTime? lastCompletionDate)
        {
            if (lastCompletionDate == null) return null;
            return (DateTime.UtcNow.Date - lastCompletionDate.Value.Date).Days;
        }

        private List<int> GetAchievedMilestoneValues(int currentStreak)
        {
            var milestones = _milestoneService.GetMilestoneValues();
            return milestones.Where(m => m <= currentStreak).ToList();
        }
    }
}