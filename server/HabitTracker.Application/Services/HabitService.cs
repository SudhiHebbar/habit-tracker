using AutoMapper;
using FluentValidation;
using HabitTracker.Application.DTOs.Habit;
using HabitTracker.Application.Interfaces;
using HabitTracker.Application.Options;
using HabitTracker.Domain.Entities;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace HabitTracker.Application.Services
{
    public class HabitService : IHabitService
    {
        private readonly IHabitRepository _habitRepository;
        private readonly ITrackerRepository _trackerRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IValidator<CreateHabitDto> _createValidator;
        private readonly IValidator<UpdateHabitDto> _updateValidator;
        private readonly ILogger<HabitService> _logger;
        private readonly HabitLimitsOptions _habitLimits;

        public HabitService(
            IHabitRepository habitRepository,
            ITrackerRepository trackerRepository,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IValidator<CreateHabitDto> createValidator,
            IValidator<UpdateHabitDto> updateValidator,
            ILogger<HabitService> logger,
            IOptions<HabitLimitsOptions> habitLimitsOptions)
        {
            _habitRepository = habitRepository;
            _trackerRepository = trackerRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
            _logger = logger;
            _habitLimits = habitLimitsOptions.Value;
        }

        public async Task<IEnumerable<HabitResponseDto>> GetHabitsByTrackerAsync(int trackerId, string? userId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Getting habits for tracker {TrackerId} by user {UserId}", trackerId, userId);

            if (!await _trackerRepository.CanUserAccessTrackerAsync(userId, trackerId, cancellationToken))
            {
                _logger.LogWarning("User {UserId} cannot access tracker {TrackerId}", userId, trackerId);
                return Enumerable.Empty<HabitResponseDto>();
            }

            var habits = await _habitRepository.GetActiveHabitsByTrackerIdAsync(trackerId, cancellationToken);
            return _mapper.Map<IEnumerable<HabitResponseDto>>(habits);
        }

        public async Task<HabitResponseDto?> GetHabitByIdAsync(int id, string? userId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Getting habit {HabitId} for user {UserId}", id, userId);

            if (!await _habitRepository.CanUserAccessHabitAsync(userId, id, cancellationToken))
            {
                _logger.LogWarning("User {UserId} cannot access habit {HabitId}", userId, id);
                return null;
            }

            var habit = await _habitRepository.GetHabitWithAllRelationsAsync(id, cancellationToken);
            if (habit == null || !habit.IsActive)
            {
                _logger.LogWarning("Habit {HabitId} not found or inactive", id);
                return null;
            }

            return _mapper.Map<HabitResponseDto>(habit);
        }

        public async Task<HabitResponseDto> CreateHabitAsync(int trackerId, CreateHabitDto createDto, string? userId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Creating new habit for tracker {TrackerId} by user {UserId}", trackerId, userId);

            // Validate the DTO
            var validationResult = await _createValidator.ValidateAsync(createDto, cancellationToken);
            if (!validationResult.IsValid)
            {
                var errors = string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage));
                throw new ValidationException($"Validation failed: {errors}");
            }

            // Check tracker access
            if (!await _trackerRepository.CanUserAccessTrackerAsync(userId, trackerId, cancellationToken))
            {
                throw new UnauthorizedAccessException($"User cannot access tracker {trackerId}");
            }

            // Check tracker exists and is active
            var tracker = await _trackerRepository.GetByIdAsync(trackerId, cancellationToken);
            if (tracker == null || !tracker.IsActive)
            {
                throw new InvalidOperationException($"Tracker {trackerId} not found or inactive");
            }

            // Check habit count limit
            var habitCount = await _habitRepository.GetActiveHabitCountForTrackerAsync(trackerId, cancellationToken);
            if (habitCount >= _habitLimits.MaxHabitsPerTracker)
            {
                throw new InvalidOperationException($"Maximum number of habits ({_habitLimits.MaxHabitsPerTracker}) reached for this tracker");
            }

            // Check name uniqueness
            if (!await _habitRepository.IsHabitNameUniqueInTrackerAsync(trackerId, createDto.Name, null, cancellationToken))
            {
                throw new InvalidOperationException($"A habit with the name '{createDto.Name}' already exists in this tracker");
            }

            // Map and create habit
            var habit = _mapper.Map<Habit>(createDto);
            habit.TrackerId = trackerId;
            habit.CreatedAt = DateTime.UtcNow;
            habit.UpdatedAt = DateTime.UtcNow;
            habit.IsActive = true;

            await _habitRepository.AddAsync(habit, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Created habit {HabitId} in tracker {TrackerId}", habit.Id, trackerId);

            return _mapper.Map<HabitResponseDto>(habit);
        }

        public async Task<HabitResponseDto?> UpdateHabitAsync(int id, UpdateHabitDto updateDto, string? userId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Updating habit {HabitId} by user {UserId}", id, userId);

            // Validate the DTO
            var validationResult = await _updateValidator.ValidateAsync(updateDto, cancellationToken);
            if (!validationResult.IsValid)
            {
                var errors = string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage));
                throw new ValidationException($"Validation failed: {errors}");
            }

            // Check habit access
            if (!await _habitRepository.CanUserAccessHabitAsync(userId, id, cancellationToken))
            {
                _logger.LogWarning("User {UserId} cannot access habit {HabitId}", userId, id);
                return null;
            }

            // Get the habit
            var habit = await _habitRepository.GetByIdAsync(id, cancellationToken);
            if (habit == null)
            {
                _logger.LogWarning("Habit {HabitId} not found", id);
                return null;
            }

            // Check name uniqueness if name is changing
            if (habit.Name != updateDto.Name)
            {
                if (!await _habitRepository.IsHabitNameUniqueInTrackerAsync(habit.TrackerId, updateDto.Name, id, cancellationToken))
                {
                    throw new InvalidOperationException($"A habit with the name '{updateDto.Name}' already exists in this tracker");
                }
            }

            // Map updates
            _mapper.Map(updateDto, habit);
            habit.UpdatedAt = DateTime.UtcNow;

            await _habitRepository.UpdateAsync(habit, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Updated habit {HabitId}", id);

            return _mapper.Map<HabitResponseDto>(habit);
        }

        public async Task<bool> DeleteHabitAsync(int id, string? userId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Deleting habit {HabitId} by user {UserId}", id, userId);

            if (!await _habitRepository.CanUserAccessHabitAsync(userId, id, cancellationToken))
            {
                _logger.LogWarning("User {UserId} cannot access habit {HabitId}", userId, id);
                return false;
            }

            await _habitRepository.SoftDeleteAsync(id, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Soft deleted habit {HabitId}", id);
            return true;
        }

        public async Task<bool> RestoreHabitAsync(int id, string? userId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Restoring habit {HabitId} by user {UserId}", id, userId);

            if (!await _habitRepository.CanUserAccessHabitAsync(userId, id, cancellationToken))
            {
                _logger.LogWarning("User {UserId} cannot access habit {HabitId}", userId, id);
                return false;
            }

            await _habitRepository.RestoreAsync(id, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Restored habit {HabitId}", id);
            return true;
        }

        public async Task<bool> UpdateHabitOrderAsync(int trackerId, List<(int HabitId, int DisplayOrder)> habitOrders, string? userId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Updating habit order for tracker {TrackerId} by user {UserId}", trackerId, userId);

            if (!await _trackerRepository.CanUserAccessTrackerAsync(userId, trackerId, cancellationToken))
            {
                _logger.LogWarning("User {UserId} cannot access tracker {TrackerId}", userId, trackerId);
                return false;
            }

            // Verify all habits belong to the tracker and user can access them
            foreach (var (habitId, _) in habitOrders)
            {
                if (!await _habitRepository.CanUserAccessHabitAsync(userId, habitId, cancellationToken))
                {
                    _logger.LogWarning("User {UserId} cannot access habit {HabitId}", userId, habitId);
                    return false;
                }
            }

            await _habitRepository.ReorderHabitsAsync(trackerId, habitOrders, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Updated habit order for tracker {TrackerId}", trackerId);
            return true;
        }

        public async Task<IEnumerable<HabitResponseDto>> GetHabitsWithCompletionsAsync(int trackerId, string? userId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Getting habits with completions for tracker {TrackerId} by user {UserId}", trackerId, userId);

            if (!await _trackerRepository.CanUserAccessTrackerAsync(userId, trackerId, cancellationToken))
            {
                _logger.LogWarning("User {UserId} cannot access tracker {TrackerId}", userId, trackerId);
                return Enumerable.Empty<HabitResponseDto>();
            }

            var habits = await _habitRepository.GetHabitsWithCompletionDataAsync(trackerId, cancellationToken);
            return _mapper.Map<IEnumerable<HabitResponseDto>>(habits);
        }

        public async Task<Dictionary<string, int>> GetHabitStatsByFrequencyAsync(int trackerId, string? userId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Getting habit stats by frequency for tracker {TrackerId} by user {UserId}", trackerId, userId);

            if (!await _trackerRepository.CanUserAccessTrackerAsync(userId, trackerId, cancellationToken))
            {
                _logger.LogWarning("User {UserId} cannot access tracker {TrackerId}", userId, trackerId);
                return new Dictionary<string, int>();
            }

            return await _habitRepository.GetHabitsCountByFrequencyAsync(trackerId, cancellationToken);
        }

        public async Task<bool> ValidateHabitNameAsync(int trackerId, string name, int? excludeHabitId, string? userId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Validating habit name '{Name}' for tracker {TrackerId} by user {UserId}", name, trackerId, userId);

            if (!await _trackerRepository.CanUserAccessTrackerAsync(userId, trackerId, cancellationToken))
            {
                _logger.LogWarning("User {UserId} cannot access tracker {TrackerId}", userId, trackerId);
                return false;
            }

            return await _habitRepository.IsHabitNameUniqueInTrackerAsync(trackerId, name, excludeHabitId, cancellationToken);
        }
    }
}