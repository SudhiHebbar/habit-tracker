namespace HabitTracker.Application.DTOs.Tracker
{
    public class TrackerSwitchDto
    {
        public int CurrentTrackerId { get; set; }
        public int? PreviousTrackerId { get; set; }
        public int? NextTrackerId { get; set; }
        public List<TrackerSummaryDto> RecentTrackers { get; set; } = new();
        public List<TrackerSummaryDto> FavoriteTrackers { get; set; } = new();
        public DateTime SwitchedAt { get; set; }
    }
}