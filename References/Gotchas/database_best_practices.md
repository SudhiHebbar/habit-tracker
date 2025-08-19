# Database Best Practices and Data Access Patterns

## Core Database Principles

### 1. Avoid Inline Queries

**Problem**: SQL queries scattered throughout application code make maintenance difficult and create security vulnerabilities.

**Solutions by Technology Stack:**

#### .NET/Entity Framework

```csharp
// ❌ Avoid: Inline queries
var user = context.Database.SqlQuery<User>("SELECT * FROM Users WHERE Id = " + userId);

// ✅ Preferred: Repository pattern with EF Core
public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public async Task<User> GetByIdAsync(int id)
    {
        return await _context.Users.FindAsync(id);
    }
}
```

#### Python/Django ORM

```python
# ❌ Avoid: Raw SQL everywhere
from django.db import connection
cursor = connection.cursor()
cursor.execute("SELECT * FROM users WHERE id = %s", [user_id])

# ✅ Preferred: Model-based queries
class User(models.Model):
    # ... model definition

    @classmethod
    def get_by_id(cls, user_id):
        return cls.objects.get(id=user_id)
```

#### Node.js/Prisma

```javascript
// ❌ Avoid: Raw queries without parameterization
const query = `SELECT * FROM users WHERE id = ${userId}`;
const result = await db.query(query);

// ✅ Preferred: ORM with type safety
const user = await prisma.user.findUnique({
  where: { id: userId },
});
```

### 2. Repository Pattern Implementation

#### Interface Definition

```typescript
interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: CreateUserDto): Promise<User>;
  update(id: string, user: UpdateUserDto): Promise<User>;
  delete(id: string): Promise<void>;
}
```

#### Implementation Examples

**Entity Framework (.NET)**

```csharp
public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        return await _context.Users
            .Include(u => u.Profile)
            .FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<User> CreateAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }
}
```

**SQLAlchemy (Python)**

```python
class UserRepository:
    def __init__(self, session: Session):
        self.session = session

    async def get_by_id(self, user_id: int) -> Optional[User]:
        return self.session.query(User).filter(User.id == user_id).first()

    async def create(self, user: User) -> User:
        self.session.add(user)
        await self.session.commit()
        return user
```

### 3. Query Optimization Patterns

#### Eager Loading vs Lazy Loading

```csharp
// ✅ Eager loading for known relationships
var users = await _context.Users
    .Include(u => u.Orders)
    .ThenInclude(o => o.OrderItems)
    .ToListAsync();

// ✅ Selective loading for performance
var users = await _context.Users
    .Select(u => new UserDto
    {
        Id = u.Id,
        Name = u.Name,
        OrderCount = u.Orders.Count()
    })
    .ToListAsync();
```

#### Batch Operations

```csharp
// ❌ Avoid: N+1 operations
foreach(var user in users)
{
    user.LastLogin = DateTime.Now;
    await _context.SaveChangesAsync(); // Multiple database hits
}

// ✅ Preferred: Batch updates
foreach(var user in users)
{
    user.LastLogin = DateTime.Now;
}
await _context.SaveChangesAsync(); // Single database hit
```

### 4. Transaction Management

#### Explicit Transaction Control

```csharp
// .NET Example
using var transaction = await _context.Database.BeginTransactionAsync();
try
{
    await _userRepository.CreateAsync(user);
    await _auditRepository.LogAsync(auditEntry);
    await transaction.CommitAsync();
}
catch
{
    await transaction.RollbackAsync();
    throw;
}
```

#### Unit of Work Pattern

```csharp
public interface IUnitOfWork : IDisposable
{
    IUserRepository Users { get; }
    IOrderRepository Orders { get; }
    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}
```

### 5. Security Best Practices

#### Parameterized Queries

```csharp
// ❌ SQL Injection vulnerable
var query = $"SELECT * FROM Users WHERE Email = '{email}'";

// ✅ Parameterized and safe
var user = await _context.Users
    .FromSqlRaw("SELECT * FROM Users WHERE Email = {0}", email)
    .FirstOrDefaultAsync();
```

#### Input Validation

