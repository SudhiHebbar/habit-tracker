using System.Data;

namespace HabitTracker.Application.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        // Repository properties
        ITrackerRepository Trackers { get; }
        IHabitRepository Habits { get; }
        IHabitCompletionRepository HabitCompletions { get; }
        IStreakRepository Streaks { get; }
        
        // Transaction management
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
        int SaveChanges();
        
        // Transaction control
        Task BeginTransactionAsync(IsolationLevel isolationLevel = IsolationLevel.ReadCommitted, CancellationToken cancellationToken = default);
        Task CommitTransactionAsync(CancellationToken cancellationToken = default);
        Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
        
        // Change tracking
        bool HasChanges { get; }
        void DetachAllEntities();
        void ReloadEntity<TEntity>(TEntity entity) where TEntity : class;
        Task ReloadEntityAsync<TEntity>(TEntity entity, CancellationToken cancellationToken = default) where TEntity : class;
        
        // Bulk operations support
        Task<int> ExecuteRawSqlAsync(string sql, params object[] parameters);
        Task<int> ExecuteRawSqlAsync(string sql, CancellationToken cancellationToken, params object[] parameters);
        
        // Database connection management
        Task<bool> CanConnectAsync(CancellationToken cancellationToken = default);
        Task EnsureCreatedAsync(CancellationToken cancellationToken = default);
        Task EnsureDeletedAsync(CancellationToken cancellationToken = default);
        
        // Performance and optimization
        Task<T> ExecuteInTransactionAsync<T>(Func<Task<T>> operation, IsolationLevel isolationLevel = IsolationLevel.ReadCommitted);
        Task ExecuteInTransactionAsync(Func<Task> operation, IsolationLevel isolationLevel = IsolationLevel.ReadCommitted);
        
        // Audit and logging
        IEnumerable<string> GetChangedEntityNames();
        Task<Dictionary<string, object>> GetChangesSummaryAsync(CancellationToken cancellationToken = default);
    }
}