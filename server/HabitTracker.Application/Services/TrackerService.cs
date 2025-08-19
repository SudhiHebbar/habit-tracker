using AutoMapper;
using FluentValidation;
using HabitTracker.Application.DTOs.Tracker;
using HabitTracker.Application.Interfaces;
using HabitTracker.Application.Options;
using HabitTracker.Domain.Entities;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace HabitTracker.Application.Services
{
    public class TrackerService : ITrackerService
    {
        private readonly ITrackerRepository _trackerRepository;
        private readonly IMapper _mapper;
        private readonly IValidator<CreateTrackerDto> _createValidator;
        private readonly IValidator<UpdateTrackerDto> _updateValidator;
        private readonly ILogger<TrackerService> _logger;
        private readonly TrackerLimitsOptions _trackerLimits;

        public TrackerService(
            ITrackerRepository trackerRepository,
            IMapper mapper,
            IValidator<CreateTrackerDto> createValidator,
            IValidator<UpdateTrackerDto> updateValidator,
            ILogger<TrackerService> logger,
            IOptions<TrackerLimitsOptions> trackerLimitsOptions)
        {
            _trackerRepository = trackerRepository;
            _mapper = mapper;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
            _logger = logger;
            _trackerLimits = trackerLimitsOptions.Value;
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

            _logger.LogInformation("Updated display order for user {UserId}", userId);
            return true;
        }
    }
}