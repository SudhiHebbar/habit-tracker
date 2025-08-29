namespace HabitTracker.Application.DTOs.Streak
{
    public class StreakResponseDto
    {
        public int Id { get; set; }
        public int HabitId { get; set; }
        public string HabitName { get; set; } = string.Empty;
        public int CurrentStreak { get; set; }
        public int LongestStreak { get; set; }
        public DateTime? LastCompletionDate { get; set; }
        public int TotalCompletions { get; set; }
        public decimal CompletionRate { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsAtRisk { get; set; }
        public int? DaysSinceLastCompletion { get; set; }
        public List<int> AchievedMilestones { get; set; } = new();
        public int? NextMilestone { get; set; }
    }
}