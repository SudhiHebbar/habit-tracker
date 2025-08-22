using FluentValidation;
using HabitTracker.Application.DTOs.Habit;

namespace HabitTracker.Application.Validators
{
    public class RestoreHabitValidator : AbstractValidator<RestoreHabitDto>
    {
        public RestoreHabitValidator()
        {
            RuleFor(x => x.RestoreReason)
                .MaximumLength(200)
                .WithMessage("Restore reason cannot exceed 200 characters");
            
            RuleFor(x => x.Confirmed)
                .Equal(true)
                .WithMessage("Restoration must be confirmed");
        }
    }
}