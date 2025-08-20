using FluentValidation;
using HabitTracker.Application.DTOs.Habit;
using System.Text.RegularExpressions;

namespace HabitTracker.Application.Validators
{
    public class CreateHabitValidator : AbstractValidator<CreateHabitDto>
    {
        private static readonly string[] ValidFrequencies = { "Daily", "Weekly", "Custom" };
        private static readonly Regex HexColorRegex = new Regex(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$");

        public CreateHabitValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Habit name is required")
                .Length(1, 100).WithMessage("Habit name must be between 1 and 100 characters")
                .Matches(@"^[a-zA-Z0-9\s\-_'"",.!?]+$").WithMessage("Habit name contains invalid characters");

            RuleFor(x => x.Description)
                .MaximumLength(500).WithMessage("Description must not exceed 500 characters")
                .When(x => !string.IsNullOrEmpty(x.Description));

            RuleFor(x => x.TargetFrequency)
                .NotEmpty().WithMessage("Target frequency is required")
                .Must(BeValidFrequency).WithMessage($"Target frequency must be one of: {string.Join(", ", ValidFrequencies)}");

            RuleFor(x => x.TargetCount)
                .InclusiveBetween(1, 100).WithMessage("Target count must be between 1 and 100");

            RuleFor(x => x.Color)
                .NotEmpty().WithMessage("Color is required")
                .Must(BeValidHexColor).WithMessage("Color must be a valid hex color code (e.g., #6366F1)");

            RuleFor(x => x.Icon)
                .MaximumLength(50).WithMessage("Icon identifier must not exceed 50 characters")
                .Matches(@"^[a-zA-Z0-9\-_]+$").WithMessage("Icon identifier contains invalid characters")
                .When(x => !string.IsNullOrEmpty(x.Icon));

            RuleFor(x => x.DisplayOrder)
                .GreaterThanOrEqualTo(0).WithMessage("Display order must be non-negative");
        }

        private bool BeValidFrequency(string frequency)
        {
            return ValidFrequencies.Contains(frequency);
        }

        private bool BeValidHexColor(string color)
        {
            return !string.IsNullOrEmpty(color) && HexColorRegex.IsMatch(color);
        }
    }
}