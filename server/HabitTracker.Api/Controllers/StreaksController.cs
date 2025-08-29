using Microsoft.AspNetCore.Mvc;
using HabitTracker.Application.Interfaces;
using HabitTracker.Application.DTOs.Streak;
using Microsoft.AspNetCore.Authorization;

namespace HabitTracker.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StreaksController : ControllerBase
    {
        private readonly IStreakCalculationService _streakCalculationService;
        private readonly IStreakAnalyticsService _streakAnalyticsService;
        private readonly IStreakMilestoneService _streakMilestoneService;
        private readonly ILogger<StreaksController> _logger;

        public StreaksController(
            IStreakCalculationService streakCalculationService,
            IStreakAnalyticsService streakAnalyticsService,
            IStreakMilestoneService streakMilestoneService,
            ILogger<StreaksController> logger)
        {
            _streakCalculationService = streakCalculationService;
            _streakAnalyticsService = streakAnalyticsService;
            _streakMilestoneService = streakMilestoneService;
            _logger = logger;
        }

        /// <summary>
        /// Get streak details for a specific habit
        /// </summary>
        /// <param name="habitId">The habit ID</param>
        /// <returns>Streak details including current/longest streak and milestone info</returns>
        [HttpGet("habit/{habitId}")]
        public async Task<ActionResult<StreakResponseDto>> GetStreakByHabitId(int habitId)
        {
            try
            {
                var streak = await _streakCalculationService.GetStreakDetailsAsync(habitId);
                return Ok(streak);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning("Invalid habit ID {HabitId}: {Message}", habitId, ex.Message);
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting streak for habit {HabitId}", habitId);
                return StatusCode(500, new { message = "An error occurred while retrieving the streak." });
            }
        }

        /// <summary>
        /// Get all streaks for a tracker
        /// </summary>
        /// <param name="trackerId">The tracker ID</param>
        /// <returns>List of all streaks in the tracker</returns>
        [HttpGet("tracker/{trackerId}")]
        public async Task<ActionResult<IEnumerable<StreakResponseDto>>> GetStreaksByTracker(int trackerId)
        {
            try
            {
                var streaks = await _streakCalculationService.GetStreaksByTrackerAsync(trackerId);
                return Ok(streaks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting streaks for tracker {TrackerId}", trackerId);
                return StatusCode(500, new { message = "An error occurred while retrieving streaks." });
            }
        }

        /// <summary>
        /// Get streaks that are at risk of being broken
        /// </summary>
        /// <param name="trackerId">The tracker ID</param>
        /// <param name="warningDays">Number of days to consider as warning period (default: 1)</param>
        /// <returns>List of streaks at risk</returns>
        [HttpGet("tracker/{trackerId}/at-risk")]
        public async Task<ActionResult<IEnumerable<StreakResponseDto>>> GetStreaksAtRisk(int trackerId, [FromQuery] int warningDays = 1)
        {
            try
            {
                var streaksAtRisk = await _streakCalculationService.GetStreaksAtRiskAsync(trackerId, warningDays);
                return Ok(streaksAtRisk);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting streaks at risk for tracker {TrackerId}", trackerId);
                return StatusCode(500, new { message = "An error occurred while retrieving streaks at risk." });
            }
        }

        /// <summary>
        /// Get streak analytics for a tracker
        /// </summary>
        /// <param name="trackerId">The tracker ID</param>
        /// <returns>Comprehensive streak analytics including trends and statistics</returns>
        [HttpGet("analytics/{trackerId}")]
        public async Task<ActionResult<StreakAnalyticsDto>> GetStreakAnalytics(int trackerId)
        {
            try
            {
                var analytics = await _streakAnalyticsService.GetStreakAnalyticsAsync(trackerId);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting streak analytics for tracker {TrackerId}", trackerId);
                return StatusCode(500, new { message = "An error occurred while retrieving streak analytics." });
            }
        }

        /// <summary>
        /// Get streak trends over a specified period
        /// </summary>
        /// <param name="trackerId">The tracker ID</param>
        /// <param name="days">Number of days to analyze (default: 30)</param>
        /// <returns>Daily streak trend data</returns>
        [HttpGet("trends/{trackerId}")]
        public async Task<ActionResult<IEnumerable<StreakTrendDto>>> GetStreakTrends(int trackerId, [FromQuery] int days = 30)
        {
            try
            {
                var trends = await _streakAnalyticsService.GetStreakTrendsAsync(trackerId, days);
                return Ok(trends);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting streak trends for tracker {TrackerId}", trackerId);
                return StatusCode(500, new { message = "An error occurred while retrieving streak trends." });
            }
        }

        /// <summary>
        /// Get streak leaderboard for a tracker
        /// </summary>
        /// <param name="trackerId">The tracker ID</param>
        /// <param name="count">Number of entries to return (default: 10)</param>
        /// <param name="byCurrentStreak">Sort by current streak if true, longest streak if false (default: true)</param>
        /// <returns>Streak leaderboard entries</returns>
        [HttpGet("leaderboard/{trackerId}")]
        public async Task<ActionResult<IEnumerable<StreakLeaderboardEntryDto>>> GetStreakLeaderboard(
            int trackerId, 
            [FromQuery] int count = 10, 
            [FromQuery] bool byCurrentStreak = true)
        {
            try
            {
                var leaderboard = await _streakAnalyticsService.GetStreakLeaderboardAsync(trackerId, count, byCurrentStreak);
                return Ok(leaderboard);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting streak leaderboard for tracker {TrackerId}", trackerId);
                return StatusCode(500, new { message = "An error occurred while retrieving the leaderboard." });
            }
        }

        /// <summary>
        /// Get streak statistics for a tracker
        /// </summary>
        /// <param name="trackerId">The tracker ID</param>
        /// <returns>Dictionary of streak statistics</returns>
        [HttpGet("statistics/{trackerId}")]
        public async Task<ActionResult<Dictionary<string, double>>> GetStreakStatistics(int trackerId)
        {
            try
            {
                var statistics = await _streakAnalyticsService.GetStreakStatisticsAsync(trackerId);
                return Ok(statistics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting streak statistics for tracker {TrackerId}", trackerId);
                return StatusCode(500, new { message = "An error occurred while retrieving statistics." });
            }
        }

        /// <summary>
        /// Check milestone achievements for a habit
        /// </summary>
        /// <param name="habitId">The habit ID</param>
        /// <param name="currentStreak">The current streak value</param>
        /// <returns>Milestone check results including any new achievements</returns>
        [HttpPost("milestones/check/{habitId}")]
        public async Task<ActionResult<MilestoneCheckResultDto>> CheckMilestones(int habitId, [FromQuery] int currentStreak)
        {
            try
            {
                var result = await _streakMilestoneService.CheckMilestoneAchievementAsync(habitId, currentStreak);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking milestones for habit {HabitId}", habitId);
                return StatusCode(500, new { message = "An error occurred while checking milestones." });
            }
        }

        /// <summary>
        /// Get achieved milestones for a habit
        /// </summary>
        /// <param name="habitId">The habit ID</param>
        /// <returns>List of achieved milestones</returns>
        [HttpGet("milestones/{habitId}")]
        public async Task<ActionResult<IEnumerable<MilestoneAchievementDto>>> GetAchievedMilestones(int habitId)
        {
            try
            {
                var milestones = await _streakMilestoneService.GetAchievedMilestonesAsync(habitId);
                return Ok(milestones);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting achieved milestones for habit {HabitId}", habitId);
                return StatusCode(500, new { message = "An error occurred while retrieving milestones." });
            }
        }

        /// <summary>
        /// Get recent milestones for a tracker
        /// </summary>
        /// <param name="trackerId">The tracker ID</param>
        /// <param name="days">Number of days to look back (default: 7)</param>
        /// <returns>List of recent milestone achievements</returns>
        [HttpGet("milestones/recent/{trackerId}")]
        public async Task<ActionResult<IEnumerable<MilestoneAchievementDto>>> GetRecentMilestones(int trackerId, [FromQuery] int days = 7)
        {
            try
            {
                var milestones = await _streakMilestoneService.GetRecentMilestonesAsync(trackerId, days);
                return Ok(milestones);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent milestones for tracker {TrackerId}", trackerId);
                return StatusCode(500, new { message = "An error occurred while retrieving recent milestones." });
            }
        }

        /// <summary>
        /// Recalculate streak for a specific habit
        /// </summary>
        /// <param name="habitId">The habit ID</param>
        /// <returns>Updated streak information</returns>
        [HttpPost("recalculate/{habitId}")]
        public async Task<ActionResult<StreakResponseDto>> RecalculateStreak(int habitId)
        {
            try
            {
                await _streakCalculationService.RecalculateStreakAsync(habitId);
                var streak = await _streakCalculationService.GetStreakDetailsAsync(habitId);
                return Ok(streak);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning("Invalid habit ID {HabitId}: {Message}", habitId, ex.Message);
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error recalculating streak for habit {HabitId}", habitId);
                return StatusCode(500, new { message = "An error occurred while recalculating the streak." });
            }
        }

        /// <summary>
        /// Recalculate all streaks for a tracker
        /// </summary>
        /// <param name="trackerId">The tracker ID</param>
        /// <returns>List of updated streaks</returns>
        [HttpPost("recalculate/tracker/{trackerId}")]
        public async Task<ActionResult<IEnumerable<StreakResponseDto>>> RecalculateAllStreaks(int trackerId)
        {
            try
            {
                await _streakCalculationService.RecalculateAllStreaksAsync(trackerId);
                var streaks = await _streakCalculationService.GetStreaksByTrackerAsync(trackerId);
                return Ok(streaks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error recalculating streaks for tracker {TrackerId}", trackerId);
                return StatusCode(500, new { message = "An error occurred while recalculating streaks." });
            }
        }

        /// <summary>
        /// Validate streak consistency for a habit
        /// </summary>
        /// <param name="habitId">The habit ID</param>
        /// <returns>Validation result</returns>
        [HttpGet("validate/{habitId}")]
        public async Task<ActionResult<object>> ValidateStreakConsistency(int habitId)
        {
            try
            {
                var isConsistent = await _streakCalculationService.ValidateStreakConsistencyAsync(habitId);
                return Ok(new { habitId, isConsistent });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating streak consistency for habit {HabitId}", habitId);
                return StatusCode(500, new { message = "An error occurred while validating streak consistency." });
            }
        }

        /// <summary>
        /// Get top performing habits by streak
        /// </summary>
        /// <param name="trackerId">The tracker ID</param>
        /// <param name="count">Number of top performers to return (default: 5)</param>
        /// <returns>List of top performing habits</returns>
        [HttpGet("top-performers/{trackerId}")]
        public async Task<ActionResult<IEnumerable<StreakResponseDto>>> GetTopPerformers(int trackerId, [FromQuery] int count = 5)
        {
            try
            {
                var topPerformers = await _streakAnalyticsService.GetTopPerformersAsync(trackerId, count);
                return Ok(topPerformers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting top performers for tracker {TrackerId}", trackerId);
                return StatusCode(500, new { message = "An error occurred while retrieving top performers." });
            }
        }

        /// <summary>
        /// Get overall progress for a tracker
        /// </summary>
        /// <param name="trackerId">The tracker ID</param>
        /// <returns>Overall progress percentage</returns>
        [HttpGet("progress/{trackerId}")]
        public async Task<ActionResult<object>> GetOverallProgress(int trackerId)
        {
            try
            {
                var progress = await _streakAnalyticsService.GetOverallProgressAsync(trackerId);
                return Ok(new { trackerId, progress });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting overall progress for tracker {TrackerId}", trackerId);
                return StatusCode(500, new { message = "An error occurred while retrieving progress." });
            }
        }
    }
}