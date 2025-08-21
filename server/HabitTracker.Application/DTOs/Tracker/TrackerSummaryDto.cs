namespace HabitTracker.Application.DTOs.Tracker
{
    public class TrackerSummaryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int HabitCount { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsShared { get; set; }
        public DateTime LastAccessedAt { get; set; }
        public int TodayCompletionsCount { get; set; }
        public int CurrentStreak { get; set; }
    }
}