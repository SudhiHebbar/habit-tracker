# Task 004: Repository Pattern and Unit of Work Implementation

## Requirement Reference
- User Story: TS-003

## Task Overview
Implement the Repository Pattern and Unit of Work pattern to abstract data access layer and provide testable, maintainable data operations. This task creates generic and specific repositories for all entities, implements the Unit of Work pattern for transaction management, and sets up dependency injection for clean architecture separation. Includes comprehensive unit testing for data access logic.

## Dependent Tasks
- task_002_dotnet_project_setup.md (Backend infrastructure required)
- task_003_database_schema_implementation.md (Database entities must exist)

## Tasks
- Create generic repository interface and implementation
- Implement specific repositories for each entity (Tracker, Habit, HabitCompletion, Streak)
- Design and implement Unit of Work pattern for transaction management
- Configure dependency injection for repository registration
- Create repository interfaces in Application layer following clean architecture
- Implement async CRUD operations with proper error handling
- Add query methods for specific business requirements
- Create comprehensive unit tests for repository implementations
- Implement repository integration tests with in-memory database
- Set up repository performance testing and optimization

## Current State
```
server\
├── HabitTracker.Api\
├── HabitTracker.Application\
├── HabitTracker.Domain\
│   └── Entities\
│       ├── Tracker.cs
│       ├── Habit.cs
│       ├── HabitCompletion.cs
│       └── Streak.cs
├── HabitTracker.Infrastructure\
│   ├── Data\
│   │   ├── ApplicationDbContext.cs
│   │   └── Configurations\
│   ├── Migrations\
│   └── SeedData\
├── HabitTracker.Tests\
└── HabitTracker.sln
```

## Future State
```
server\
├── HabitTracker.Api\
├── HabitTracker.Application\
│   └── Interfaces\
│       ├── IGenericRepository.cs
│       ├── ITrackerRepository.cs
│       ├── IHabitRepository.cs
│       ├── IHabitCompletionRepository.cs
│       ├── IStreakRepository.cs
│       └── IUnitOfWork.cs
├── HabitTracker.Domain\
│   └── Entities\ (existing)
├── HabitTracker.Infrastructure\
│   ├── Data\ (existing)
│   └── Repositories\
│       ├── GenericRepository.cs
│       ├── TrackerRepository.cs
│       ├── HabitRepository.cs
│       ├── HabitCompletionRepository.cs
│       ├── StreakRepository.cs
│       └── UnitOfWork.cs
├── HabitTracker.Tests\
│   ├── Unit\
│   │   └── Repositories\
│   │       ├── TrackerRepositoryTests.cs
│   │       ├── HabitRepositoryTests.cs
│   │       ├── HabitCompletionRepositoryTests.cs
│   │       └── UnitOfWorkTests.cs
│   └── Integration\
│       └── RepositoryIntegrationTests.cs
└── HabitTracker.sln
```

## Development Workflow
1. Design repository interfaces in Application layer (clean architecture)
2. Create generic repository base implementation
3. Implement specific repositories for each entity
4. Design and implement Unit of Work pattern
5. Configure dependency injection for repository services
6. Add business-specific query methods to repositories
7. Create comprehensive unit tests for repository logic
8. Implement integration tests with in-memory database
9. Performance test and optimize repository queries
10. Validate repository pattern implementation against requirements

## Data Workflow
- Repositories abstract Entity Framework Core operations
- Unit of Work manages transactions across multiple repositories
- Application layer depends on repository interfaces, not implementations
- Repository implementations use DbContext for database operations
- Async patterns used throughout for scalable I/O operations
- Query optimization through proper LINQ expression usage
- Transaction management ensures data consistency

## Impacted Components
### Application Layer (HabitTracker.Application)
- **New**: IGenericRepository interface for common CRUD operations
- **New**: ITrackerRepository interface with tracker-specific methods
- **New**: IHabitRepository interface with habit management operations
- **New**: IHabitCompletionRepository interface for completion tracking
- **New**: IStreakRepository interface for progress calculations
- **New**: IUnitOfWork interface for transaction management

### Infrastructure Layer (HabitTracker.Infrastructure)
- **New**: GenericRepository base implementation
- **New**: TrackerRepository with user and sharing operations
- **New**: HabitRepository with tracker-specific filtering
- **New**: HabitCompletionRepository with date-based queries
- **New**: StreakRepository with calculation and update methods
- **New**: UnitOfWork implementation managing all repositories

