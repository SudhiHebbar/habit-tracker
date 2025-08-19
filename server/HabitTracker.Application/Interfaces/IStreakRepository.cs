using HabitTracker.Domain.Entities;

namespace HabitTracker.Application.Interfaces
{
    public interface IStreakRepository : IGenericRepository<Streak>
    {
        // Basic streak operations
        Task<Streak?> GetStreakByHabitIdAsync(int habitId, CancellationToken cancellationToken = default);
        Task<IEnumerable<Streak>> GetStreaksByTrackerIdAsync(int trackerId, CancellationToken cancellationToken = default);
        Task<Streak> GetOrCreateStreakAsync(int habitId, CancellationToken cancellationToken = default);
        
        // Streak calculation and updates
        Task<Streak> CalculateAndUpdateStreakAsync(int habitId, CancellationToken cancellationToken = default);
        Task<IEnumerable<Streak>> RecalculateAllStreaksAsync(int trackerId, CancellationToken cancellationToken = default);
        Task<Streak> UpdateCurrentStreakAsync(int habitId, int currentStreak, DateOnly? lastCompletionDate = null, CancellationToken cancellationToken = default);
        Task<Streak> UpdateLongestStreakAsync(int habitId, int longestStreak, CancellationToken cancellationToken = default);
        Task<Streak> ResetCurrentStreakAsync(int habitId, CancellationToken cancellationToken = default);
        
        // Advanced queries with relationships
        Task<Streak?> GetStreakWithHabitAsync(int habitId, CancellationToken cancellationToken = default);
        Task<IEnumerable<Streak>> GetStreaksWithHabitsAsync(int trackerId, CancellationToken cancellationToken = default);
        Task<IEnumerable<Streak>> GetStreaksWithHabitsAndTrackerAsync(string? userId, CancellationToken cancellationToken = default);
        
        // Streak analysis and filtering
        Task<IEnumerable<Streak>> GetActiveStreaksAsync(int trackerId, int minLength = 1, CancellationToken cancellationToken = default);
        Task<IEnumerable<Streak>> GetStreaksByLengthAsync(int trackerId, int minLength, int? maxLength = null, CancellationToken cancellationToken = default);
        Task<IEnumerable<Streak>> GetStreaksAtRiskAsync(int trackerId, int daysSinceLastCompletion = 1, CancellationToken cancellationToken = default);
        Task<IEnumerable<Streak>> GetTopStreaksAsync(int trackerId, int count = 10, bool byCurrentStreak = true, CancellationToken cancellationToken = default);
        
        // Completion rate operations
        Task<Streak> UpdateCompletionRateAsync(int habitId, double completionRate, CancellationToken cancellationToken = default);
        Task<Streak> UpdateTotalCompletionsAsync(int habitId, int totalCompletions, CancellationToken cancellationToken = default);
        Task<IEnumerable<Streak>> GetStreaksByCompletionRateAsync(int trackerId, double minRate, double? maxRate = null, CancellationToken cancellationToken = default);
        
        // Streak milestones and achievements
        Task<IEnumerable<Streak>> GetStreaksMilestoneAsync(int trackerId, IEnumerable<int> milestoneValues, CancellationToken cancellationToken = default);
        Task<bool> HasReachedMilestoneAsync(int habitId, int milestone, CancellationToken cancellationToken = default);
        Task<IEnumerable<int>> GetAchievedMilestonesAsync(int habitId, IEnumerable<int> milestones, CancellationToken cancellationToken = default);
        
        // Time-based streak analysis
        Task<IEnumerable<Streak>> GetStreaksLastUpdatedBeforeAsync(DateTime cutoffDate, CancellationToken cancellationToken = default);
        Task<IEnumerable<Streak>> GetStreaksWithRecentActivityAsync(int trackerId, int days = 7, CancellationToken cancellationToken = default);
        Task<IEnumerable<Streak>> GetStreaksWithNoRecentActivityAsync(int trackerId, int days = 7, CancellationToken cancellationToken = default);
        
        // Bulk operations
        Task<IEnumerable<Streak>> CreateStreaksForHabitsAsync(IEnumerable<int> habitIds, CancellationToken cancellationToken = default);
        Task<bool> DeleteStreaksByTrackerAsync(int trackerId, CancellationToken cancellationToken = default);
        Task<bool> DeleteStreaksByHabitIdsAsync(IEnumerable<int> habitIds, CancellationToken cancellationToken = default);
        Task<IEnumerable<Streak>> BulkUpdateStreaksAsync(IEnumerable<Streak> streaks, CancellationToken cancellationToken = default);
        
        // Statistics and analytics
        Task<Dictionary<int, int>> GetCurrentStreakLengthsAsync(int trackerId, CancellationToken cancellationToken = default);
        Task<Dictionary<int, int>> GetLongestStreakLengthsAsync(int trackerId, CancellationToken cancellationToken = default);
        Task<Dictionary<int, double>> GetCompletionRatesAsync(int trackerId, CancellationToken cancellationToken = default);
        Task<Dictionary<int, int>> GetTotalCompletionCountsAsync(int trackerId, CancellationToken cancellationToken = default);
        
        // Streak insights
        Task<double> GetAverageCurrentStreakAsync(int trackerId, CancellationToken cancellationToken = default);
        Task<double> GetAverageLongestStreakAsync(int trackerId, CancellationToken cancellationToken = default);
        Task<double> GetAverageCompletionRateAsync(int trackerId, CancellationToken cancellationToken = default);
        Task<int> GetTotalActiveStreaksAsync(int trackerId, int minLength = 1, CancellationToken cancellationToken = default);
        
        // Streak comparison and ranking
        Task<int> GetStreakRankAsync(int habitId, bool byCurrentStreak = true, CancellationToken cancellationToken = default);
        Task<IEnumerable<(int HabitId, int Streak, int Rank)>> GetStreakLeaderboardAsync(int trackerId, int count = 10, bool byCurrentStreak = true, CancellationToken cancellationToken = default);
        
        // Data maintenance
        Task<int> CleanupOrphanedStreaksAsync(CancellationToken cancellationToken = default);
        Task<bool> ValidateStreakConsistencyAsync(int habitId, CancellationToken cancellationToken = default);
        Task<IEnumerable<int>> FindInconsistentStreaksAsync(int trackerId, CancellationToken cancellationToken = default);
        Task<Streak> RecalculateStreakFromCompletionsAsync(int habitId, CancellationToken cancellationToken = default);
    }
}