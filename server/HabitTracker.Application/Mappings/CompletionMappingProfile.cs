using AutoMapper;
using HabitTracker.Application.DTOs.Completion;
using HabitTracker.Domain.Entities;

namespace HabitTracker.Application.Mappings
{
    public class CompletionMappingProfile : Profile
    {
        public CompletionMappingProfile()
        {
            CreateMap<HabitCompletion, CompletionResponseDto>();
            CreateMap<ToggleCompletionDto, HabitCompletion>();
            CreateMap<CompleteHabitDto, HabitCompletion>();
        }
    }
}