```csharp
public async Task<User> GetUserAsync(string email)
{
    if (string.IsNullOrWhiteSpace(email))
        throw new ArgumentException("Email cannot be empty");

    if (!IsValidEmail(email))
        throw new ArgumentException("Invalid email format");

    return await _userRepository.GetByEmailAsync(email);
}
```

## Technology-Specific Patterns

### Entity Framework Core Best Practices

```yaml
configuration:
  - use_fluent_api: "Configure entity relationships explicitly"
  - connection_resilience: "Enable connection retry policies"
  - query_tracking: "Use AsNoTracking() for read-only queries"

performance:
  - compiled_queries: "Use compiled queries for frequently executed queries"
  - split_queries: "Use AsSplitQuery() for multiple includes"
  - projection: "Use Select() to fetch only needed columns"
```

### Prisma Best Practices

```yaml
schema_design:
  - use_relations: "Define explicit relationships in schema"
  - use_indexes: "Add database-level indexes for performance"
  - use_constraints: "Leverage database constraints for data integrity"

queries:
  - use_select: "Use select to fetch specific fields"
  - use_include: "Use include for related data"
  - use_transactions: "Wrap related operations in transactions"
```

### Django ORM Best Practices

```yaml
querysets:
  - use_select_related: "For ForeignKey and OneToOne relationships"
  - use_prefetch_related: "For ManyToMany and reverse ForeignKey"
  - use_only_defer: "Use only() and defer() to control field selection"

performance:
  - use_bulk_operations: "Use bulk_create() and bulk_update()"
  - use_database_functions: "Leverage database functions in queries"
  - use_raw_when_needed: "Use raw() for complex queries"
```

## Validation Commands

### Database Schema Validation

```bash
# Entity Framework
dotnet ef migrations check
dotnet ef dbcontext info

# Django
python manage.py check
python manage.py makemigrations --dry-run

# Prisma
npx prisma validate
npx prisma db push --preview-feature
```

### Query Performance Analysis

```bash
# Entity Framework - Enable logging
builder.Services.AddLogging(logging => logging.AddConsole());

# Django - Debug toolbar
pip install django-debug-toolbar

# Prisma - Query analysis
npx prisma studio
```

### Security Auditing

```bash
# Check for SQL injection vulnerabilities
# Use static analysis tools like:
# - SonarQube
# - CodeQL
# - Semgrep

# Database security scanning
# Use tools like:
# - SQLMap for penetration testing
# - Database security scanners
```

## Common Anti-Patterns to Avoid

### 1. Active Record in Domain Models

```csharp
// ❌ Avoid: Domain model with persistence logic
public class User
{
    public void Save()
    {
        // Database logic in domain model
    }
}

// ✅ Preferred: Separate concerns
public class User
{
    // Pure domain logic only
}

public class UserRepository
{
    public async Task SaveAsync(User user)
    {
        // Persistence logic in repository
    }
}
```

### 2. Leaky Abstractions

```csharp
// ❌ Avoid: Exposing ORM types
public IQueryable<User> GetUsers()
{
    return _context.Users; // Exposes EF types
}

// ✅ Preferred: Clean abstractions
public async Task<IEnumerable<User>> GetUsersAsync()
{
    return await _context.Users.ToListAsync();
}
```

### 3. Chatty Database Access

```csharp
// ❌ Avoid: Multiple round trips
foreach(var user in users)
{
    var orders = await GetOrdersByUserIdAsync(user.Id);
    user.Orders = orders;
}

// ✅ Preferred: Single query with joins
var usersWithOrders = await _context.Users
    .Include(u => u.Orders)
    .ToListAsync();
```

## Quality Gates

### Code Review Checklist

- [ ] No inline SQL queries without parameterization
- [ ] Repository pattern implemented for data access
- [ ] Proper transaction boundaries defined
- [ ] Input validation implemented
- [ ] ORM relationships properly configured
- [ ] Query performance considered (avoid N+1)
- [ ] Error handling implemented for database operations
- [ ] Connection management handled properly
- [ ] Database migrations properly versioned
- [ ] Security scanning performed on queries
