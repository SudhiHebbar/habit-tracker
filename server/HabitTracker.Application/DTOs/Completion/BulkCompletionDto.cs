namespace HabitTracker.Application.DTOs.Completion
{
    public class BulkCompletionDto
    {
        public List<int> HabitIds { get; set; } = new();
        public DateTime Date { get; set; }
        public string? Notes { get; set; }
    }
    
    public class BulkCompletionResponseDto
    {
        public List<CompletionResponseDto> Completions { get; set; } = new();
        public int SuccessCount { get; set; }
        public int FailureCount { get; set; }
        public List<string> Errors { get; set; } = new();
    }
}