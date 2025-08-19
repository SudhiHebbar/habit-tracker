using HabitTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HabitTracker.Infrastructure.Configurations
{
    public class HabitCompletionConfiguration : IEntityTypeConfiguration<HabitCompletion>
    {
        public void Configure(EntityTypeBuilder<HabitCompletion> builder)
        {
            builder.HasKey(hc => hc.Id);

            builder.Property(hc => hc.CompletionDate)
                .IsRequired()
                .HasColumnType("date");

            builder.Property(hc => hc.IsCompleted)
                .HasDefaultValue(true);

            builder.Property(hc => hc.Notes)
                .HasMaxLength(500);

            builder.Property(hc => hc.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(hc => hc.UpdatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            builder.HasOne(hc => hc.Habit)
                .WithMany(h => h.Completions)
                .HasForeignKey(hc => hc.HabitId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(hc => new { hc.HabitId, hc.CompletionDate })
                .IsUnique()
                .HasDatabaseName("UQ_HabitCompletions_HabitDate");

            builder.HasIndex(hc => hc.HabitId)
                .HasDatabaseName("IX_HabitCompletions_HabitId");

            builder.HasIndex(hc => hc.CompletionDate)
                .HasDatabaseName("IX_HabitCompletions_CompletionDate");
        }
    }
}