using AutoMapper;
using FluentValidation;
using HabitTracker.Application.DTOs.Tracker;
using HabitTracker.Application.DTOs.Habit;
using HabitTracker.Application.Interfaces;
using HabitTracker.Application.Options;
using HabitTracker.Domain.Entities;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace HabitTracker.Application.Services
{
    public class TrackerService : ITrackerService
    {
        private readonly ITrackerRepository _trackerRepository;
        private readonly IHabitRepository _habitRepository;
        private readonly IHabitCompletionRepository _completionRepository;
        private readonly IMapper _mapper;
        private readonly IValidator<CreateTrackerDto> _createValidator;
        private readonly IValidator<UpdateTrackerDto> _updateValidator;
        private readonly ILogger<TrackerService> _logger;
        private readonly TrackerLimitsOptions _trackerLimits;
        private readonly IMemoryCache _cache;
        private readonly TimeSpan _cacheExpiration = TimeSpan.FromMinutes(5);

        public TrackerService(
            ITrackerRepository trackerRepository,
            IHabitRepository habitRepository,
            IHabitCompletionRepository completionRepository,
            IMapper mapper,
            IValidator<CreateTrackerDto> createValidator,
            IValidator<UpdateTrackerDto> updateValidator,
            ILogger<TrackerService> logger,
            IOptions<TrackerLimitsOptions> trackerLimitsOptions,
            IMemoryCache cache)
        {
            _trackerRepository = trackerRepository;
            _habitRepository = habitRepository;
            _completionRepository = completionRepository;
            _mapper = mapper;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
            _logger = logger;
            _trackerLimits = trackerLimitsOptions.Value;
            _cache = cache;
        }

        public async Task<IEnumerable<TrackerResponseDto>> GetAllTrackersAsync(string? userId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Getting all trackers for user {UserId}", userId);
            var trackers = await _trackerRepository.GetTrackersByUserIdAsync(userId, cancellationToken);
            var trackerDtos = _mapper.Map<IEnumerable<TrackerResponseDto>>(trackers);
            
            foreach (var dto in trackerDtos)
            {
                dto.HabitCount = await _trackerRepository.GetActiveHabitCountAsync(dto.Id, cancellationToken);
            }
            
            return trackerDtos;
        }

        public async Task<IEnumerable<TrackerResponseDto>> GetActiveTrackersAsync(string? userId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Getting active trackers for user {UserId}", userId);
            var trackers = await _trackerRepository.GetActiveTrackersByUserIdAsync(userId, cancellationToken);
            var trackerDtos = _mapper.Map<IEnumerable<TrackerResponseDto>>(trackers);
            
            foreach (var dto in trackerDtos)
            {
                dto.HabitCount = await _trackerRepository.GetActiveHabitCountAsync(dto.Id, cancellationToken);
            }
            
            return trackerDtos.OrderBy(t => t.DisplayOrder).ThenBy(t => t.Name);
        }

        public async Task<TrackerResponseDto?> GetTrackerByIdAsync(int id, string? userId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Getting tracker {TrackerId} for user {UserId}", id, userId);
            
            if (!await _trackerRepository.CanUserAccessTrackerAsync(userId, id, cancellationToken))
            {
                _logger.LogWarning("User {UserId} cannot access tracker {TrackerId}", userId, id);
                return null;
            }

            var tracker = await _trackerRepository.GetTrackerWithHabitsAsync(id, cancellationToken);
            if (tracker == null)
            {
                _logger.LogWarning("Tracker {TrackerId} not found", id);
                return null;
            }

            var dto = _mapper.Map<TrackerResponseDto>(tracker);
            dto.HabitCount = tracker.Habits.Count(h => h.IsActive);
            return dto;
        }

        public async Task<TrackerResponseDto> CreateTrackerAsync(CreateTrackerDto createDto, string? userId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Creating new tracker for user {UserId}", userId);
            
            var validationResult = await _createValidator.ValidateAsync(createDto, cancellationToken);
            if (!validationResult.IsValid)
            {
                var errors = string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage));
                throw new ValidationException($"Validation failed: {errors}");
            }

            var existingTrackers = await _trackerRepository.GetActiveTrackersByUserIdAsync(userId, cancellationToken);
            if (existingTrackers.Count() >= _trackerLimits.MaxTrackersPerUser)
            {
                throw new InvalidOperationException($"Maximum number of trackers ({_trackerLimits.MaxTrackersPerUser}) reached");
            }

            if (!await _trackerRepository.IsTrackerNameUniqueForUserAsync(userId, createDto.Name, null, cancellationToken))
            {
                throw new InvalidOperationException($"A tracker with the name '{createDto.Name}' already exists");
            }

            var tracker = _mapper.Map<Tracker>(createDto);
            tracker.UserId = userId;
            tracker.CreatedAt = DateTime.UtcNow;
            tracker.UpdatedAt = DateTime.UtcNow;
            tracker.IsActive = true;

            await _trackerRepository.AddAsync(tracker, cancellationToken);
            await _trackerRepository.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Created tracker {TrackerId} for user {UserId}", tracker.Id, userId);
            
            var responseDto = _mapper.Map<TrackerResponseDto>(tracker);
            responseDto.HabitCount = 0;
            return responseDto;
        }

        public async Task<TrackerResponseDto?> UpdateTrackerAsync(int id, UpdateTrackerDto updateDto, string? userId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Updating tracker {TrackerId} for user {UserId}", id, userId);
            
            var validationResult = await _updateValidator.ValidateAsync(updateDto, cancellationToken);
            if (!validationResult.IsValid)
            {
                var errors = string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage));
                throw new ValidationException($"Validation failed: {errors}");
            }

            if (!await _trackerRepository.CanUserAccessTrackerAsync(userId, id, cancellationToken))
            {
                _logger.LogWarning("User {UserId} cannot access tracker {TrackerId}", userId, id);
                return null;
            }

            var tracker = await _trackerRepository.GetByIdAsync(id, cancellationToken);
            if (tracker == null || !tracker.IsActive)
            {
                _logger.LogWarning("Tracker {TrackerId} not found or inactive", id);
                return null;
            }

            if (!await _trackerRepository.IsTrackerNameUniqueForUserAsync(userId, updateDto.Name, id, cancellationToken))
            {
                throw new InvalidOperationException($"A tracker with the name '{updateDto.Name}' already exists");
            }

            _mapper.Map(updateDto, tracker);
            tracker.UpdatedAt = DateTime.UtcNow;

            await _trackerRepository.UpdateAsync(tracker, cancellationToken);
            await _trackerRepository.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Updated tracker {TrackerId} for user {UserId}", id, userId);
            
            var responseDto = _mapper.Map<TrackerResponseDto>(tracker);
            responseDto.HabitCount = await _trackerRepository.GetActiveHabitCountAsync(id, cancellationToken);
            return responseDto;
        }

        public async Task<bool> DeleteTrackerAsync(int id, string? userId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Deleting tracker {TrackerId} for user {UserId}", id, userId);
            
            if (!await _trackerRepository.CanUserAccessTrackerAsync(userId, id, cancellationToken))
            {
                _logger.LogWarning("User {UserId} cannot access tracker {TrackerId}", userId, id);
                return false;
            }

            await _trackerRepository.SoftDeleteAsync(id, cancellationToken);
            await _trackerRepository.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Soft deleted tracker {TrackerId} for user {UserId}", id, userId);
            return true;
        }

        public async Task<bool> RestoreTrackerAsync(int id, string? userId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Restoring tracker {TrackerId} for user {UserId}", id, userId);
            
            if (!await _trackerRepository.CanUserAccessTrackerAsync(userId, id, cancellationToken))
            {
                _logger.LogWarning("User {UserId} cannot access tracker {TrackerId}", userId, id);
                return false;
            }

            await _trackerRepository.RestoreAsync(id, cancellationToken);
            await _trackerRepository.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Restored tracker {TrackerId} for user {UserId}", id, userId);
            return true;
        }

        public async Task<IEnumerable<TrackerResponseDto>> GetSharedTrackersAsync(CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Getting shared trackers");
            var trackers = await _trackerRepository.GetSharedTrackersAsync(cancellationToken);
            var trackerDtos = _mapper.Map<IEnumerable<TrackerResponseDto>>(trackers);
            
            foreach (var dto in trackerDtos)
            {
                dto.HabitCount = await _trackerRepository.GetActiveHabitCountAsync(dto.Id, cancellationToken);
            }
            
            return trackerDtos;
        }

        public async Task<bool> UpdateDisplayOrderAsync(string? userId, List<(int TrackerId, int DisplayOrder)> trackerOrders, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Updating display order for user {UserId}", userId);
            
            foreach (var (trackerId, _) in trackerOrders)
            {
                if (!await _trackerRepository.CanUserAccessTrackerAsync(userId, trackerId, cancellationToken))
                {
                    _logger.LogWarning("User {UserId} cannot access tracker {TrackerId}", userId, trackerId);
                    return false;
                }
            }

            await _trackerRepository.ReorderTrackersAsync(userId, trackerOrders, cancellationToken);
            await _trackerRepository.SaveChangesAsync(cancellationToken);

            InvalidateUserTrackerCache(userId);
            _logger.LogInformation("Updated display order for user {UserId}", userId);
            return true;
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

        public async Task<TrackerWithStatsDto?> GetTrackerWithStatsAsync(int id, string? userId, CancellationToken cancellationToken = default)
        {
            var cacheKey = $"tracker_full_{id}_{userId}";
            
            if (_cache.TryGetValue<TrackerWithStatsDto>(cacheKey, out var cached))
            {
                _logger.LogDebug("Returning cached full tracker data for tracker {TrackerId}", id);
                return cached;
            }

            _logger.LogInformation("Getting full tracker data for tracker {TrackerId}", id);
            
            if (!await _trackerRepository.CanUserAccessTrackerAsync(userId, id, cancellationToken))
            {
                _logger.LogWarning("User {UserId} cannot access tracker {TrackerId}", userId, id);
                return null;
            }

            var tracker = await _trackerRepository.GetTrackerWithHabitsAsync(id, cancellationToken);
            if (tracker == null)
            {
                _logger.LogWarning("Tracker {TrackerId} not found", id);
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
                    id, today, today, cancellationToken);
                
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
                        id, date, date, cancellationToken);
                    recentCompletions[date] = completions.Count();
                }
                dto.RecentCompletions = recentCompletions;
            }

            _cache.Set(cacheKey, dto, _cacheExpiration);
            return dto;
        }

        private void InvalidateUserTrackerCache(string? userId)
        {
            var summariesKey = $"tracker_summaries_{userId}";
            _cache.Remove(summariesKey);
            _logger.LogDebug("Invalidated tracker cache for user {UserId}", userId);
        }
    }
}