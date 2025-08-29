using HabitTracker.Application.DTOs.Streak;

namespace HabitTracker.Application.Interfaces
{
    public interface IStreakMilestoneService
    {
        Task<MilestoneCheckResultDto> CheckMilestoneAchievementAsync(int habitId, int currentStreak, CancellationToken cancellationToken = default);
        Task<IEnumerable<MilestoneAchievementDto>> GetAchievedMilestonesAsync(int habitId, CancellationToken cancellationToken = default);
        Task<IEnumerable<MilestoneAchievementDto>> GetRecentMilestonesAsync(int trackerId, int days = 7, CancellationToken cancellationToken = default);
        Task<int> GetNextMilestoneAsync(int currentStreak);
        Task<string> GetMilestoneMessageAsync(int milestoneValue);
        Task<string> GetCelebrationTypeAsync(int milestoneValue);
        Task<Dictionary<int, List<int>>> GetAllMilestonesByTrackerAsync(int trackerId, CancellationToken cancellationToken = default);
        bool IsMilestone(int streakValue);
        List<int> GetMilestoneValues();
    }
}