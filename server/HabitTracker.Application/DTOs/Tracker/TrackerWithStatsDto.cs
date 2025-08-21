using HabitTracker.Application.DTOs.Habit;

namespace HabitTracker.Application.DTOs.Tracker
{
    public class TrackerWithStatsDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? UserId { get; set; }
        public bool IsShared { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsActive { get; set; }
        public int DisplayOrder { get; set; }
        public DateTime LastAccessedAt { get; set; }
        
        public List<HabitResponseDto> Habits { get; set; } = new();
        
        public int TotalHabits { get; set; }
        public int ActiveHabits { get; set; }
        public int CompletedToday { get; set; }
        public double TodayCompletionRate { get; set; }
        public int CurrentStreak { get; set; }
        public int LongestStreak { get; set; }
        public Dictionary<DateTime, int> RecentCompletions { get; set; } = new();
    }
}