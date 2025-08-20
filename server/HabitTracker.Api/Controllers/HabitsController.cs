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
        private readonly ILogger<HabitsController> _logger;

        public HabitsController(IHabitService habitService, ILogger<HabitsController> logger)
        {
            _habitService = habitService;
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
        /// Delete a habit (soft delete)
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteHabit(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                string? userId = null;

                var result = await _habitService.DeleteHabitAsync(id, userId, cancellationToken);
                
                if (!result)
                {
                    return NotFound($"Habit with ID {id} not found");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting habit {HabitId}", id);
                return StatusCode(500, "An error occurred while deleting the habit");
            }
        }

        /// <summary>
        /// Restore a soft-deleted habit
        /// </summary>
        [HttpPost("{id}/restore")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> RestoreHabit(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                string? userId = null;

                var result = await _habitService.RestoreHabitAsync(id, userId, cancellationToken);
                
                if (!result)
                {
                    return NotFound($"Habit with ID {id} not found");
                }

                return Ok(new { message = "Habit restored successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error restoring habit {HabitId}", id);
                return StatusCode(500, "An error occurred while restoring the habit");
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
}