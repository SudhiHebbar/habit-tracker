using HabitTracker.Application.DTOs.Habit;

namespace HabitTracker.Application.Interfaces
{
    public interface IHabitDeletionService
    {
        // Deletion impact analysis
        Task<DeletionImpactDto> CalculateDeletionImpactAsync(int habitId, string? userId, CancellationToken cancellationToken = default);
        Task<BulkDeletionImpactDto> CalculateBulkDeletionImpactAsync(List<int> habitIds, string? userId, CancellationToken cancellationToken = default);
        
        // Soft delete operations
        Task<bool> SoftDeleteHabitAsync(int habitId, DeleteHabitDto deleteDto, string? userId, CancellationToken cancellationToken = default);
        Task<bool> BulkSoftDeleteHabitsAsync(BulkDeleteDto bulkDeleteDto, string? userId, CancellationToken cancellationToken = default);
        
        // Restore operations
        Task<bool> RestoreHabitAsync(int habitId, RestoreHabitDto restoreDto, string? userId, CancellationToken cancellationToken = default);
        Task<bool> BulkRestoreHabitsAsync(List<int> habitIds, string? userId, CancellationToken cancellationToken = default);
        
        // Deleted habits management
        Task<IEnumerable<HabitResponseDto>> GetDeletedHabitsByTrackerAsync(int trackerId, string? userId, CancellationToken cancellationToken = default);
        Task<IEnumerable<HabitResponseDto>> GetAllDeletedHabitsAsync(string? userId, CancellationToken cancellationToken = default);
        
        // Permanent deletion (for compliance)
        Task<bool> PermanentlyDeleteHabitAsync(int habitId, string? userId, CancellationToken cancellationToken = default);
        Task<bool> PermanentlyDeleteOldHabitsAsync(DateTime cutoffDate, string? userId, CancellationToken cancellationToken = default);
        
        // Undo functionality
        Task<bool> CanUndoDeletionAsync(int habitId, string? userId, CancellationToken cancellationToken = default);
        Task<bool> UndoRecentDeletionAsync(int habitId, string? userId, CancellationToken cancellationToken = default);
    }
}