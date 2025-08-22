using System.ComponentModel.DataAnnotations;

namespace HabitTracker.Application.DTOs.Habit
{
    public class BulkDeleteDto
    {
        [Required(ErrorMessage = "Habit IDs are required")]
        [MinLength(1, ErrorMessage = "At least one habit ID must be provided")]
        public List<int> HabitIds { get; set; } = new();
        
        [StringLength(200, ErrorMessage = "Delete reason cannot exceed 200 characters")]
        public string? DeleteReason { get; set; }
        
        [Range(typeof(bool), "true", "true", ErrorMessage = "Bulk deletion must be confirmed")]
        public bool Confirmed { get; set; }
        
        public bool RequestImpactAnalysis { get; set; } = true;
    }
}