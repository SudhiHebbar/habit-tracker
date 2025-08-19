namespace HabitTracker.Application.Options
{
    public class TrackerLimitsOptions
    {
        public const string SectionName = "TrackerLimits";

        /// <summary>
        /// Maximum number of trackers a user can create
        /// </summary>
        public int MaxTrackersPerUser { get; set; } = 20;

        /// <summary>
        /// Maximum number of habits allowed per tracker
        /// </summary>
        public int MaxHabitsPerTracker { get; set; } = 100;

        /// <summary>
        /// Maximum length for tracker name
        /// </summary>
        public int MaxTrackerNameLength { get; set; } = 100;

        /// <summary>
        /// Maximum length for tracker description
        /// </summary>
        public int MaxTrackerDescriptionLength { get; set; } = 500;
    }
}