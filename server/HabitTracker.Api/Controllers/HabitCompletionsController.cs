using HabitTracker.Application.DTOs.Completion;
using HabitTracker.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace HabitTracker.Api.Controllers
{
    [ApiController]
    [Route("api/habits/{habitId}/completions")]
    public class HabitCompletionsController : ControllerBase
    {
        private readonly IHabitCompletionService _completionService;
        private readonly ILogger<HabitCompletionsController> _logger;

        public HabitCompletionsController(
            IHabitCompletionService completionService,
            ILogger<HabitCompletionsController> logger)
        {
            _completionService = completionService;
            _logger = logger;
        }

        [HttpPost("toggle")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(CompletionResponseDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ToggleCompletion(
            [FromRoute] int habitId,
            [FromBody] ToggleCompletionDto dto,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var stopwatch = Stopwatch.StartNew();
                var result = await _completionService.ToggleCompletionAsync(habitId, dto, cancellationToken);
                stopwatch.Stop();
                
                _logger.LogInformation("Toggled completion for habit {HabitId} in {ElapsedMs}ms", 
                    habitId, stopwatch.ElapsedMilliseconds);
                
                if (stopwatch.ElapsedMilliseconds > 200)
                {
                    _logger.LogWarning("Completion toggle exceeded 200ms threshold: {ElapsedMs}ms", 
                        stopwatch.ElapsedMilliseconds);
                }
                
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument for habit {HabitId}", habitId);
                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error toggling completion for habit {HabitId}", habitId);
                return StatusCode(500, new { error = "An error occurred while toggling completion" });
            }
        }

        [HttpPost("complete")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(CompletionResponseDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CompleteHabit(
            [FromRoute] int habitId,
            [FromBody] CompleteHabitDto dto,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var stopwatch = Stopwatch.StartNew();
                var result = await _completionService.CompleteHabitAsync(habitId, dto, cancellationToken);
                stopwatch.Stop();
                
                _logger.LogInformation("Set completion status for habit {HabitId} in {ElapsedMs}ms", 
                    habitId, stopwatch.ElapsedMilliseconds);
                
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument for habit {HabitId}", habitId);
                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting completion status for habit {HabitId}", habitId);
                return StatusCode(500, new { error = "An error occurred while setting completion status" });
            }
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<CompletionResponseDto>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetCompletions(
            [FromRoute] int habitId,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var result = await _completionService.GetCompletionsAsync(habitId, startDate, endDate, cancellationToken);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting completions for habit {HabitId}", habitId);
                return StatusCode(500, new { error = "An error occurred while retrieving completions" });
            }
        }

        [HttpGet("status")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(CompletionStatusDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetCompletionStatus(
            [FromRoute] int habitId,
            [FromQuery] DateTime? date = null,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var targetDate = date ?? DateTime.UtcNow;
                var result = await _completionService.GetCompletionStatusAsync(habitId, targetDate, cancellationToken);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting completion status for habit {HabitId}", habitId);
                return StatusCode(500, new { error = "An error occurred while retrieving completion status" });
            }
        }

        [HttpGet("history")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(CompletionHistoryDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetCompletionHistory(
            [FromRoute] int habitId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 30,
            CancellationToken cancellationToken = default)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 30;
                
                var result = await _completionService.GetCompletionHistoryAsync(habitId, page, pageSize, cancellationToken);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting completion history for habit {HabitId}", habitId);
                return StatusCode(500, new { error = "An error occurred while retrieving completion history" });
            }
        }

        [HttpGet("stats")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(CompletionStatsDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetCompletionStats(
            [FromRoute] int habitId,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var result = await _completionService.GetCompletionStatsAsync(habitId, cancellationToken);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting completion stats for habit {HabitId}", habitId);
                return StatusCode(500, new { error = "An error occurred while retrieving completion stats" });
            }
        }
    }

    [ApiController]
    [Route("api/completions")]
    public class CompletionsController : ControllerBase
    {
        private readonly IHabitCompletionService _completionService;
        private readonly ILogger<CompletionsController> _logger;

        public CompletionsController(
            IHabitCompletionService completionService,
            ILogger<CompletionsController> logger)
        {
            _completionService = completionService;
            _logger = logger;
        }

        [HttpPost("bulk")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(BulkCompletionResponseDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> BulkToggleCompletions(
            [FromBody] BulkCompletionDto dto,
            CancellationToken cancellationToken = default)
        {
            try
            {
                if (dto.HabitIds == null || !dto.HabitIds.Any())
                {
                    return BadRequest(new { error = "No habit IDs provided" });
                }
                
                var stopwatch = Stopwatch.StartNew();
                var result = await _completionService.BulkToggleCompletionsAsync(dto, cancellationToken);
                stopwatch.Stop();
                
                _logger.LogInformation("Bulk toggled {Count} completions in {ElapsedMs}ms", 
                    dto.HabitIds.Count, stopwatch.ElapsedMilliseconds);
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk toggle completions");
                return StatusCode(500, new { error = "An error occurred during bulk completion toggle" });
            }
        }
    }

    [ApiController]
    [Route("api/trackers/{trackerId}/completions")]
    public class TrackerCompletionsController : ControllerBase
    {
        private readonly IHabitCompletionService _completionService;
        private readonly ILogger<TrackerCompletionsController> _logger;

        public TrackerCompletionsController(
            IHabitCompletionService completionService,
            ILogger<TrackerCompletionsController> logger)
        {
            _completionService = completionService;
            _logger = logger;
        }

        [HttpGet("weekly")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(WeeklyCompletionDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetWeeklyCompletions(
            [FromRoute] int trackerId,
            [FromQuery] DateTime? weekStartDate = null,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var startDate = weekStartDate ?? DateTime.UtcNow.Date.AddDays(-(int)DateTime.UtcNow.DayOfWeek);
                var result = await _completionService.GetWeeklyCompletionsAsync(trackerId, startDate, cancellationToken);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting weekly completions for tracker {TrackerId}", trackerId);
                return StatusCode(500, new { error = "An error occurred while retrieving weekly completions" });
            }
        }
    }
}