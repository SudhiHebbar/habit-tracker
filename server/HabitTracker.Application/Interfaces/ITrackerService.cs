using HabitTracker.Application.DTOs.Tracker;

namespace HabitTracker.Application.Interfaces
{
    public interface ITrackerService
    {
        Task<IEnumerable<TrackerResponseDto>> GetAllTrackersAsync(string? userId, CancellationToken cancellationToken = default);
        Task<IEnumerable<TrackerResponseDto>> GetActiveTrackersAsync(string? userId, CancellationToken cancellationToken = default);
        Task<TrackerResponseDto?> GetTrackerByIdAsync(int id, string? userId, CancellationToken cancellationToken = default);
        Task<TrackerResponseDto> CreateTrackerAsync(CreateTrackerDto createDto, string? userId, CancellationToken cancellationToken = default);
        Task<TrackerResponseDto?> UpdateTrackerAsync(int id, UpdateTrackerDto updateDto, string? userId, CancellationToken cancellationToken = default);
        Task<bool> DeleteTrackerAsync(int id, string? userId, CancellationToken cancellationToken = default);
        Task<bool> RestoreTrackerAsync(int id, string? userId, CancellationToken cancellationToken = default);
        Task<IEnumerable<TrackerResponseDto>> GetSharedTrackersAsync(CancellationToken cancellationToken = default);
        Task<bool> UpdateDisplayOrderAsync(string? userId, List<(int TrackerId, int DisplayOrder)> trackerOrders, CancellationToken cancellationToken = default);
    }
}