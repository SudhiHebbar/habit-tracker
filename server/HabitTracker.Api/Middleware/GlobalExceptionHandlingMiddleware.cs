using System.Net;
using System.Text.Json;

namespace HabitTracker.Api.Middleware
{
    public class GlobalExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionHandlingMiddleware> _logger;

        public GlobalExceptionHandlingMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled exception occurred. RequestPath: {RequestPath}", context.Request.Path);
                await HandleExceptionAsync(context, ex);
            }
        }

        private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            
            var response = new ErrorResponse
            {
                Message = "An error occurred while processing your request.",
                Details = context.Request.Path.Value ?? string.Empty
            };

            switch (exception)
            {
                case ArgumentException:
                    response.Message = "Invalid argument provided.";
                    context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                    break;
                
                case UnauthorizedAccessException:
                    response.Message = "Unauthorized access.";
                    context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                    break;
                
                case KeyNotFoundException:
                    response.Message = "The requested resource was not found.";
                    context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                    break;
                
                default:
                    response.Message = "An internal server error occurred.";
                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    break;
            }

            // Add correlation ID for request tracking
            var correlationId = context.TraceIdentifier ?? Guid.NewGuid().ToString();
            response.CorrelationId = correlationId;
            response.Timestamp = DateTime.UtcNow;

            var jsonResponse = JsonSerializer.Serialize(response, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            await context.Response.WriteAsync(jsonResponse);
        }
    }

    public class ErrorResponse
    {
        public string Message { get; set; } = string.Empty;
        public string Details { get; set; } = string.Empty;
        public string CorrelationId { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }
}