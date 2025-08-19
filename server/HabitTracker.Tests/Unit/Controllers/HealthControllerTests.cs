using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using NSubstitute;
using HabitTracker.Api.Controllers;

namespace HabitTracker.Tests.Unit.Controllers
{
    public class HealthControllerTests
    {
        private readonly ILogger<HealthController> _mockLogger;
        private readonly HealthController _controller;

        public HealthControllerTests()
        {
            _mockLogger = Substitute.For<ILogger<HealthController>>();
            _controller = new HealthController(_mockLogger);
        }

        [Fact]
        public void Get_ReturnsHealthyStatus()
        {
            // Act
            var result = _controller.Get();

            // Assert
            result.Should().NotBeNull();
            result.Result.Should().BeOfType<OkObjectResult>();
            
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.Value.Should().NotBeNull();
            
            var healthStatus = okResult.Value!.GetType().GetProperty("Status")?.GetValue(okResult.Value);
            healthStatus.Should().Be("Healthy");
        }

        [Fact]
        public void Get_LogsHealthCheckRequest()
        {
            // Act
            _controller.Get();

            // Assert
            _mockLogger.Received(1).Log(
                LogLevel.Information,
                Arg.Any<EventId>(),
                Arg.Is<object>(o => o.ToString()!.Contains("Health check requested")),
                Arg.Any<Exception?>(),
                Arg.Any<Func<object, Exception?, string>>());
        }

        [Fact]
        public void GetDetailed_ReturnsDetailedHealthStatus()
        {
            // Act
            var result = _controller.GetDetailed();

            // Assert
            result.Should().NotBeNull();
            result.Result.Should().BeOfType<OkObjectResult>();
            
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.Value.Should().NotBeNull();
            
            var healthStatus = okResult.Value!.GetType().GetProperty("Status")?.GetValue(okResult.Value);
            healthStatus.Should().Be("Healthy");
            
            var checks = okResult.Value!.GetType().GetProperty("Checks")?.GetValue(okResult.Value);
            checks.Should().NotBeNull();
        }

        [Fact]
        public void GetDetailed_LogsDetailedHealthCheckRequest()
        {
            // Act
            _controller.GetDetailed();

            // Assert
            _mockLogger.Received(1).Log(
                LogLevel.Information,
                Arg.Any<EventId>(),
                Arg.Is<object>(o => o.ToString()!.Contains("Detailed health check requested")),
                Arg.Any<Exception?>(),
                Arg.Any<Func<object, Exception?, string>>());
        }
    }
}