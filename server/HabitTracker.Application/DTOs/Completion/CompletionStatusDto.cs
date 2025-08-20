namespace HabitTracker.Application.DTOs.Completion
{
    public class CompletionStatusDto
    {
        public int HabitId { get; set; }
        public DateTime Date { get; set; }
        public bool IsCompleted { get; set; }
        public int CurrentStreak { get; set; }
        public int LongestStreak { get; set; }
        public DateTime? LastCompletedDate { get; set; }
    }
    
    public class CompletionHistoryDto
    {
        public int HabitId { get; set; }
        public List<CompletionResponseDto> Completions { get; set; } = new();
        public int TotalCompletions { get; set; }
        public double CompletionRate { get; set; }
        public int CurrentPage { get; set; }
        public int TotalPages { get; set; }
    }
    
    public class WeeklyCompletionDto
    {
        public int TrackerId { get; set; }
        public DateTime WeekStartDate { get; set; }
        public DateTime WeekEndDate { get; set; }
        public Dictionary<DateTime, List<CompletionItemDto>> CompletionsByDate { get; set; } = new();
        public int TotalCompletions { get; set; }
        public double CompletionRate { get; set; }
    }
    
    public class CompletionItemDto
    {
        public int HabitId { get; set; }
        public string HabitName { get; set; } = string.Empty;
        public string HabitColor { get; set; } = string.Empty;
        public string? HabitIcon { get; set; }
        public bool IsCompleted { get; set; }
    }
    
    public class CompletionStatsDto
    {
        public int HabitId { get; set; }
        public int TotalCompletions { get; set; }
        public int CurrentStreak { get; set; }
        public int LongestStreak { get; set; }
        public double CompletionRate { get; set; }
        public DateTime? FirstCompletionDate { get; set; }
        public DateTime? LastCompletionDate { get; set; }
        public Dictionary<DayOfWeek, int> CompletionsByDayOfWeek { get; set; } = new();
    }
}