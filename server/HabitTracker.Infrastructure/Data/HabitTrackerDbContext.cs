using HabitTracker.Domain.Entities;
using HabitTracker.Infrastructure.Configurations;
using Microsoft.EntityFrameworkCore;

namespace HabitTracker.Infrastructure.Data
{
    public class HabitTrackerDbContext : DbContext
    {
        public HabitTrackerDbContext(DbContextOptions<HabitTrackerDbContext> options) : base(options)
        {
        }

        public DbSet<Tracker> Trackers { get; set; } = null!;
        public DbSet<Habit> Habits { get; set; } = null!;
        public DbSet<HabitCompletion> HabitCompletions { get; set; } = null!;
        public DbSet<Streak> Streaks { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Apply entity configurations
            modelBuilder.ApplyConfiguration(new TrackerConfiguration());
            modelBuilder.ApplyConfiguration(new HabitConfiguration());
            modelBuilder.ApplyConfiguration(new HabitCompletionConfiguration());
            modelBuilder.ApplyConfiguration(new StreakConfiguration());
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);
            
            // Enable sensitive data logging in development
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.EnableSensitiveDataLogging()
                             .EnableDetailedErrors();
            }
        }

        public override int SaveChanges()
        {
            UpdateAuditFields();
            return base.SaveChanges();
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            UpdateAuditFields();
            return base.SaveChangesAsync(cancellationToken);
        }

        private void UpdateAuditFields()
        {
            var entries = ChangeTracker.Entries()
                .Where(e => e.Entity is Tracker || e.Entity is Habit || e.Entity is HabitCompletion)
                .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified);

            foreach (var entry in entries)
            {
                if (entry.State == EntityState.Added)
                {
                    if (entry.Property("CreatedAt").CurrentValue == null)
                        entry.Property("CreatedAt").CurrentValue = DateTime.UtcNow;
                }

                if (entry.Property("UpdatedAt") != null)
                    entry.Property("UpdatedAt").CurrentValue = DateTime.UtcNow;
            }
        }
    }
}