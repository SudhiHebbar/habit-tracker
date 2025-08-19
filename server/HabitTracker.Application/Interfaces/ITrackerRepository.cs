using HabitTracker.Domain.Entities;

namespace HabitTracker.Application.Interfaces
{
    public interface ITrackerRepository : IGenericRepository<Tracker>
    {
        // User-specific operations
        Task<IEnumerable<Tracker>> GetTrackersByUserIdAsync(string? userId, CancellationToken cancellationToken = default);
        Task<IEnumerable<Tracker>> GetActiveTrackersByUserIdAsync(string? userId, CancellationToken cancellationToken = default);
        Task<Tracker?> GetTrackerByUserAndNameAsync(string? userId, string name, CancellationToken cancellationToken = default);
        
        // Sharing operations
        Task<IEnumerable<Tracker>> GetSharedTrackersAsync(CancellationToken cancellationToken = default);
        Task<bool> IsTrackerSharedAsync(int trackerId, CancellationToken cancellationToken = default);
        Task SetTrackerSharingStatusAsync(int trackerId, bool isShared, CancellationToken cancellationToken = default);
        
        // Display order operations
        Task<IEnumerable<Tracker>> GetTrackersOrderedByDisplayOrderAsync(string? userId, CancellationToken cancellationToken = default);
        Task UpdateDisplayOrderAsync(int trackerId, int displayOrder, CancellationToken cancellationToken = default);
        Task ReorderTrackersAsync(string? userId, List<(int TrackerId, int DisplayOrder)> trackerOrders, CancellationToken cancellationToken = default);
        
        // Advanced queries with relationships
        Task<Tracker?> GetTrackerWithHabitsAsync(int trackerId, CancellationToken cancellationToken = default);
        Task<Tracker?> GetTrackerWithActiveHabitsAsync(int trackerId, CancellationToken cancellationToken = default);
        Task<IEnumerable<Tracker>> GetTrackersWithHabitCountsAsync(string? userId, CancellationToken cancellationToken = default);
        
        // Business logic operations
        Task<bool> CanUserAccessTrackerAsync(string? userId, int trackerId, CancellationToken cancellationToken = default);
        Task<bool> IsTrackerNameUniqueForUserAsync(string? userId, string name, int? excludeTrackerId = null, CancellationToken cancellationToken = default);
        Task<int> GetActiveHabitCountAsync(int trackerId, CancellationToken cancellationToken = default);
        
        // Soft delete operations
        Task SoftDeleteAsync(int trackerId, CancellationToken cancellationToken = default);
        Task RestoreAsync(int trackerId, CancellationToken cancellationToken = default);
        
        // Statistics and analytics
        Task<Dictionary<int, int>> GetHabitCountsByTrackerAsync(string? userId, CancellationToken cancellationToken = default);
        Task<DateTime?> GetLastActivityDateAsync(int trackerId, CancellationToken cancellationToken = default);
    }
}