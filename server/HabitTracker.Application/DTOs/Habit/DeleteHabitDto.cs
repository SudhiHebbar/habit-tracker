using System.ComponentModel.DataAnnotations;

namespace HabitTracker.Application.DTOs.Habit
{
    public class DeleteHabitDto
    {
        [StringLength(200, ErrorMessage = "Delete reason cannot exceed 200 characters")]
        public string? DeleteReason { get; set; }
        
        [Range(typeof(bool), "true", "true", ErrorMessage = "Deletion must be confirmed")]
        public bool Confirmed { get; set; }
        
        public bool RequestImpactAnalysis { get; set; } = true;
    }
}