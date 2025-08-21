namespace HabitTracker.Application.DTOs.Habit
{
    public class DeactivateHabitDto
    {
        public string? Reason { get; set; }
        public bool PreserveCompletions { get; set; } = true;
    }
}