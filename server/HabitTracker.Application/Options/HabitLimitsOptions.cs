namespace HabitTracker.Application.Options
{
    public class HabitLimitsOptions
    {
        public const string SectionName = "HabitLimits";
        
        public int MaxHabitsPerTracker { get; set; } = 500;
        public int MaxNameLength { get; set; } = 100;
        public int MaxDescriptionLength { get; set; } = 500;
        public int MaxTargetCount { get; set; } = 100;
    }
}