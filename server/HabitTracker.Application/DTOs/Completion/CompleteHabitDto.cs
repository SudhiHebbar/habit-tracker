namespace HabitTracker.Application.DTOs.Completion
{
    public class CompleteHabitDto
    {
        public DateTime Date { get; set; }
        public bool IsCompleted { get; set; }
        public string? Notes { get; set; }
    }
}