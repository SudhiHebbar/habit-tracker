namespace HabitTracker.Domain.Entities
{
    public class Streak
    {
        public int Id { get; set; }
        public int HabitId { get; set; }
        public int CurrentStreak { get; set; } = 0;
        public int LongestStreak { get; set; } = 0;
        public DateTime? LastCompletionDate { get; set; }
        public int TotalCompletions { get; set; } = 0;
        public decimal CompletionRate { get; set; } = 0;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public virtual Habit Habit { get; set; } = null!;
    }
}