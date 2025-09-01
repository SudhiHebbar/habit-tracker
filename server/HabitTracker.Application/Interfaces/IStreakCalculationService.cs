using HabitTracker.Application.DTOs.Streak;
using HabitTracker.Domain.Entities;

namespace HabitTracker.Application.Interfaces
{
    public interface IStreakCalculationService
    {
        Task<Streak> CalculateStreakAsync(int habitId, CancellationToken cancellationToken = default);
        Task<Streak> UpdateStreakOnCompletionAsync(int habitId, DateOnly completionDate, CancellationToken cancellationToken = default);
        Task<Streak> UpdateStreakOnDeletionAsync(int habitId, DateOnly deletionDate, CancellationToken cancellationToken = default);
        Task<Streak> RecalculateStreakAsync(int habitId, CancellationToken cancellationToken = default);
        Task<IEnumerable<Streak>> RecalculateAllStreaksAsync(int trackerId, CancellationToken cancellationToken = default);
        Task<bool> ValidateStreakConsistencyAsync(int habitId, CancellationToken cancellationToken = default);
        Task<StreakResponseDto> GetStreakDetailsAsync(int habitId, CancellationToken cancellationToken = default);
        Task<IEnumerable<StreakResponseDto>> GetStreaksByTrackerAsync(int trackerId, CancellationToken cancellationToken = default);
        Task<IEnumerable<StreakResponseDto>> GetStreaksAtRiskAsync(int trackerId, int warningDays = 1, CancellationToken cancellationToken = default);
        Task<Dictionary<int, bool>> CheckStreakRisksAsync(int trackerId, CancellationToken cancellationToken = default);
    }
}