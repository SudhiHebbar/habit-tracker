using FluentValidation;
using HabitTracker.Application.DTOs.Habit;

namespace HabitTracker.Application.Validators
{
    public class DeleteHabitValidator : AbstractValidator<DeleteHabitDto>
    {
        public DeleteHabitValidator()
        {
            RuleFor(x => x.DeleteReason)
                .MaximumLength(200)
                .WithMessage("Delete reason cannot exceed 200 characters");
            
            RuleFor(x => x.Confirmed)
                .Equal(true)
                .WithMessage("Deletion must be confirmed");
        }
    }
}