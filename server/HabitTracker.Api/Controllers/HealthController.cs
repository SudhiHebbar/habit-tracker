using Microsoft.AspNetCore.Mvc;

namespace HabitTracker.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        private readonly ILogger<HealthController> _logger;

        public HealthController(ILogger<HealthController> logger)
        {
            _logger = logger;
        }

        [HttpGet]
        public ActionResult<object> Get()
        {
            _logger.LogInformation("Health check requested at {Timestamp}", DateTime.UtcNow);

            var healthStatus = new
            {
                Status = "Healthy",
                Timestamp = DateTime.UtcNow,
                Version = "1.0.0",
                Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown"
            };

            return Ok(healthStatus);
        }

        [HttpGet("detailed")]
        public ActionResult<object> GetDetailed()
        {
            _logger.LogInformation("Detailed health check requested at {Timestamp}", DateTime.UtcNow);

            var detailedHealth = new
            {
                Status = "Healthy",
                Timestamp = DateTime.UtcNow,
                Version = "1.0.0",
                Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown",
                MachineName = Environment.MachineName,
                ProcessId = Environment.ProcessId,
                WorkingSet = Environment.WorkingSet,
                Checks = new
                {
                    Database = "Not implemented yet",
                    Memory = $"{Environment.WorkingSet / 1024 / 1024} MB",
                    Uptime = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss") + " UTC"
                }
            };

            return Ok(detailedHealth);
        }
    }
}