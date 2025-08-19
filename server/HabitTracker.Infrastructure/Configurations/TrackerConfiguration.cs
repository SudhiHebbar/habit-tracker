using HabitTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HabitTracker.Infrastructure.Configurations
{
    public class TrackerConfiguration : IEntityTypeConfiguration<Tracker>
    {
        public void Configure(EntityTypeBuilder<Tracker> builder)
        {
            builder.HasKey(t => t.Id);

            builder.Property(t => t.Name)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(t => t.Description)
                .HasMaxLength(500);

            builder.Property(t => t.UserId)
                .HasMaxLength(450);

            builder.Property(t => t.IsShared)
                .HasDefaultValue(false);

            builder.Property(t => t.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(t => t.UpdatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(t => t.IsActive)
                .HasDefaultValue(true);

            builder.Property(t => t.DisplayOrder)
                .HasDefaultValue(0);

            builder.HasMany(t => t.Habits)
                .WithOne(h => h.Tracker)
                .HasForeignKey(h => h.TrackerId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(t => t.UserId)
                .HasDatabaseName("IX_Trackers_UserId");

            builder.HasIndex(t => t.IsActive)
                .HasDatabaseName("IX_Trackers_IsActive");
        }
    }
}