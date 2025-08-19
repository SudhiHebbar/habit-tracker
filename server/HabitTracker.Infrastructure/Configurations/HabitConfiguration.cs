using HabitTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HabitTracker.Infrastructure.Configurations
{
    public class HabitConfiguration : IEntityTypeConfiguration<Habit>
    {
        public void Configure(EntityTypeBuilder<Habit> builder)
        {
            builder.HasKey(h => h.Id);

            builder.Property(h => h.Name)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(h => h.Description)
                .HasMaxLength(500);

            builder.Property(h => h.TargetFrequency)
                .IsRequired()
                .HasMaxLength(20)
                .HasDefaultValue("Daily");

            builder.Property(h => h.TargetCount)
                .HasDefaultValue(1);

            builder.Property(h => h.Color)
                .IsRequired()
                .HasMaxLength(7)
                .HasDefaultValue("#6366F1");

            builder.Property(h => h.Icon)
                .HasMaxLength(50);

            builder.Property(h => h.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(h => h.UpdatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(h => h.IsActive)
                .HasDefaultValue(true);

            builder.Property(h => h.DisplayOrder)
                .HasDefaultValue(0);

            builder.HasOne(h => h.Tracker)
                .WithMany(t => t.Habits)
                .HasForeignKey(h => h.TrackerId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(h => h.Completions)
                .WithOne(c => c.Habit)
                .HasForeignKey(c => c.HabitId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(h => h.Streak)
                .WithOne(s => s.Habit)
                .HasForeignKey<Streak>(s => s.HabitId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(h => h.TrackerId)
                .HasDatabaseName("IX_Habits_TrackerId");

            builder.HasIndex(h => h.IsActive)
                .HasDatabaseName("IX_Habits_IsActive");
        }
    }
}