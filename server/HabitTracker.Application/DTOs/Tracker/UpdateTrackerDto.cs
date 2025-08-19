namespace HabitTracker.Application.DTOs.Tracker
{
    public class UpdateTrackerDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsShared { get; set; }
        public int DisplayOrder { get; set; }
    }
}