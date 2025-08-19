using HabitTracker.Application.Interfaces;
using HabitTracker.Domain.Entities;
using HabitTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HabitTracker.Infrastructure.Repositories
{
    public class HabitCompletionRepository : GenericRepository<HabitCompletion>, IHabitCompletionRepository
    {
        public HabitCompletionRepository(HabitTrackerDbContext context, ILogger<HabitCompletionRepository> logger) 
            : base(context, logger)
        {
        }

        // Basic completion operations
        public async Task<HabitCompletion?> GetCompletionByHabitAndDateAsync(int habitId, DateTime date, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting completion for habit {HabitId} on date {Date}", habitId, date);
                
                var dateOnly = date.Date; // Normalize to date only
                return await _dbSet
                    .FirstOrDefaultAsync(hc => hc.HabitId == habitId && hc.CompletionDate.Date == dateOnly, cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting completion for habit {HabitId} on date {Date}", habitId, date);
                throw;
            }
        }

        public async Task<IEnumerable<HabitCompletion>> GetCompletionsByHabitIdAsync(int habitId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting all completions for habit {HabitId}", habitId);
                
                return await _dbSet
                    .Where(hc => hc.HabitId == habitId)
                    .AsNoTracking()
                    .OrderByDescending(hc => hc.CompletionDate)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting completions for habit {HabitId}", habitId);
                throw;
            }
        }

        public async Task<IEnumerable<HabitCompletion>> GetCompletionsByTrackerIdAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting all completions for tracker {TrackerId}", trackerId);
                
                return await _dbSet
                    .Where(hc => hc.Habit.TrackerId == trackerId)
                    .AsNoTracking()
                    .OrderByDescending(hc => hc.CompletionDate)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting completions for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        // Date-based queries
        public async Task<IEnumerable<HabitCompletion>> GetCompletionsByDateAsync(DateTime date, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting all completions for date {Date}", date);
                
                var dateOnly = date.Date; // Normalize to date only
                return await _dbSet
                    .Where(hc => hc.CompletionDate.Date == dateOnly)
                    .Include(hc => hc.Habit)
                    .AsNoTracking()
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting completions for date {Date}", date);
                throw;
            }
        }

        public async Task<IEnumerable<HabitCompletion>> GetCompletionsByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting completions between {StartDate} and {EndDate}", startDate, endDate);
                
                var startDateOnly = startDate.Date;
                var endDateOnly = endDate.Date;
                
                return await _dbSet
                    .Where(hc => hc.CompletionDate.Date >= startDateOnly && hc.CompletionDate.Date <= endDateOnly)
                    .Include(hc => hc.Habit)
                    .AsNoTracking()
                    .OrderBy(hc => hc.CompletionDate)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting completions between dates");
                throw;
            }
        }

        public async Task<IEnumerable<HabitCompletion>> GetCompletionsByHabitAndDateRangeAsync(int habitId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting completions for habit {HabitId} between {StartDate} and {EndDate}", habitId, startDate, endDate);
                
                var startDateOnly = startDate.Date;
                var endDateOnly = endDate.Date;
                
                return await _dbSet
                    .Where(hc => hc.HabitId == habitId && hc.CompletionDate.Date >= startDateOnly && hc.CompletionDate.Date <= endDateOnly)
                    .AsNoTracking()
                    .OrderBy(hc => hc.CompletionDate)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting completions for habit {HabitId} between dates", habitId);
                throw;
            }
        }

        public async Task<IEnumerable<HabitCompletion>> GetCompletionsByTrackerAndDateRangeAsync(int trackerId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting completions for tracker {TrackerId} between {StartDate} and {EndDate}", trackerId, startDate, endDate);
                
                var startDateOnly = startDate.Date;
                var endDateOnly = endDate.Date;
                
                return await _dbSet
                    .Where(hc => hc.Habit.TrackerId == trackerId && hc.CompletionDate.Date >= startDateOnly && hc.CompletionDate.Date <= endDateOnly)
                    .Include(hc => hc.Habit)
                    .AsNoTracking()
                    .OrderBy(hc => hc.CompletionDate)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting completions for tracker {TrackerId} between dates", trackerId);
                throw;
            }
        }

        // Recent completion operations
        public async Task<IEnumerable<HabitCompletion>> GetRecentCompletionsAsync(int habitId, int days = 30, CancellationToken cancellationToken = default)
        {
            try
            {
                var cutoffDate = DateTime.UtcNow.AddDays(-days).Date;
                _logger.LogDebug("Getting recent completions for habit {HabitId} since {CutoffDate}", habitId, cutoffDate);
                
                return await _dbSet
                    .Where(hc => hc.HabitId == habitId && hc.CompletionDate.Date >= cutoffDate)
                    .AsNoTracking()
                    .OrderByDescending(hc => hc.CompletionDate)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent completions for habit {HabitId}", habitId);
                throw;
            }
        }

        public async Task<IEnumerable<HabitCompletion>> GetRecentCompletionsByTrackerAsync(int trackerId, int days = 30, CancellationToken cancellationToken = default)
        {
            try
            {
                var cutoffDate = DateTime.UtcNow.AddDays(-days).Date;
                _logger.LogDebug("Getting recent completions for tracker {TrackerId} since {CutoffDate}", trackerId, cutoffDate);
                
                return await _dbSet
                    .Where(hc => hc.Habit.TrackerId == trackerId && hc.CompletionDate.Date >= cutoffDate)
                    .Include(hc => hc.Habit)
                    .AsNoTracking()
                    .OrderByDescending(hc => hc.CompletionDate)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent completions for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<HabitCompletion?> GetLastCompletionAsync(int habitId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting last completion for habit {HabitId}", habitId);
                
                return await _dbSet
                    .Where(hc => hc.HabitId == habitId && hc.IsCompleted)
                    .AsNoTracking()
                    .OrderByDescending(hc => hc.CompletionDate)
                    .FirstOrDefaultAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting last completion for habit {HabitId}", habitId);
                throw;
            }
        }

        public async Task<HabitCompletion?> GetFirstCompletionAsync(int habitId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting first completion for habit {HabitId}", habitId);
                
                return await _dbSet
                    .Where(hc => hc.HabitId == habitId && hc.IsCompleted)
                    .AsNoTracking()
                    .OrderBy(hc => hc.CompletionDate)
                    .FirstOrDefaultAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting first completion for habit {HabitId}", habitId);
                throw;
            }
        }

        // Completion status operations
        public async Task<bool> IsHabitCompletedOnDateAsync(int habitId, DateOnly date, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Checking if habit {HabitId} is completed on {Date}", habitId, date);
                
                var dateTime = date.ToDateTime(TimeOnly.MinValue);
                return await _dbSet
                    .AnyAsync(hc => hc.HabitId == habitId && hc.CompletionDate.Date == dateTime.Date && hc.IsCompleted, cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking completion status for habit {HabitId} on {Date}", habitId, date);
                throw;
            }
        }

        public async Task<IEnumerable<DateOnly>> GetCompletedDatesAsync(int habitId, DateOnly? startDate = null, DateOnly? endDate = null, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting completed dates for habit {HabitId}", habitId);
                
                var query = _dbSet.Where(hc => hc.HabitId == habitId && hc.IsCompleted);
                
                if (startDate.HasValue)
                {
                    var startDateTime = startDate.Value.ToDateTime(TimeOnly.MinValue).Date;
                    query = query.Where(hc => hc.CompletionDate.Date >= startDateTime);
                }
                
                if (endDate.HasValue)
                {
                    var endDateTime = endDate.Value.ToDateTime(TimeOnly.MinValue).Date;
                    query = query.Where(hc => hc.CompletionDate.Date <= endDateTime);
                }

                var completions = await query
                    .AsNoTracking()
                    .Select(hc => hc.CompletionDate.Date)
                    .OrderBy(d => d)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);

                return completions.Select(d => DateOnly.FromDateTime(d));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting completed dates for habit {HabitId}", habitId);
                throw;
            }
        }

        public async Task<IEnumerable<DateOnly>> GetMissedDatesAsync(int habitId, DateOnly startDate, DateOnly endDate, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting missed dates for habit {HabitId} between {StartDate} and {EndDate}", habitId, startDate, endDate);
                
                // Get all completed dates in the range
                var completedDates = await GetCompletedDatesAsync(habitId, startDate, endDate, cancellationToken);
                var completedDatesSet = new HashSet<DateOnly>(completedDates);
                
                // Generate all dates in the range
                var allDates = new List<DateOnly>();
                var currentDate = startDate;
                while (currentDate <= endDate)
                {
                    allDates.Add(currentDate);
                    currentDate = currentDate.AddDays(1);
                }
                
                // Return dates that are not completed
                return allDates.Where(date => !completedDatesSet.Contains(date));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting missed dates for habit {HabitId}", habitId);
                throw;
            }
        }

        // Advanced queries with relationships
        public async Task<IEnumerable<HabitCompletion>> GetCompletionsWithHabitAsync(int trackerId, DateOnly? date = null, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting completions with habit for tracker {TrackerId} on date {Date}", trackerId, date);
                
                var query = _dbSet
                    .Where(hc => hc.Habit.TrackerId == trackerId);
                
                if (date.HasValue)
                {
                    var dateTime = date.Value.ToDateTime(TimeOnly.MinValue).Date;
                    query = query.Where(hc => hc.CompletionDate.Date == dateTime);
                }

                return await query
                    .Include(hc => hc.Habit)
                    .AsNoTracking()
                    .OrderByDescending(hc => hc.CompletionDate)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting completions with habit for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<IEnumerable<HabitCompletion>> GetCompletionsWithHabitAndTrackerAsync(string? userId, DateOnly? date = null, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting completions with habit and tracker for user {UserId} on date {Date}", userId ?? "anonymous", date);
                
                var query = _dbSet
                    .Where(hc => hc.Habit.Tracker.UserId == userId);
                
                if (date.HasValue)
                {
                    var dateTime = date.Value.ToDateTime(TimeOnly.MinValue).Date;
                    query = query.Where(hc => hc.CompletionDate.Date == dateTime);
                }

                return await query
                    .Include(hc => hc.Habit)
                        .ThenInclude(h => h.Tracker)
                    .AsNoTracking()
                    .OrderByDescending(hc => hc.CompletionDate)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting completions with habit and tracker for user {UserId}", userId);
                throw;
            }
        }

        // Completion management
        public async Task<HabitCompletion> ToggleCompletionAsync(int habitId, DateOnly date, string? notes = null, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Toggling completion for habit {HabitId} on {Date}", habitId, date);
                
                var dateTime = date.ToDateTime(TimeOnly.MinValue);
                var existingCompletion = await GetCompletionByHabitAndDateAsync(habitId, dateTime, cancellationToken);
                
                if (existingCompletion != null)
                {
                    // Toggle the completion status
                    existingCompletion.IsCompleted = !existingCompletion.IsCompleted;
                    existingCompletion.Notes = notes;
                    existingCompletion.UpdatedAt = DateTime.UtcNow;
                    return existingCompletion;
                }
                else
                {
                    // Create new completion record
                    var newCompletion = new HabitCompletion
                    {
                        HabitId = habitId,
                        CompletionDate = dateTime,
                        IsCompleted = true,
                        Notes = notes,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    
                    await _dbSet.AddAsync(newCompletion, cancellationToken);
                    return newCompletion;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error toggling completion for habit {HabitId} on {Date}", habitId, date);
                throw;
            }
        }

        public async Task<HabitCompletion> MarkAsCompletedAsync(int habitId, DateOnly date, string? notes = null, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Marking habit {HabitId} as completed on {Date}", habitId, date);
                
                var dateTime = date.ToDateTime(TimeOnly.MinValue);
                var existingCompletion = await GetCompletionByHabitAndDateAsync(habitId, dateTime, cancellationToken);
                
                if (existingCompletion != null)
                {
                    existingCompletion.IsCompleted = true;
                    existingCompletion.Notes = notes;
                    existingCompletion.UpdatedAt = DateTime.UtcNow;
                    return existingCompletion;
                }
                else
                {
                    var newCompletion = new HabitCompletion
                    {
                        HabitId = habitId,
                        CompletionDate = dateTime,
                        IsCompleted = true,
                        Notes = notes,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    
                    await _dbSet.AddAsync(newCompletion, cancellationToken);
                    return newCompletion;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking habit {HabitId} as completed on {Date}", habitId, date);
                throw;
            }
        }

        public async Task<HabitCompletion> MarkAsIncompleteAsync(int habitId, DateOnly date, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Marking habit {HabitId} as incomplete on {Date}", habitId, date);
                
                var dateTime = date.ToDateTime(TimeOnly.MinValue);
                var existingCompletion = await GetCompletionByHabitAndDateAsync(habitId, dateTime, cancellationToken);
                
                if (existingCompletion != null)
                {
                    existingCompletion.IsCompleted = false;
                    existingCompletion.UpdatedAt = DateTime.UtcNow;
                    return existingCompletion;
                }
                else
                {
                    var newCompletion = new HabitCompletion
                    {
                        HabitId = habitId,
                        CompletionDate = dateTime,
                        IsCompleted = false,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    
                    await _dbSet.AddAsync(newCompletion, cancellationToken);
                    return newCompletion;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking habit {HabitId} as incomplete on {Date}", habitId, date);
                throw;
            }
        }

        public async Task<bool> RemoveCompletionAsync(int habitId, DateOnly date, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Removing completion for habit {HabitId} on {Date}", habitId, date);
                
                var dateTime = date.ToDateTime(TimeOnly.MinValue);
                var completion = await GetCompletionByHabitAndDateAsync(habitId, dateTime, cancellationToken);
                
                if (completion != null)
                {
                    _dbSet.Remove(completion);
                    return true;
                }
                
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing completion for habit {HabitId} on {Date}", habitId, date);
                throw;
            }
        }

        // Bulk operations
        public async Task<IEnumerable<HabitCompletion>> MarkMultipleCompletedAsync(IEnumerable<(int HabitId, DateOnly Date, string? Notes)> completions, CancellationToken cancellationToken = default)
        {
            try
            {
                if (completions == null)
                    throw new ArgumentNullException(nameof(completions));

                var completionList = completions.ToList();
                _logger.LogDebug("Marking {Count} habits as completed", completionList.Count);
                
                var results = new List<HabitCompletion>();
                
                foreach (var (habitId, date, notes) in completionList)
                {
                    var completion = await MarkAsCompletedAsync(habitId, date, notes, cancellationToken);
                    results.Add(completion);
                }
                
                return results;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking multiple habits as completed");
                throw;
            }
        }

        public async Task<bool> RemoveMultipleCompletionsAsync(IEnumerable<(int HabitId, DateOnly Date)> completions, CancellationToken cancellationToken = default)
        {
            try
            {
                if (completions == null)
                    throw new ArgumentNullException(nameof(completions));

                var completionList = completions.ToList();
                _logger.LogDebug("Removing {Count} completions", completionList.Count);
                
                var success = true;
                foreach (var (habitId, date) in completionList)
                {
                    var removed = await RemoveCompletionAsync(habitId, date, cancellationToken);
                    if (!removed) success = false;
                }
                
                return success;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing multiple completions");
                throw;
            }
        }

        public async Task<IEnumerable<HabitCompletion>> GetOrCreateCompletionsForDateAsync(int trackerId, DateOnly date, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting or creating completions for tracker {TrackerId} on {Date}", trackerId, date);
                
                // Get existing completions for the date
                var existingCompletions = await GetCompletionsWithHabitAsync(trackerId, date, cancellationToken);
                var existingHabitIds = existingCompletions.Select(c => c.HabitId).ToHashSet();
                
                // Get all active habits in the tracker
                var allActiveHabits = await _context.Habits
                    .Where(h => h.TrackerId == trackerId && h.IsActive)
                    .Select(h => h.Id)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
                
                // Create completions for habits that don't have them
                var newCompletions = new List<HabitCompletion>();
                var dateTime = date.ToDateTime(TimeOnly.MinValue);
                
                foreach (var habitId in allActiveHabits.Where(id => !existingHabitIds.Contains(id)))
                {
                    var newCompletion = new HabitCompletion
                    {
                        HabitId = habitId,
                        CompletionDate = dateTime,
                        IsCompleted = false,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    
                    await _dbSet.AddAsync(newCompletion, cancellationToken);
                    newCompletions.Add(newCompletion);
                }
                
                return existingCompletions.Concat(newCompletions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting or creating completions for tracker {TrackerId} on {Date}", trackerId, date);
                throw;
            }
        }

        // Statistics and aggregations
        public async Task<int> GetCompletionCountAsync(int habitId, DateOnly? startDate = null, DateOnly? endDate = null, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting completion count for habit {HabitId}", habitId);
                
                var query = _dbSet.Where(hc => hc.HabitId == habitId && hc.IsCompleted);
                
                if (startDate.HasValue)
                {
                    var startDateTime = startDate.Value.ToDateTime(TimeOnly.MinValue).Date;
                    query = query.Where(hc => hc.CompletionDate.Date >= startDateTime);
                }
                
                if (endDate.HasValue)
                {
                    var endDateTime = endDate.Value.ToDateTime(TimeOnly.MinValue).Date;
                    query = query.Where(hc => hc.CompletionDate.Date <= endDateTime);
                }

                return await query.CountAsync(cancellationToken).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting completion count for habit {HabitId}", habitId);
                throw;
            }
        }

        public async Task<int> GetCompletionCountByTrackerAsync(int trackerId, DateOnly? startDate = null, DateOnly? endDate = null, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting completion count for tracker {TrackerId}", trackerId);
                
                var query = _dbSet.Where(hc => hc.Habit.TrackerId == trackerId && hc.IsCompleted);
                
                if (startDate.HasValue)
                {
                    var startDateTime = startDate.Value.ToDateTime(TimeOnly.MinValue).Date;
                    query = query.Where(hc => hc.CompletionDate.Date >= startDateTime);
                }
                
                if (endDate.HasValue)
                {
                    var endDateTime = endDate.Value.ToDateTime(TimeOnly.MinValue).Date;
                    query = query.Where(hc => hc.CompletionDate.Date <= endDateTime);
                }

                return await query.CountAsync(cancellationToken).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting completion count for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<double> GetCompletionRateAsync(int habitId, DateOnly? startDate = null, DateOnly? endDate = null, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting completion rate for habit {HabitId}", habitId);
                
                // If no date range specified, use from first completion to today
                if (!startDate.HasValue)
                {
                    var firstCompletion = await GetFirstCompletionAsync(habitId, cancellationToken);
                    startDate = firstCompletion != null ? DateOnly.FromDateTime(firstCompletion.CompletionDate) : DateOnly.FromDateTime(DateTime.UtcNow);
                }
                
                if (!endDate.HasValue)
                    endDate = DateOnly.FromDateTime(DateTime.UtcNow);

                var totalDays = (endDate.Value.DayNumber - startDate.Value.DayNumber) + 1;
                var completedDays = await GetCompletionCountAsync(habitId, startDate, endDate, cancellationToken);
                
                return totalDays > 0 ? (double)completedDays / totalDays * 100.0 : 0.0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting completion rate for habit {HabitId}", habitId);
                throw;
            }
        }

        public async Task<double> GetCompletionRateByTrackerAsync(int trackerId, DateOnly? startDate = null, DateOnly? endDate = null, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting completion rate for tracker {TrackerId}", trackerId);
                
                // Get all active habits in tracker
                var activeHabits = await _context.Habits
                    .Where(h => h.TrackerId == trackerId && h.IsActive)
                    .CountAsync(cancellationToken)
                    .ConfigureAwait(false);

                if (activeHabits == 0)
                    return 0.0;

                // Set default date range if not provided
                if (!startDate.HasValue)
                    startDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-30));
                
                if (!endDate.HasValue)
                    endDate = DateOnly.FromDateTime(DateTime.UtcNow);

                var totalDays = (endDate.Value.DayNumber - startDate.Value.DayNumber) + 1;
                var totalPossibleCompletions = totalDays * activeHabits;
                var actualCompletions = await GetCompletionCountByTrackerAsync(trackerId, startDate, endDate, cancellationToken);
                
                return totalPossibleCompletions > 0 ? (double)actualCompletions / totalPossibleCompletions * 100.0 : 0.0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting completion rate for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        // Streak calculation support
        public async Task<IEnumerable<DateOnly>> GetConsecutiveCompletionDatesAsync(int habitId, DateOnly fromDate, bool backwards = false, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting consecutive completion dates for habit {HabitId} from {FromDate} (backwards: {Backwards})", habitId, fromDate, backwards);
                
                var completedDates = await GetCompletedDatesAsync(habitId, cancellationToken: cancellationToken);
                var sortedDates = backwards 
                    ? completedDates.Where(d => d <= fromDate).OrderByDescending(d => d).ToList()
                    : completedDates.Where(d => d >= fromDate).OrderBy(d => d).ToList();
                
                var consecutiveDates = new List<DateOnly>();
                DateOnly? expectedDate = fromDate;
                
                foreach (var date in sortedDates)
                {
                    if (date == expectedDate)
                    {
                        consecutiveDates.Add(date);
                        expectedDate = backwards ? date.AddDays(-1) : date.AddDays(1);
                    }
                    else
                    {
                        break;
                    }
                }
                
                return consecutiveDates;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting consecutive completion dates for habit {HabitId}", habitId);
                throw;
            }
        }

        public async Task<int> GetCurrentStreakLengthAsync(int habitId, DateOnly? referenceDate = null, CancellationToken cancellationToken = default)
        {
            try
            {
                var refDate = referenceDate ?? DateOnly.FromDateTime(DateTime.UtcNow);
                _logger.LogDebug("Getting current streak length for habit {HabitId} as of {ReferenceDate}", habitId, refDate);
                
                var consecutiveDates = await GetConsecutiveCompletionDatesAsync(habitId, refDate, backwards: true, cancellationToken);
                return consecutiveDates.Count();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting current streak length for habit {HabitId}", habitId);
                throw;
            }
        }

        public async Task<(int Length, DateOnly StartDate, DateOnly EndDate)?> GetLongestStreakAsync(int habitId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting longest streak for habit {HabitId}", habitId);
                
                var completedDates = await GetCompletedDatesAsync(habitId, cancellationToken: cancellationToken);
                var sortedDates = completedDates.OrderBy(d => d).ToList();
                
                if (!sortedDates.Any())
                    return null;

                var longestStreak = (Length: 0, StartDate: sortedDates.First(), EndDate: sortedDates.First());
                var currentStreak = (Length: 1, StartDate: sortedDates.First(), EndDate: sortedDates.First());

                for (int i = 1; i < sortedDates.Count; i++)
                {
                    if (sortedDates[i] == sortedDates[i - 1].AddDays(1))
                    {
                        // Consecutive date, extend current streak
                        currentStreak.Length++;
                        currentStreak.EndDate = sortedDates[i];
                    }
                    else
                    {
                        // Not consecutive, check if current is longest and start new streak
                        if (currentStreak.Length > longestStreak.Length)
                        {
                            longestStreak = currentStreak;
                        }
                        
                        currentStreak = (Length: 1, StartDate: sortedDates[i], EndDate: sortedDates[i]);
                    }
                }
                
                // Check final streak
                if (currentStreak.Length > longestStreak.Length)
                {
                    longestStreak = currentStreak;
                }
                
                return longestStreak;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting longest streak for habit {HabitId}", habitId);
                throw;
            }
        }

        public async Task<IEnumerable<(DateOnly StartDate, DateOnly EndDate, int Length)>> GetAllStreaksAsync(int habitId, int minLength = 2, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting all streaks for habit {HabitId} with minimum length {MinLength}", habitId, minLength);
                
                var completedDates = await GetCompletedDatesAsync(habitId, cancellationToken: cancellationToken);
                var sortedDates = completedDates.OrderBy(d => d).ToList();
                
                if (!sortedDates.Any())
                    return new List<(DateOnly, DateOnly, int)>();

                var streaks = new List<(DateOnly StartDate, DateOnly EndDate, int Length)>();
                var currentStreak = (StartDate: sortedDates.First(), EndDate: sortedDates.First(), Length: 1);

                for (int i = 1; i < sortedDates.Count; i++)
                {
                    if (sortedDates[i] == sortedDates[i - 1].AddDays(1))
                    {
                        // Consecutive date, extend current streak
                        currentStreak.Length++;
                        currentStreak.EndDate = sortedDates[i];
                    }
                    else
                    {
                        // Not consecutive, save current streak if it meets minimum length and start new streak
                        if (currentStreak.Length >= minLength)
                        {
                            streaks.Add(currentStreak);
                        }
                        
                        currentStreak = (StartDate: sortedDates[i], EndDate: sortedDates[i], Length: 1);
                    }
                }
                
                // Check final streak
                if (currentStreak.Length >= minLength)
                {
                    streaks.Add(currentStreak);
                }
                
                return streaks;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all streaks for habit {HabitId}", habitId);
                throw;
            }
        }

        // Calendar and weekly views
        public async Task<Dictionary<DateOnly, bool>> GetCompletionCalendarAsync(int habitId, int year, int month, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting completion calendar for habit {HabitId} for {Year}-{Month:D2}", habitId, year, month);
                
                var startDate = new DateOnly(year, month, 1);
                var endDate = startDate.AddMonths(1).AddDays(-1);
                
                var startDateTime = startDate.ToDateTime(TimeOnly.MinValue);
                var endDateTime = endDate.ToDateTime(TimeOnly.MinValue);
                
                var completions = await GetCompletionsByHabitAndDateRangeAsync(habitId, startDateTime, endDateTime, cancellationToken);
                
                var calendar = new Dictionary<DateOnly, bool>();
                var currentDate = startDate;
                
                while (currentDate <= endDate)
                {
                    var currentDateTime = currentDate.ToDateTime(TimeOnly.MinValue);
                    var completion = completions.FirstOrDefault(c => c.CompletionDate.Date == currentDateTime.Date);
                    calendar[currentDate] = completion?.IsCompleted ?? false;
                    currentDate = currentDate.AddDays(1);
                }
                
                return calendar;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting completion calendar for habit {HabitId}", habitId);
                throw;
            }
        }

        public async Task<Dictionary<DateOnly, IEnumerable<HabitCompletion>>> GetWeeklyCompletionsAsync(int trackerId, DateOnly weekStartDate, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting weekly completions for tracker {TrackerId} starting {WeekStartDate}", trackerId, weekStartDate);
                
                var weekEndDate = weekStartDate.AddDays(6);
                var startDateTime = weekStartDate.ToDateTime(TimeOnly.MinValue);
                var endDateTime = weekEndDate.ToDateTime(TimeOnly.MinValue);
                
                var completions = await GetCompletionsByTrackerAndDateRangeAsync(trackerId, startDateTime, endDateTime, cancellationToken);
                
                return completions
                    .GroupBy(c => DateOnly.FromDateTime(c.CompletionDate))
                    .ToDictionary(g => g.Key, g => g.AsEnumerable());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting weekly completions for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<Dictionary<DateOnly, int>> GetDailyCompletionCountsAsync(int trackerId, DateOnly startDate, DateOnly endDate, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting daily completion counts for tracker {TrackerId} between {StartDate} and {EndDate}", trackerId, startDate, endDate);
                
                var startDateTime = startDate.ToDateTime(TimeOnly.MinValue).Date;
                var endDateTime = endDate.ToDateTime(TimeOnly.MinValue).Date;
                
                return await _dbSet
                    .Where(hc => hc.Habit.TrackerId == trackerId && 
                                hc.CompletionDate.Date >= startDateTime && 
                                hc.CompletionDate.Date <= endDateTime && 
                                hc.IsCompleted)
                    .GroupBy(hc => hc.CompletionDate.Date)
                    .ToDictionaryAsync(g => DateOnly.FromDateTime(g.Key), g => g.Count(), cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting daily completion counts for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        // Analytics and insights
        public async Task<Dictionary<DayOfWeek, int>> GetCompletionsByDayOfWeekAsync(int habitId, DateOnly? startDate = null, DateOnly? endDate = null, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting completions by day of week for habit {HabitId}", habitId);
                
                var query = _dbSet.Where(hc => hc.HabitId == habitId && hc.IsCompleted);
                
                if (startDate.HasValue)
                {
                    var startDateTime = startDate.Value.ToDateTime(TimeOnly.MinValue).Date;
                    query = query.Where(hc => hc.CompletionDate.Date >= startDateTime);
                }
                
                if (endDate.HasValue)
                {
                    var endDateTime = endDate.Value.ToDateTime(TimeOnly.MinValue).Date;
                    query = query.Where(hc => hc.CompletionDate.Date <= endDateTime);
                }

                return await query
                    .GroupBy(hc => hc.CompletionDate.DayOfWeek)
                    .ToDictionaryAsync(g => g.Key, g => g.Count(), cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting completions by day of week for habit {HabitId}", habitId);
                throw;
            }
        }

        public async Task<Dictionary<int, int>> GetCompletionsByMonthAsync(int habitId, int year, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting completions by month for habit {HabitId} in year {Year}", habitId, year);
                
                var startDate = new DateTime(year, 1, 1);
                var endDate = new DateTime(year, 12, 31);
                
                var completions = await _dbSet
                    .Where(hc => hc.HabitId == habitId && hc.IsCompleted && 
                              hc.CompletionDate.Date >= startDate && hc.CompletionDate.Date <= endDate)
                    .Select(hc => hc.CompletionDate.Month)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);

                return completions
                    .GroupBy(month => month)
                    .ToDictionary(g => g.Key, g => g.Count());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting completions by month for habit {HabitId} in year {Year}", habitId, year);
                throw;
            }
        }

        public async Task<Dictionary<int, double>> GetMonthlyCompletionRatesAsync(int habitId, int year, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting monthly completion rates for habit {HabitId} in year {Year}", habitId, year);
                
                var monthlyCompletions = await GetCompletionsByMonthAsync(habitId, year, cancellationToken);
                var monthlyRates = new Dictionary<int, double>();
                
                for (int month = 1; month <= 12; month++)
                {
                    var daysInMonth = DateTime.DaysInMonth(year, month);
                    var completionsInMonth = monthlyCompletions.GetValueOrDefault(month, 0);
                    var completionRate = (double)completionsInMonth / daysInMonth * 100.0;
                    monthlyRates[month] = completionRate;
                }
                
                return monthlyRates;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting monthly completion rates for habit {HabitId} in year {Year}", habitId, year);
                throw;
            }
        }

        // Data cleanup and maintenance
        public async Task<int> DeleteOldCompletionsAsync(DateOnly cutoffDate, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Deleting completions older than {CutoffDate}", cutoffDate);
                
                var cutoffDateTime = cutoffDate.ToDateTime(TimeOnly.MinValue).Date;
                var oldCompletions = await _dbSet
                    .Where(hc => hc.CompletionDate.Date < cutoffDateTime)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);

                _dbSet.RemoveRange(oldCompletions);
                return oldCompletions.Count;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting old completions");
                throw;
            }
        }

        public async Task<int> DeleteCompletionsByHabitAsync(int habitId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Deleting all completions for habit {HabitId}", habitId);
                
                var completions = await _dbSet
                    .Where(hc => hc.HabitId == habitId)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);

                _dbSet.RemoveRange(completions);
                return completions.Count;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting completions for habit {HabitId}", habitId);
                throw;
            }
        }

        public async Task<int> DeleteCompletionsByTrackerAsync(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Deleting all completions for tracker {TrackerId}", trackerId);
                
                var completions = await _dbSet
                    .Where(hc => hc.Habit.TrackerId == trackerId)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);

                _dbSet.RemoveRange(completions);
                return completions.Count;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting completions for tracker {TrackerId}", trackerId);
                throw;
            }
        }
    }
}