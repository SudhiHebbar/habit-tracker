namespace HabitTracker.Application.DTOs.Habit
{
    public class EditHabitDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? TargetFrequency { get; set; }
        public int? TargetCount { get; set; }
        public string? Color { get; set; }
        public string? Icon { get; set; }
        public int? DisplayOrder { get; set; }
        public bool? IsActive { get; set; }
        
        public bool HasChanges()
        {
            return Name != null || Description != null || TargetFrequency != null || 
                   TargetCount != null || Color != null || Icon != null || 
                   DisplayOrder != null || IsActive != null;
        }
    }
}