using AutoMapper;
using HabitTracker.Application.DTOs.Tracker;
using HabitTracker.Domain.Entities;

namespace HabitTracker.Application.Mappings
{
    public class TrackerMappingProfile : Profile
    {
        public TrackerMappingProfile()
        {
            CreateMap<Tracker, TrackerResponseDto>()
                .ForMember(dest => dest.HabitCount, opt => opt.MapFrom(src => src.Habits.Count(h => h.IsActive)));

            CreateMap<CreateTrackerDto, Tracker>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(_ => true));

            CreateMap<UpdateTrackerDto, Tracker>()
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow))
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.Ignore())
                .ForMember(dest => dest.Habits, opt => opt.Ignore());

            CreateMap<Tracker, TrackerSummaryDto>()
                .ForMember(dest => dest.HabitCount, opt => opt.MapFrom(src => src.Habits.Count(h => h.IsActive)))
                .ForMember(dest => dest.LastAccessedAt, opt => opt.MapFrom(src => src.UpdatedAt))
                .ForMember(dest => dest.TodayCompletionsCount, opt => opt.Ignore())
                .ForMember(dest => dest.CurrentStreak, opt => opt.Ignore());

            CreateMap<Tracker, TrackerWithStatsDto>()
                .ForMember(dest => dest.Habits, opt => opt.Ignore())
                .ForMember(dest => dest.TotalHabits, opt => opt.MapFrom(src => src.Habits.Count))
                .ForMember(dest => dest.ActiveHabits, opt => opt.MapFrom(src => src.Habits.Count(h => h.IsActive)))
                .ForMember(dest => dest.LastAccessedAt, opt => opt.MapFrom(src => src.UpdatedAt))
                .ForMember(dest => dest.CompletedToday, opt => opt.Ignore())
                .ForMember(dest => dest.TodayCompletionRate, opt => opt.Ignore())
                .ForMember(dest => dest.CurrentStreak, opt => opt.Ignore())
                .ForMember(dest => dest.LongestStreak, opt => opt.Ignore())
                .ForMember(dest => dest.RecentCompletions, opt => opt.Ignore());
        }
    }
}