using HabitTracker.Application.DTOs.Tracker;
using HabitTracker.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HabitTracker.Api.Controllers
{
    [ApiController]
    [Route("api/tracker-switching")]
    public class TrackerSwitchingController : ControllerBase
    {
        private readonly ITrackerSwitchingService _trackerSwitchingService;
        private readonly ILogger<TrackerSwitchingController> _logger;

        public TrackerSwitchingController(
            ITrackerSwitchingService trackerSwitchingService,
            ILogger<TrackerSwitchingController> logger)
        {
            _trackerSwitchingService = trackerSwitchingService;
            _logger = logger;
        }

        [HttpGet("{trackerId}/switch-data")]
        [ProducesResponseType(typeof(TrackerSwitchDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<TrackerSwitchDto>> GetTrackerSwitchData(
            int trackerId,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var userId = GetUserId();
                var switchData = await _trackerSwitchingService.GetTrackerSwitchDataAsync(trackerId, userId, cancellationToken);
                
                Response.Headers["Cache-Control"] = "private, max-age=10";
                return Ok(switchData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting switch data for tracker {TrackerId}", trackerId);
                return StatusCode(500, new { message = "An error occurred while retrieving switch data" });
            }
        }

        [HttpPost("{trackerId}/record-access")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> RecordTrackerAccess(
            int trackerId,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var userId = GetUserId();
                await _trackerSwitchingService.RecordTrackerAccessAsync(trackerId, userId, cancellationToken);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error recording access for tracker {TrackerId}", trackerId);
                return StatusCode(500, new { message = "An error occurred while recording tracker access" });
            }
        }

        [HttpGet("recent")]
        [ProducesResponseType(typeof(IEnumerable<TrackerSummaryDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<TrackerSummaryDto>>> GetRecentTrackers(
            [FromQuery] int count = 5,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var userId = GetUserId();
                var trackers = await _trackerSwitchingService.GetRecentTrackersAsync(userId, count, cancellationToken);
                
                Response.Headers["Cache-Control"] = "private, max-age=30";
                return Ok(trackers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent trackers");
                return StatusCode(500, new { message = "An error occurred while retrieving recent trackers" });
            }
        }

        [HttpGet("favorites")]
        [ProducesResponseType(typeof(IEnumerable<TrackerSummaryDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<TrackerSummaryDto>>> GetFavoriteTrackers(
            [FromQuery] int count = 5,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var userId = GetUserId();
                var trackers = await _trackerSwitchingService.GetFavoriteTrackersAsync(userId, count, cancellationToken);
                
                Response.Headers["Cache-Control"] = "private, max-age=60";
                return Ok(trackers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting favorite trackers");
                return StatusCode(500, new { message = "An error occurred while retrieving favorite trackers" });
            }
        }

        [HttpPost("{trackerId}/preload")]
        [ProducesResponseType(StatusCodes.Status202Accepted)]
        public async Task<IActionResult> PreloadTrackerData(
            int trackerId,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var userId = GetUserId();
                await _trackerSwitchingService.PreloadTrackerDataAsync(trackerId, userId, cancellationToken);
                return Accepted();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error preloading data for tracker {TrackerId}", trackerId);
                return StatusCode(500, new { message = "An error occurred while preloading tracker data" });
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