using HabitTracker.Domain.Entities;

namespace HabitTracker.Application.Interfaces
{
    public interface IHabitRepository : IGenericRepository<Habit>
    {
        // Tracker-specific operations
        Task<IEnumerable<Habit>> GetHabitsByTrackerIdAsync(int trackerId, CancellationToken cancellationToken = default);
        Task<IEnumerable<Habit>> GetActiveHabitsByTrackerIdAsync(int trackerId, CancellationToken cancellationToken = default);
        Task<Habit?> GetHabitByTrackerAndNameAsync(int trackerId, string name, CancellationToken cancellationToken = default);
        
        // Display order operations
        Task<IEnumerable<Habit>> GetHabitsOrderedByDisplayOrderAsync(int trackerId, CancellationToken cancellationToken = default);
        Task UpdateDisplayOrderAsync(int habitId, int displayOrder, CancellationToken cancellationToken = default);
        Task ReorderHabitsAsync(int trackerId, List<(int HabitId, int DisplayOrder)> habitOrders, CancellationToken cancellationToken = default);
        
        // Advanced queries with relationships
        Task<Habit?> GetHabitWithTrackerAsync(int habitId, CancellationToken cancellationToken = default);
        Task<Habit?> GetHabitWithCompletionsAsync(int habitId, CancellationToken cancellationToken = default);
        Task<Habit?> GetHabitWithStreakAsync(int habitId, CancellationToken cancellationToken = default);
        Task<Habit?> GetHabitWithAllRelationsAsync(int habitId, CancellationToken cancellationToken = default);
        Task<IEnumerable<Habit>> GetHabitsWithCompletionDataAsync(int trackerId, CancellationToken cancellationToken = default);
        
        // Frequency and target operations
        Task<IEnumerable<Habit>> GetHabitsByFrequencyAsync(int trackerId, string frequency, CancellationToken cancellationToken = default);
        Task<IEnumerable<Habit>> GetHabitsByTargetCountAsync(int trackerId, int targetCount, CancellationToken cancellationToken = default);
        Task<Dictionary<string, int>> GetHabitsCountByFrequencyAsync(int trackerId, CancellationToken cancellationToken = default);
        
        // Color and customization operations
        Task<IEnumerable<Habit>> GetHabitsByColorAsync(int trackerId, string color, CancellationToken cancellationToken = default);
        Task<Dictionary<string, int>> GetHabitsCountByColorAsync(int trackerId, CancellationToken cancellationToken = default);
        Task<bool> IsColorUsedInTrackerAsync(int trackerId, string color, int? excludeHabitId = null, CancellationToken cancellationToken = default);
        
        // Business logic operations
        Task<bool> IsHabitNameUniqueInTrackerAsync(int trackerId, string name, int? excludeHabitId = null, CancellationToken cancellationToken = default);
        Task<bool> CanUserAccessHabitAsync(string? userId, int habitId, CancellationToken cancellationToken = default);
        Task<int> GetHabitCountForTrackerAsync(int trackerId, CancellationToken cancellationToken = default);
        Task<int> GetActiveHabitCountForTrackerAsync(int trackerId, CancellationToken cancellationToken = default);
        
        // Recent and activity operations
        Task<IEnumerable<Habit>> GetRecentlyCreatedHabitsAsync(int trackerId, int count = 10, CancellationToken cancellationToken = default);
        Task<IEnumerable<Habit>> GetRecentlyUpdatedHabitsAsync(int trackerId, int count = 10, CancellationToken cancellationToken = default);
        Task<IEnumerable<Habit>> GetHabitsCreatedBetweenAsync(int trackerId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
        
        // Soft delete operations
        Task SoftDeleteAsync(int habitId, CancellationToken cancellationToken = default);
        Task RestoreAsync(int habitId, CancellationToken cancellationToken = default);
        Task SoftDeleteAllByTrackerAsync(int trackerId, CancellationToken cancellationToken = default);
        
        // Bulk operations
        Task<IEnumerable<Habit>> CreateHabitsAsync(IEnumerable<Habit> habits, CancellationToken cancellationToken = default);
        Task UpdateHabitsAsync(IEnumerable<Habit> habits, CancellationToken cancellationToken = default);
        Task DeleteHabitsAsync(IEnumerable<int> habitIds, CancellationToken cancellationToken = default);
        
        // Analytics and statistics
        Task<Dictionary<int, DateTime?>> GetLastCompletionDatesAsync(int trackerId, CancellationToken cancellationToken = default);
        Task<Dictionary<int, int>> GetCompletionCountsAsync(int trackerId, DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default);
    }
}