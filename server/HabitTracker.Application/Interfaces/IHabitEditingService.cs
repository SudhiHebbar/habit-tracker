using HabitTracker.Application.DTOs.Habit;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace HabitTracker.Application.Interfaces
{
    public interface IHabitEditingService
    {
        Task<HabitEditResponseDto?> EditHabitAsync(int id, EditHabitDto editDto, string? userId, CancellationToken cancellationToken = default);
        Task<bool> DeactivateHabitAsync(int id, DeactivateHabitDto deactivateDto, string? userId, CancellationToken cancellationToken = default);
        Task<bool> ReactivateHabitAsync(int id, string? userId, CancellationToken cancellationToken = default);
        Task<EditImpactInfo> AnalyzeEditImpactAsync(int id, EditHabitDto editDto, CancellationToken cancellationToken = default);
        Task<bool> BulkEditHabitsAsync(int trackerId, List<(int HabitId, EditHabitDto EditData)> edits, string? userId, CancellationToken cancellationToken = default);
        Task<Dictionary<string, object>> GetHabitEditHistoryAsync(int id, string? userId, CancellationToken cancellationToken = default);
    }
}