### API Layer (HabitTracker.Api)
- **Updated**: Dependency injection configuration for repositories
- **Updated**: Service registration for Unit of Work pattern

### Testing Layer (HabitTracker.Tests)
- **New**: Unit tests for all repository implementations
- **New**: Integration tests with in-memory database
- **New**: Repository performance and optimization tests

## Implementation Plan
### Backend Implementation Plan
1. **Repository Interface Design**
   - Create IGenericRepository with common CRUD operations (Get, Add, Update, Delete)
   - Design ITrackerRepository with user-specific and sharing methods
   - Implement IHabitRepository with tracker filtering and ordering
   - Create IHabitCompletionRepository with date range and completion queries
   - Design IStreakRepository with calculation and progress methods
   - Create IUnitOfWork interface for transaction and repository management

2. **Generic Repository Implementation**
   - Implement GenericRepository base class with Entity Framework operations
   - Add async methods for all CRUD operations
   - Implement proper exception handling and logging
   - Add query optimization with Include/ThenInclude for related data
   - Create expression-based query methods for flexibility

3. **Specific Repository Implementations**
   - Implement TrackerRepository with user organization and sharing logic
   - Create HabitRepository with tracker-specific filtering and validation
   - Build HabitCompletionRepository with date-based queries and aggregations
   - Implement StreakRepository with calculation logic and updates
   - Add repository-specific business logic and validation

4. **Unit of Work Pattern**
   - Create UnitOfWork class managing DbContext and all repositories
   - Implement transaction management with SaveChanges coordination
   - Add rollback capabilities for failed operations
   - Create disposal pattern for proper resource management
   - Implement change tracking and audit field updates

5. **Dependency Injection Configuration**
   - Register repositories with appropriate lifetimes (Scoped)
   - Configure Unit of Work with DbContext dependency
   - Set up interface-to-implementation mappings
   - Add configuration for different environments (Development, Production)
   - Implement service validation and health checks

6. **Business Query Methods**
   - Add GetActiveTrackersByUserAsync to TrackerRepository
   - Implement GetHabitsByTrackerAsync with filtering to HabitRepository
   - Create GetCompletionsByDateRangeAsync to HabitCompletionRepository
   - Add CalculateStreakAsync methods to StreakRepository
   - Implement complex queries with proper optimization

7. **Error Handling and Logging**
   - Add structured logging to all repository operations
   - Implement proper exception handling with custom exceptions
   - Add correlation ID tracking for request tracing
   - Create error recovery patterns for transient failures
   - Implement retry logic for database connection issues

8. **Testing Implementation**
   - Create unit tests for repository interfaces and implementations
   - Implement integration tests with in-memory Entity Framework provider
   - Add performance tests for complex queries
   - Create test data builders for consistent test scenarios
   - Implement repository mock setups for service layer testing

## References
### Implementation Context References
- Repository pattern guidance: References/Gotchas/architecture_patterns.md
- Entity Framework best practices: References/Gotchas/dotnet_gotchas.md
- Database optimization: References/Gotchas/database_best_practices.md
- Testing patterns: References/Gotchas/testing_workflow_patterns.md

### Document References
- Clean architecture specification: '../design.md'
- Database schema requirements: '../requirements.md'
- .NET patterns and gotchas: '../References/Gotchas/dotnet_gotchas.md'

### External References
- **Repository Pattern**: https://learn.microsoft.com/en-us/aspnet/mvc/overview/older-versions/getting-started-with-ef-5-using-mvc-4/implementing-the-repository-and-unit-of-work-patterns-in-an-asp-net-mvc-application
  - Repository pattern implementation
  - Unit of Work pattern design
  - Dependency injection integration

- **Entity Framework Core Best Practices**: https://medium.com/@solomongetachew112/best-practices-for-using-entity-framework-core-in-asp-net-core-applications-with-net-8-9e4d796c02ac
  - Performance optimization
  - Query best practices
  - DbContext lifetime management

- **ASP.NET Core Testing**: https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests?view=aspnetcore-8.0
  - Integration testing patterns
  - In-memory database testing
  - Repository testing strategies

- **Clean Architecture**: https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
  - Dependency inversion principles
  - Interface segregation
  - Separation of concerns

