# .NET Core / ASP.NET Core Gotchas & Best Practices

## Critical .NET Core Gotchas

### CORS Configuration Issues

```csharp
// ❌ GOTCHA: UseCors() called after UseMvc()
app.UseMvc(); // MVC pipeline terminates request
app.UseCors("CorsPolicy"); // Never reached!

// ✅ CORRECT: CORS before MVC
app.UseCors("CorsPolicy");
app.UseMvc();

// ❌ GOTCHA: CORS headers only sent on cross-domain requests
// Testing on same domain (localhost:5000 to localhost:5000) won't show CORS headers

// ✅ CORRECT: Test with actual cross-domain origin
services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", builder =>
        builder.WithOrigins("http://localhost:3000") // Specific origins
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials());
});
```

### Exception Handling Anti-Patterns

```csharp
// ❌ GOTCHA: Catching generic Exception and checking message
try {
    DoSomethingRisky();
} catch (Exception ex) {
    if (ex.Message == "Customer cannot be null") {
        // Fragile - message can change
    }
}

// ✅ CORRECT: Use specific exception types
try {
    DoSomethingRisky();
} catch (ArgumentNullException ex) {
    // Handle specific exception type
}

// ❌ GOTCHA: Improper exception rethrowing
catch (Exception ex) {
    throw ex; // Loses original stack trace
}

// ✅ CORRECT: Preserve stack trace
catch (Exception ex) {
    throw; // Preserves original stack trace
}
```

### Immutable Type Confusion

```csharp
// ❌ GOTCHA: DateTime operations don't modify original
DateTime meeting = DateTime.Now;
meeting.AddDays(1); // Returns new DateTime, doesn't modify 'meeting'

// ✅ CORRECT: Assign result back
DateTime meeting = DateTime.Now;
meeting = meeting.AddDays(1);
```

### TimeSpan Property Confusion

```csharp
// ❌ GOTCHA: Using component properties instead of total
TimeSpan elapsed = stopwatch.Elapsed;
Console.WriteLine($"Took {elapsed.Milliseconds} ms"); // Only millisecond component!

// ✅ CORRECT: Use Total properties for actual measurements
Console.WriteLine($"Took {elapsed.TotalMilliseconds} ms");
```

### String Concatenation Performance

```csharp
// ❌ GOTCHA: Multiple string concatenations create many objects
string result = "";
for (int i = 0; i < 1000; i++) {
    result += i; // Creates new string each iteration
}

// ✅ CORRECT: Use StringBuilder for multiple concatenations
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 1000; i++) {
    sb.Append(i);
}
string result = sb.ToString();
```

### Double Comparison Issues

```csharp
// ❌ GOTCHA: Direct equality comparison with doubles
double a = 0.1 + 0.2;
double b = 0.3;
bool equal = (a == b); // May be false due to floating point precision

// ✅ CORRECT: Use epsilon comparison or decimal for exact calculations
bool equal = Math.Abs(a - b) < double.Epsilon;
// OR use decimal for financial calculations
decimal preciseA = 0.1m + 0.2m;
decimal preciseB = 0.3m;
bool exactEqual = (preciseA == preciseB); // Always true
```

### Async Void Anti-Pattern

```csharp
// ❌ GOTCHA: async void prevents proper exception handling
public async void ProcessDataAsync() // Exceptions won't propagate properly
{
    await SomeAsyncOperation();
}

// ✅ CORRECT: Return Task for proper exception handling
public async Task ProcessDataAsync()
{
    await SomeAsyncOperation();
}
```

### Boxing and Unboxing Performance

```csharp
// ❌ GOTCHA: Unnecessary boxing with value types
ArrayList list = new ArrayList();
list.Add(42); // Boxing int to object
int value = (int)list[0]; // Unboxing back to int

// ✅ CORRECT: Use generic collections to avoid boxing
List<int> list = new List<int>();
list.Add(42); // No boxing
int value = list[0]; // No unboxing
```

