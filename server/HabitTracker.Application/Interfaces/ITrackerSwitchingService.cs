using HabitTracker.Application.DTOs.Tracker;

namespace HabitTracker.Application.Interfaces
{
    public interface ITrackerSwitchingService
    {
        Task<IEnumerable<TrackerSummaryDto>> GetTrackerSummariesAsync(string? userId, CancellationToken cancellationToken = default);
        Task<TrackerWithStatsDto?> GetTrackerWithStatsAsync(int trackerId, string? userId, CancellationToken cancellationToken = default);
        Task<TrackerSwitchDto> GetTrackerSwitchDataAsync(int currentTrackerId, string? userId, CancellationToken cancellationToken = default);
        Task RecordTrackerAccessAsync(int trackerId, string? userId, CancellationToken cancellationToken = default);
        Task<IEnumerable<TrackerSummaryDto>> GetRecentTrackersAsync(string? userId, int count = 5, CancellationToken cancellationToken = default);
        Task<IEnumerable<TrackerSummaryDto>> GetFavoriteTrackersAsync(string? userId, int count = 5, CancellationToken cancellationToken = default);
        Task PreloadTrackerDataAsync(int trackerId, string? userId, CancellationToken cancellationToken = default);
    }
}