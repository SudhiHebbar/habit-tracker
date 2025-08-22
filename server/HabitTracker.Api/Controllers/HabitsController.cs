using HabitTracker.Application.DTOs.Habit;
using HabitTracker.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HabitTracker.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HabitsController : ControllerBase
    {
        private readonly IHabitService _habitService;
        private readonly IHabitEditingService _habitEditingService;
        private readonly IHabitDeletionService _habitDeletionService;
        private readonly ILogger<HabitsController> _logger;

        public HabitsController(
            IHabitService habitService, 
            IHabitEditingService habitEditingService, 
            IHabitDeletionService habitDeletionService,
            ILogger<HabitsController> logger)
        {
            _habitService = habitService;
            _habitEditingService = habitEditingService;
            _habitDeletionService = habitDeletionService;
            _logger = logger;
        }

        /// <summary>
        /// Get all habits for a specific tracker
        /// </summary>
        [HttpGet("tracker/{trackerId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<HabitResponseDto>>> GetHabitsByTracker(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                // TODO: Get userId from authentication context when auth is implemented
                string? userId = null;

                var habits = await _habitService.GetHabitsByTrackerAsync(trackerId, userId, cancellationToken);
                
                if (!habits.Any())
                {
                    return Ok(new List<HabitResponseDto>());
                }

                return Ok(habits);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting habits for tracker {TrackerId}", trackerId);
                return StatusCode(500, "An error occurred while fetching habits");
            }
        }

        /// <summary>
        /// Get habits with completion data for a tracker
        /// </summary>
        [HttpGet("tracker/{trackerId}/with-completions")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<HabitResponseDto>>> GetHabitsWithCompletions(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                string? userId = null;

                var habits = await _habitService.GetHabitsWithCompletionsAsync(trackerId, userId, cancellationToken);
                return Ok(habits);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting habits with completions for tracker {TrackerId}", trackerId);
                return StatusCode(500, "An error occurred while fetching habits");
            }
        }

        /// <summary>
        /// Get a specific habit by ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<HabitResponseDto>> GetHabitById(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                string? userId = null;

                var habit = await _habitService.GetHabitByIdAsync(id, userId, cancellationToken);
                
                if (habit == null)
                {
                    return NotFound($"Habit with ID {id} not found");
                }

                return Ok(habit);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting habit {HabitId}", id);
                return StatusCode(500, "An error occurred while fetching the habit");
            }
        }

        /// <summary>
        /// Create a new habit in a tracker
        /// </summary>
        [HttpPost("tracker/{trackerId}")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<HabitResponseDto>> CreateHabit(int trackerId, [FromBody] CreateHabitDto createDto, CancellationToken cancellationToken = default)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                string? userId = null;

                var habit = await _habitService.CreateHabitAsync(trackerId, createDto, userId, cancellationToken);
                
                return CreatedAtAction(
                    nameof(GetHabitById),
                    new { id = habit.Id },
                    habit);
            }
            catch (FluentValidation.ValidationException ex)
            {
                _logger.LogWarning(ex, "Validation failed for creating habit in tracker {TrackerId}", trackerId);
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation while creating habit in tracker {TrackerId}", trackerId);
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access to tracker {TrackerId}", trackerId);
                return NotFound($"Tracker with ID {trackerId} not found");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating habit in tracker {TrackerId}", trackerId);
                return StatusCode(500, "An error occurred while creating the habit");
            }
        }

        /// <summary>
        /// Update an existing habit
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<HabitResponseDto>> UpdateHabit(int id, [FromBody] UpdateHabitDto updateDto, CancellationToken cancellationToken = default)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                string? userId = null;

                var habit = await _habitService.UpdateHabitAsync(id, updateDto, userId, cancellationToken);
                
                if (habit == null)
                {
                    return NotFound($"Habit with ID {id} not found");
                }

                return Ok(habit);
            }
            catch (FluentValidation.ValidationException ex)
            {
                _logger.LogWarning(ex, "Validation failed for updating habit {HabitId}", id);
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation while updating habit {HabitId}", id);
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating habit {HabitId}", id);
                return StatusCode(500, "An error occurred while updating the habit");
            }
        }

        /// <summary>
        /// Delete a habit with deletion confirmation (soft delete)
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteHabit(int id, [FromBody] DeleteHabitDto deleteDto, CancellationToken cancellationToken = default)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                string? userId = null;

                var result = await _habitDeletionService.SoftDeleteHabitAsync(id, deleteDto, userId, cancellationToken);
                
                if (!result)
                {
                    return NotFound($"Habit with ID {id} not found");
                }

                return Ok(new { 
                    message = "Habit deleted successfully", 
                    deletedAt = DateTime.UtcNow,
                    canUndo = true,
                    undoTimeoutSeconds = 300 // 5 minutes
                });
            }
            catch (UnauthorizedAccessException)
            {
                return NotFound($"Habit with ID {id} not found");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting habit {HabitId}", id);
                return StatusCode(500, "An error occurred while deleting the habit");
            }
        }

        /// <summary>
        /// Restore a soft-deleted habit with confirmation
        /// </summary>
        [HttpPost("{id}/restore")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> RestoreHabit(int id, [FromBody] RestoreHabitDto restoreDto, CancellationToken cancellationToken = default)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                string? userId = null;

                var result = await _habitDeletionService.RestoreHabitAsync(id, restoreDto, userId, cancellationToken);
                
                if (!result)
                {
                    return NotFound($"Habit with ID {id} not found or not deleted");
                }

                return Ok(new { 
                    message = "Habit restored successfully",
                    restoredAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error restoring habit {HabitId}", id);
                return StatusCode(500, "An error occurred while restoring the habit");
            }
        }

        /// <summary>
        /// Get deletion impact analysis for a habit
        /// </summary>
        [HttpGet("{id}/deletion-impact")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<DeletionImpactDto>> GetDeletionImpact(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                string? userId = null;

                var impact = await _habitDeletionService.CalculateDeletionImpactAsync(id, userId, cancellationToken);
                return Ok(impact);
            }
            catch (UnauthorizedAccessException)
            {
                return NotFound($"Habit with ID {id} not found");
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation while calculating deletion impact for habit {HabitId}", id);
                return NotFound($"Habit with ID {id} not found");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating deletion impact for habit {HabitId}", id);
                return StatusCode(500, "An error occurred while calculating deletion impact");
            }
        }

        /// <summary>
        /// Bulk delete multiple habits
        /// </summary>
        [HttpPost("bulk-delete")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> BulkDeleteHabits([FromBody] BulkDeleteDto bulkDeleteDto, CancellationToken cancellationToken = default)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                string? userId = null;

                // Calculate impact if requested
                BulkDeletionImpactDto? impact = null;
                if (bulkDeleteDto.RequestImpactAnalysis)
                {
                    impact = await _habitDeletionService.CalculateBulkDeletionImpactAsync(bulkDeleteDto.HabitIds, userId, cancellationToken);
                }

                var result = await _habitDeletionService.BulkSoftDeleteHabitsAsync(bulkDeleteDto, userId, cancellationToken);

                if (!result)
                {
                    return BadRequest("Failed to delete habits - some habits may not exist or are inaccessible");
                }

                return Ok(new
                {
                    message = $"Bulk deletion initiated for {bulkDeleteDto.HabitIds.Count} habits",
                    deletedAt = DateTime.UtcNow,
                    canUndo = true,
                    undoTimeoutSeconds = 300,
                    impact = impact
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error bulk deleting habits");
                return StatusCode(500, "An error occurred while bulk deleting habits");
            }
        }

        /// <summary>
        /// Get bulk deletion impact analysis
        /// </summary>
        [HttpPost("bulk-deletion-impact")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<BulkDeletionImpactDto>> GetBulkDeletionImpact([FromBody] List<int> habitIds, CancellationToken cancellationToken = default)
        {
            try
            {
                if (habitIds == null || !habitIds.Any())
                {
                    return BadRequest("At least one habit ID must be provided");
                }

                if (habitIds.Count > 50)
                {
                    return BadRequest("Cannot analyze more than 50 habits at once");
                }

                string? userId = null;
                var impact = await _habitDeletionService.CalculateBulkDeletionImpactAsync(habitIds, userId, cancellationToken);
                return Ok(impact);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating bulk deletion impact");
                return StatusCode(500, "An error occurred while calculating bulk deletion impact");
            }
        }

        /// <summary>
        /// Get deleted habits for a tracker
        /// </summary>
        [HttpGet("tracker/{trackerId}/deleted")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<HabitResponseDto>>> GetDeletedHabits(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                string? userId = null;
                var habits = await _habitDeletionService.GetDeletedHabitsByTrackerAsync(trackerId, userId, cancellationToken);
                return Ok(habits);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting deleted habits for tracker {TrackerId}", trackerId);
                return StatusCode(500, "An error occurred while fetching deleted habits");
            }
        }

        /// <summary>
        /// Undo a recent deletion (within 5-minute grace period)
        /// </summary>
        [HttpPost("{id}/undo-delete")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UndoDelete(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                string? userId = null;

                var canUndo = await _habitDeletionService.CanUndoDeletionAsync(id, userId, cancellationToken);
                if (!canUndo)
                {
                    return BadRequest("Cannot undo deletion - habit not found, not deleted, or deletion is outside the undo grace period");
                }

                var result = await _habitDeletionService.UndoRecentDeletionAsync(id, userId, cancellationToken);
                
                if (!result)
                {
                    return BadRequest("Failed to undo deletion");
                }

                return Ok(new { 
                    message = "Deletion undone successfully",
                    restoredAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error undoing deletion for habit {HabitId}", id);
                return StatusCode(500, "An error occurred while undoing the deletion");
            }
        }

        /// <summary>
        /// Edit an existing habit with partial updates
        /// </summary>
        [HttpPatch("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<HabitEditResponseDto>> EditHabit(int id, [FromBody] EditHabitDto editDto, CancellationToken cancellationToken = default)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                string? userId = null;

                var habit = await _habitEditingService.EditHabitAsync(id, editDto, userId, cancellationToken);
                
                if (habit == null)
                {
                    return NotFound($"Habit with ID {id} not found");
                }

                return Ok(habit);
            }
            catch (FluentValidation.ValidationException ex)
            {
                _logger.LogWarning(ex, "Validation failed for editing habit {HabitId}", id);
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation while editing habit {HabitId}", id);
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error editing habit {HabitId}", id);
                return StatusCode(500, "An error occurred while editing the habit");
            }
        }

        /// <summary>
        /// Deactivate a habit while preserving history
        /// </summary>
        [HttpPatch("{id}/deactivate")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeactivateHabit(int id, [FromBody] DeactivateHabitDto deactivateDto, CancellationToken cancellationToken = default)
        {
            try
            {
                string? userId = null;

                var result = await _habitEditingService.DeactivateHabitAsync(id, deactivateDto, userId, cancellationToken);
                
                if (!result)
                {
                    return NotFound($"Habit with ID {id} not found");
                }

                return Ok(new { message = "Habit deactivated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deactivating habit {HabitId}", id);
                return StatusCode(500, "An error occurred while deactivating the habit");
            }
        }

        /// <summary>
        /// Reactivate a deactivated habit
        /// </summary>
        [HttpPatch("{id}/reactivate")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ReactivateHabit(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                string? userId = null;

                var result = await _habitEditingService.ReactivateHabitAsync(id, userId, cancellationToken);
                
                if (!result)
                {
                    return NotFound($"Habit with ID {id} not found");
                }

                return Ok(new { message = "Habit reactivated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reactivating habit {HabitId}", id);
                return StatusCode(500, "An error occurred while reactivating the habit");
            }
        }

        /// <summary>
        /// Get edit history for a habit
        /// </summary>
        [HttpGet("{id}/edit-history")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Dictionary<string, object>>> GetHabitEditHistory(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                string? userId = null;

                var history = await _habitEditingService.GetHabitEditHistoryAsync(id, userId, cancellationToken);
                
                if (!history.Any())
                {
                    return NotFound($"Habit with ID {id} not found or no history available");
                }

                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting edit history for habit {HabitId}", id);
                return StatusCode(500, "An error occurred while fetching edit history");
            }
        }

        /// <summary>
        /// Bulk edit habits in a tracker
        /// </summary>
        [HttpPost("tracker/{trackerId}/bulk-edit")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> BulkEditHabits(int trackerId, [FromBody] List<BulkEditRequest> edits, CancellationToken cancellationToken = default)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                string? userId = null;

                var editsList = edits.Select(e => (e.HabitId, e.EditData)).ToList();
                var result = await _habitEditingService.BulkEditHabitsAsync(trackerId, editsList, userId, cancellationToken);
                
                if (!result)
                {
                    return BadRequest("Failed to apply bulk edits");
                }

                return Ok(new { message = "Bulk edits applied successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error applying bulk edits for tracker {TrackerId}", trackerId);
                return StatusCode(500, "An error occurred while applying bulk edits");
            }
        }

        /// <summary>
        /// Update display order for habits in a tracker
        /// </summary>
        [HttpPut("tracker/{trackerId}/order")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateHabitOrder(int trackerId, [FromBody] List<HabitOrderDto> habitOrders, CancellationToken cancellationToken = default)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                string? userId = null;

                var orderList = habitOrders.Select(h => (h.HabitId, h.DisplayOrder)).ToList();
                var result = await _habitService.UpdateHabitOrderAsync(trackerId, orderList, userId, cancellationToken);
                
                if (!result)
                {
                    return NotFound($"Tracker with ID {trackerId} not found or access denied");
                }

                return Ok(new { message = "Habit order updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating habit order for tracker {TrackerId}", trackerId);
                return StatusCode(500, "An error occurred while updating habit order");
            }
        }

        /// <summary>
        /// Get habit statistics by frequency for a tracker
        /// </summary>
        [HttpGet("tracker/{trackerId}/stats/frequency")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Dictionary<string, int>>> GetHabitStatsByFrequency(int trackerId, CancellationToken cancellationToken = default)
        {
            try
            {
                string? userId = null;

                var stats = await _habitService.GetHabitStatsByFrequencyAsync(trackerId, userId, cancellationToken);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting habit stats for tracker {TrackerId}", trackerId);
                return StatusCode(500, "An error occurred while fetching habit statistics");
            }
        }

        /// <summary>
        /// Validate if a habit name is unique in a tracker
        /// </summary>
        [HttpGet("tracker/{trackerId}/validate-name")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<bool>> ValidateHabitName(int trackerId, [FromQuery] string name, [FromQuery] int? excludeHabitId = null, CancellationToken cancellationToken = default)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(name))
                {
                    return BadRequest("Name parameter is required");
                }

                string? userId = null;

                var isValid = await _habitService.ValidateHabitNameAsync(trackerId, name, excludeHabitId, userId, cancellationToken);
                return Ok(new { isValid });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating habit name for tracker {TrackerId}", trackerId);
                return StatusCode(500, "An error occurred while validating the habit name");
            }
        }
    }

    public class HabitOrderDto
    {
        public int HabitId { get; set; }
        public int DisplayOrder { get; set; }
    }

    public class BulkEditRequest
    {
        public int HabitId { get; set; }
        public EditHabitDto EditData { get; set; } = new();
    }
}