### Closure Variable Capture

```csharp
// ❌ GOTCHA: Capturing loop variable in closures
var actions = new List<Action>();
for (int i = 0; i < 3; i++)
{
    actions.Add(() => Console.WriteLine(i)); // Captures variable, not value
}
// All actions print "3"

// ✅ CORRECT: Capture value by creating local copy
var actions = new List<Action>();
for (int i = 0; i < 3; i++)
{
    int localI = i; // Copy value
    actions.Add(() => Console.WriteLine(localI));
}
```

### Enumeration Multiple Times

```csharp
// ❌ GOTCHA: Multiple enumeration of IEnumerable
public void ProcessData(IEnumerable<string> data)
{
    if (data.Any()) // First enumeration
    {
        foreach (var item in data) // Second enumeration - potential problem!
        {
            ProcessItem(item);
        }
    }
}

// ✅ CORRECT: Materialize once if multiple access needed
public void ProcessData(IEnumerable<string> data)
{
    var materializedData = data.ToList(); // Single enumeration
    if (materializedData.Any())
    {
        foreach (var item in materializedData)
        {
            ProcessItem(item);
        }
    }
}
```

### Event Handler Memory Leaks

```csharp
// ❌ GOTCHA: Static event handlers prevent garbage collection
public class Publisher
{
    public static event Action<string> StaticEvent;
}

public class Subscriber
{
    public Subscriber()
    {
        Publisher.StaticEvent += HandleEvent; // Never gets collected!
    }

    private void HandleEvent(string data) { }
}

// ✅ CORRECT: Use weak event patterns or unsubscribe
public class Subscriber : IDisposable
{
    public Subscriber()
    {
        Publisher.StaticEvent += HandleEvent;
    }

    public void Dispose()
    {
        Publisher.StaticEvent -= HandleEvent; // Explicit cleanup
    }

    private void HandleEvent(string data) { }
}
```

### ref vs out Parameter Confusion

```csharp
// ❌ GOTCHA: Misunderstanding ref vs out
public void InitializeValue(out int value)
{
    // value++; // Compilation error - must assign before use
    value = 10; // Must assign
}

public void ModifyValue(ref int value)
{
    value++; // Can use existing value
}

// ✅ CORRECT: Understand the difference
int uninitializedValue; // Don't need to initialize for 'out'
InitializeValue(out uninitializedValue);

int existingValue = 5; // Must initialize for 'ref'
ModifyValue(ref existingValue);
```

### Static Constructor Gotchas

```csharp
// ❌ GOTCHA: Static constructor exceptions can break type
public class ProblematicClass
{
    static ProblematicClass()
    {
        throw new Exception("Oops!"); // Type becomes unusable
    }

    public static void DoSomething() { }
}

// Any attempt to use ProblematicClass will throw TypeInitializationException

// ✅ CORRECT: Handle exceptions in static constructors carefully
public class SafeClass
{
    private static bool _initialized = false;

    static SafeClass()
    {
        try
        {
            // Risky initialization code
            _initialized = true;
        }
        catch (Exception ex)
        {
            // Log error, set default state
            _initialized = false;
        }
    }
}
```

### Dependency Injection Lifetime Management

```csharp
// ❌ GOTCHA: Wrong service lifetime can cause memory leaks
services.AddSingleton<IUserService, UserService>(); // UserService holds DbContext!

// ✅ CORRECT: Match lifetime to usage pattern
services.AddScoped<IUserService, UserService>();    // Scoped to HTTP request
services.AddTransient<IEmailService, EmailService>(); // New instance each time
services.AddSingleton<IConfiguration>(configuration); // Truly singleton
```

### Entity Framework Context Issues

