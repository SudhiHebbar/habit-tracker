using AutoMapper;
using HabitTracker.Application.DTOs.Streak;
using HabitTracker.Domain.Entities;

namespace HabitTracker.Application.Mappings
{
    public class StreakMappingProfile : Profile
    {
        public StreakMappingProfile()
        {
            CreateMap<Streak, StreakResponseDto>()
                .ForMember(dest => dest.HabitName, opt => opt.MapFrom(src => src.Habit != null ? src.Habit.Name : string.Empty))
                .ForMember(dest => dest.IsAtRisk, opt => opt.Ignore())
                .ForMember(dest => dest.DaysSinceLastCompletion, opt => opt.Ignore())
                .ForMember(dest => dest.AchievedMilestones, opt => opt.Ignore())
                .ForMember(dest => dest.NextMilestone, opt => opt.Ignore());

            CreateMap<StreakResponseDto, Streak>()
                .ForMember(dest => dest.Habit, opt => opt.Ignore());
        }
    }
}