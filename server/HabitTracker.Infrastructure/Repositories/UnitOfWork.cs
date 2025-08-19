using System.Data;
using HabitTracker.Application.Interfaces;
using HabitTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;

namespace HabitTracker.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly HabitTrackerDbContext _context;
        private readonly ILogger<UnitOfWork> _logger;
        private IDbContextTransaction? _transaction;
        private bool _disposed = false;

        // Repository instances - lazy initialization
        private ITrackerRepository? _trackers;
        private IHabitRepository? _habits;
        private IHabitCompletionRepository? _habitCompletions;
        private IStreakRepository? _streaks;

        public UnitOfWork(
            HabitTrackerDbContext context, 
            ILogger<UnitOfWork> logger,
            ITrackerRepository trackerRepository,
            IHabitRepository habitRepository,
            IHabitCompletionRepository habitCompletionRepository,
            IStreakRepository streakRepository)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            
            // Inject repository instances
            _trackers = trackerRepository ?? throw new ArgumentNullException(nameof(trackerRepository));
            _habits = habitRepository ?? throw new ArgumentNullException(nameof(habitRepository));
            _habitCompletions = habitCompletionRepository ?? throw new ArgumentNullException(nameof(habitCompletionRepository));
            _streaks = streakRepository ?? throw new ArgumentNullException(nameof(streakRepository));
        }

        // Repository properties
        public ITrackerRepository Trackers => _trackers ?? throw new ObjectDisposedException(nameof(UnitOfWork));
        public IHabitRepository Habits => _habits ?? throw new ObjectDisposedException(nameof(UnitOfWork));
        public IHabitCompletionRepository HabitCompletions => _habitCompletions ?? throw new ObjectDisposedException(nameof(UnitOfWork));
        public IStreakRepository Streaks => _streaks ?? throw new ObjectDisposedException(nameof(UnitOfWork));

        // Change tracking
        public bool HasChanges => _context.ChangeTracker.HasChanges();

        // Transaction management
        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Saving changes to database");
                
                var result = await _context.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
                
                _logger.LogDebug("Successfully saved {ChangeCount} changes to database", result);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving changes to database");
                throw;
            }
        }

        public int SaveChanges()
        {
            try
            {
                _logger.LogDebug("Saving changes to database (synchronous)");
                
                var result = _context.SaveChanges();
                
                _logger.LogDebug("Successfully saved {ChangeCount} changes to database", result);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving changes to database (synchronous)");
                throw;
            }
        }

        // Transaction control
        public async Task BeginTransactionAsync(IsolationLevel isolationLevel = IsolationLevel.ReadCommitted, CancellationToken cancellationToken = default)
        {
            try
            {
                if (_transaction != null)
                {
                    _logger.LogWarning("Transaction already exists. Rolling back existing transaction before starting new one.");
                    await _transaction.RollbackAsync(cancellationToken).ConfigureAwait(false);
                    await _transaction.DisposeAsync().ConfigureAwait(false);
                }

                _logger.LogDebug("Beginning transaction with isolation level {IsolationLevel}", isolationLevel);
                
                _transaction = await _context.Database.BeginTransactionAsync(isolationLevel, cancellationToken).ConfigureAwait(false);
                
                _logger.LogDebug("Transaction begun successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error beginning transaction");
                throw;
            }
        }

        public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                if (_transaction == null)
                {
                    _logger.LogWarning("No active transaction to commit");
                    return;
                }

                _logger.LogDebug("Committing transaction");
                
                await _transaction.CommitAsync(cancellationToken).ConfigureAwait(false);
                
                _logger.LogDebug("Transaction committed successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error committing transaction");
                await RollbackTransactionAsync(cancellationToken).ConfigureAwait(false);
                throw;
            }
            finally
            {
                if (_transaction != null)
                {
                    await _transaction.DisposeAsync().ConfigureAwait(false);
                    _transaction = null;
                }
            }
        }

        public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                if (_transaction == null)
                {
                    _logger.LogWarning("No active transaction to rollback");
                    return;
                }

                _logger.LogDebug("Rolling back transaction");
                
                await _transaction.RollbackAsync(cancellationToken).ConfigureAwait(false);
                
                _logger.LogDebug("Transaction rolled back successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rolling back transaction");
                throw;
            }
            finally
            {
                if (_transaction != null)
                {
                    await _transaction.DisposeAsync().ConfigureAwait(false);
                    _transaction = null;
                }
            }
        }

        // Change tracking operations
        public void DetachAllEntities()
        {
            try
            {
                _logger.LogDebug("Detaching all tracked entities");
                
                var entries = _context.ChangeTracker.Entries()
                    .Where(e => e.State != EntityState.Detached)
                    .ToList();

                foreach (var entry in entries)
                {
                    entry.State = EntityState.Detached;
                }
                
                _logger.LogDebug("Detached {EntityCount} entities", entries.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error detaching entities");
                throw;
            }
        }

        public void ReloadEntity<TEntity>(TEntity entity) where TEntity : class
        {
            try
            {
                if (entity == null)
                    throw new ArgumentNullException(nameof(entity));

                _logger.LogDebug("Reloading entity of type {EntityType}", typeof(TEntity).Name);
                
                _context.Entry(entity).Reload();
                
                _logger.LogDebug("Entity reloaded successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reloading entity of type {EntityType}", typeof(TEntity).Name);
                throw;
            }
        }

        public async Task ReloadEntityAsync<TEntity>(TEntity entity, CancellationToken cancellationToken = default) where TEntity : class
        {
            try
            {
                if (entity == null)
                    throw new ArgumentNullException(nameof(entity));

                _logger.LogDebug("Reloading entity of type {EntityType} (async)", typeof(TEntity).Name);
                
                await _context.Entry(entity).ReloadAsync(cancellationToken).ConfigureAwait(false);
                
                _logger.LogDebug("Entity reloaded successfully (async)");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reloading entity of type {EntityType} (async)", typeof(TEntity).Name);
                throw;
            }
        }

        // Bulk operations support
        public async Task<int> ExecuteRawSqlAsync(string sql, params object[] parameters)
        {
            return await ExecuteRawSqlAsync(sql, CancellationToken.None, parameters).ConfigureAwait(false);
        }

        public async Task<int> ExecuteRawSqlAsync(string sql, CancellationToken cancellationToken, params object[] parameters)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(sql))
                    throw new ArgumentException("SQL cannot be null or empty", nameof(sql));

                _logger.LogDebug("Executing raw SQL with {ParameterCount} parameters", parameters?.Length ?? 0);
                _logger.LogTrace("SQL: {SQL}", sql);
                
                var result = await _context.Database.ExecuteSqlRawAsync(sql, parameters ?? Array.Empty<object>(), cancellationToken).ConfigureAwait(false);
                
                _logger.LogDebug("Raw SQL execution completed, affected {RowCount} rows", result);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing raw SQL");
                throw;
            }
        }

        // Database connection management
        public async Task<bool> CanConnectAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Testing database connection");
                
                var canConnect = await _context.Database.CanConnectAsync(cancellationToken).ConfigureAwait(false);
                
                _logger.LogDebug("Database connection test result: {CanConnect}", canConnect);
                return canConnect;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error testing database connection");
                return false;
            }
        }

        public async Task EnsureCreatedAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Ensuring database is created");
                
                var created = await _context.Database.EnsureCreatedAsync(cancellationToken).ConfigureAwait(false);
                
                _logger.LogDebug("Database ensure created result: {WasCreated}", created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error ensuring database is created");
                throw;
            }
        }

        public async Task EnsureDeletedAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Ensuring database is deleted");
                
                var deleted = await _context.Database.EnsureDeletedAsync(cancellationToken).ConfigureAwait(false);
                
                _logger.LogDebug("Database ensure deleted result: {WasDeleted}", deleted);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error ensuring database is deleted");
                throw;
            }
        }

        // Performance and optimization
        public async Task<T> ExecuteInTransactionAsync<T>(Func<Task<T>> operation, IsolationLevel isolationLevel = IsolationLevel.ReadCommitted)
        {
            try
            {
                if (operation == null)
                    throw new ArgumentNullException(nameof(operation));

                _logger.LogDebug("Executing operation in transaction with isolation level {IsolationLevel}", isolationLevel);
                
                await BeginTransactionAsync(isolationLevel).ConfigureAwait(false);
                
                try
                {
                    var result = await operation().ConfigureAwait(false);
                    await CommitTransactionAsync().ConfigureAwait(false);
                    
                    _logger.LogDebug("Transaction operation completed successfully");
                    return result;
                }
                catch
                {
                    await RollbackTransactionAsync().ConfigureAwait(false);
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing operation in transaction");
                throw;
            }
        }

        public async Task ExecuteInTransactionAsync(Func<Task> operation, IsolationLevel isolationLevel = IsolationLevel.ReadCommitted)
        {
            try
            {
                if (operation == null)
                    throw new ArgumentNullException(nameof(operation));

                _logger.LogDebug("Executing void operation in transaction with isolation level {IsolationLevel}", isolationLevel);
                
                await BeginTransactionAsync(isolationLevel).ConfigureAwait(false);
                
                try
                {
                    await operation().ConfigureAwait(false);
                    await CommitTransactionAsync().ConfigureAwait(false);
                    
                    _logger.LogDebug("Transaction operation completed successfully");
                }
                catch
                {
                    await RollbackTransactionAsync().ConfigureAwait(false);
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing void operation in transaction");
                throw;
            }
        }

        // Audit and logging
        public IEnumerable<string> GetChangedEntityNames()
        {
            try
            {
                var changedEntities = _context.ChangeTracker.Entries()
                    .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified || e.State == EntityState.Deleted)
                    .Select(e => e.Entity.GetType().Name)
                    .Distinct()
                    .ToList();

                _logger.LogDebug("Found {EntityCount} changed entity types: [{EntityTypes}]", 
                    changedEntities.Count, string.Join(", ", changedEntities));

                return changedEntities;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting changed entity names");
                throw;
            }
        }

        public async Task<Dictionary<string, object>> GetChangesSummaryAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Generating changes summary");
                
                var entries = _context.ChangeTracker.Entries()
                    .Where(e => e.State != EntityState.Unchanged && e.State != EntityState.Detached)
                    .ToList();

                var summary = new Dictionary<string, object>
                {
                    ["TotalChanges"] = entries.Count,
                    ["HasChanges"] = entries.Any(),
                    ["ChangesByState"] = entries
                        .GroupBy(e => e.State.ToString())
                        .ToDictionary(g => g.Key, g => g.Count()),
                    ["ChangesByEntityType"] = entries
                        .GroupBy(e => e.Entity.GetType().Name)
                        .ToDictionary(g => g.Key, g => g.Count()),
                    ["ChangedEntityIds"] = entries
                        .Where(e => e.State == EntityState.Modified)
                        .Select(e => new
                        {
                            EntityType = e.Entity.GetType().Name,
                            EntityId = GetEntityId(e.Entity),
                            ModifiedProperties = e.Properties
                                .Where(p => p.IsModified)
                                .Select(p => p.Metadata.Name)
                                .ToArray()
                        })
                        .ToList()
                };

                _logger.LogDebug("Changes summary generated with {TotalChanges} total changes", summary["TotalChanges"]);

                await Task.CompletedTask; // To satisfy async signature
                return summary;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating changes summary");
                throw;
            }
        }

        // Helper method to get entity ID
        private static object? GetEntityId(object entity)
        {
            try
            {
                // Try to get Id property using reflection
                var idProperty = entity.GetType().GetProperty("Id");
                return idProperty?.GetValue(entity);
            }
            catch
            {
                return "Unknown";
            }
        }

        // IDisposable implementation
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed && disposing)
            {
                try
                {
                    _logger.LogDebug("Disposing UnitOfWork");

                    // Rollback any pending transaction
                    if (_transaction != null)
                    {
                        _logger.LogDebug("Rolling back pending transaction during disposal");
                        _transaction.Rollback();
                        _transaction.Dispose();
                        _transaction = null;
                    }

                    // Dispose context
                    _context?.Dispose();

                    // Clear repository references
                    _trackers = null;
                    _habits = null;
                    _habitCompletions = null;
                    _streaks = null;

                    _logger.LogDebug("UnitOfWork disposed successfully");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error during UnitOfWork disposal");
                }
                finally
                {
                    _disposed = true;
                }
            }
        }

        // Destructor
        ~UnitOfWork()
        {
            Dispose(false);
        }

        // Helper method to ensure not disposed
        private void ThrowIfDisposed()
        {
            if (_disposed)
            {
                throw new ObjectDisposedException(nameof(UnitOfWork));
            }
        }
    }
}