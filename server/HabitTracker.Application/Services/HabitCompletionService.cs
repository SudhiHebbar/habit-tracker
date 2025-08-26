using AutoMapper;
using HabitTracker.Application.DTOs.Completion;
using HabitTracker.Application.Interfaces;
using HabitTracker.Domain.Entities;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using System.Collections;

namespace HabitTracker.Application.Services
{
    public class HabitCompletionService : IHabitCompletionService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<HabitCompletionService> _logger;
        private readonly IMemoryCache _cache;
        private readonly IStreakRepository _streakRepository;
        private const string CacheKeyPrefix = "completion_";
        private readonly TimeSpan _cacheExpiration = TimeSpan.FromMinutes(5);

        public HabitCompletionService(
            IUnitOfWork unitOfWork, 
            IMapper mapper, 
            ILogger<HabitCompletionService> logger,
            IMemoryCache cache,
            IStreakRepository streakRepository)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
            _cache = cache;
            _streakRepository = streakRepository;
        }

        public async Task<CompletionResponseDto> ToggleCompletionAsync(int habitId, ToggleCompletionDto dto, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Toggling completion for habit {HabitId}", habitId);
                
                // Validate habit exists
                var habit = await _unitOfWork.Habits.GetByIdAsync(habitId, cancellationToken);
                if (habit == null)
                {
                    throw new ArgumentException($"Habit with ID {habitId} not found");
                }

                // Use current date if not provided
                var completionDate = dto.Date?.Date ?? DateTime.UtcNow.Date;
                var dateOnly = DateOnly.FromDateTime(completionDate);
                
                // Toggle completion
                var completion = await _unitOfWork.HabitCompletions.ToggleCompletionAsync(
                    habitId, 
                    dateOnly, 
                    dto.Notes, 
                    cancellationToken);
                
                // Save changes
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                
                // Calculate streaks synchronously for immediate UI feedback
                await TriggerStreakCalculationAsync(habitId, cancellationToken);
                
                // Clear cache for this habit
                InvalidateHabitCache(habitId);
                
                // Get updated streak info for response
                var streak = await _streakRepository.GetStreakByHabitIdAsync(habitId, cancellationToken);
                
                var response = _mapper.Map<CompletionResponseDto>(completion);
                response.CurrentStreak = streak?.CurrentStreak ?? 0;
                response.LongestStreak = streak?.LongestStreak ?? 0;
                
                _logger.LogInformation("Successfully toggled completion for habit {HabitId} on {Date}", habitId, completionDate);
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error toggling completion for habit {HabitId}", habitId);
                throw;
            }
        }

        public async Task<CompletionResponseDto> CompleteHabitAsync(int habitId, CompleteHabitDto dto, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Setting completion status for habit {HabitId}", habitId);
                
                // Validate habit exists
                var habit = await _unitOfWork.Habits.GetByIdAsync(habitId, cancellationToken);
                if (habit == null)
                {
                    throw new ArgumentException($"Habit with ID {habitId} not found");
                }

                var dateOnly = DateOnly.FromDateTime(dto.Date.Date);
                
                HabitCompletion completion;
                if (dto.IsCompleted)
                {
                    completion = await _unitOfWork.HabitCompletions.MarkAsCompletedAsync(
                        habitId, 
                        dateOnly, 
                        dto.Notes, 
                        cancellationToken);
                }
                else
                {
                    completion = await _unitOfWork.HabitCompletions.MarkAsIncompleteAsync(
                        habitId, 
                        dateOnly, 
                        cancellationToken);
                }
                
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                
                // Calculate streaks synchronously for immediate UI feedback
                await TriggerStreakCalculationAsync(habitId, cancellationToken);
                
                // Clear cache
                InvalidateHabitCache(habitId);
                
                // Get updated streak info
                var streak = await _streakRepository.GetStreakByHabitIdAsync(habitId, cancellationToken);
                
                var response = _mapper.Map<CompletionResponseDto>(completion);
                response.CurrentStreak = streak?.CurrentStreak ?? 0;
                response.LongestStreak = streak?.LongestStreak ?? 0;
                
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting completion status for habit {HabitId}", habitId);
                throw;
            }
        }

        public async Task<IEnumerable<CompletionResponseDto>> GetCompletionsAsync(int habitId, DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default)
        {
            try
            {
                var cacheKey = $"{CacheKeyPrefix}list_{habitId}_{startDate?.Ticks}_{endDate?.Ticks}";
                
                if (_cache.TryGetValue<IEnumerable<CompletionResponseDto>>(cacheKey, out var cached))
                {
                    return cached!;
                }
                
                IEnumerable<HabitCompletion> completions;
                
                if (startDate.HasValue && endDate.HasValue)
                {
                    completions = await _unitOfWork.HabitCompletions.GetCompletionsByHabitAndDateRangeAsync(
                        habitId, 
                        startDate.Value, 
                        endDate.Value, 
                        cancellationToken);
                }
                else
                {
                    completions = await _unitOfWork.HabitCompletions.GetCompletionsByHabitIdAsync(
                        habitId, 
                        cancellationToken);
                }
                
                var result = _mapper.Map<IEnumerable<CompletionResponseDto>>(completions);
                
                _cache.Set(cacheKey, result, _cacheExpiration);
                
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting completions for habit {HabitId}", habitId);
                throw;
            }
        }

        public async Task<CompletionStatusDto> GetCompletionStatusAsync(int habitId, DateTime date, CancellationToken cancellationToken = default)
        {
            try
            {
                var dateOnly = DateOnly.FromDateTime(date.Date);
                var isCompleted = await _unitOfWork.HabitCompletions.IsHabitCompletedOnDateAsync(
                    habitId, 
                    dateOnly, 
                    cancellationToken);
                
                var streak = await _streakRepository.GetStreakByHabitIdAsync(habitId, cancellationToken);
                var lastCompletion = await _unitOfWork.HabitCompletions.GetLastCompletionAsync(
                    habitId, 
                    cancellationToken);
                
                return new CompletionStatusDto
                {
                    HabitId = habitId,
                    Date = date,
                    IsCompleted = isCompleted,
                    CurrentStreak = streak?.CurrentStreak ?? 0,
                    LongestStreak = streak?.LongestStreak ?? 0,
                    LastCompletedDate = lastCompletion?.CompletionDate
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting completion status for habit {HabitId}", habitId);
                throw;
            }
        }

        public async Task<BulkCompletionResponseDto> BulkToggleCompletionsAsync(BulkCompletionDto dto, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Bulk toggling {Count} completions", dto.HabitIds.Count);
                
                var response = new BulkCompletionResponseDto();
                var dateOnly = DateOnly.FromDateTime(dto.Date.Date);
                
                foreach (var habitId in dto.HabitIds)
                {
                    try
                    {
                        var completion = await _unitOfWork.HabitCompletions.ToggleCompletionAsync(
                            habitId, 
                            dateOnly, 
                            dto.Notes, 
                            cancellationToken);
                        
                        var completionDto = _mapper.Map<CompletionResponseDto>(completion);
                        response.Completions.Add(completionDto);
                        response.SuccessCount++;
                        
                        // Clear cache for each habit
                        InvalidateHabitCache(habitId);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to toggle completion for habit {HabitId}", habitId);
                        response.FailureCount++;
                        response.Errors.Add($"Failed to toggle habit {habitId}: {ex.Message}");
                    }
                }
                
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                
                // Calculate streaks synchronously for all habits
                foreach (var habitId in dto.HabitIds)
                {
                    await TriggerStreakCalculationAsync(habitId, cancellationToken);
                }
                
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk toggle completions");
                throw;
            }
        }

        public async Task<CompletionHistoryDto> GetCompletionHistoryAsync(int habitId, int page = 1, int pageSize = 30, CancellationToken cancellationToken = default)
        {
            try
            {
                var completions = await _unitOfWork.HabitCompletions.GetCompletionsByHabitIdAsync(
                    habitId, 
                    cancellationToken);
                
                var completionsList = completions.ToList();
                var totalCompletions = completionsList.Count;
                var totalPages = (int)Math.Ceiling(totalCompletions / (double)pageSize);
                
                var pagedCompletions = completionsList
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize);
                
                var completionRate = await _unitOfWork.HabitCompletions.GetCompletionRateAsync(
                    habitId, 
                    cancellationToken: cancellationToken);
                
                return new CompletionHistoryDto
                {
                    HabitId = habitId,
                    Completions = _mapper.Map<List<CompletionResponseDto>>(pagedCompletions),
                    TotalCompletions = totalCompletions,
                    CompletionRate = completionRate,
                    CurrentPage = page,
                    TotalPages = totalPages
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting completion history for habit {HabitId}", habitId);
                throw;
            }
        }

        public async Task<WeeklyCompletionDto> GetWeeklyCompletionsAsync(int trackerId, DateTime weekStartDate, CancellationToken cancellationToken = default)
        {
            try
            {
                var startDateOnly = DateOnly.FromDateTime(weekStartDate.Date);
                var endDateOnly = startDateOnly.AddDays(6);
                
                var completions = await _unitOfWork.HabitCompletions.GetWeeklyCompletionsAsync(
                    trackerId, 
                    startDateOnly, 
                    cancellationToken);
                
                var habits = await _unitOfWork.Habits.GetActiveHabitsByTrackerIdAsync(trackerId, cancellationToken);
                var habitDict = habits.ToDictionary(h => h.Id);
                
                var completionsByDate = new Dictionary<DateTime, List<CompletionItemDto>>();
                
                foreach (var (date, dayCompletions) in completions)
                {
                    var items = dayCompletions.Select(c => new CompletionItemDto
                    {
                        HabitId = c.HabitId,
                        HabitName = habitDict.ContainsKey(c.HabitId) ? habitDict[c.HabitId].Name : "Unknown",
                        HabitColor = habitDict.ContainsKey(c.HabitId) ? habitDict[c.HabitId].Color : "#000000",
                        HabitIcon = habitDict.ContainsKey(c.HabitId) ? habitDict[c.HabitId].Icon : null,
                        IsCompleted = c.IsCompleted
                    }).ToList();
                    
                    completionsByDate[date.ToDateTime(TimeOnly.MinValue)] = items;
                }
                
                var totalCompletions = completions.Sum(c => c.Value.Count(comp => comp.IsCompleted));
                var totalPossible = habits.Count() * 7;
                var completionRate = totalPossible > 0 ? (double)totalCompletions / totalPossible * 100 : 0;
                
                return new WeeklyCompletionDto
                {
                    TrackerId = trackerId,
                    WeekStartDate = weekStartDate,
                    WeekEndDate = endDateOnly.ToDateTime(TimeOnly.MinValue),
                    CompletionsByDate = completionsByDate,
                    TotalCompletions = totalCompletions,
                    CompletionRate = completionRate
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting weekly completions for tracker {TrackerId}", trackerId);
                throw;
            }
        }

        public async Task<CompletionStatsDto> GetCompletionStatsAsync(int habitId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Getting completion stats for habit {HabitId}", habitId);
                var totalCompletions = await _unitOfWork.HabitCompletions.GetCompletionCountAsync(
                    habitId, 
                    null, 
                    null, 
                    cancellationToken);
                
                var streak = await _streakRepository.GetStreakByHabitIdAsync(habitId, cancellationToken);
                
                var completionRate = await _unitOfWork.HabitCompletions.GetCompletionRateAsync(
                    habitId, 
                    null, 
                    null, 
                    cancellationToken);
                
                var firstCompletion = await _unitOfWork.HabitCompletions.GetFirstCompletionAsync(
                    habitId, 
                    cancellationToken);
                
                var lastCompletion = await _unitOfWork.HabitCompletions.GetLastCompletionAsync(
                    habitId, 
                    cancellationToken);
                
                var completionsByDayOfWeek = await _unitOfWork.HabitCompletions.GetCompletionsByDayOfWeekAsync(
                    habitId, 
                    null, 
                    null, 
                    cancellationToken);
                
                return new CompletionStatsDto
                {
                    HabitId = habitId,
                    TotalCompletions = totalCompletions,
                    CurrentStreak = streak?.CurrentStreak ?? 0,
                    LongestStreak = streak?.LongestStreak ?? 0,
                    CompletionRate = completionRate,
                    FirstCompletionDate = firstCompletion?.CompletionDate,
                    LastCompletionDate = lastCompletion?.CompletionDate,
                    CompletionsByDayOfWeek = completionsByDayOfWeek
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting completion stats for habit {HabitId}", habitId);
                throw;
            }
        }

        public async Task TriggerStreakCalculationAsync(int habitId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Triggering streak calculation for habit {HabitId}", habitId);
                
                var currentStreak = await _unitOfWork.HabitCompletions.GetCurrentStreakLengthAsync(
                    habitId, 
                    cancellationToken: cancellationToken);
                
                var longestStreak = await _unitOfWork.HabitCompletions.GetLongestStreakAsync(
                    habitId, 
                    cancellationToken);
                
                var completionCount = await _unitOfWork.HabitCompletions.GetCompletionCountAsync(
                    habitId, 
                    cancellationToken: cancellationToken);
                
                var completionRate = await _unitOfWork.HabitCompletions.GetCompletionRateAsync(
                    habitId, 
                    cancellationToken: cancellationToken);
                
                var lastCompletion = await _unitOfWork.HabitCompletions.GetLastCompletionAsync(
                    habitId, 
                    cancellationToken);
                
                await _streakRepository.UpdateStreakAsync(
                    habitId,
                    currentStreak,
                    longestStreak?.Length ?? 0,
                    lastCompletion?.CompletionDate,
                    completionCount,
                    completionRate,
                    cancellationToken);
                
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                
                _logger.LogInformation("Streak calculation completed for habit {HabitId}", habitId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating streak for habit {HabitId}", habitId);
                // Don't throw - this is a background operation
            }
        }

        private void InvalidateHabitCache(int habitId)
        {
            // Simple cache invalidation - just remove common cache patterns
            // This is more reliable than reflection-based invalidation
            var keysToRemove = new List<string>
            {
                $"{CacheKeyPrefix}list_{habitId}",
                $"{CacheKeyPrefix}stats_{habitId}",
                $"{CacheKeyPrefix}status_{habitId}"
            };
            
            // Try to remove potential cache entries with different parameters
            for (int i = 0; i < 100; i++) // reasonable range for date variations
            {
                keysToRemove.Add($"{CacheKeyPrefix}list_{habitId}_{i}");
                keysToRemove.Add($"{CacheKeyPrefix}status_{habitId}_{i}");
            }
            
            foreach (var key in keysToRemove)
            {
                _cache.Remove(key);
            }
            
            _logger.LogDebug("Attempted cache invalidation for habit {HabitId}", habitId);
        }
    }
}