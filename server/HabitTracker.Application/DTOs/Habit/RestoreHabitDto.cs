using System.ComponentModel.DataAnnotations;

namespace HabitTracker.Application.DTOs.Habit
{
    public class RestoreHabitDto
    {
        [StringLength(200, ErrorMessage = "Restore reason cannot exceed 200 characters")]
        public string? RestoreReason { get; set; }
        
        [Range(typeof(bool), "true", "true", ErrorMessage = "Restoration must be confirmed")]
        public bool Confirmed { get; set; }
        
        public bool RestoreToActiveState { get; set; } = true;
    }
}