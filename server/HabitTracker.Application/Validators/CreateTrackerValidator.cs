using FluentValidation;
using HabitTracker.Application.DTOs.Tracker;

namespace HabitTracker.Application.Validators
{
    public class CreateTrackerValidator : AbstractValidator<CreateTrackerDto>
    {
        public CreateTrackerValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Tracker name is required")
                .MaximumLength(100).WithMessage("Tracker name must not exceed 100 characters")
                .Matches(@"^[a-zA-Z0-9\s\-_]+$").WithMessage("Tracker name can only contain letters, numbers, spaces, hyphens, and underscores");

            RuleFor(x => x.Description)
                .MaximumLength(500).WithMessage("Description must not exceed 500 characters");

            RuleFor(x => x.DisplayOrder)
                .GreaterThanOrEqualTo(0).WithMessage("Display order must be a non-negative number");
        }
    }
}