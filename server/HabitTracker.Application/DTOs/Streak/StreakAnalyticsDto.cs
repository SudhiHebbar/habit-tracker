namespace HabitTracker.Application.DTOs.Streak
{
    public class StreakAnalyticsDto
    {
        public int TrackerId { get; set; }
        public int TotalHabits { get; set; }
        public int ActiveStreaks { get; set; }
        public double AverageCurrentStreak { get; set; }
        public double AverageLongestStreak { get; set; }
        public double AverageCompletionRate { get; set; }
        public int TotalCompletions { get; set; }
        public List<StreakTrendDto> Trends { get; set; } = new();
        public List<StreakLeaderboardEntryDto> TopStreaks { get; set; } = new();
        public List<StreakResponseDto> StreaksAtRisk { get; set; } = new();
        public Dictionary<string, int> MilestoneAchievements { get; set; } = new();
    }

    public class StreakTrendDto
    {
        public DateTime Date { get; set; }
        public int ActiveStreakCount { get; set; }
        public double AverageStreak { get; set; }
        public int CompletionsCount { get; set; }
    }

    public class StreakLeaderboardEntryDto
    {
        public int HabitId { get; set; }
        public string HabitName { get; set; } = string.Empty;
        public int CurrentStreak { get; set; }
        public int LongestStreak { get; set; }
        public int Rank { get; set; }
        public string Color { get; set; } = string.Empty;
        public string? Icon { get; set; }
    }
}