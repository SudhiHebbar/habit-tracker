using HabitTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HabitTracker.Infrastructure.Configurations
{
    public class StreakConfiguration : IEntityTypeConfiguration<Streak>
    {
        public void Configure(EntityTypeBuilder<Streak> builder)
        {
            builder.HasKey(s => s.Id);

            builder.Property(s => s.CurrentStreak)
                .HasDefaultValue(0);

            builder.Property(s => s.LongestStreak)
                .HasDefaultValue(0);

            builder.Property(s => s.LastCompletionDate)
                .HasColumnType("date");

            builder.Property(s => s.TotalCompletions)
                .HasDefaultValue(0);

            builder.Property(s => s.CompletionRate)
                .HasPrecision(5, 2)
                .HasDefaultValue(0);

            builder.Property(s => s.UpdatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            builder.HasOne(s => s.Habit)
                .WithOne(h => h.Streak)
                .HasForeignKey<Streak>(s => s.HabitId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(s => s.HabitId)
                .IsUnique()
                .HasDatabaseName("IX_Streaks_HabitId");
        }
    }
}