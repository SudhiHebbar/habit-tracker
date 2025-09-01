namespace HabitTracker.Application.DTOs.Streak
{
    public class MilestoneAchievementDto
    {
        public int HabitId { get; set; }
        public string HabitName { get; set; } = string.Empty;
        public int MilestoneValue { get; set; }
        public DateTime AchievedAt { get; set; }
        public string CelebrationType { get; set; } = "confetti";
        public string Message { get; set; } = string.Empty;
        public bool IsNew { get; set; }
        public string BadgeType { get; set; } = string.Empty;
    }

    public class MilestoneCheckResultDto
    {
        public bool HasNewMilestone { get; set; }
        public List<MilestoneAchievementDto> Milestones { get; set; } = new();
        public int CurrentStreak { get; set; }
        public int NextMilestone { get; set; }
    }
}