```csharp
// ❌ GOTCHA: DbContext is not thread-safe
public class UserService
{
    private readonly ApplicationDbContext _context;

    public async Task ProcessUsersAsync()
    {
        var users = await _context.Users.ToListAsync();
        await Task.WhenAll(users.Select(ProcessUserAsync)); // DANGER!
    }
}

// ✅ CORRECT: Use separate contexts for parallel operations
public async Task ProcessUsersAsync()
{
    var users = await _context.Users.ToListAsync();
    var tasks = users.Select(async user =>
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        return await ProcessUserAsync(user, context);
    });
    await Task.WhenAll(tasks);
}
```

### Configuration Binding

```csharp
// ❌ GOTCHA: Configuration not validating at startup
services.Configure<DatabaseOptions>(configuration.GetSection("Database"));

// ✅ CORRECT: Validate configuration at startup
services.Configure<DatabaseOptions>(configuration.GetSection("Database"));
services.AddOptions<DatabaseOptions>()
    .Bind(configuration.GetSection("Database"))
    .ValidateDataAnnotations()
    .ValidateOnStart();
```

### Async/Await Patterns

```csharp
// ❌ GOTCHA: Blocking async calls cause deadlocks
public ActionResult GetUser(int id)
{
    var user = _userService.GetUserAsync(id).Result; // DEADLOCK RISK!
    return Ok(user);
}

// ✅ CORRECT: Async all the way up
public async Task<ActionResult> GetUserAsync(int id)
{
    var user = await _userService.GetUserAsync(id);
    return Ok(user);
}
```

## Deployment & Environment Gotchas

### launchSettings.json Interference

```csharp
// ❌ GOTCHA: dotnet run uses launchSettings.json in production containers
// In Dockerfile:
COPY . .  // Copies launchSettings.json
ENTRYPOINT dotnet run  // Uses development settings!

// ✅ CORRECT: Exclude Properties folder or use published output
// In .dockerignore:
Properties/

// OR better - use published deployment:
RUN dotnet publish -c Release -o /app/publish
ENTRYPOINT dotnet /app/publish/MyApp.dll
```

### Forward Headers for Reverse Proxies

```csharp
// ❌ GOTCHA: OAuth redirects use wrong hostname behind reverse proxy
// Results in localhost URLs instead of actual domain

// ✅ CORRECT: Configure forwarded headers middleware
if (app.Environment.IsProduction())
{
    app.UseForwardedHeaders(new ForwardedHeadersOptions
    {
        ForwardedHeaders = ForwardedHeaders.XForwardedFor |
                          ForwardedHeaders.XForwardedProto |
                          ForwardedHeaders.XForwardedHost
    });
}

// OR use environment variable (ASP.NET Core 3.0+):
// ASPNETCORE_FORWARDEDHEADERS_ENABLED=true
```

### Reserved Path Conflicts

```csharp
// ❌ GOTCHA: Some hosting platforms reserve specific paths
// GitHub Codespaces reserves "/signin" paths
// Azure App Service reserves certain paths

// ✅ CORRECT: Use alternative paths for authentication
[HttpPost("/sign-in")]  // Not "/signin"
public async Task<IActionResult> SignIn([FromForm] LoginModel model)
{
    // Authentication logic
}

// Configure OAuth callback path to avoid conflicts
services.AddAuthentication()
    .AddGitHub(options =>
    {
        options.CallbackPath = "/auth/github-callback"; // Not "/signin-github"
    });
```

### Windows Authentication with CORS

```csharp
// ❌ GOTCHA: Windows Authentication blocks CORS preflight OPTIONS requests
// OPTIONS requests are anonymous, get 401 Unauthorized

// ✅ CORRECT: Allow anonymous access for OPTIONS or disable Windows auth for preflight
services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", builder =>
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader());
});

// In web.config or launchSettings.json - enable both:
"windowsAuthentication": true,
"anonymousAuthentication": true  // Required for CORS preflight
```

## Performance Gotchas

### N+1 Query Problem

