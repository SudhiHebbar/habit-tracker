using HabitTracker.Application.DTOs.Streak;

namespace HabitTracker.Application.Interfaces
{
    public interface IStreakAnalyticsService
    {
        Task<StreakAnalyticsDto> GetStreakAnalyticsAsync(int trackerId, CancellationToken cancellationToken = default);
        Task<IEnumerable<StreakTrendDto>> GetStreakTrendsAsync(int trackerId, int days = 30, CancellationToken cancellationToken = default);
        Task<IEnumerable<StreakLeaderboardEntryDto>> GetStreakLeaderboardAsync(int trackerId, int count = 10, bool byCurrentStreak = true, CancellationToken cancellationToken = default);
        Task<Dictionary<string, double>> GetStreakStatisticsAsync(int trackerId, CancellationToken cancellationToken = default);
        Task<Dictionary<int, int>> GetStreakDistributionAsync(int trackerId, CancellationToken cancellationToken = default);
        Task<IEnumerable<StreakResponseDto>> GetTopPerformersAsync(int trackerId, int count = 5, CancellationToken cancellationToken = default);
        Task<double> GetOverallProgressAsync(int trackerId, CancellationToken cancellationToken = default);
        Task<Dictionary<string, int>> GetMilestoneStatisticsAsync(int trackerId, CancellationToken cancellationToken = default);
    }
}