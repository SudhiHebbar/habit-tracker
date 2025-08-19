using HabitTracker.Application.Interfaces;
using HabitTracker.Domain.Entities;
using HabitTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HabitTracker.Infrastructure.Repositories
{
    public class StreakRepository : GenericRepository<Streak>, IStreakRepository
    {
        public StreakRepository(HabitTrackerDbContext context, ILogger<StreakRepository> logger) 
            : base(context, logger)
        {
        }

        // Basic streak operations
        public async Task<Streak?> GetStreakByHabitIdAsync(int habitId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting streak for habit {HabitId}", habitId);
                
                return await _dbSet
                    .FirstOrDefaultAsync(s => s.HabitId == habitId, cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting streak for habit {HabitId}", habitId);
                throw;
            }
        }

        public async Task<IEnumerable<Streak>> GetStreaksByTrackerIdAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting streaks for tracker {TrackerId}", trackerId);
                
                return await _dbSet
                    .Where(s => s.Habit.TrackerId == trackerId)
                    .AsNoTracking()
                    .OrderByDescending(s => s.CurrentStreak)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting streaks for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<Streak> GetOrCreateStreakAsync(int habitId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting or creating streak for habit {HabitId}", habitId);
                
                var existingStreak = await GetStreakByHabitIdAsync(habitId, cancellationToken);
                
                if (existingStreak != null)
                    return existingStreak;

                // Create new streak record
                var newStreak = new Streak
                {
                    HabitId = habitId,
                    CurrentStreak = 0,
                    LongestStreak = 0,
                    LastCompletionDate = null,
                    TotalCompletions = 0,
                    CompletionRate = 0.0m,
                    UpdatedAt = DateTime.UtcNow
                };

                await _dbSet.AddAsync(newStreak, cancellationToken).ConfigureAwait(false);
                return newStreak;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting or creating streak for habit {HabitId}", habitId);
                throw;
            }
        }

        // Streak calculation and updates
        public async Task<Streak> CalculateAndUpdateStreakAsync(int habitId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Calculating and updating streak for habit {HabitId}", habitId);

                // Get or create streak record
                var streak = await GetOrCreateStreakAsync(habitId, cancellationToken);

                // Get all completions for this habit
                var completions = await _context.HabitCompletions
                    .Where(hc => hc.HabitId == habitId && hc.IsCompleted)
                    .OrderBy(hc => hc.CompletionDate)
                    .Select(hc => hc.CompletionDate)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);

                if (!completions.Any())
                {
                    // No completions, reset everything
                    streak.CurrentStreak = 0;
                    streak.LongestStreak = 0;
                    streak.LastCompletionDate = null;
                    streak.TotalCompletions = 0;
                    streak.CompletionRate = 0.0m;
                }
                else
                {
                    // Calculate total completions
                    streak.TotalCompletions = completions.Count;
                    streak.LastCompletionDate = completions.Last();

                    // Calculate current streak (consecutive days from today backwards)
                    var today = DateOnly.FromDateTime(DateTime.UtcNow);
                    var currentStreak = CalculateCurrentStreakFromCompletions(completions, today);
                    streak.CurrentStreak = currentStreak;

                    // Calculate longest streak
                    var longestStreak = CalculateLongestStreakFromCompletions(completions);
                    streak.LongestStreak = Math.Max(streak.LongestStreak, longestStreak);

                    // Calculate completion rate (from first completion to today)
                    var firstCompletion = completions.First();
                    var daysSinceFirst = (today.DayNumber - firstCompletion.DayNumber) + 1;
                    streak.CompletionRate = daysSinceFirst > 0 ? (decimal)completions.Count / daysSinceFirst * 100 : 0;
                }

                streak.UpdatedAt = DateTime.UtcNow;
                return streak;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating streak for habit {HabitId}", habitId);
                throw;
            }
        }

        public async Task<IEnumerable<Streak>> RecalculateAllStreaksAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Recalculating all streaks for tracker {TrackerId}", trackerId);

                var habitIds = await _context.Habits
                    .Where(h => h.TrackerId == trackerId && h.IsActive)
                    .Select(h => h.Id)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);

                var updatedStreaks = new List<Streak>();
                
                foreach (var habitId in habitIds)
                {
                    var streak = await CalculateAndUpdateStreakAsync(habitId, cancellationToken);
                    updatedStreaks.Add(streak);
                }

                return updatedStreaks;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error recalculating all streaks for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<Streak> UpdateCurrentStreakAsync(int habitId, int currentStreak, DateOnly? lastCompletionDate = null, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Updating current streak for habit {HabitId} to {CurrentStreak}", habitId, currentStreak);
                
                var streak = await GetOrCreateStreakAsync(habitId, cancellationToken);
                
                streak.CurrentStreak = currentStreak;
                if (lastCompletionDate.HasValue)
                    streak.LastCompletionDate = lastCompletionDate.Value;
                
                // Update longest streak if current exceeds it
                if (currentStreak > streak.LongestStreak)
                    streak.LongestStreak = currentStreak;
                
                streak.UpdatedAt = DateTime.UtcNow;
                return streak;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating current streak for habit {HabitId}", habitId);
                throw;
            }
        }

        public async Task<Streak> UpdateLongestStreakAsync(int habitId, int longestStreak, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Updating longest streak for habit {HabitId} to {LongestStreak}", habitId, longestStreak);
                
                var streak = await GetOrCreateStreakAsync(habitId, cancellationToken);
                
                // Only update if the new longest is greater
                if (longestStreak > streak.LongestStreak)
                    streak.LongestStreak = longestStreak;
                
                streak.UpdatedAt = DateTime.UtcNow;
                return streak;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating longest streak for habit {HabitId}", habitId);
                throw;
            }
        }

        public async Task<Streak> ResetCurrentStreakAsync(int habitId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Resetting current streak for habit {HabitId}", habitId);
                
                var streak = await GetOrCreateStreakAsync(habitId, cancellationToken);
                streak.CurrentStreak = 0;
                streak.UpdatedAt = DateTime.UtcNow;
                return streak;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting current streak for habit {HabitId}", habitId);
                throw;
            }
        }

        // Advanced queries with relationships
        public async Task<Streak?> GetStreakWithHabitAsync(int habitId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting streak with habit for habit {HabitId}", habitId);
                
                return await _dbSet
                    .Include(s => s.Habit)
                    .FirstOrDefaultAsync(s => s.HabitId == habitId, cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting streak with habit for habit {HabitId}", habitId);
                throw;
            }
        }

        public async Task<IEnumerable<Streak>> GetStreaksWithHabitsAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting streaks with habits for tracker {TrackerId}", trackerId);
                
                return await _dbSet
                    .Where(s => s.Habit.TrackerId == trackerId)
                    .Include(s => s.Habit)
                    .AsNoTracking()
                    .OrderByDescending(s => s.CurrentStreak)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting streaks with habits for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<IEnumerable<Streak>> GetStreaksWithHabitsAndTrackerAsync(string? userId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting streaks with habits and tracker for user {UserId}", userId ?? "anonymous");
                
                return await _dbSet
                    .Where(s => s.Habit.Tracker.UserId == userId)
                    .Include(s => s.Habit)
                        .ThenInclude(h => h.Tracker)
                    .AsNoTracking()
                    .OrderByDescending(s => s.CurrentStreak)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting streaks with habits and tracker for user {UserId}", userId);
                throw;
            }
        }

        // Streak analysis and filtering
        public async Task<IEnumerable<Streak>> GetActiveStreaksAsync(int trackerId, int minLength = 1, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting active streaks for tracker {TrackerId} with minimum length {MinLength}", trackerId, minLength);
                
                return await _dbSet
                    .Where(s => s.Habit.TrackerId == trackerId && s.Habit.IsActive && s.CurrentStreak >= minLength)
                    .Include(s => s.Habit)
                    .AsNoTracking()
                    .OrderByDescending(s => s.CurrentStreak)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active streaks for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<IEnumerable<Streak>> GetStreaksByLengthAsync(int trackerId, int minLength, int? maxLength = null, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting streaks by length for tracker {TrackerId} (min: {MinLength}, max: {MaxLength})", trackerId, minLength, maxLength);
                
                var query = _dbSet
                    .Where(s => s.Habit.TrackerId == trackerId && s.CurrentStreak >= minLength);
                
                if (maxLength.HasValue)
                    query = query.Where(s => s.CurrentStreak <= maxLength.Value);

                return await query
                    .Include(s => s.Habit)
                    .AsNoTracking()
                    .OrderByDescending(s => s.CurrentStreak)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting streaks by length for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<IEnumerable<Streak>> GetStreaksAtRiskAsync(int trackerId, int daysSinceLastCompletion = 1, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting streaks at risk for tracker {TrackerId} (days since last completion: {Days})", trackerId, daysSinceLastCompletion);
                
                var cutoffDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-daysSinceLastCompletion));
                
                return await _dbSet
                    .Where(s => s.Habit.TrackerId == trackerId 
                             && s.Habit.IsActive 
                             && s.CurrentStreak > 0 
                             && (s.LastCompletionDate == null || s.LastCompletionDate < cutoffDate))
                    .Include(s => s.Habit)
                    .AsNoTracking()
                    .OrderByDescending(s => s.CurrentStreak)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting streaks at risk for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<IEnumerable<Streak>> GetTopStreaksAsync(int trackerId, int count = 10, bool byCurrentStreak = true, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting top {Count} streaks for tracker {TrackerId} (by current: {ByCurrentStreak})", count, trackerId, byCurrentStreak);
                
                var query = _dbSet
                    .Where(s => s.Habit.TrackerId == trackerId && s.Habit.IsActive);

                query = byCurrentStreak 
                    ? query.OrderByDescending(s => s.CurrentStreak)
                    : query.OrderByDescending(s => s.LongestStreak);

                return await query
                    .Take(count)
                    .Include(s => s.Habit)
                    .AsNoTracking()
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting top streaks for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        // Completion rate operations
        public async Task<Streak> UpdateCompletionRateAsync(int habitId, double completionRate, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Updating completion rate for habit {HabitId} to {CompletionRate}%", habitId, completionRate);
                
                var streak = await GetOrCreateStreakAsync(habitId, cancellationToken);
                streak.CompletionRate = (decimal)completionRate;
                streak.UpdatedAt = DateTime.UtcNow;
                return streak;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating completion rate for habit {HabitId}", habitId);
                throw;
            }
        }

        public async Task<Streak> UpdateTotalCompletionsAsync(int habitId, int totalCompletions, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Updating total completions for habit {HabitId} to {TotalCompletions}", habitId, totalCompletions);
                
                var streak = await GetOrCreateStreakAsync(habitId, cancellationToken);
                streak.TotalCompletions = totalCompletions;
                streak.UpdatedAt = DateTime.UtcNow;
                return streak;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating total completions for habit {HabitId}", habitId);
                throw;
            }
        }

        public async Task<IEnumerable<Streak>> GetStreaksByCompletionRateAsync(int trackerId, double minRate, double? maxRate = null, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting streaks by completion rate for tracker {TrackerId} (min: {MinRate}%, max: {MaxRate}%)", trackerId, minRate, maxRate);
                
                var query = _dbSet
                    .Where(s => s.Habit.TrackerId == trackerId && s.CompletionRate >= (decimal)minRate);
                
                if (maxRate.HasValue)
                    query = query.Where(s => s.CompletionRate <= (decimal)maxRate.Value);

                return await query
                    .Include(s => s.Habit)
                    .AsNoTracking()
                    .OrderByDescending(s => s.CompletionRate)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting streaks by completion rate for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        // Streak milestones and achievements
        public async Task<IEnumerable<Streak>> GetStreaksMilestoneAsync(int trackerId, IEnumerable<int> milestoneValues, CancellationToken cancellationToken = default)
        {
            try
            {
                var milestones = milestoneValues.ToList();
                _logger.LogDebug("Getting streaks at milestones for tracker {TrackerId}: [{Milestones}]", trackerId, string.Join(", ", milestones));
                
                return await _dbSet
                    .Where(s => s.Habit.TrackerId == trackerId && milestones.Contains(s.CurrentStreak))
                    .Include(s => s.Habit)
                    .AsNoTracking()
                    .OrderByDescending(s => s.CurrentStreak)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting streaks at milestones for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<bool> HasReachedMilestoneAsync(int habitId, int milestone, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Checking if habit {HabitId} has reached milestone {Milestone}", habitId, milestone);
                
                var streak = await GetStreakByHabitIdAsync(habitId, cancellationToken);
                return streak != null && (streak.CurrentStreak >= milestone || streak.LongestStreak >= milestone);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking milestone for habit {HabitId}", habitId);
                throw;
            }
        }

        public async Task<IEnumerable<int>> GetAchievedMilestonesAsync(int habitId, IEnumerable<int> milestones, CancellationToken cancellationToken = default)
        {
            try
            {
                var milestoneList = milestones.ToList();
                _logger.LogDebug("Getting achieved milestones for habit {HabitId}: [{Milestones}]", habitId, string.Join(", ", milestoneList));
                
                var streak = await GetStreakByHabitIdAsync(habitId, cancellationToken);
                
                if (streak == null)
                    return new List<int>();

                return milestoneList.Where(m => streak.LongestStreak >= m).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting achieved milestones for habit {HabitId}", habitId);
                throw;
            }
        }

        // Statistics and analytics
        public async Task<Dictionary<int, int>> GetCurrentStreakLengthsAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting current streak lengths for tracker {TrackerId}", trackerId);
                
                return await _dbSet
                    .Where(s => s.Habit.TrackerId == trackerId && s.Habit.IsActive)
                    .ToDictionaryAsync(s => s.HabitId, s => s.CurrentStreak, cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting current streak lengths for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<Dictionary<int, int>> GetLongestStreakLengthsAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting longest streak lengths for tracker {TrackerId}", trackerId);
                
                return await _dbSet
                    .Where(s => s.Habit.TrackerId == trackerId && s.Habit.IsActive)
                    .ToDictionaryAsync(s => s.HabitId, s => s.LongestStreak, cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting longest streak lengths for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<Dictionary<int, double>> GetCompletionRatesAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting completion rates for tracker {TrackerId}", trackerId);
                
                return await _dbSet
                    .Where(s => s.Habit.TrackerId == trackerId && s.Habit.IsActive)
                    .ToDictionaryAsync(s => s.HabitId, s => (double)s.CompletionRate, cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting completion rates for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<Dictionary<int, int>> GetTotalCompletionCountsAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting total completion counts for tracker {TrackerId}", trackerId);
                
                return await _dbSet
                    .Where(s => s.Habit.TrackerId == trackerId && s.Habit.IsActive)
                    .ToDictionaryAsync(s => s.HabitId, s => s.TotalCompletions, cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting total completion counts for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        // Bulk operations
        public async Task<IEnumerable<Streak>> CreateStreaksForHabitsAsync(IEnumerable<int> habitIds, CancellationToken cancellationToken = default)
        {
            try
            {
                var habitIdList = habitIds.ToList();
                _logger.LogDebug("Creating streaks for {Count} habits", habitIdList.Count);
                
                var streaks = new List<Streak>();
                
                foreach (var habitId in habitIdList)
                {
                    var streak = await GetOrCreateStreakAsync(habitId, cancellationToken);
                    streaks.Add(streak);
                }
                
                return streaks;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating streaks for habits");
                throw;
            }
        }

        public async Task<bool> DeleteStreaksByTrackerAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Deleting streaks for tracker {TrackerId}", trackerId);
                
                var streaks = await _dbSet
                    .Where(s => s.Habit.TrackerId == trackerId)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);

                _dbSet.RemoveRange(streaks);
                return streaks.Any();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting streaks for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<bool> DeleteStreaksByHabitIdsAsync(IEnumerable<int> habitIds, CancellationToken cancellationToken = default)
        {
            try
            {
                var habitIdList = habitIds.ToList();
                _logger.LogDebug("Deleting streaks for {Count} habits", habitIdList.Count);
                
                var streaks = await _dbSet
                    .Where(s => habitIdList.Contains(s.HabitId))
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);

                _dbSet.RemoveRange(streaks);
                return streaks.Any();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting streaks for habits");
                throw;
            }
        }

        public async Task<IEnumerable<Streak>> BulkUpdateStreaksAsync(IEnumerable<Streak> streaks, CancellationToken cancellationToken = default)
        {
            try
            {
                var streakList = streaks.ToList();
                _logger.LogDebug("Bulk updating {Count} streaks", streakList.Count);
                
                foreach (var streak in streakList)
                {
                    streak.UpdatedAt = DateTime.UtcNow;
                }
                
                _dbSet.UpdateRange(streakList);
                return streakList;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error bulk updating streaks");
                throw;
            }
        }

        // Data maintenance
        public async Task<int> CleanupOrphanedStreaksAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Cleaning up orphaned streaks");
                
                var orphanedStreaks = await _dbSet
                    .Where(s => s.Habit == null)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);

                _dbSet.RemoveRange(orphanedStreaks);
                return orphanedStreaks.Count;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cleaning up orphaned streaks");
                throw;
            }
        }

        public async Task<Streak> RecalculateStreakFromCompletionsAsync(int habitId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Recalculating streak from completions for habit {HabitId}", habitId);
                
                return await CalculateAndUpdateStreakAsync(habitId, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error recalculating streak from completions for habit {HabitId}", habitId);
                throw;
            }
        }

        // Helper methods for streak calculations
        private static int CalculateCurrentStreakFromCompletions(List<DateOnly> completions, DateOnly referenceDate)
        {
            if (!completions.Any())
                return 0;

            var sortedCompletions = completions.OrderByDescending(d => d).ToList();
            var currentStreak = 0;
            var expectedDate = referenceDate;

            // Check if the reference date (usually today) is completed
            if (!sortedCompletions.Contains(referenceDate))
            {
                // If today is not completed, check yesterday
                expectedDate = referenceDate.AddDays(-1);
            }

            // Count consecutive days backwards from the reference date
            foreach (var completionDate in sortedCompletions)
            {
                if (completionDate == expectedDate)
                {
                    currentStreak++;
                    expectedDate = expectedDate.AddDays(-1);
                }
                else if (completionDate < expectedDate)
                {
                    // Found a gap, stop counting
                    break;
                }
            }

            return currentStreak;
        }

        private static int CalculateLongestStreakFromCompletions(List<DateOnly> completions)
        {
            if (!completions.Any())
                return 0;

            var sortedCompletions = completions.OrderBy(d => d).ToList();
            var longestStreak = 1;
            var currentStreak = 1;

            for (int i = 1; i < sortedCompletions.Count; i++)
            {
                if (sortedCompletions[i] == sortedCompletions[i - 1].AddDays(1))
                {
                    // Consecutive day
                    currentStreak++;
                    longestStreak = Math.Max(longestStreak, currentStreak);
                }
                else
                {
                    // Gap found, reset current streak
                    currentStreak = 1;
                }
            }

            return longestStreak;
        }

        // Additional essential methods
        public async Task<double> GetAverageCurrentStreakAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                var streaks = await _dbSet
                    .Where(s => s.Habit.TrackerId == trackerId && s.Habit.IsActive)
                    .Select(s => s.CurrentStreak)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);

                return streaks.Any() ? streaks.Average() : 0.0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting average current streak for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<double> GetAverageLongestStreakAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                var streaks = await _dbSet
                    .Where(s => s.Habit.TrackerId == trackerId && s.Habit.IsActive)
                    .Select(s => s.LongestStreak)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);

                return streaks.Any() ? streaks.Average() : 0.0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting average longest streak for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<double> GetAverageCompletionRateAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                var rates = await _dbSet
                    .Where(s => s.Habit.TrackerId == trackerId && s.Habit.IsActive)
                    .Select(s => s.CompletionRate)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);

                return rates.Any() ? (double)rates.Average() : 0.0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting average completion rate for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<int> GetTotalActiveStreaksAsync(int trackerId, int minLength = 1, CancellationToken cancellationToken = default)
        {
            try
            {
                return await _dbSet
                    .Where(s => s.Habit.TrackerId == trackerId && s.Habit.IsActive && s.CurrentStreak >= minLength)
                    .CountAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting total active streaks for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<IEnumerable<Streak>> GetStreaksLastUpdatedBeforeAsync(DateTime cutoffDate, CancellationToken cancellationToken = default)
        {
            try
            {
                return await _dbSet
                    .Where(s => s.UpdatedAt < cutoffDate)
                    .Include(s => s.Habit)
                    .AsNoTracking()
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting streaks last updated before {CutoffDate}", cutoffDate);
                throw;
            }
        }

        public async Task<IEnumerable<Streak>> GetStreaksWithRecentActivityAsync(int trackerId, int days = 7, CancellationToken cancellationToken = default)
        {
            try
            {
                var cutoffDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-days));
                
                return await _dbSet
                    .Where(s => s.Habit.TrackerId == trackerId && s.LastCompletionDate >= cutoffDate)
                    .Include(s => s.Habit)
                    .AsNoTracking()
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting streaks with recent activity for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<IEnumerable<Streak>> GetStreaksWithNoRecentActivityAsync(int trackerId, int days = 7, CancellationToken cancellationToken = default)
        {
            try
            {
                var cutoffDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-days));
                
                return await _dbSet
                    .Where(s => s.Habit.TrackerId == trackerId && (s.LastCompletionDate == null || s.LastCompletionDate < cutoffDate))
                    .Include(s => s.Habit)
                    .AsNoTracking()
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting streaks with no recent activity for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<bool> ValidateStreakConsistencyAsync(int habitId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Validating streak consistency for habit {HabitId}", habitId);
                
                var streak = await GetStreakByHabitIdAsync(habitId, cancellationToken);
                if (streak == null)
                    return true; // No streak to validate

                // Get completions and recalculate expected values
                var completions = await _context.HabitCompletions
                    .Where(hc => hc.HabitId == habitId && hc.IsCompleted)
                    .Select(hc => hc.CompletionDate)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);

                var expectedCurrentStreak = CalculateCurrentStreakFromCompletions(completions, DateOnly.FromDateTime(DateTime.UtcNow));
                var expectedLongestStreak = CalculateLongestStreakFromCompletions(completions);
                var expectedTotalCompletions = completions.Count;

                return streak.CurrentStreak == expectedCurrentStreak
                    && streak.LongestStreak >= expectedLongestStreak // Allow for manual updates to longest streak
                    && streak.TotalCompletions == expectedTotalCompletions;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating streak consistency for habit {HabitId}", habitId);
                throw;
            }
        }

        public async Task<IEnumerable<int>> FindInconsistentStreaksAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Finding inconsistent streaks for tracker {TrackerId}", trackerId);
                
                var habitIds = await _context.Habits
                    .Where(h => h.TrackerId == trackerId && h.IsActive)
                    .Select(h => h.Id)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);

                var inconsistentHabitIds = new List<int>();
                
                foreach (var habitId in habitIds)
                {
                    var isConsistent = await ValidateStreakConsistencyAsync(habitId, cancellationToken);
                    if (!isConsistent)
                        inconsistentHabitIds.Add(habitId);
                }
                
                return inconsistentHabitIds;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error finding inconsistent streaks for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<int> GetStreakRankAsync(int habitId, bool byCurrentStreak = true, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting streak rank for habit {HabitId} (by current: {ByCurrentStreak})", habitId, byCurrentStreak);
                
                var habit = await _context.Habits.FindAsync([habitId], cancellationToken).ConfigureAwait(false);
                if (habit == null)
                    return -1;

                var streak = await GetStreakByHabitIdAsync(habitId, cancellationToken);
                if (streak == null)
                    return -1;

                var streakValue = byCurrentStreak ? streak.CurrentStreak : streak.LongestStreak;
                
                var betterStreaks = byCurrentStreak
                    ? await _dbSet.Where(s => s.Habit.TrackerId == habit.TrackerId && s.CurrentStreak > streakValue).CountAsync(cancellationToken)
                    : await _dbSet.Where(s => s.Habit.TrackerId == habit.TrackerId && s.LongestStreak > streakValue).CountAsync(cancellationToken);

                return betterStreaks + 1; // Rank is 1-based
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting streak rank for habit {HabitId}", habitId);
                throw;
            }
        }

        public async Task<IEnumerable<(int HabitId, int Streak, int Rank)>> GetStreakLeaderboardAsync(int trackerId, int count = 10, bool byCurrentStreak = true, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting streak leaderboard for tracker {TrackerId} (top {Count}, by current: {ByCurrentStreak})", trackerId, count, byCurrentStreak);
                
                var query = _dbSet.Where(s => s.Habit.TrackerId == trackerId && s.Habit.IsActive);
                
                var orderedStreaks = byCurrentStreak
                    ? await query.OrderByDescending(s => s.CurrentStreak).Take(count).ToListAsync(cancellationToken)
                    : await query.OrderByDescending(s => s.LongestStreak).Take(count).ToListAsync(cancellationToken);

                var leaderboard = new List<(int HabitId, int Streak, int Rank)>();
                
                for (int i = 0; i < orderedStreaks.Count; i++)
                {
                    var streak = orderedStreaks[i];
                    var streakValue = byCurrentStreak ? streak.CurrentStreak : streak.LongestStreak;
                    leaderboard.Add((streak.HabitId, streakValue, i + 1));
                }
                
                return leaderboard;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting streak leaderboard for tracker {TrackerId}", trackerId);
                throw;
            }
        }
    }
}