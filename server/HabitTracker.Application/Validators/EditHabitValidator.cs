using FluentValidation;
using HabitTracker.Application.DTOs.Habit;
using System.Collections.Generic;

namespace HabitTracker.Application.Validators
{
    public class EditHabitValidator : AbstractValidator<EditHabitDto>
    {
        private readonly HashSet<string> _validFrequencies = new()
        {
            "Daily", "Weekly", "BiWeekly", "Monthly", "Custom"
        };

        public EditHabitValidator()
        {
            When(x => x.Name != null, () =>
            {
                RuleFor(x => x.Name)
                    .NotEmpty().WithMessage("Habit name cannot be empty")
                    .MaximumLength(100).WithMessage("Habit name must not exceed 100 characters");
            });

            When(x => x.Description != null, () =>
            {
                RuleFor(x => x.Description)
                    .MaximumLength(500).WithMessage("Description must not exceed 500 characters");
            });

            When(x => x.TargetFrequency != null, () =>
            {
                RuleFor(x => x.TargetFrequency)
                    .Must(BeValidFrequency).WithMessage("Invalid frequency. Must be one of: Daily, Weekly, BiWeekly, Monthly, Custom");
            });

            When(x => x.TargetCount != null, () =>
            {
                RuleFor(x => x.TargetCount)
                    .GreaterThan(0).WithMessage("Target count must be greater than 0")
                    .LessThanOrEqualTo(100).WithMessage("Target count must not exceed 100");
            });

            When(x => x.Color != null, () =>
            {
                RuleFor(x => x.Color)
                    .Matches(@"^#[0-9A-Fa-f]{6}$").WithMessage("Color must be a valid hex color code (e.g., #6366F1)");
            });

            When(x => x.Icon != null, () =>
            {
                RuleFor(x => x.Icon)
                    .MaximumLength(50).WithMessage("Icon identifier must not exceed 50 characters");
            });

            When(x => x.DisplayOrder != null, () =>
            {
                RuleFor(x => x.DisplayOrder)
                    .GreaterThanOrEqualTo(0).WithMessage("Display order must be 0 or greater");
            });

            RuleFor(x => x)
                .Must(x => x.HasChanges())
                .WithMessage("No changes detected in the edit request");
        }

        private bool BeValidFrequency(string? frequency)
        {
            return frequency != null && _validFrequencies.Contains(frequency);
        }
    }
}