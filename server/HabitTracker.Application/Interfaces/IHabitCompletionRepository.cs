using HabitTracker.Domain.Entities;

namespace HabitTracker.Application.Interfaces
{
    public interface IHabitCompletionRepository : IGenericRepository<HabitCompletion>
    {
        // Basic completion operations
        Task<HabitCompletion?> GetCompletionByHabitAndDateAsync(int habitId, DateTime date, CancellationToken cancellationToken = default);
        Task<IEnumerable<HabitCompletion>> GetCompletionsByHabitIdAsync(int habitId, CancellationToken cancellationToken = default);
        Task<IEnumerable<HabitCompletion>> GetCompletionsByTrackerIdAsync(int trackerId, CancellationToken cancellationToken = default);
        
        // Date-based queries
        Task<IEnumerable<HabitCompletion>> GetCompletionsByDateAsync(DateTime date, CancellationToken cancellationToken = default);
        Task<IEnumerable<HabitCompletion>> GetCompletionsByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
        Task<IEnumerable<HabitCompletion>> GetCompletionsByHabitAndDateRangeAsync(int habitId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
        Task<IEnumerable<HabitCompletion>> GetCompletionsByTrackerAndDateRangeAsync(int trackerId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
        
        // Recent completion operations
        Task<IEnumerable<HabitCompletion>> GetRecentCompletionsAsync(int habitId, int days = 30, CancellationToken cancellationToken = default);
        Task<IEnumerable<HabitCompletion>> GetRecentCompletionsByTrackerAsync(int trackerId, int days = 30, CancellationToken cancellationToken = default);
        Task<HabitCompletion?> GetLastCompletionAsync(int habitId, CancellationToken cancellationToken = default);
        Task<HabitCompletion?> GetFirstCompletionAsync(int habitId, CancellationToken cancellationToken = default);
        
        // Completion status operations
        Task<bool> IsHabitCompletedOnDateAsync(int habitId, DateOnly date, CancellationToken cancellationToken = default);
        Task<IEnumerable<DateOnly>> GetCompletedDatesAsync(int habitId, DateOnly? startDate = null, DateOnly? endDate = null, CancellationToken cancellationToken = default);
        Task<IEnumerable<DateOnly>> GetMissedDatesAsync(int habitId, DateOnly startDate, DateOnly endDate, CancellationToken cancellationToken = default);
        
        // Advanced queries with relationships
        Task<IEnumerable<HabitCompletion>> GetCompletionsWithHabitAsync(int trackerId, DateOnly? date = null, CancellationToken cancellationToken = default);
        Task<IEnumerable<HabitCompletion>> GetCompletionsWithHabitAndTrackerAsync(string? userId, DateOnly? date = null, CancellationToken cancellationToken = default);
        
        // Completion management
        Task<HabitCompletion> ToggleCompletionAsync(int habitId, DateOnly date, string? notes = null, CancellationToken cancellationToken = default);
        Task<HabitCompletion> MarkAsCompletedAsync(int habitId, DateOnly date, string? notes = null, CancellationToken cancellationToken = default);
        Task<HabitCompletion> MarkAsIncompleteAsync(int habitId, DateOnly date, CancellationToken cancellationToken = default);
        Task<bool> RemoveCompletionAsync(int habitId, DateOnly date, CancellationToken cancellationToken = default);
        
        // Bulk operations
        Task<IEnumerable<HabitCompletion>> MarkMultipleCompletedAsync(IEnumerable<(int HabitId, DateOnly Date, string? Notes)> completions, CancellationToken cancellationToken = default);
        Task<bool> RemoveMultipleCompletionsAsync(IEnumerable<(int HabitId, DateOnly Date)> completions, CancellationToken cancellationToken = default);
        Task<IEnumerable<HabitCompletion>> GetOrCreateCompletionsForDateAsync(int trackerId, DateOnly date, CancellationToken cancellationToken = default);
        
        // Statistics and aggregations
        Task<int> GetCompletionCountAsync(int habitId, DateOnly? startDate = null, DateOnly? endDate = null, CancellationToken cancellationToken = default);
        Task<int> GetCompletionCountByTrackerAsync(int trackerId, DateOnly? startDate = null, DateOnly? endDate = null, CancellationToken cancellationToken = default);
        Task<double> GetCompletionRateAsync(int habitId, DateOnly? startDate = null, DateOnly? endDate = null, CancellationToken cancellationToken = default);
        Task<double> GetCompletionRateByTrackerAsync(int trackerId, DateOnly? startDate = null, DateOnly? endDate = null, CancellationToken cancellationToken = default);
        
        // Streak calculation support
        Task<IEnumerable<DateOnly>> GetConsecutiveCompletionDatesAsync(int habitId, DateOnly fromDate, bool backwards = false, CancellationToken cancellationToken = default);
        Task<int> GetCurrentStreakLengthAsync(int habitId, DateOnly? referenceDate = null, CancellationToken cancellationToken = default);
        Task<(int Length, DateOnly StartDate, DateOnly EndDate)?> GetLongestStreakAsync(int habitId, CancellationToken cancellationToken = default);
        Task<IEnumerable<(DateOnly StartDate, DateOnly EndDate, int Length)>> GetAllStreaksAsync(int habitId, int minLength = 2, CancellationToken cancellationToken = default);
        
        // Calendar and weekly views
        Task<Dictionary<DateOnly, bool>> GetCompletionCalendarAsync(int habitId, int year, int month, CancellationToken cancellationToken = default);
        Task<Dictionary<DateOnly, IEnumerable<HabitCompletion>>> GetWeeklyCompletionsAsync(int trackerId, DateOnly weekStartDate, CancellationToken cancellationToken = default);
        Task<Dictionary<DateOnly, int>> GetDailyCompletionCountsAsync(int trackerId, DateOnly startDate, DateOnly endDate, CancellationToken cancellationToken = default);
        
        // Analytics and insights
        Task<Dictionary<DayOfWeek, int>> GetCompletionsByDayOfWeekAsync(int habitId, DateOnly? startDate = null, DateOnly? endDate = null, CancellationToken cancellationToken = default);
        Task<Dictionary<int, int>> GetCompletionsByMonthAsync(int habitId, int year, CancellationToken cancellationToken = default);
        Task<Dictionary<int, double>> GetMonthlyCompletionRatesAsync(int habitId, int year, CancellationToken cancellationToken = default);
        
        // Data cleanup and maintenance
        Task<int> DeleteOldCompletionsAsync(DateOnly cutoffDate, CancellationToken cancellationToken = default);
        Task<int> DeleteCompletionsByHabitAsync(int habitId, CancellationToken cancellationToken = default);
        Task<int> DeleteCompletionsByTrackerAsync(int trackerId, CancellationToken cancellationToken = default);
    }
}