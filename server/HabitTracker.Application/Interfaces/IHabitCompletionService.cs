using HabitTracker.Application.DTOs.Completion;
using HabitTracker.Domain.Entities;

namespace HabitTracker.Application.Interfaces
{
    public interface IHabitCompletionService
    {
        Task<CompletionResponseDto> ToggleCompletionAsync(int habitId, ToggleCompletionDto dto, CancellationToken cancellationToken = default);
        Task<CompletionResponseDto> CompleteHabitAsync(int habitId, CompleteHabitDto dto, CancellationToken cancellationToken = default);
        Task<IEnumerable<CompletionResponseDto>> GetCompletionsAsync(int habitId, DateTime? startDate = null, DateTime? endDate = null, CancellationToken cancellationToken = default);
        Task<CompletionStatusDto> GetCompletionStatusAsync(int habitId, DateTime date, CancellationToken cancellationToken = default);
        Task<BulkCompletionResponseDto> BulkToggleCompletionsAsync(BulkCompletionDto dto, CancellationToken cancellationToken = default);
        Task<CompletionHistoryDto> GetCompletionHistoryAsync(int habitId, int page = 1, int pageSize = 30, CancellationToken cancellationToken = default);
        Task<WeeklyCompletionDto> GetWeeklyCompletionsAsync(int trackerId, DateTime weekStartDate, CancellationToken cancellationToken = default);
        Task<CompletionStatsDto> GetCompletionStatsAsync(int habitId, CancellationToken cancellationToken = default);
        Task TriggerStreakCalculationAsync(int habitId, CancellationToken cancellationToken = default);
    }
}