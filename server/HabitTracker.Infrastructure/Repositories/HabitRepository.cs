using HabitTracker.Application.Interfaces;
using HabitTracker.Domain.Entities;
using HabitTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HabitTracker.Infrastructure.Repositories
{
    public class HabitRepository : GenericRepository<Habit>, IHabitRepository
    {
        public HabitRepository(HabitTrackerDbContext context, ILogger<HabitRepository> logger) 
            : base(context, logger)
        {
        }

        // Tracker-specific operations
        public async Task<IEnumerable<Habit>> GetHabitsByTrackerIdAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting habits for tracker {TrackerId}", trackerId);
                
                return await _dbSet
                    .Where(h => h.TrackerId == trackerId)
                    .AsNoTracking()
                    .OrderBy(h => h.DisplayOrder)
                    .ThenBy(h => h.Name)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting habits for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<IEnumerable<Habit>> GetActiveHabitsByTrackerIdAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting active habits for tracker {TrackerId}", trackerId);
                
                return await _dbSet
                    .Where(h => h.TrackerId == trackerId && h.IsActive)
                    .AsNoTracking()
                    .OrderBy(h => h.DisplayOrder)
                    .ThenBy(h => h.Name)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active habits for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<Habit?> GetHabitByTrackerAndNameAsync(int trackerId, string name, CancellationToken cancellationToken = default)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(name))
                    throw new ArgumentException("Habit name cannot be null or empty", nameof(name));

                _logger.LogDebug("Getting habit by name {HabitName} in tracker {TrackerId}", name, trackerId);
                
                return await _dbSet
                    .Where(h => h.TrackerId == trackerId && h.Name == name)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting habit by name {HabitName} in tracker {TrackerId}", name, trackerId);
                throw;
            }
        }

        // Display order operations
        public async Task<IEnumerable<Habit>> GetHabitsOrderedByDisplayOrderAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting habits ordered by display order for tracker {TrackerId}", trackerId);
                
                return await _dbSet
                    .Where(h => h.TrackerId == trackerId && h.IsActive)
                    .OrderBy(h => h.DisplayOrder)
                    .ThenBy(h => h.Name)
                    .AsNoTracking()
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting ordered habits for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task UpdateDisplayOrderAsync(int habitId, int displayOrder, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Updating display order for habit {HabitId} to {DisplayOrder}", habitId, displayOrder);
                
                var habit = await _dbSet.FindAsync([habitId], cancellationToken).ConfigureAwait(false);
                if (habit != null)
                {
                    habit.DisplayOrder = displayOrder;
                    habit.UpdatedAt = DateTime.UtcNow;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating display order for habit {HabitId}", habitId);
                throw;
            }
        }

        public async Task ReorderHabitsAsync(int trackerId, List<(int HabitId, int DisplayOrder)> habitOrders, CancellationToken cancellationToken = default)
        {
            try
            {
                if (habitOrders == null || !habitOrders.Any())
                    return;

                _logger.LogDebug("Reordering {Count} habits for tracker {TrackerId}", habitOrders.Count, trackerId);
                
                var habitIds = habitOrders.Select(ho => ho.HabitId).ToList();
                var habits = await _dbSet
                    .Where(h => h.TrackerId == trackerId && habitIds.Contains(h.Id))
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);

                foreach (var habit in habits)
                {
                    var orderInfo = habitOrders.FirstOrDefault(ho => ho.HabitId == habit.Id);
                    if (orderInfo != default)
                    {
                        habit.DisplayOrder = orderInfo.DisplayOrder;
                        habit.UpdatedAt = DateTime.UtcNow;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reordering habits for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        // Advanced queries with relationships
        public async Task<Habit?> GetHabitWithTrackerAsync(int habitId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting habit {HabitId} with tracker", habitId);
                
                return await _dbSet
                    .Include(h => h.Tracker)
                    .FirstOrDefaultAsync(h => h.Id == habitId, cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting habit {HabitId} with tracker", habitId);
                throw;
            }
        }

        public async Task<Habit?> GetHabitWithCompletionsAsync(int habitId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting habit {HabitId} with completions", habitId);
                
                return await _dbSet
                    .Include(h => h.Completions.OrderByDescending(c => c.CompletionDate))
                    .FirstOrDefaultAsync(h => h.Id == habitId, cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting habit {HabitId} with completions", habitId);
                throw;
            }
        }

        public async Task<Habit?> GetHabitWithStreakAsync(int habitId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting habit {HabitId} with streak", habitId);
                
                return await _dbSet
                    .Include(h => h.Streak)
                    .FirstOrDefaultAsync(h => h.Id == habitId, cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting habit {HabitId} with streak", habitId);
                throw;
            }
        }

        public async Task<Habit?> GetHabitWithAllRelationsAsync(int habitId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting habit {HabitId} with all relations", habitId);
                
                return await _dbSet
                    .Include(h => h.Tracker)
                    .Include(h => h.Completions.OrderByDescending(c => c.CompletionDate).Take(30))
                    .Include(h => h.Streak)
                    .FirstOrDefaultAsync(h => h.Id == habitId, cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting habit {HabitId} with all relations", habitId);
                throw;
            }
        }

        public async Task<IEnumerable<Habit>> GetHabitsWithCompletionDataAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting habits with completion data for tracker {TrackerId}", trackerId);
                
                return await _dbSet
                    .Where(h => h.TrackerId == trackerId && h.IsActive)
                    .Include(h => h.Completions.Where(c => c.CompletionDate >= DateTime.UtcNow.AddDays(-30)))
                    .Include(h => h.Streak)
                    .AsNoTracking()
                    .OrderBy(h => h.DisplayOrder)
                    .ThenBy(h => h.Name)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting habits with completion data for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        // Frequency and target operations
        public async Task<IEnumerable<Habit>> GetHabitsByFrequencyAsync(int trackerId, string frequency, CancellationToken cancellationToken = default)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(frequency))
                    throw new ArgumentException("Frequency cannot be null or empty", nameof(frequency));

                _logger.LogDebug("Getting habits by frequency {Frequency} for tracker {TrackerId}", frequency, trackerId);
                
                return await _dbSet
                    .Where(h => h.TrackerId == trackerId && h.TargetFrequency == frequency && h.IsActive)
                    .AsNoTracking()
                    .OrderBy(h => h.DisplayOrder)
                    .ThenBy(h => h.Name)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting habits by frequency {Frequency} for tracker {TrackerId}", frequency, trackerId);
                throw;
            }
        }

        public async Task<IEnumerable<Habit>> GetHabitsByTargetCountAsync(int trackerId, int targetCount, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting habits by target count {TargetCount} for tracker {TrackerId}", targetCount, trackerId);
                
                return await _dbSet
                    .Where(h => h.TrackerId == trackerId && h.TargetCount == targetCount && h.IsActive)
                    .AsNoTracking()
                    .OrderBy(h => h.DisplayOrder)
                    .ThenBy(h => h.Name)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting habits by target count {TargetCount} for tracker {TrackerId}", targetCount, trackerId);
                throw;
            }
        }

        public async Task<Dictionary<string, int>> GetHabitsCountByFrequencyAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting habit counts by frequency for tracker {TrackerId}", trackerId);
                
                return await _dbSet
                    .Where(h => h.TrackerId == trackerId && h.IsActive)
                    .GroupBy(h => h.TargetFrequency)
                    .ToDictionaryAsync(g => g.Key, g => g.Count(), cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting habit counts by frequency for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        // Business logic operations
        public async Task<bool> IsHabitNameUniqueInTrackerAsync(int trackerId, string name, int? excludeHabitId = null, CancellationToken cancellationToken = default)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(name))
                    return false;

                _logger.LogDebug("Checking if habit name {HabitName} is unique in tracker {TrackerId}", name, trackerId);
                
                var query = _dbSet.Where(h => h.TrackerId == trackerId && h.Name == name);
                
                if (excludeHabitId.HasValue)
                    query = query.Where(h => h.Id != excludeHabitId.Value);

                return !await query.AnyAsync(cancellationToken).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking name uniqueness for habit {HabitName} in tracker {TrackerId}", name, trackerId);
                throw;
            }
        }

        public async Task<bool> CanUserAccessHabitAsync(string? userId, int habitId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Checking if user {UserId} can access habit {HabitId}", userId ?? "anonymous", habitId);
                
                return await _dbSet
                    .Where(h => h.Id == habitId && (h.Tracker.UserId == userId || h.Tracker.IsShared))
                    .AnyAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking access for user {UserId} to habit {HabitId}", userId, habitId);
                throw;
            }
        }

        public async Task<int> GetHabitCountForTrackerAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting habit count for tracker {TrackerId}", trackerId);
                
                return await _dbSet
                    .Where(h => h.TrackerId == trackerId)
                    .CountAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting habit count for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<int> GetActiveHabitCountForTrackerAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting active habit count for tracker {TrackerId}", trackerId);
                
                return await _dbSet
                    .Where(h => h.TrackerId == trackerId && h.IsActive)
                    .CountAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active habit count for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        // Recent and activity operations
        public async Task<IEnumerable<Habit>> GetRecentlyCreatedHabitsAsync(int trackerId, int count = 10, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting {Count} recently created habits for tracker {TrackerId}", count, trackerId);
                
                return await _dbSet
                    .Where(h => h.TrackerId == trackerId && h.IsActive)
                    .OrderByDescending(h => h.CreatedAt)
                    .Take(count)
                    .AsNoTracking()
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recently created habits for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<IEnumerable<Habit>> GetRecentlyUpdatedHabitsAsync(int trackerId, int count = 10, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting {Count} recently updated habits for tracker {TrackerId}", count, trackerId);
                
                return await _dbSet
                    .Where(h => h.TrackerId == trackerId && h.IsActive)
                    .OrderByDescending(h => h.UpdatedAt)
                    .Take(count)
                    .AsNoTracking()
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recently updated habits for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<IEnumerable<Habit>> GetHabitsCreatedBetweenAsync(int trackerId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting habits created between {StartDate} and {EndDate} for tracker {TrackerId}", startDate, endDate, trackerId);
                
                return await _dbSet
                    .Where(h => h.TrackerId == trackerId && h.CreatedAt >= startDate && h.CreatedAt <= endDate)
                    .AsNoTracking()
                    .OrderBy(h => h.CreatedAt)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting habits created between dates for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        // Soft delete operations
        public async Task SoftDeleteAsync(int habitId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Soft deleting habit {HabitId}", habitId);
                
                var habit = await _dbSet.IgnoreQueryFilters().FirstOrDefaultAsync(h => h.Id == habitId, cancellationToken).ConfigureAwait(false);
                if (habit != null)
                {
                    habit.IsDeleted = true;
                    habit.DeletedAt = DateTime.UtcNow;
                    habit.IsActive = false; // Backward compatibility
                    habit.UpdatedAt = DateTime.UtcNow;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error soft deleting habit {HabitId}", habitId);
                throw;
            }
        }

        public async Task RestoreAsync(int habitId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Restoring habit {HabitId}", habitId);
                
                var habit = await _dbSet.IgnoreQueryFilters().FirstOrDefaultAsync(h => h.Id == habitId, cancellationToken).ConfigureAwait(false);
                if (habit != null)
                {
                    habit.IsDeleted = false;
                    habit.DeletedAt = null;
                    habit.DeleteReason = null;
                    habit.IsActive = true;
                    habit.UpdatedAt = DateTime.UtcNow;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error restoring habit {HabitId}", habitId);
                throw;
            }
        }

        public async Task SoftDeleteAllByTrackerAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Soft deleting all habits for tracker {TrackerId}", trackerId);
                
                var habits = await _dbSet
                    .Where(h => h.TrackerId == trackerId && h.IsActive)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);

                foreach (var habit in habits)
                {
                    habit.IsDeleted = true;
                    habit.DeletedAt = DateTime.UtcNow;
                    habit.IsActive = false; // Backward compatibility
                    habit.UpdatedAt = DateTime.UtcNow;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error soft deleting all habits for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        // Deleted habits operations
        public async Task<IEnumerable<Habit>> GetDeletedHabitsByTrackerIdAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting deleted habits for tracker {TrackerId}", trackerId);
                
                return await _dbSet
                    .IgnoreQueryFilters()
                    .Where(h => h.TrackerId == trackerId && h.IsDeleted)
                    .AsNoTracking()
                    .OrderByDescending(h => h.DeletedAt)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting deleted habits for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<IEnumerable<Habit>> GetAllDeletedHabitsForUserAsync(string? userId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting all deleted habits for user {UserId}", userId ?? "anonymous");
                
                return await _dbSet
                    .IgnoreQueryFilters()
                    .Include(h => h.Tracker)
                    .Where(h => h.IsDeleted && (h.Tracker.UserId == userId || h.Tracker.IsShared))
                    .AsNoTracking()
                    .OrderByDescending(h => h.DeletedAt)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all deleted habits for user {UserId}", userId);
                throw;
            }
        }

        public async Task<Habit?> GetDeletedHabitByIdAsync(int habitId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting deleted habit {HabitId}", habitId);
                
                return await _dbSet
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(h => h.Id == habitId && h.IsDeleted, cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting deleted habit {HabitId}", habitId);
                throw;
            }
        }

        public async Task<Habit?> GetHabitByIdIncludingDeletedAsync(int habitId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting habit {HabitId} including deleted", habitId);
                
                return await _dbSet
                    .IgnoreQueryFilters()
                    .Include(h => h.Tracker)
                    .Include(h => h.Completions.OrderByDescending(c => c.CompletionDate).Take(30))
                    .Include(h => h.Streak)
                    .FirstOrDefaultAsync(h => h.Id == habitId, cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting habit {HabitId} including deleted", habitId);
                throw;
            }
        }

        // Color and customization operations - Key methods only
        public async Task<IEnumerable<Habit>> GetHabitsByColorAsync(int trackerId, string color, CancellationToken cancellationToken = default)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(color))
                    throw new ArgumentException("Color cannot be null or empty", nameof(color));

                return await _dbSet
                    .Where(h => h.TrackerId == trackerId && h.Color == color && h.IsActive)
                    .AsNoTracking()
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting habits by color for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<Dictionary<string, int>> GetHabitsCountByColorAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                return await _dbSet
                    .Where(h => h.TrackerId == trackerId && h.IsActive)
                    .GroupBy(h => h.Color)
                    .ToDictionaryAsync(g => g.Key, g => g.Count(), cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting habit counts by color for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<bool> IsColorUsedInTrackerAsync(int trackerId, string color, int? excludeHabitId = null, CancellationToken cancellationToken = default)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(color))
                    return false;

                var query = _dbSet.Where(h => h.TrackerId == trackerId && h.Color == color && h.IsActive);
                
                if (excludeHabitId.HasValue)
                    query = query.Where(h => h.Id != excludeHabitId.Value);

                return await query.AnyAsync(cancellationToken).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking color usage for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        // Bulk operations - Essential methods
        public async Task<IEnumerable<Habit>> CreateHabitsAsync(IEnumerable<Habit> habits, CancellationToken cancellationToken = default)
        {
            try
            {
                if (habits == null)
                    throw new ArgumentNullException(nameof(habits));

                var habitList = habits.ToList();
                _logger.LogDebug("Creating {Count} habits", habitList.Count);
                
                await _dbSet.AddRangeAsync(habitList, cancellationToken).ConfigureAwait(false);
                return habitList;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating multiple habits");
                throw;
            }
        }

        public async Task UpdateHabitsAsync(IEnumerable<Habit> habits, CancellationToken cancellationToken = default)
        {
            try
            {
                if (habits == null)
                    throw new ArgumentNullException(nameof(habits));

                var habitList = habits.ToList();
                _logger.LogDebug("Updating {Count} habits", habitList.Count);
                
                _dbSet.UpdateRange(habitList);
                await Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating multiple habits");
                throw;
            }
        }

        public async Task DeleteHabitsAsync(IEnumerable<int> habitIds, CancellationToken cancellationToken = default)
        {
            try
            {
                if (habitIds == null)
                    throw new ArgumentNullException(nameof(habitIds));

                var idList = habitIds.ToList();
                _logger.LogDebug("Deleting {Count} habits", idList.Count);
                
                var habits = await _dbSet
                    .Where(h => idList.Contains(h.Id))
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);

                _dbSet.RemoveRange(habits);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting multiple habits");
                throw;
            }
        }

        // Analytics and statistics - Key methods
        public async Task<Dictionary<int, DateTime?>> GetLastCompletionDatesAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting last completion dates for tracker {TrackerId}", trackerId);
                
                return await _context.HabitCompletions
                    .Where(hc => hc.Habit.TrackerId == trackerId && hc.IsCompleted)
                    .GroupBy(hc => hc.HabitId)
                    .ToDictionaryAsync(
                        g => g.Key,
                        g => g.Max(hc => (DateTime?)hc.CompletionDate),
                        cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting last completion dates for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<Dictionary<int, int>> GetCompletionCountsAsync(int trackerId, DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting completion counts for tracker {TrackerId}", trackerId);
                
                var query = _context.HabitCompletions
                    .Where(hc => hc.Habit.TrackerId == trackerId && hc.IsCompleted);

                if (startDate.HasValue)
                    query = query.Where(hc => hc.CompletionDate >= startDate.Value);

                if (endDate.HasValue)
                    query = query.Where(hc => hc.CompletionDate <= endDate.Value);

                return await query
                    .GroupBy(hc => hc.HabitId)
                    .ToDictionaryAsync(g => g.Key, g => g.Count(), cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting completion counts for tracker {TrackerId}", trackerId);
                throw;
            }
        }
    }
}