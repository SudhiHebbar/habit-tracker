using FluentValidation;
using HabitTracker.Application.DTOs.Habit;

namespace HabitTracker.Application.Validators
{
    public class BulkDeleteValidator : AbstractValidator<BulkDeleteDto>
    {
        public BulkDeleteValidator()
        {
            RuleFor(x => x.HabitIds)
                .NotEmpty()
                .WithMessage("At least one habit ID must be provided");
            
            RuleFor(x => x.HabitIds)
                .Must(ids => ids.Count <= 50)
                .WithMessage("Cannot delete more than 50 habits at once");
            
            RuleForEach(x => x.HabitIds)
                .GreaterThan(0)
                .WithMessage("All habit IDs must be positive integers");
            
            RuleFor(x => x.DeleteReason)
                .MaximumLength(200)
                .WithMessage("Delete reason cannot exceed 200 characters");
            
            RuleFor(x => x.Confirmed)
                .Equal(true)
                .WithMessage("Bulk deletion must be confirmed");
        }
    }
}