using HabitTracker.Application.Interfaces;
using HabitTracker.Domain.Entities;
using HabitTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HabitTracker.Infrastructure.Repositories
{
    public class TrackerRepository : GenericRepository<Tracker>, ITrackerRepository
    {
        public TrackerRepository(HabitTrackerDbContext context, ILogger<TrackerRepository> logger) 
            : base(context, logger)
        {
        }

        // User-specific operations
        public async Task<IEnumerable<Tracker>> GetTrackersByUserIdAsync(string? userId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting trackers for user {UserId}", userId ?? "anonymous");
                
                return await _dbSet
                    .Where(t => t.UserId == userId)
                    .AsNoTracking()
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting trackers for user {UserId}", userId);
                throw;
            }
        }

        public async Task<IEnumerable<Tracker>> GetActiveTrackersByUserIdAsync(string? userId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting active trackers for user {UserId}", userId ?? "anonymous");
                
                return await _dbSet
                    .Where(t => t.UserId == userId && t.IsActive)
                    .AsNoTracking()
                    .OrderBy(t => t.DisplayOrder)
                    .ThenBy(t => t.Name)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active trackers for user {UserId}", userId);
                throw;
            }
        }

        public async Task<Tracker?> GetTrackerByUserAndNameAsync(string? userId, string name, CancellationToken cancellationToken = default)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(name))
                    throw new ArgumentException("Tracker name cannot be null or empty", nameof(name));

                _logger.LogDebug("Getting tracker by name {TrackerName} for user {UserId}", name, userId ?? "anonymous");
                
                return await _dbSet
                    .Where(t => t.UserId == userId && t.Name == name)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tracker by name {TrackerName} for user {UserId}", name, userId);
                throw;
            }
        }

        // Sharing operations
        public async Task<IEnumerable<Tracker>> GetSharedTrackersAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting shared trackers");
                
                return await _dbSet
                    .Where(t => t.IsShared && t.IsActive)
                    .AsNoTracking()
                    .OrderBy(t => t.Name)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting shared trackers");
                throw;
            }
        }

        public async Task<bool> IsTrackerSharedAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Checking if tracker {TrackerId} is shared", trackerId);
                
                return await _dbSet
                    .Where(t => t.Id == trackerId)
                    .Select(t => t.IsShared)
                    .FirstOrDefaultAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if tracker {TrackerId} is shared", trackerId);
                throw;
            }
        }

        public async Task SetTrackerSharingStatusAsync(int trackerId, bool isShared, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Setting tracker {TrackerId} sharing status to {IsShared}", trackerId, isShared);
                
                var tracker = await _dbSet.FindAsync([trackerId], cancellationToken).ConfigureAwait(false);
                if (tracker != null)
                {
                    tracker.IsShared = isShared;
                    tracker.UpdatedAt = DateTime.UtcNow;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting sharing status for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        // Display order operations
        public async Task<IEnumerable<Tracker>> GetTrackersOrderedByDisplayOrderAsync(string? userId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting trackers ordered by display order for user {UserId}", userId ?? "anonymous");
                
                return await _dbSet
                    .Where(t => t.UserId == userId && t.IsActive)
                    .OrderBy(t => t.DisplayOrder)
                    .ThenBy(t => t.Name)
                    .AsNoTracking()
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting ordered trackers for user {UserId}", userId);
                throw;
            }
        }

        public async Task UpdateDisplayOrderAsync(int trackerId, int displayOrder, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Updating display order for tracker {TrackerId} to {DisplayOrder}", trackerId, displayOrder);
                
                var tracker = await _dbSet.FindAsync([trackerId], cancellationToken).ConfigureAwait(false);
                if (tracker != null)
                {
                    tracker.DisplayOrder = displayOrder;
                    tracker.UpdatedAt = DateTime.UtcNow;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating display order for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task ReorderTrackersAsync(string? userId, List<(int TrackerId, int DisplayOrder)> trackerOrders, CancellationToken cancellationToken = default)
        {
            try
            {
                if (trackerOrders == null || !trackerOrders.Any())
                    return;

                _logger.LogDebug("Reordering {Count} trackers for user {UserId}", trackerOrders.Count, userId ?? "anonymous");
                
                var trackerIds = trackerOrders.Select(to => to.TrackerId).ToList();
                var trackers = await _dbSet
                    .Where(t => t.UserId == userId && trackerIds.Contains(t.Id))
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);

                foreach (var tracker in trackers)
                {
                    var orderInfo = trackerOrders.FirstOrDefault(to => to.TrackerId == tracker.Id);
                    if (orderInfo != default)
                    {
                        tracker.DisplayOrder = orderInfo.DisplayOrder;
                        tracker.UpdatedAt = DateTime.UtcNow;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reordering trackers for user {UserId}", userId);
                throw;
            }
        }

        // Advanced queries with relationships
        public async Task<Tracker?> GetTrackerWithHabitsAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting tracker {TrackerId} with habits", trackerId);
                
                return await _dbSet
                    .Include(t => t.Habits)
                    .FirstOrDefaultAsync(t => t.Id == trackerId, cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tracker {TrackerId} with habits", trackerId);
                throw;
            }
        }

        public async Task<Tracker?> GetTrackerWithActiveHabitsAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting tracker {TrackerId} with active habits", trackerId);
                
                return await _dbSet
                    .Include(t => t.Habits.Where(h => h.IsActive))
                    .FirstOrDefaultAsync(t => t.Id == trackerId, cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tracker {TrackerId} with active habits", trackerId);
                throw;
            }
        }

        public async Task<IEnumerable<Tracker>> GetTrackersWithHabitCountsAsync(string? userId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting trackers with habit counts for user {UserId}", userId ?? "anonymous");
                
                return await _dbSet
                    .Where(t => t.UserId == userId && t.IsActive)
                    .Select(t => new Tracker
                    {
                        Id = t.Id,
                        Name = t.Name,
                        Description = t.Description,
                        UserId = t.UserId,
                        IsShared = t.IsShared,
                        CreatedAt = t.CreatedAt,
                        UpdatedAt = t.UpdatedAt,
                        IsActive = t.IsActive,
                        DisplayOrder = t.DisplayOrder,
                        Habits = t.Habits.Where(h => h.IsActive).ToList()
                    })
                    .AsNoTracking()
                    .OrderBy(t => t.DisplayOrder)
                    .ThenBy(t => t.Name)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting trackers with habit counts for user {UserId}", userId);
                throw;
            }
        }

        // Business logic operations
        public async Task<bool> CanUserAccessTrackerAsync(string? userId, int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Checking if user {UserId} can access tracker {TrackerId}", userId ?? "anonymous", trackerId);
                
                return await _dbSet
                    .Where(t => t.Id == trackerId && (t.UserId == userId || t.IsShared))
                    .AnyAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking access for user {UserId} to tracker {TrackerId}", userId, trackerId);
                throw;
            }
        }

        public async Task<bool> IsTrackerNameUniqueForUserAsync(string? userId, string name, int? excludeTrackerId = null, CancellationToken cancellationToken = default)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(name))
                    return false;

                _logger.LogDebug("Checking if tracker name {TrackerName} is unique for user {UserId}", name, userId ?? "anonymous");
                
                var query = _dbSet.Where(t => t.UserId == userId && t.Name == name);
                
                if (excludeTrackerId.HasValue)
                    query = query.Where(t => t.Id != excludeTrackerId.Value);

                return !await query.AnyAsync(cancellationToken).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking name uniqueness for tracker {TrackerName} and user {UserId}", name, userId);
                throw;
            }
        }

        public async Task<int> GetActiveHabitCountAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting active habit count for tracker {TrackerId}", trackerId);
                
                return await _context.Habits
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

        // Soft delete operations
        public async Task SoftDeleteAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Soft deleting tracker {TrackerId}", trackerId);
                
                var tracker = await _dbSet.FindAsync([trackerId], cancellationToken).ConfigureAwait(false);
                if (tracker != null)
                {
                    tracker.IsActive = false;
                    tracker.UpdatedAt = DateTime.UtcNow;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error soft deleting tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task RestoreAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Restoring tracker {TrackerId}", trackerId);
                
                var tracker = await _dbSet.FindAsync([trackerId], cancellationToken).ConfigureAwait(false);
                if (tracker != null)
                {
                    tracker.IsActive = true;
                    tracker.UpdatedAt = DateTime.UtcNow;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error restoring tracker {TrackerId}", trackerId);
                throw;
            }
        }

        // Statistics and analytics
        public async Task<Dictionary<int, int>> GetHabitCountsByTrackerAsync(string? userId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting habit counts by tracker for user {UserId}", userId ?? "anonymous");
                
                return await _dbSet
                    .Where(t => t.UserId == userId && t.IsActive)
                    .ToDictionaryAsync(
                        t => t.Id,
                        t => t.Habits.Count(h => h.IsActive),
                        cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting habit counts by tracker for user {UserId}", userId);
                throw;
            }
        }

        public async Task<DateTime?> GetLastActivityDateAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting last activity date for tracker {TrackerId}", trackerId);
                
                // Get the most recent completion date across all habits in the tracker
                var lastCompletionDate = await _context.HabitCompletions
                    .Where(hc => hc.Habit.TrackerId == trackerId)
                    .OrderByDescending(hc => hc.CompletionDate)
                    .Select(hc => (DateTime?)hc.CreatedAt)
                    .FirstOrDefaultAsync(cancellationToken)
                    .ConfigureAwait(false);

                // Get the tracker's last update date
                var lastUpdateDate = await _dbSet
                    .Where(t => t.Id == trackerId)
                    .Select(t => t.UpdatedAt)
                    .FirstOrDefaultAsync(cancellationToken)
                    .ConfigureAwait(false);

                // Return the most recent date
                if (lastCompletionDate.HasValue && lastCompletionDate > lastUpdateDate)
                    return lastCompletionDate;
                
                return lastUpdateDate;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting last activity date for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        // Save changes for repository operations
        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Saving changes to database");
                return await _context.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving changes to database");
                throw;
            }
        }
    }
}