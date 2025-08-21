using AutoMapper;
using HabitTracker.Application.DTOs.Habit;
using HabitTracker.Domain.Entities;

namespace HabitTracker.Application.Mappings
{
    public class HabitMappingProfile : Profile
    {
        public HabitMappingProfile()
        {
            // Create mapping
            CreateMap<CreateHabitDto, Habit>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.TrackerId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true))
                .ForMember(dest => dest.Tracker, opt => opt.Ignore())
                .ForMember(dest => dest.Completions, opt => opt.Ignore())
                .ForMember(dest => dest.Streak, opt => opt.Ignore());

            // Update mapping
            CreateMap<UpdateHabitDto, Habit>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.TrackerId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.Tracker, opt => opt.Ignore())
                .ForMember(dest => dest.Completions, opt => opt.Ignore())
                .ForMember(dest => dest.Streak, opt => opt.Ignore());

            // Response mapping
            CreateMap<Habit, HabitResponseDto>()
                .ForMember(dest => dest.CurrentStreak, opt => opt.MapFrom((src, dest) => 
                    src.Streak != null ? src.Streak.CurrentStreak : 0))
                .ForMember(dest => dest.LongestStreak, opt => opt.MapFrom((src, dest) => 
                    src.Streak != null ? src.Streak.LongestStreak : 0))
                .ForMember(dest => dest.LastCompletedDate, opt => opt.MapFrom((src, dest) =>
                    src.Completions != null && src.Completions.Any(c => c.IsCompleted)
                        ? src.Completions.Where(c => c.IsCompleted)
                            .OrderByDescending(c => c.CompletionDate)
                            .FirstOrDefault()?.CompletionDate
                        : (DateTime?)null))
                .ForMember(dest => dest.CompletionsThisWeek, opt => opt.MapFrom((src, dest) =>
                    src.Completions != null
                        ? src.Completions.Count(c => c.IsCompleted && 
                            c.CompletionDate >= DateTime.UtcNow.AddDays(-7))
                        : 0))
                .ForMember(dest => dest.CompletionsThisMonth, opt => opt.MapFrom((src, dest) =>
                    src.Completions != null
                        ? src.Completions.Count(c => c.IsCompleted && 
                            c.CompletionDate >= DateTime.UtcNow.AddDays(-30))
                        : 0));

            // Edit response mapping
            CreateMap<Habit, HabitEditResponseDto>()
                .ForMember(dest => dest.EditImpact, opt => opt.Ignore())
                .ForMember(dest => dest.ChangedFields, opt => opt.Ignore());
        }
    }
}