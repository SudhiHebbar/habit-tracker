using AutoMapper;
using HabitTracker.Application.DTOs.Habit;
using HabitTracker.Application.Interfaces;
using HabitTracker.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace HabitTracker.Application.Services
{
    public class HabitDeletionService : IHabitDeletionService
    {
        private readonly IHabitRepository _habitRepository;
        private readonly ITrackerRepository _trackerRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<HabitDeletionService> _logger;
        private readonly TimeSpan _undoGracePeriod = TimeSpan.FromMinutes(5);

        public HabitDeletionService(
            IHabitRepository habitRepository,
            ITrackerRepository trackerRepository,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ILogger<HabitDeletionService> logger)
        {
            _habitRepository = habitRepository;
            _trackerRepository = trackerRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<DeletionImpactDto> CalculateDeletionImpactAsync(int habitId, string? userId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Calculating deletion impact for habit {HabitId} by user {UserId}", habitId, userId);

            if (!await _habitRepository.CanUserAccessHabitAsync(userId, habitId, cancellationToken))
            {
                throw new UnauthorizedAccessException($"User cannot access habit {habitId}");
            }

            var habit = await _habitRepository.GetHabitWithAllRelationsAsync(habitId, cancellationToken);
            if (habit == null)
            {
                throw new InvalidOperationException($"Habit {habitId} not found");
            }

            var impact = new DeletionImpactDto
            {
                HabitId = habit.Id,
                HabitName = habit.Name,
                Color = habit.Color,
                Icon = habit.Icon,
                HabitCreatedAt = habit.CreatedAt,
                TargetFrequency = habit.TargetFrequency,
                TargetCount = habit.TargetCount
            };

            // Calculate completion statistics
            var completions = habit.Completions.Where(c => c.IsCompleted).ToList();
            impact.TotalCompletions = completions.Count;
            impact.CompletionsLast30Days = completions.Count(c => c.CompletionDate >= DateTime.UtcNow.AddDays(-30));
            impact.CompletionsLast7Days = completions.Count(c => c.CompletionDate >= DateTime.UtcNow.AddDays(-7));
            impact.LastCompletionDate = completions.Any() ? completions.Max(c => c.CompletionDate) : null;
            impact.FirstCompletionDate = completions.Any() ? completions.Min(c => c.CompletionDate) : null;

            // Calculate streak information
            if (habit.Streak != null)
            {
                impact.CurrentStreak = habit.Streak.CurrentStreak;
                impact.LongestStreak = habit.Streak.LongestStreak;
                impact.StreakStartDate = habit.Streak.LastCompletionDate; // Use last completion date as reference
            }

            // Calculate days of history
            impact.DaysOfHistory = completions.Any() ? 
                (int)(DateTime.UtcNow - impact.FirstCompletionDate!.Value).TotalDays : 0;

            // Determine impact severity and warnings
            CalculateImpactSeverityAndWarnings(impact);

            return impact;
        }

        public async Task<BulkDeletionImpactDto> CalculateBulkDeletionImpactAsync(List<int> habitIds, string? userId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Calculating bulk deletion impact for {Count} habits by user {UserId}", habitIds.Count, userId);

            var bulkImpact = new BulkDeletionImpactDto
            {
                TotalHabitsToDelete = habitIds.Count
            };

            foreach (var habitId in habitIds)
            {
                try
                {
                    var impact = await CalculateDeletionImpactAsync(habitId, userId, cancellationToken);
                    bulkImpact.HabitImpacts.Add(impact);
                    bulkImpact.TotalCompletionsAffected += impact.TotalCompletions;
                    if (impact.CurrentStreak > 0) bulkImpact.TotalStreaksAffected++;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Could not calculate impact for habit {HabitId}", habitId);
                    bulkImpact.OverallWarnings.Add($"Could not analyze habit {habitId} - it may already be deleted or inaccessible");
                }
            }

            // Calculate overall impact severity
            var highImpactCount = bulkImpact.HabitImpacts.Count(h => h.ImpactSeverity == "High");
            var mediumImpactCount = bulkImpact.HabitImpacts.Count(h => h.ImpactSeverity == "Medium");

            if (highImpactCount > 0)
            {
                bulkImpact.OverallImpactSeverity = "High";
                bulkImpact.OverallWarnings.Add($"{highImpactCount} habits have high deletion impact");
            }
            else if (mediumImpactCount > habitIds.Count / 2)
            {
                bulkImpact.OverallImpactSeverity = "Medium";
            }

            if (bulkImpact.TotalCompletionsAffected > 100)
            {
                bulkImpact.OverallWarnings.Add($"This will affect {bulkImpact.TotalCompletionsAffected} completion records");
            }

            return bulkImpact;
        }

        public async Task<bool> SoftDeleteHabitAsync(int habitId, DeleteHabitDto deleteDto, string? userId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Soft deleting habit {HabitId} by user {UserId}", habitId, userId);

            if (!await _habitRepository.CanUserAccessHabitAsync(userId, habitId, cancellationToken))
            {
                _logger.LogWarning("User {UserId} cannot access habit {HabitId}", userId, habitId);
                return false;
            }

            var habit = await _habitRepository.GetByIdAsync(habitId, cancellationToken);
            if (habit == null || habit.IsDeleted)
            {
                _logger.LogWarning("Habit {HabitId} not found or already deleted", habitId);
                return false;
            }

            // Perform soft delete
            habit.IsDeleted = true;
            habit.DeletedAt = DateTime.UtcNow;
            habit.DeleteReason = deleteDto.DeleteReason;
            habit.IsActive = false; // Also set IsActive to false for backward compatibility
            habit.UpdatedAt = DateTime.UtcNow;

            await _habitRepository.UpdateAsync(habit, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Soft deleted habit {HabitId} with reason: {DeleteReason}", habitId, deleteDto.DeleteReason ?? "No reason provided");
            return true;
        }

        public async Task<bool> BulkSoftDeleteHabitsAsync(BulkDeleteDto bulkDeleteDto, string? userId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Bulk soft deleting {Count} habits by user {UserId}", bulkDeleteDto.HabitIds.Count, userId);

            var successCount = 0;
            foreach (var habitId in bulkDeleteDto.HabitIds)
            {
                try
                {
                    var deleteDto = new DeleteHabitDto
                    {
                        DeleteReason = bulkDeleteDto.DeleteReason,
                        Confirmed = true
                    };

                    var result = await SoftDeleteHabitAsync(habitId, deleteDto, userId, cancellationToken);
                    if (result) successCount++;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error bulk deleting habit {HabitId}", habitId);
                }
            }

            _logger.LogInformation("Bulk deletion completed: {SuccessCount}/{TotalCount} habits deleted", successCount, bulkDeleteDto.HabitIds.Count);
            return successCount > 0;
        }

        public async Task<bool> RestoreHabitAsync(int habitId, RestoreHabitDto restoreDto, string? userId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Restoring habit {HabitId} by user {UserId}", habitId, userId);

            if (!await _habitRepository.CanUserAccessHabitAsync(userId, habitId, cancellationToken))
            {
                _logger.LogWarning("User {UserId} cannot access habit {HabitId}", userId, habitId);
                return false;
            }

            // We need to query including deleted items to find the habit
            var habit = await _habitRepository.GetHabitByIdIncludingDeletedAsync(habitId, cancellationToken);
            if (habit == null || !habit.IsDeleted)
            {
                _logger.LogWarning("Habit {HabitId} not found or not deleted", habitId);
                return false;
            }

            // Restore the habit
            habit.IsDeleted = false;
            habit.DeletedAt = null;
            habit.DeleteReason = null;
            habit.IsActive = restoreDto.RestoreToActiveState;
            habit.UpdatedAt = DateTime.UtcNow;

            await _habitRepository.UpdateAsync(habit, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Restored habit {HabitId}", habitId);
            return true;
        }

        public async Task<bool> BulkRestoreHabitsAsync(List<int> habitIds, string? userId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Bulk restoring {Count} habits by user {UserId}", habitIds.Count, userId);

            var successCount = 0;
            foreach (var habitId in habitIds)
            {
                try
                {
                    var restoreDto = new RestoreHabitDto
                    {
                        RestoreToActiveState = true,
                        Confirmed = true
                    };

                    var result = await RestoreHabitAsync(habitId, restoreDto, userId, cancellationToken);
                    if (result) successCount++;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error bulk restoring habit {HabitId}", habitId);
                }
            }

            _logger.LogInformation("Bulk restoration completed: {SuccessCount}/{TotalCount} habits restored", successCount, habitIds.Count);
            return successCount > 0;
        }

        public async Task<IEnumerable<HabitResponseDto>> GetDeletedHabitsByTrackerAsync(int trackerId, string? userId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Getting deleted habits for tracker {TrackerId} by user {UserId}", trackerId, userId);

            if (!await _trackerRepository.CanUserAccessTrackerAsync(userId, trackerId, cancellationToken))
            {
                _logger.LogWarning("User {UserId} cannot access tracker {TrackerId}", userId, trackerId);
                return Enumerable.Empty<HabitResponseDto>();
            }

            var habits = await _habitRepository.GetDeletedHabitsByTrackerIdAsync(trackerId, cancellationToken);
            return _mapper.Map<IEnumerable<HabitResponseDto>>(habits);
        }

        public async Task<IEnumerable<HabitResponseDto>> GetAllDeletedHabitsAsync(string? userId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Getting all deleted habits for user {UserId}", userId);

            var habits = await _habitRepository.GetAllDeletedHabitsForUserAsync(userId, cancellationToken);
            return _mapper.Map<IEnumerable<HabitResponseDto>>(habits);
        }

        public async Task<bool> PermanentlyDeleteHabitAsync(int habitId, string? userId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Permanently deleting habit {HabitId} by user {UserId}", habitId, userId);

            if (!await _habitRepository.CanUserAccessHabitAsync(userId, habitId, cancellationToken))
            {
                _logger.LogWarning("User {UserId} cannot access habit {HabitId}", userId, habitId);
                return false;
            }

            var habit = await _habitRepository.GetHabitByIdIncludingDeletedAsync(habitId, cancellationToken);
            if (habit == null)
            {
                _logger.LogWarning("Habit {HabitId} not found", habitId);
                return false;
            }

            await _habitRepository.DeleteAsync(habit, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Permanently deleted habit {HabitId}", habitId);
            return true;
        }

        public async Task<bool> PermanentlyDeleteOldHabitsAsync(DateTime cutoffDate, string? userId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Permanently deleting habits deleted before {CutoffDate} for user {UserId}", cutoffDate, userId);

            var allDeletedHabits = await _habitRepository.GetAllDeletedHabitsForUserAsync(userId, cancellationToken);
            var oldDeletedHabits = allDeletedHabits.Where(h => h.DeletedAt < cutoffDate).ToList();

            if (!oldDeletedHabits.Any())
            {
                _logger.LogInformation("No old deleted habits found for permanent deletion");
                return false;
            }

            foreach (var habit in oldDeletedHabits)
            {
                await _habitRepository.DeleteAsync(habit, cancellationToken);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Permanently deleted {Count} old habits", oldDeletedHabits.Count);
            return true;
        }

        public async Task<bool> CanUndoDeletionAsync(int habitId, string? userId, CancellationToken cancellationToken = default)
        {
            var habit = await _habitRepository.GetHabitByIdIncludingDeletedAsync(habitId, cancellationToken);
            if (habit == null || !habit.IsDeleted || !habit.DeletedAt.HasValue)
            {
                return false;
            }

            // Check if deletion is within undo grace period
            return DateTime.UtcNow - habit.DeletedAt.Value <= _undoGracePeriod;
        }

        public async Task<bool> UndoRecentDeletionAsync(int habitId, string? userId, CancellationToken cancellationToken = default)
        {
            if (!await CanUndoDeletionAsync(habitId, userId, cancellationToken))
            {
                _logger.LogWarning("Cannot undo deletion for habit {HabitId} - outside grace period or not deleted", habitId);
                return false;
            }

            var restoreDto = new RestoreHabitDto
            {
                RestoreToActiveState = true,
                Confirmed = true,
                RestoreReason = "Undo recent deletion"
            };

            return await RestoreHabitAsync(habitId, restoreDto, userId, cancellationToken);
        }

        private void CalculateImpactSeverityAndWarnings(DeletionImpactDto impact)
        {
            var warnings = new List<string>();
            var severityScore = 0;

            // Check completion history
            if (impact.TotalCompletions > 50)
            {
                warnings.Add($"This habit has {impact.TotalCompletions} completion records");
                severityScore += 2;
            }
            else if (impact.TotalCompletions > 10)
            {
                severityScore += 1;
            }

            // Check recent activity
            if (impact.CompletionsLast7Days > 0)
            {
                warnings.Add($"This habit was completed {impact.CompletionsLast7Days} times in the last 7 days");
                severityScore += 2;
            }
            else if (impact.CompletionsLast30Days > 0)
            {
                warnings.Add($"This habit was completed {impact.CompletionsLast30Days} times in the last 30 days");
                severityScore += 1;
            }

            // Check streak impact
            if (impact.CurrentStreak > 7)
            {
                warnings.Add($"This will break a current streak of {impact.CurrentStreak} days");
                severityScore += 3;
            }
            else if (impact.CurrentStreak > 0)
            {
                warnings.Add($"This will break a current streak of {impact.CurrentStreak} days");
                severityScore += 1;
            }

            if (impact.LongestStreak > 14)
            {
                warnings.Add($"This habit achieved a longest streak of {impact.LongestStreak} days");
                severityScore += 1;
            }

            // Check habit age
            var habitAge = DateTime.UtcNow - impact.HabitCreatedAt;
            if (habitAge.TotalDays > 30)
            {
                warnings.Add($"This habit has been tracked for {habitAge.Days} days");
                severityScore += 1;
            }

            impact.ImpactWarnings = warnings;
            
            // Determine severity
            impact.ImpactSeverity = severityScore switch
            {
                >= 5 => "High",
                >= 2 => "Medium",
                _ => "Low"
            };
        }
    }
}