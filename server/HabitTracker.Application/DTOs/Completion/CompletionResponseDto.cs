namespace HabitTracker.Application.DTOs.Completion
{
    public class CompletionResponseDto
    {
        public int Id { get; set; }
        public int HabitId { get; set; }
        public DateTime CompletionDate { get; set; }
        public bool IsCompleted { get; set; }
        public string? Notes { get; set; }
        public int CurrentStreak { get; set; }
        public int LongestStreak { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}