```csharp
// ❌ GOTCHA: N+1 queries with lazy loading
var users = await _context.Users.ToListAsync();
foreach (var user in users)
{
    Console.WriteLine(user.Orders.Count); // Separate query for each user!
}

// ✅ CORRECT: Use Include for eager loading
var users = await _context.Users
    .Include(u => u.Orders)
    .ToListAsync();
```

### Memory Leaks with Event Handlers

```csharp
// ❌ GOTCHA: Event handlers prevent garbage collection
public class OrderService
{
    public OrderService(INotificationService notifications)
    {
        notifications.OrderCreated += OnOrderCreated; // Never unsubscribed!
    }
}

// ✅ CORRECT: Implement IDisposable and unsubscribe
public class OrderService : IDisposable
{
    private readonly INotificationService _notifications;

    public OrderService(INotificationService notifications)
    {
        _notifications = notifications;
        _notifications.OrderCreated += OnOrderCreated;
    }

    public void Dispose()
    {
        _notifications.OrderCreated -= OnOrderCreated;
    }
}
```

### Resource Management with Using Statements

```csharp
// ❌ GOTCHA: Not disposing resources can exhaust connection pools
SqlConnection conn = new SqlConnection(connectionString);
conn.Open();
// Do work...
conn.Close(); // If exception occurs, connection might not close!

// ✅ CORRECT: Use using statements for automatic disposal
using (var conn = new SqlConnection(connectionString))
{
    conn.Open();
    // Do work - connection automatically disposed even if exception occurs
}

// C# 8+ syntax:
using var conn = new SqlConnection(connectionString);
conn.Open();
// Automatically disposed at end of scope
```

### IDisposable Implementation Gotchas

```csharp
// ❌ GOTCHA: Not suppressing finalizer after disposal
public class MyResource : IDisposable
{
    public void Dispose()
    {
        // Clean up resources
        // Missing: GC.SuppressFinalize(this);
    }
}

// ✅ CORRECT: Full dispose pattern
public class MyResource : IDisposable
{
    private bool _disposed = false;

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this); // Prevent finalizer from running
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed)
        {
            if (disposing)
            {
                // Dispose managed resources
            }
            // Dispose unmanaged resources
            _disposed = true;
        }
    }
}
```

## Development & Debugging Gotchas

### Preprocessor Statement Abuse

```csharp
// ❌ GOTCHA: Using preprocessor for business logic
bool allowFeature = true;
#if CUSTOMER_A
    allowFeature = false;
#endif
// Creates maintenance nightmare and testing complexity

// ✅ CORRECT: Use configuration and strategy pattern
public interface IFeatureToggle
{
    bool IsFeatureEnabled(string featureName);
}

public class ConfigurationFeatureToggle : IFeatureToggle
{
    private readonly IConfiguration _config;

    public bool IsFeatureEnabled(string featureName)
    {
        return _config.GetValue<bool>($"Features:{featureName}");
    }
}
```

### Serialization Gotchas

```csharp
// ❌ GOTCHA: Properties without setters can't be deserialized
public class User
{
    public string Name { get; } // No setter - won't deserialize
    public int Age { get; private set; } // Private setter may not work
}

// ✅ CORRECT: Provide accessible setters or use attributes
public class User
{
    public string Name { get; set; } // Public setter

    [JsonPropertyName("age")]
    public int Age { get; init; } // Init-only works with System.Text.Json
}
```

### Thread Safety Gotchas

```csharp
// ❌ GOTCHA: Assuming static variables are thread-safe
public static class Counter
{
    private static int _count = 0;

    public static void Increment()
    {
        _count++; // Not atomic - race condition!
    }
}

// ✅ CORRECT: Use thread-safe operations or locking
public static class Counter
{
    private static int _count = 0;
    private static readonly object _lock = new object();

    public static void Increment()
    {
        lock (_lock)
        {
            _count++;
        }
    }

    // OR use Interlocked for simple operations
    public static void IncrementAtomic()
    {
        Interlocked.Increment(ref _count);
    }
}
```

## Security Gotchas

### Authorization vs Authentication

