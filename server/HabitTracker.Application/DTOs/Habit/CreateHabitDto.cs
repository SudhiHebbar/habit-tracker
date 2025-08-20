namespace HabitTracker.Application.DTOs.Habit
{
    public class CreateHabitDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string TargetFrequency { get; set; } = "Daily";
        public int TargetCount { get; set; } = 1;
        public string Color { get; set; } = "#6366F1";
        public string? Icon { get; set; }
        public int DisplayOrder { get; set; } = 0;
    }
}