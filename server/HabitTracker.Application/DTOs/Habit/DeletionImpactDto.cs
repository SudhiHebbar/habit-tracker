namespace HabitTracker.Application.DTOs.Habit
{
    public class DeletionImpactDto
    {
        public int HabitId { get; set; }
        public string HabitName { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public string? Icon { get; set; }
        
        // Completion impact data
        public int TotalCompletions { get; set; }
        public int CompletionsLast30Days { get; set; }
        public int CompletionsLast7Days { get; set; }
        public DateTime? LastCompletionDate { get; set; }
        public DateTime? FirstCompletionDate { get; set; }
        
        // Streak impact data
        public int? CurrentStreak { get; set; }
        public int? LongestStreak { get; set; }
        public DateTime? StreakStartDate { get; set; }
        
        // Historical data preservation
        public int DaysOfHistory { get; set; }
        public bool WillPreserveHistory { get; set; } = true;
        
        // Habit metadata
        public DateTime HabitCreatedAt { get; set; }
        public string TargetFrequency { get; set; } = string.Empty;
        public int TargetCount { get; set; }
        
        // Impact warnings
        public List<string> ImpactWarnings { get; set; } = new();
        public string ImpactSeverity { get; set; } = "Low"; // Low, Medium, High
    }
    
    public class BulkDeletionImpactDto
    {
        public List<DeletionImpactDto> HabitImpacts { get; set; } = new();
        public int TotalHabitsToDelete { get; set; }
        public int TotalCompletionsAffected { get; set; }
        public int TotalStreaksAffected { get; set; }
        public List<string> OverallWarnings { get; set; } = new();
        public string OverallImpactSeverity { get; set; } = "Low"; // Low, Medium, High
    }
}