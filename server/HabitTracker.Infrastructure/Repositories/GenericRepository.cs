using System.Linq.Expressions;
using HabitTracker.Application.Interfaces;
using HabitTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HabitTracker.Infrastructure.Repositories
{
    public class GenericRepository<TEntity> : IGenericRepository<TEntity> where TEntity : class
    {
        protected readonly HabitTrackerDbContext _context;
        protected readonly DbSet<TEntity> _dbSet;
        protected readonly ILogger<GenericRepository<TEntity>> _logger;

        public GenericRepository(HabitTrackerDbContext context, ILogger<GenericRepository<TEntity>> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _dbSet = _context.Set<TEntity>();
        }

        // Basic CRUD Operations
        public virtual async Task<TEntity?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting entity of type {EntityType} with ID {Id}", typeof(TEntity).Name, id);
                return await _dbSet.FindAsync([id], cancellationToken).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting entity of type {EntityType} with ID {Id}", typeof(TEntity).Name, id);
                throw;
            }
        }

        public virtual async Task<IEnumerable<TEntity>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Getting all entities of type {EntityType}", typeof(TEntity).Name);
                return await _dbSet.AsNoTracking().ToListAsync(cancellationToken).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all entities of type {EntityType}", typeof(TEntity).Name);
                throw;
            }
        }

        public virtual async Task<TEntity> AddAsync(TEntity entity, CancellationToken cancellationToken = default)
        {
            try
            {
                if (entity == null)
                    throw new ArgumentNullException(nameof(entity));

                _logger.LogDebug("Adding entity of type {EntityType}", typeof(TEntity).Name);
                await _dbSet.AddAsync(entity, cancellationToken).ConfigureAwait(false);
                return entity;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding entity of type {EntityType}", typeof(TEntity).Name);
                throw;
            }
        }

        public virtual async Task<IEnumerable<TEntity>> AddRangeAsync(IEnumerable<TEntity> entities, CancellationToken cancellationToken = default)
        {
            try
            {
                if (entities == null)
                    throw new ArgumentNullException(nameof(entities));

                var entityList = entities.ToList();
                _logger.LogDebug("Adding {Count} entities of type {EntityType}", entityList.Count, typeof(TEntity).Name);
                
                await _dbSet.AddRangeAsync(entityList, cancellationToken).ConfigureAwait(false);
                return entityList;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding range of entities of type {EntityType}", typeof(TEntity).Name);
                throw;
            }
        }

        public virtual Task UpdateAsync(TEntity entity, CancellationToken cancellationToken = default)
        {
            try
            {
                if (entity == null)
                    throw new ArgumentNullException(nameof(entity));

                _logger.LogDebug("Updating entity of type {EntityType}", typeof(TEntity).Name);
                _dbSet.Update(entity);
                return Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating entity of type {EntityType}", typeof(TEntity).Name);
                throw;
            }
        }

        public virtual Task DeleteAsync(TEntity entity, CancellationToken cancellationToken = default)
        {
            try
            {
                if (entity == null)
                    throw new ArgumentNullException(nameof(entity));

                _logger.LogDebug("Deleting entity of type {EntityType}", typeof(TEntity).Name);
                _dbSet.Remove(entity);
                return Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting entity of type {EntityType}", typeof(TEntity).Name);
                throw;
            }
        }

        public virtual async Task DeleteByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Deleting entity of type {EntityType} with ID {Id}", typeof(TEntity).Name, id);
                var entity = await GetByIdAsync(id, cancellationToken).ConfigureAwait(false);
                
                if (entity != null)
                {
                    await DeleteAsync(entity, cancellationToken).ConfigureAwait(false);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting entity of type {EntityType} with ID {Id}", typeof(TEntity).Name, id);
                throw;
            }
        }

        // Query Operations
        public virtual async Task<IEnumerable<TEntity>> FindAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken = default)
        {
            try
            {
                if (predicate == null)
                    throw new ArgumentNullException(nameof(predicate));

                _logger.LogDebug("Finding entities of type {EntityType} with predicate", typeof(TEntity).Name);
                return await _dbSet.Where(predicate).AsNoTracking().ToListAsync(cancellationToken).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error finding entities of type {EntityType} with predicate", typeof(TEntity).Name);
                throw;
            }
        }

        public virtual async Task<TEntity?> FirstOrDefaultAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken = default)
        {
            try
            {
                if (predicate == null)
                    throw new ArgumentNullException(nameof(predicate));

                _logger.LogDebug("Finding first entity of type {EntityType} with predicate", typeof(TEntity).Name);
                return await _dbSet.Where(predicate).AsNoTracking().FirstOrDefaultAsync(cancellationToken).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error finding first entity of type {EntityType} with predicate", typeof(TEntity).Name);
                throw;
            }
        }

        public virtual async Task<bool> AnyAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken = default)
        {
            try
            {
                if (predicate == null)
                    throw new ArgumentNullException(nameof(predicate));

                _logger.LogDebug("Checking if any entity of type {EntityType} exists with predicate", typeof(TEntity).Name);
                return await _dbSet.AnyAsync(predicate, cancellationToken).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if any entity of type {EntityType} exists with predicate", typeof(TEntity).Name);
                throw;
            }
        }

        public virtual async Task<int> CountAsync(Expression<Func<TEntity, bool>>? predicate = null, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Counting entities of type {EntityType}", typeof(TEntity).Name);
                
                if (predicate == null)
                    return await _dbSet.CountAsync(cancellationToken).ConfigureAwait(false);
                
                return await _dbSet.CountAsync(predicate, cancellationToken).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error counting entities of type {EntityType}", typeof(TEntity).Name);
                throw;
            }
        }

        // Advanced Query Operations with Includes
        public virtual async Task<TEntity?> GetByIdWithIncludesAsync(int id, params Expression<Func<TEntity, object>>[] includes)
        {
            try
            {
                _logger.LogDebug("Getting entity of type {EntityType} with ID {Id} and includes", typeof(TEntity).Name, id);
                
                IQueryable<TEntity> query = _dbSet;
                foreach (var include in includes)
                {
                    query = query.Include(include);
                }
                
                return await query.FirstOrDefaultAsync(e => EF.Property<int>(e, "Id") == id).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting entity of type {EntityType} with ID {Id} and includes", typeof(TEntity).Name, id);
                throw;
            }
        }

        public virtual async Task<IEnumerable<TEntity>> GetAllWithIncludesAsync(params Expression<Func<TEntity, object>>[] includes)
        {
            try
            {
                _logger.LogDebug("Getting all entities of type {EntityType} with includes", typeof(TEntity).Name);
                
                IQueryable<TEntity> query = _dbSet;
                foreach (var include in includes)
                {
                    query = query.Include(include);
                }
                
                return await query.AsNoTracking().ToListAsync().ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all entities of type {EntityType} with includes", typeof(TEntity).Name);
                throw;
            }
        }

        public virtual async Task<IEnumerable<TEntity>> FindWithIncludesAsync(Expression<Func<TEntity, bool>> predicate, params Expression<Func<TEntity, object>>[] includes)
        {
            try
            {
                if (predicate == null)
                    throw new ArgumentNullException(nameof(predicate));

                _logger.LogDebug("Finding entities of type {EntityType} with predicate and includes", typeof(TEntity).Name);
                
                IQueryable<TEntity> query = _dbSet;
                foreach (var include in includes)
                {
                    query = query.Include(include);
                }
                
                return await query.Where(predicate).AsNoTracking().ToListAsync().ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error finding entities of type {EntityType} with predicate and includes", typeof(TEntity).Name);
                throw;
            }
        }

        // Pagination
        public virtual async Task<IEnumerable<TEntity>> GetPagedAsync(int pageNumber, int pageSize, Expression<Func<TEntity, bool>>? filter = null, CancellationToken cancellationToken = default)
        {
            try
            {
                if (pageNumber <= 0)
                    throw new ArgumentException("Page number must be greater than 0", nameof(pageNumber));
                
                if (pageSize <= 0)
                    throw new ArgumentException("Page size must be greater than 0", nameof(pageSize));

                _logger.LogDebug("Getting paged entities of type {EntityType} - Page: {PageNumber}, Size: {PageSize}", 
                    typeof(TEntity).Name, pageNumber, pageSize);
                
                IQueryable<TEntity> query = _dbSet;
                
                if (filter != null)
                    query = query.Where(filter);
                
                return await query
                    .AsNoTracking()
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync(cancellationToken)
                    .ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting paged entities of type {EntityType}", typeof(TEntity).Name);
                throw;
            }
        }

        // Ordering
        public virtual async Task<IEnumerable<TEntity>> GetOrderedAsync<TKey>(Expression<Func<TEntity, TKey>> orderBy, bool ascending = true, CancellationToken cancellationToken = default)
        {
            try
            {
                if (orderBy == null)
                    throw new ArgumentNullException(nameof(orderBy));

                _logger.LogDebug("Getting ordered entities of type {EntityType}", typeof(TEntity).Name);
                
                IQueryable<TEntity> query = ascending ? _dbSet.OrderBy(orderBy) : _dbSet.OrderByDescending(orderBy);
                
                return await query.AsNoTracking().ToListAsync(cancellationToken).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting ordered entities of type {EntityType}", typeof(TEntity).Name);
                throw;
            }
        }

        public virtual async Task<IEnumerable<TEntity>> FindOrderedAsync<TKey>(Expression<Func<TEntity, bool>> predicate, Expression<Func<TEntity, TKey>> orderBy, bool ascending = true, CancellationToken cancellationToken = default)
        {
            try
            {
                if (predicate == null)
                    throw new ArgumentNullException(nameof(predicate));
                if (orderBy == null)
                    throw new ArgumentNullException(nameof(orderBy));

                _logger.LogDebug("Finding ordered entities of type {EntityType} with predicate", typeof(TEntity).Name);
                
                IQueryable<TEntity> query = _dbSet.Where(predicate);
                query = ascending ? query.OrderBy(orderBy) : query.OrderByDescending(orderBy);
                
                return await query.AsNoTracking().ToListAsync(cancellationToken).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error finding ordered entities of type {EntityType} with predicate", typeof(TEntity).Name);
                throw;
            }
        }
    }
}