```csharp
// ❌ GOTCHA: Only checking authentication, not authorization
[Authorize] // Only checks if user is logged in
public async Task<ActionResult> DeleteUserAsync(int id)
{
    // Any authenticated user can delete any user!
}

// ✅ CORRECT: Use proper authorization
[Authorize(Policy = "AdminOnly")]
public async Task<ActionResult> DeleteUserAsync(int id)
{
    // Only admin users can delete
}
```

### Input Validation

```csharp
// ❌ GOTCHA: Trusting user input
public async Task<ActionResult> CreateUserAsync(CreateUserRequest request)
{
    var user = new User { Email = request.Email }; // No validation!
    await _context.Users.AddAsync(user);
}

// ✅ CORRECT: Validate input with data annotations and FluentValidation
[HttpPost]
public async Task<ActionResult> CreateUserAsync([FromBody] CreateUserRequest request)
{
    if (!ModelState.IsValid)
        return BadRequest(ModelState);

    // Additional business logic validation
    var validator = new CreateUserRequestValidator();
    var validationResult = await validator.ValidateAsync(request);
    if (!validationResult.IsValid)
        return BadRequest(validationResult.Errors);
}
```

## Common Patterns to Follow

### Repository Pattern with Unit of Work

```csharp
public interface IUnitOfWork
{
    IUserRepository Users { get; }
    IOrderRepository Orders { get; }
    Task<int> SaveChangesAsync();
}

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
        Users = new UserRepository(context);
        Orders = new OrderRepository(context);
    }

    public async Task<int> SaveChangesAsync() => await _context.SaveChangesAsync();
}
```

### Result Pattern for Error Handling

```csharp
public class Result<T>
{
    public bool IsSuccess { get; init; }
    public T? Value { get; init; }
    public string? Error { get; init; }

    public static Result<T> Success(T value) => new() { IsSuccess = true, Value = value };
    public static Result<T> Failure(string error) => new() { IsSuccess = false, Error = error };
}

public async Task<Result<User>> GetUserAsync(int id)
{
    var user = await _context.Users.FindAsync(id);
    return user != null
        ? Result<User>.Success(user)
        : Result<User>.Failure($"User with ID {id} not found");
}
```

### Testing Patterns

```csharp
// Use WebApplicationFactory for integration tests
public class UserControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public UserControllerTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task GetUser_ReturnsUser_WhenUserExists()
    {
        // Arrange, Act, Assert pattern
    }
}
```

## Additional Critical .NET Gotchas

### Default Interface Implementation Gotchas

```csharp
// ❌ GOTCHA: Default interface methods not called when casting to base interface
interface IBase
{
    void BaseMethod() => Console.WriteLine("Base implementation");
}

interface IDerived : IBase
{
    void BaseMethod() => Console.WriteLine("Derived implementation");
}

class Implementation : IDerived { }

// Usage:
Implementation impl = new Implementation();
IBase baseRef = impl;
IDerived derivedRef = impl;

baseRef.BaseMethod();    // Calls IBase.BaseMethod() - "Base implementation"
derivedRef.BaseMethod(); // Calls IDerived.BaseMethod() - "Derived implementation"

// ✅ CORRECT: Be explicit about which interface method you want
```

### Struct Mutability Gotchas

```csharp
// ❌ GOTCHA: Modifying struct properties in readonly contexts
public struct Point
{
    public int X { get; set; }
    public int Y { get; set; }
}

public class Container
{
    public readonly Point ReadonlyPoint = new Point { X = 1, Y = 2 };

    public void ModifyPoint()
    {
        ReadonlyPoint.X = 10; // Compilation error!
    }
}

// ✅ CORRECT: Use readonly structs or be aware of copying behavior
public readonly struct ReadonlyPoint
{
    public ReadonlyPoint(int x, int y) { X = x; Y = y; }
    public int X { get; }
    public int Y { get; }
}
```

### Task.Run vs Task.FromResult Confusion

