namespace HabitTracker.Application.DTOs.Tracker
{
    public class CreateTrackerDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsShared { get; set; } = false;
        public int DisplayOrder { get; set; } = 0;
    }
}