## Build Commands
```bash
# Build solution
cd server && dotnet build

# Run unit tests
cd server && dotnet test --filter "Category=Unit"

# Run integration tests
cd server && dotnet test --filter "Category=Integration"

# Run all tests with coverage
cd server && dotnet test --collect:"XPlat Code Coverage"

# Run specific repository tests
cd server && dotnet test --filter "ClassName~RepositoryTests"

# Build and run API (for integration testing)
cd server && dotnet run --project HabitTracker.Api

# Check code analysis
cd server && dotnet build --verbosity normal
```

## Implementation Validation Strategy
### Repository Pattern Validation
- [ ] **Interface Segregation**: Repositories have focused, single-purpose interfaces
- [ ] **Dependency Inversion**: Application layer depends on abstractions, not implementations
- [ ] **Clean Architecture**: No dependencies from Application to Infrastructure
- [ ] **Generic Operations**: Common CRUD operations abstracted in base repository
- [ ] **Specific Operations**: Business-specific methods in dedicated repositories

### Unit of Work Validation
- [ ] **Transaction Management**: Multiple repository operations in single transaction
- [ ] **Change Tracking**: Entity changes tracked correctly across repositories
- [ ] **Rollback Capability**: Failed operations can be rolled back completely
- [ ] **Resource Management**: DbContext disposed properly after operations
- [ ] **Concurrency Handling**: Optimistic concurrency conflicts managed

### Code Quality Validation
- [ ] **Async Patterns**: All I/O operations use async/await properly
- [ ] **Exception Handling**: Proper exception handling with meaningful messages
- [ ] **Logging**: Structured logging for all repository operations
- [ ] **Performance**: Queries optimized with proper includes and filtering
- [ ] **Testability**: Repository methods easily testable with mocking

### Testing Validation
- [ ] **Unit Test Coverage**: All repository methods covered by unit tests
- [ ] **Integration Tests**: End-to-end database operations tested
- [ ] **Mock Implementation**: Repository interfaces can be mocked for service testing
- [ ] **Performance Tests**: Query performance validated with sample data
- [ ] **Error Scenarios**: Exception handling tested with invalid operations

### Business Logic Validation
- [ ] **Data Integrity**: Business rules enforced at repository level
- [ ] **Query Optimization**: Complex queries optimized for performance
- [ ] **Audit Fields**: CreatedAt/UpdatedAt fields updated automatically
- [ ] **Soft Deletes**: Logical deletion implemented where specified
- [ ] **Pagination**: Large result sets handled with proper pagination

## ToDo Tasks
### Phase 1: Interface Design (Day 1)
- [ ] Create IGenericRepository interface with common CRUD operations
- [ ] Design ITrackerRepository with user organization methods
- [ ] Implement IHabitRepository with tracker-specific operations
- [ ] Create IHabitCompletionRepository with date-based queries
- [ ] Design IStreakRepository with calculation and update methods
- [ ] Create IUnitOfWork interface for transaction management

### Phase 2: Generic Repository Implementation (Day 1)
- [ ] Implement GenericRepository base class with Entity Framework
- [ ] Add async CRUD operations with proper error handling
- [ ] Implement query optimization with Include methods
- [ ] Add expression-based query capabilities
- [ ] Create logging and exception handling infrastructure

### Phase 3: Specific Repository Implementation (Day 2)
- [ ] Implement TrackerRepository with user and sharing logic
- [ ] Create HabitRepository with tracker filtering and validation
- [ ] Build HabitCompletionRepository with date queries and aggregations
- [ ] Implement StreakRepository with calculation and update logic
- [ ] Add business-specific query methods to each repository

### Phase 4: Unit of Work and DI Setup (Day 2)
- [ ] Create UnitOfWork implementation with transaction management
- [ ] Configure dependency injection for all repositories
- [ ] Set up service registration with proper lifetimes
- [ ] Implement disposal pattern and resource management
- [ ] Add configuration validation and health checks

### Phase 5: Testing and Validation (Day 3)
- [ ] Create comprehensive unit tests for all repositories
- [ ] Implement integration tests with in-memory database
- [ ] Add performance tests for complex queries
- [ ] Create repository mock setups for service layer testing
- [ ] Validate repository pattern implementation against clean architecture
- [ ] Document repository interfaces and usage patterns
- [ ] Prepare for service layer implementation (next phase)

This task creates a robust, testable data access layer that follows clean architecture principles while providing excellent performance and maintainability for the habit tracking application.