```csharp
// ❌ GOTCHA: Using Task.Run for already-completed synchronous work
public async Task<string> GetCachedValueAsync(string key)
{
    if (_cache.TryGetValue(key, out string value))
    {
        return await Task.Run(() => value); // Unnecessary thread pool usage!
    }
    return await FetchFromDatabaseAsync(key);
}

// ✅ CORRECT: Use Task.FromResult for already-completed values
public async Task<string> GetCachedValueAsync(string key)
{
    if (_cache.TryGetValue(key, out string value))
    {
        return value; // Direct return, no Task needed
        // OR: return Task.FromResult(value);
    }
    return await FetchFromDatabaseAsync(key);
}
```

### Collection Modified During Enumeration

```csharp
// ❌ GOTCHA: Modifying collection while enumerating
var items = new List<string> { "a", "b", "c", "d" };
foreach (var item in items)
{
    if (item == "b")
    {
        items.Remove(item); // InvalidOperationException!
    }
}

// ✅ CORRECT: Enumerate backwards or use separate collection
// Option 1: Enumerate backwards
for (int i = items.Count - 1; i >= 0; i--)
{
    if (items[i] == "b")
    {
        items.RemoveAt(i);
    }
}

// Option 2: Use LINQ to create new collection
items = items.Where(item => item != "b").ToList();
```

### Nullable Reference Types Gotchas

```csharp
// ❌ GOTCHA: Nullable warnings ignored in legacy code
#nullable enable
public class UserService
{
    private readonly string _connectionString; // Warning: Non-nullable field not initialized

    public User GetUser(string name) // Warning: Possible null reference return
    {
        return _users.FirstOrDefault(u => u.Name == name); // May return null
    }
}

// ✅ CORRECT: Properly handle nullable scenarios
#nullable enable
public class UserService
{
    private readonly string _connectionString = string.Empty;

    public User? GetUser(string name) // Explicitly nullable return
    {
        return _users.FirstOrDefault(u => u.Name == name);
    }

    public User GetRequiredUser(string name) // Non-nullable with exception
    {
        return _users.FirstOrDefault(u => u.Name == name)
            ?? throw new UserNotFoundException($"User '{name}' not found");
    }
}
```

### ConfigureAwait(false) Misunderstanding

```csharp
// ❌ GOTCHA: Inconsistent ConfigureAwait usage
public async Task<string> ProcessDataAsync()
{
    var data1 = await GetDataAsync().ConfigureAwait(false);
    var data2 = await TransformDataAsync(data1); // Context might be captured!
    return data2;
}

// ✅ CORRECT: Be consistent with ConfigureAwait usage
public async Task<string> ProcessDataAsync()
{
    var data1 = await GetDataAsync().ConfigureAwait(false);
    var data2 = await TransformDataAsync(data1).ConfigureAwait(false);
    return data2;
}

// OR in ASP.NET Core (.NET Core), ConfigureAwait(false) is often unnecessary
public async Task<string> ProcessDataAsync()
{
    var data1 = await GetDataAsync();
    var data2 = await TransformDataAsync(data1);
    return data2;
}
```

### Record Types Equality Gotchas

```csharp
// ❌ GOTCHA: Assuming reference equality with records
public record Person(string Name, int Age);

var person1 = new Person("John", 30);
var person2 = new Person("John", 30);

bool referenceEqual = ReferenceEquals(person1, person2); // False
bool valueEqual = person1 == person2; // True - records use value equality

// ✅ CORRECT: Understand record equality semantics
// Records implement value-based equality by default
// But be careful with mutable properties in records
public record MutablePerson(string Name)
{
    public int Age { get; set; } // Mutable property can break equality
}

var p1 = new MutablePerson("John") { Age = 30 };
var p2 = new MutablePerson("John") { Age = 30 };
bool equal1 = p1 == p2; // True initially

p1.Age = 31;
bool equal2 = p1 == p2; // Still True! Age changes don't affect equality
```
