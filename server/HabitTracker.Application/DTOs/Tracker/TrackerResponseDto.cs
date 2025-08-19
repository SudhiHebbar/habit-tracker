namespace HabitTracker.Application.DTOs.Tracker
{
    public class TrackerResponseDto
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
        public int HabitCount { get; set; }
    }
}