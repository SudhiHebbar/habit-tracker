using AutoMapper;
using HabitTracker.Application.DTOs.Tracker;
using HabitTracker.Application.DTOs.Habit;
using HabitTracker.Application.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace HabitTracker.Application.Services
{
    public class TrackerSwitchingService : ITrackerSwitchingService
    {
        private readonly ITrackerRepository _trackerRepository;
        private readonly IHabitRepository _habitRepository;
        private readonly IHabitCompletionRepository _completionRepository;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _cache;
        private readonly ILogger<TrackerSwitchingService> _logger;
        private readonly TimeSpan _cacheExpiration = TimeSpan.FromMinutes(5);

        public TrackerSwitchingService(
            ITrackerRepository trackerRepository,
            IHabitRepository habitRepository,
            IHabitCompletionRepository completionRepository,
            IMapper mapper,
            IMemoryCache cache,
            ILogger<TrackerSwitchingService> logger)
        {
            _trackerRepository = trackerRepository;
            _habitRepository = habitRepository;
            _completionRepository = completionRepository;
            _mapper = mapper;
            _cache = cache;
            _logger = logger;
        }

        public async Task<IEnumerable<TrackerSummaryDto>> GetTrackerSummariesAsync(string? userId, CancellationToken cancellationToken = default)
        {
            var cacheKey = $"tracker_summaries_{userId}";
            
            if (_cache.TryGetValue<IEnumerable<TrackerSummaryDto>>(cacheKey, out var cached))
            {
                _logger.LogDebug("Returning cached tracker summaries for user {UserId}", userId);
                return cached!;
            }

            _logger.LogInformation("Getting tracker summaries for user {UserId}", userId);
            var trackers = await _trackerRepository.GetActiveTrackersByUserIdAsync(userId, cancellationToken);
            var summaries = new List<TrackerSummaryDto>();

            foreach (var tracker in trackers)
            {
                var summary = _mapper.Map<TrackerSummaryDto>(tracker);
                summary.HabitCount = await _trackerRepository.GetActiveHabitCountAsync(tracker.Id, cancellationToken);
                
                var today = DateTime.UtcNow.Date;
                var habits = await _habitRepository.GetHabitsByTrackerIdAsync(tracker.Id, cancellationToken);
                var activeHabits = habits.Where(h => h.IsActive).ToList();
                
                if (activeHabits.Any())
                {
                    var todayCompletions = await _completionRepository.GetCompletionsByTrackerAndDateRangeAsync(
                        tracker.Id,
                        today,
                        today,
                        cancellationToken);
                    
                    summary.TodayCompletionsCount = todayCompletions.Count();
                    
                    var currentStreaks = new List<int>();
                    foreach (var habit in activeHabits)
                    {
                        var streak = await _completionRepository.GetCurrentStreakLengthAsync(habit.Id, DateOnly.FromDateTime(today), cancellationToken);
                        currentStreaks.Add(streak);
                    }
                    
                    summary.CurrentStreak = currentStreaks.Any() ? currentStreaks.Max() : 0;
                }

                summary.LastAccessedAt = tracker.UpdatedAt;
                summaries.Add(summary);
            }

            var result = summaries.OrderBy(s => s.DisplayOrder).ThenBy(s => s.Name);
            _cache.Set(cacheKey, result, _cacheExpiration);
            
            return result;
        }

        public async Task<TrackerWithStatsDto?> GetTrackerWithStatsAsync(int trackerId, string? userId, CancellationToken cancellationToken = default)
        {
            var cacheKey = $"tracker_full_{trackerId}_{userId}";
            
            if (_cache.TryGetValue<TrackerWithStatsDto>(cacheKey, out var cached))
            {
                _logger.LogDebug("Returning cached full tracker data for tracker {TrackerId}", trackerId);
                return cached;
            }

            _logger.LogInformation("Getting full tracker data for tracker {TrackerId}", trackerId);
            
            if (!await _trackerRepository.CanUserAccessTrackerAsync(userId, trackerId, cancellationToken))
            {
                _logger.LogWarning("User {UserId} cannot access tracker {TrackerId}", userId, trackerId);
                return null;
            }

            var tracker = await _trackerRepository.GetTrackerWithHabitsAsync(trackerId, cancellationToken);
            if (tracker == null)
            {
                _logger.LogWarning("Tracker {TrackerId} not found", trackerId);
                return null;
            }

            var dto = _mapper.Map<TrackerWithStatsDto>(tracker);
            var activeHabits = tracker.Habits.Where(h => h.IsActive).ToList();
            
            dto.Habits = _mapper.Map<List<HabitResponseDto>>(activeHabits);
            dto.TotalHabits = tracker.Habits.Count;
            dto.ActiveHabits = activeHabits.Count;
            dto.LastAccessedAt = DateTime.UtcNow;

            if (activeHabits.Any())
            {
                var today = DateTime.UtcNow.Date;
                
                var todayCompletions = await _completionRepository.GetCompletionsByTrackerAndDateRangeAsync(
                    trackerId, today, today, cancellationToken);
                
                dto.CompletedToday = todayCompletions.Count();
                dto.TodayCompletionRate = activeHabits.Count > 0 
                    ? (double)dto.CompletedToday / activeHabits.Count * 100 
                    : 0;

                var currentStreaks = new List<int>();
                var longestStreaks = new List<int>();
                
                foreach (var habit in activeHabits)
                {
                    var currentStreak = await _completionRepository.GetCurrentStreakLengthAsync(habit.Id, DateOnly.FromDateTime(today), cancellationToken);
                    currentStreaks.Add(currentStreak);
                    
                    var longestStreak = await _completionRepository.GetLongestStreakAsync(habit.Id, cancellationToken);
                    longestStreaks.Add(longestStreak?.Length ?? 0);
                }
                
                dto.CurrentStreak = currentStreaks.Any() ? currentStreaks.Max() : 0;
                dto.LongestStreak = longestStreaks.Any() ? longestStreaks.Max() : 0;

                var recentDays = 7;
                var recentCompletions = new Dictionary<DateTime, int>();
                for (int i = 0; i < recentDays; i++)
                {
                    var date = today.AddDays(-i);
                    var completions = await _completionRepository.GetCompletionsByTrackerAndDateRangeAsync(
                        trackerId, date, date, cancellationToken);
                    recentCompletions[date] = completions.Count();
                }
                dto.RecentCompletions = recentCompletions;
            }

            _cache.Set(cacheKey, dto, _cacheExpiration);
            return dto;
        }

        public async Task<TrackerSwitchDto> GetTrackerSwitchDataAsync(int currentTrackerId, string? userId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Getting tracker switch data for tracker {TrackerId}", currentTrackerId);
            
            var switchData = new TrackerSwitchDto
            {
                CurrentTrackerId = currentTrackerId,
                SwitchedAt = DateTime.UtcNow
            };

            var allTrackers = await GetTrackerSummariesAsync(userId, cancellationToken);
            var trackerList = allTrackers.OrderBy(t => t.DisplayOrder).ToList();
            
            var currentIndex = trackerList.FindIndex(t => t.Id == currentTrackerId);
            if (currentIndex > 0)
            {
                switchData.PreviousTrackerId = trackerList[currentIndex - 1].Id;
            }
            if (currentIndex < trackerList.Count - 1 && currentIndex >= 0)
            {
                switchData.NextTrackerId = trackerList[currentIndex + 1].Id;
            }

            switchData.RecentTrackers = (await GetRecentTrackersAsync(userId, 5, cancellationToken)).ToList();
            switchData.FavoriteTrackers = (await GetFavoriteTrackersAsync(userId, 5, cancellationToken)).ToList();

            return switchData;
        }

        public async Task RecordTrackerAccessAsync(int trackerId, string? userId, CancellationToken cancellationToken = default)
        {
            _logger.LogDebug("Recording access for tracker {TrackerId} by user {UserId}", trackerId, userId);
            
            var cacheKey = $"tracker_access_{userId}";
            var recentAccess = _cache.Get<List<(int TrackerId, DateTime AccessedAt)>>(cacheKey) ?? new List<(int, DateTime)>();
            
            recentAccess.RemoveAll(r => r.TrackerId == trackerId);
            recentAccess.Insert(0, (trackerId, DateTime.UtcNow));
            
            if (recentAccess.Count > 10)
            {
                recentAccess = recentAccess.Take(10).ToList();
            }
            
            _cache.Set(cacheKey, recentAccess, TimeSpan.FromDays(7));
            
            InvalidateTrackerCache(trackerId, userId);
        }

        public async Task<IEnumerable<TrackerSummaryDto>> GetRecentTrackersAsync(string? userId, int count = 5, CancellationToken cancellationToken = default)
        {
            var cacheKey = $"tracker_access_{userId}";
            var recentAccess = _cache.Get<List<(int TrackerId, DateTime AccessedAt)>>(cacheKey) ?? new List<(int, DateTime)>();
            
            if (!recentAccess.Any())
            {
                var allTrackers = await GetTrackerSummariesAsync(userId, cancellationToken);
                return allTrackers.Take(count);
            }
            
            var recentTrackerIds = recentAccess.Take(count).Select(r => r.TrackerId).ToList();
            var allSummaries = await GetTrackerSummariesAsync(userId, cancellationToken);
            
            return allSummaries.Where(t => recentTrackerIds.Contains(t.Id))
                .OrderBy(t => recentTrackerIds.IndexOf(t.Id));
        }

        public async Task<IEnumerable<TrackerSummaryDto>> GetFavoriteTrackersAsync(string? userId, int count = 5, CancellationToken cancellationToken = default)
        {
            var allSummaries = await GetTrackerSummariesAsync(userId, cancellationToken);
            return allSummaries
                .OrderByDescending(t => t.TodayCompletionsCount)
                .ThenByDescending(t => t.CurrentStreak)
                .ThenByDescending(t => t.HabitCount)
                .Take(count);
        }

        public async Task PreloadTrackerDataAsync(int trackerId, string? userId, CancellationToken cancellationToken = default)
        {
            _logger.LogDebug("Preloading data for tracker {TrackerId}", trackerId);
            
            _ = Task.Run(async () =>
            {
                try
                {
                    await GetTrackerWithStatsAsync(trackerId, userId, cancellationToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error preloading tracker {TrackerId}", trackerId);
                }
            }, cancellationToken);
        }

        private void InvalidateTrackerCache(int trackerId, string? userId)
        {
            var summariesKey = $"tracker_summaries_{userId}";
            var fullDataKey = $"tracker_full_{trackerId}_{userId}";
            
            _cache.Remove(summariesKey);
            _cache.Remove(fullDataKey);
            
            _logger.LogDebug("Invalidated cache for tracker {TrackerId}", trackerId);
        }
    }
}