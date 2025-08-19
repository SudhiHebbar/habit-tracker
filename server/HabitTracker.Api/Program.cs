using Serilog;
using Microsoft.EntityFrameworkCore;
using HabitTracker.Infrastructure.Data;
using HabitTracker.Api.Extensions;
using HabitTracker.Application.Interfaces;
using HabitTracker.Infrastructure.Repositories;
using HabitTracker.Application.Services;
using HabitTracker.Application.Mappings;
using HabitTracker.Application.Validators;
using FluentValidation;
using HabitTracker.Application.DTOs.Tracker;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers();

// Configure Entity Framework Core (placeholder - will be configured later)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Server=(localdb)\\mssqllocaldb;Database=HabitTrackerDb;Trusted_Connection=true;MultipleActiveResultSets=true";

builder.Services.AddDbContext<HabitTrackerDbContext>(options =>
    options.UseSqlServer(connectionString));

// Configure Repository Pattern and Unit of Work
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<ITrackerRepository, TrackerRepository>();

// Configure AutoMapper
var mapperConfig = new AutoMapper.MapperConfiguration(cfg =>
{
    cfg.AddProfile<TrackerMappingProfile>();
});
builder.Services.AddSingleton<AutoMapper.IMapper>(mapperConfig.CreateMapper());

// Configure FluentValidation
builder.Services.AddScoped<IValidator<CreateTrackerDto>, CreateTrackerValidator>();
builder.Services.AddScoped<IValidator<UpdateTrackerDto>, UpdateTrackerValidator>();

// Configure Application Services
builder.Services.AddScoped<ITrackerService, TrackerService>();

// Configure CORS for React frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Add health checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<HabitTrackerDbContext>();

// Configure Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Habit Tracker API",
        Version = "v1",
        Description = "API for managing habit trackers and tracking progress"
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
// Global error handling should be early in the pipeline
app.UseGlobalExceptionHandling();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Habit Tracker API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();

// Enable CORS
app.UseCors("ReactApp");

// Authentication and Authorization (prepared for future implementation)
app.UseAuthentication();
app.UseAuthorization();

// Map controllers
app.MapControllers();

// Map health checks
app.MapHealthChecks("/health");

app.Run();

// Make the Program class public for testing
public partial class Program { }
