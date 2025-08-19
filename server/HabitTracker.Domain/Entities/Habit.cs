namespace HabitTracker.Domain.Entities
{
    public class Habit
    {
        public int Id { get; set; }
        public int TrackerId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string TargetFrequency { get; set; } = "Daily";
        public int TargetCount { get; set; } = 1;
        public string Color { get; set; } = "#6366F1";
        public string? Icon { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;
        public int DisplayOrder { get; set; } = 0;

        public virtual Tracker Tracker { get; set; } = null!;
        public virtual ICollection<HabitCompletion> Completions { get; set; } = new List<HabitCompletion>();
        public virtual Streak? Streak { get; set; }
    }
}