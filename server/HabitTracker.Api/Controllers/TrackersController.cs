using HabitTracker.Application.DTOs.Tracker;
using HabitTracker.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HabitTracker.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TrackersController : ControllerBase
    {
        private readonly ITrackerService _trackerService;
        private readonly ILogger<TrackersController> _logger;

        public TrackersController(ITrackerService trackerService, ILogger<TrackersController> logger)
        {
            _trackerService = trackerService;
            _logger = logger;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<TrackerResponseDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<TrackerResponseDto>>> GetTrackers(
            [FromQuery] bool includeInactive = false,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var userId = GetUserId();
                var trackers = includeInactive 
                    ? await _trackerService.GetAllTrackersAsync(userId, cancellationToken)
                    : await _trackerService.GetActiveTrackersAsync(userId, cancellationToken);
                
                return Ok(trackers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting trackers");
                return StatusCode(500, new { message = "An error occurred while retrieving trackers" });
            }
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(TrackerResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<TrackerResponseDto>> GetTracker(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                var userId = GetUserId();
                var tracker = await _trackerService.GetTrackerByIdAsync(id, userId, cancellationToken);
                
                if (tracker == null)
                {
                    return NotFound(new { message = $"Tracker with ID {id} not found" });
                }
                
                return Ok(tracker);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tracker {TrackerId}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving the tracker" });
            }
        }

        [HttpGet("shared")]
        [ProducesResponseType(typeof(IEnumerable<TrackerResponseDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<TrackerResponseDto>>> GetSharedTrackers(CancellationToken cancellationToken = default)
        {
            try
            {
                var trackers = await _trackerService.GetSharedTrackersAsync(cancellationToken);
                return Ok(trackers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting shared trackers");
                return StatusCode(500, new { message = "An error occurred while retrieving shared trackers" });
            }
        }

        [HttpGet("summaries")]
        [ProducesResponseType(typeof(IEnumerable<TrackerSummaryDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<TrackerSummaryDto>>> GetTrackerSummaries(CancellationToken cancellationToken = default)
        {
            try
            {
                var userId = GetUserId();
                var summaries = await _trackerService.GetTrackerSummariesAsync(userId, cancellationToken);
                
                Response.Headers["Cache-Control"] = "public, max-age=60";
                return Ok(summaries);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tracker summaries");
                return StatusCode(500, new { message = "An error occurred while retrieving tracker summaries" });
            }
        }

        [HttpGet("{id}/full")]
        [ProducesResponseType(typeof(TrackerWithStatsDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<TrackerWithStatsDto>> GetTrackerWithStats(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                var userId = GetUserId();
                var tracker = await _trackerService.GetTrackerWithStatsAsync(id, userId, cancellationToken);
                
                if (tracker == null)
                {
                    return NotFound(new { message = $"Tracker with ID {id} not found" });
                }
                
                Response.Headers["Cache-Control"] = "public, max-age=30";
                return Ok(tracker);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting full tracker data for {TrackerId}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving the tracker data" });
            }
        }

        [HttpPost]
        [ProducesResponseType(typeof(TrackerResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<TrackerResponseDto>> CreateTracker(
            [FromBody] CreateTrackerDto createDto,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var userId = GetUserId();
                var tracker = await _trackerService.CreateTrackerAsync(createDto, userId, cancellationToken);
                return CreatedAtAction(nameof(GetTracker), new { id = tracker.Id }, tracker);
            }
            catch (FluentValidation.ValidationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating tracker");
                return StatusCode(500, new { message = "An error occurred while creating the tracker" });
            }
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(TrackerResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<TrackerResponseDto>> UpdateTracker(
            int id,
            [FromBody] UpdateTrackerDto updateDto,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var userId = GetUserId();
                var tracker = await _trackerService.UpdateTrackerAsync(id, updateDto, userId, cancellationToken);
                
                if (tracker == null)
                {
                    return NotFound(new { message = $"Tracker with ID {id} not found" });
                }
                
                return Ok(tracker);
            }
            catch (FluentValidation.ValidationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating tracker {TrackerId}", id);
                return StatusCode(500, new { message = "An error occurred while updating the tracker" });
            }
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteTracker(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                var userId = GetUserId();
                var result = await _trackerService.DeleteTrackerAsync(id, userId, cancellationToken);
                
                if (!result)
                {
                    return NotFound(new { message = $"Tracker with ID {id} not found" });
                }
                
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting tracker {TrackerId}", id);
                return StatusCode(500, new { message = "An error occurred while deleting the tracker" });
            }
        }

        [HttpPost("{id}/restore")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> RestoreTracker(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                var userId = GetUserId();
                var result = await _trackerService.RestoreTrackerAsync(id, userId, cancellationToken);
                
                if (!result)
                {
                    return NotFound(new { message = $"Tracker with ID {id} not found" });
                }
                
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error restoring tracker {TrackerId}", id);
                return StatusCode(500, new { message = "An error occurred while restoring the tracker" });
            }
        }

        [HttpPut("reorder")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ReorderTrackers(
            [FromBody] List<TrackerOrderDto> trackerOrders,
            CancellationToken cancellationToken = default)
        {
            try
            {
                if (trackerOrders == null || !trackerOrders.Any())
                {
                    return BadRequest(new { message = "Tracker orders are required" });
                }

                var userId = GetUserId();
                var orders = trackerOrders.Select(o => (o.TrackerId, o.DisplayOrder)).ToList();
                var result = await _trackerService.UpdateDisplayOrderAsync(userId, orders, cancellationToken);
                
                if (!result)
                {
                    return BadRequest(new { message = "Failed to update tracker order" });
                }
                
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reordering trackers");
                return StatusCode(500, new { message = "An error occurred while reordering trackers" });
            }
        }

        private string? GetUserId()
        {
            // TODO: Get user ID from authentication context when implemented
            // For now, return null for anonymous access
            return null;
        }
    }

}