using HabitTracker.Application.DTOs.Habit;

namespace HabitTracker.Application.Interfaces
{
    public interface IHabitService
    {
        Task<IEnumerable<HabitResponseDto>> GetHabitsByTrackerAsync(int trackerId, string? userId, CancellationToken cancellationToken = default);
        Task<HabitResponseDto?> GetHabitByIdAsync(int id, string? userId, CancellationToken cancellationToken = default);
        Task<HabitResponseDto> CreateHabitAsync(int trackerId, CreateHabitDto createDto, string? userId, CancellationToken cancellationToken = default);
        Task<HabitResponseDto?> UpdateHabitAsync(int id, UpdateHabitDto updateDto, string? userId, CancellationToken cancellationToken = default);
        Task<bool> DeleteHabitAsync(int id, string? userId, CancellationToken cancellationToken = default);
        Task<bool> RestoreHabitAsync(int id, string? userId, CancellationToken cancellationToken = default);
        Task<bool> UpdateHabitOrderAsync(int trackerId, List<(int HabitId, int DisplayOrder)> habitOrders, string? userId, CancellationToken cancellationToken = default);
        Task<IEnumerable<HabitResponseDto>> GetHabitsWithCompletionsAsync(int trackerId, string? userId, CancellationToken cancellationToken = default);
        Task<Dictionary<string, int>> GetHabitStatsByFrequencyAsync(int trackerId, string? userId, CancellationToken cancellationToken = default);
        Task<bool> ValidateHabitNameAsync(int trackerId, string name, int? excludeHabitId, string? userId, CancellationToken cancellationToken = default);
    }
}