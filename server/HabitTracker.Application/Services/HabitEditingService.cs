using AutoMapper;
using FluentValidation;
using HabitTracker.Application.DTOs.Habit;
using HabitTracker.Application.Interfaces;
using HabitTracker.Domain.Entities;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace HabitTracker.Application.Services
{
    public class HabitEditingService : IHabitEditingService
    {
        private readonly IHabitRepository _habitRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IValidator<EditHabitDto> _editValidator;
        private readonly ILogger<HabitEditingService> _logger;

        public HabitEditingService(
            IHabitRepository habitRepository,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IValidator<EditHabitDto> editValidator,
            ILogger<HabitEditingService> logger)
        {
            _habitRepository = habitRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _editValidator = editValidator;
            _logger = logger;
        }

        public async Task<HabitEditResponseDto?> EditHabitAsync(int id, EditHabitDto editDto, string? userId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Editing habit {HabitId} by user {UserId}", id, userId);

            // Validate the edit DTO
            var validationResult = await _editValidator.ValidateAsync(editDto, cancellationToken);
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

            // Track changed fields
            var changedFields = new List<string>();
            var oldFrequency = habit.TargetFrequency;

            // Apply changes
            if (editDto.Name != null && habit.Name != editDto.Name)
            {
                // Check name uniqueness
                if (!await _habitRepository.IsHabitNameUniqueInTrackerAsync(habit.TrackerId, editDto.Name, id, cancellationToken))
                {
                    throw new InvalidOperationException($"A habit with the name '{editDto.Name}' already exists in this tracker");
                }
                habit.Name = editDto.Name;
                changedFields.Add("Name");
            }

            if (editDto.Description != null && habit.Description != editDto.Description)
            {
                habit.Description = editDto.Description;
                changedFields.Add("Description");
            }

            if (editDto.TargetFrequency != null && habit.TargetFrequency != editDto.TargetFrequency)
            {
                habit.TargetFrequency = editDto.TargetFrequency;
                changedFields.Add("TargetFrequency");
            }

            if (editDto.TargetCount != null && habit.TargetCount != editDto.TargetCount.Value)
            {
                habit.TargetCount = editDto.TargetCount.Value;
                changedFields.Add("TargetCount");
            }

            if (editDto.Color != null && habit.Color != editDto.Color)
            {
                habit.Color = editDto.Color;
                changedFields.Add("Color");
            }

            if (editDto.Icon != null && habit.Icon != editDto.Icon)
            {
                habit.Icon = editDto.Icon;
                changedFields.Add("Icon");
            }

            if (editDto.DisplayOrder != null && habit.DisplayOrder != editDto.DisplayOrder.Value)
            {
                habit.DisplayOrder = editDto.DisplayOrder.Value;
                changedFields.Add("DisplayOrder");
            }

            if (editDto.IsActive != null && habit.IsActive != editDto.IsActive.Value)
            {
                habit.IsActive = editDto.IsActive.Value;
                changedFields.Add("IsActive");
            }

            habit.UpdatedAt = DateTime.UtcNow;

            // Analyze impact
            var impact = await AnalyzeEditImpactAsync(id, editDto, cancellationToken);

            // Save changes
            await _habitRepository.UpdateAsync(habit, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Updated habit {HabitId} with {FieldCount} changed fields", id, changedFields.Count);

            // Map to response DTO
            var response = _mapper.Map<HabitEditResponseDto>(habit);
            response.ChangedFields = changedFields;
            response.EditImpact = impact;

            return response;
        }

        public async Task<bool> DeactivateHabitAsync(int id, DeactivateHabitDto deactivateDto, string? userId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Deactivating habit {HabitId} by user {UserId}", id, userId);

            if (!await _habitRepository.CanUserAccessHabitAsync(userId, id, cancellationToken))
            {
                _logger.LogWarning("User {UserId} cannot access habit {HabitId}", userId, id);
                return false;
            }

            var habit = await _habitRepository.GetByIdAsync(id, cancellationToken);
            if (habit == null)
            {
                _logger.LogWarning("Habit {HabitId} not found", id);
                return false;
            }

            habit.IsActive = false;
            habit.UpdatedAt = DateTime.UtcNow;

            // Store deactivation reason in a separate audit log (not implemented here, but could be added)
            _logger.LogInformation("Deactivating habit {HabitId} with reason: {Reason}", id, deactivateDto.Reason ?? "No reason provided");

            await _habitRepository.UpdateAsync(habit, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return true;
        }

        public async Task<bool> ReactivateHabitAsync(int id, string? userId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Reactivating habit {HabitId} by user {UserId}", id, userId);

            if (!await _habitRepository.CanUserAccessHabitAsync(userId, id, cancellationToken))
            {
                _logger.LogWarning("User {UserId} cannot access habit {HabitId}", userId, id);
                return false;
            }

            var habit = await _habitRepository.GetByIdAsync(id, cancellationToken);
            if (habit == null)
            {
                _logger.LogWarning("Habit {HabitId} not found", id);
                return false;
            }

            habit.IsActive = true;
            habit.UpdatedAt = DateTime.UtcNow;

            await _habitRepository.UpdateAsync(habit, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Reactivated habit {HabitId}", id);
            return true;
        }

        public async Task<EditImpactInfo> AnalyzeEditImpactAsync(int id, EditHabitDto editDto, CancellationToken cancellationToken = default)
        {
            var impact = new EditImpactInfo();

            var habit = await _habitRepository.GetHabitWithAllRelationsAsync(id, cancellationToken);
            if (habit == null)
            {
                return impact;
            }

            // Check if frequency is changing
            if (editDto.TargetFrequency != null && habit.TargetFrequency != editDto.TargetFrequency)
            {
                impact.FrequencyChanged = true;
                impact.StreaksNeedRecalculation = true;
                impact.AffectedCompletions = habit.Completions?.Count ?? 0;
                impact.Warning = "Changing frequency will require streak recalculation";
            }

            // Check if target count is changing
            if (editDto.TargetCount != null && habit.TargetCount != editDto.TargetCount.Value)
            {
                impact.StreaksNeedRecalculation = true;
                if (!impact.FrequencyChanged)
                {
                    impact.Warning = "Changing target count may affect streak calculations";
                }
            }

            return impact;
        }

        public async Task<bool> BulkEditHabitsAsync(int trackerId, List<(int HabitId, EditHabitDto EditData)> edits, string? userId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Bulk editing {Count} habits in tracker {TrackerId} by user {UserId}", edits.Count, trackerId, userId);

            // Validate all edits first
            foreach (var (habitId, editData) in edits)
            {
                var validationResult = await _editValidator.ValidateAsync(editData, cancellationToken);
                if (!validationResult.IsValid)
                {
                    _logger.LogWarning("Validation failed for habit {HabitId} in bulk edit", habitId);
                    return false;
                }

                if (!await _habitRepository.CanUserAccessHabitAsync(userId, habitId, cancellationToken))
                {
                    _logger.LogWarning("User {UserId} cannot access habit {HabitId} in bulk edit", userId, habitId);
                    return false;
                }
            }

            // Apply all edits
            foreach (var (habitId, editData) in edits)
            {
                await EditHabitAsync(habitId, editData, userId, cancellationToken);
            }

            _logger.LogInformation("Completed bulk edit of {Count} habits", edits.Count);
            return true;
        }

        public async Task<Dictionary<string, object>> GetHabitEditHistoryAsync(int id, string? userId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Getting edit history for habit {HabitId} by user {UserId}", id, userId);

            if (!await _habitRepository.CanUserAccessHabitAsync(userId, id, cancellationToken))
            {
                _logger.LogWarning("User {UserId} cannot access habit {HabitId}", userId, id);
                return new Dictionary<string, object>();
            }

            // This would typically query an audit log table
            // For now, return basic information
            var habit = await _habitRepository.GetByIdAsync(id, cancellationToken);
            if (habit == null)
            {
                return new Dictionary<string, object>();
            }

            return new Dictionary<string, object>
            {
                ["habitId"] = id,
                ["createdAt"] = habit.CreatedAt,
                ["updatedAt"] = habit.UpdatedAt,
                ["isActive"] = habit.IsActive,
                ["editCount"] = 0 // Would be calculated from audit log
            };
        }
    }
}