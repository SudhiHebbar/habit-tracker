namespace HabitTracker.Application.DTOs.Habit
{
    public class HabitResponseDto
    {
        public int Id { get; set; }
        public int TrackerId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string TargetFrequency { get; set; } = "Daily";
        public int TargetCount { get; set; } = 1;
        public string Color { get; set; } = "#6366F1";
        public string? Icon { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;
        public int DisplayOrder { get; set; } = 0;
        
        // Additional computed properties
        public int? CurrentStreak { get; set; }
        public int? LongestStreak { get; set; }
        public DateTime? LastCompletedDate { get; set; }
        public int CompletionsThisWeek { get; set; }
        public int CompletionsThisMonth { get; set; }
    }
}