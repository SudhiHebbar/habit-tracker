using System;
using System.Collections.Generic;

namespace HabitTracker.Application.DTOs.Habit
{
    public class HabitEditResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string TargetFrequency { get; set; } = "Daily";
        public int TargetCount { get; set; }
        public string Color { get; set; } = "#6366F1";
        public string? Icon { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public DateTime UpdatedAt { get; set; }
        
        public EditImpactInfo? EditImpact { get; set; }
        public List<string> ChangedFields { get; set; } = new();
    }
    
    public class EditImpactInfo
    {
        public bool FrequencyChanged { get; set; }
        public int? AffectedCompletions { get; set; }
        public bool StreaksNeedRecalculation { get; set; }
        public string? Warning { get; set; }
    }
}