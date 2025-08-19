# Task 003: Database Schema Implementation with Entity Framework Core

## Requirement Reference
- User Story: TS-002

## Task Overview
Implement the complete database schema for the Habit Tracker application using Entity Framework Core 8 with Azure SQL Database. This task creates all database tables, relationships, indexes, constraints, and Entity Framework models following the requirements specification. Includes migration setup, seed data, and performance optimization through proper indexing.

## Dependent Tasks
- task_002_dotnet_project_setup.md (Backend infrastructure must be in place)

## Tasks
- Create Entity Framework Core domain entities for all tables
- Configure entity relationships and constraints using Fluent API
- Implement database migrations for schema creation
- Add proper indexes for query performance optimization
- Create seed data for development and testing
- Configure entity validation and business rules
- Set up database connection string management
- Implement audit fields (CreatedAt, UpdatedAt) across entities
- Configure cascade delete behaviors and foreign key constraints
- Validate database schema against requirements

## Current State
```
server\
├── HabitTracker.Api\
├── HabitTracker.Application\
├── HabitTracker.Domain\
├── HabitTracker.Infrastructure\
│   └── Data\
│       └── ApplicationDbContext.cs (basic setup)
├── HabitTracker.Tests\
└── HabitTracker.sln
```

## Future State
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
│   │       ├── TrackerConfiguration.cs
│   │       ├── HabitConfiguration.cs
│   │       ├── HabitCompletionConfiguration.cs
│   │       └── StreakConfiguration.cs
│   ├── Migrations\
│   │   ├── 20240101000000_InitialCreate.cs
│   │   └── 20240101000001_AddIndexes.cs
│   └── SeedData\
│       └── DatabaseSeeder.cs
├── HabitTracker.Tests\
└── HabitTracker.sln
```

## Development Workflow
1. Create domain entities in Domain layer
2. Configure entity relationships using Fluent API in Infrastructure
3. Update ApplicationDbContext with DbSets and configurations
4. Create and apply Entity Framework migrations
5. Add performance indexes based on query patterns
6. Implement seed data for development testing
7. Configure audit fields and business rule validations
8. Test database operations and constraint enforcement
9. Validate schema against requirements specification
10. Document database schema and relationships

## Data Workflow
- Entity Framework Core manages database operations with Azure SQL
- Domain entities represent business objects with proper encapsulation
- Fluent API configurations handle complex relationships and constraints
- Migrations provide versioned schema changes
- Seed data ensures consistent development environment
- Audit fields track entity creation and modification times
- Indexes optimize query performance for dashboard and analytics

## Impacted Components
### Backend (.NET 8 Web API)
- **New**: Domain entities (Tracker, Habit, HabitCompletion, Streak)
- **New**: Entity Framework configurations (Fluent API)
- **Updated**: ApplicationDbContext with DbSets and relationships
- **New**: Database migrations for schema creation
- **New**: Entity validation and business rule enforcement
- **New**: Database indexes for performance optimization
- **New**: Seed data for development environment
- **New**: Audit field implementation across entities

### Database (Azure SQL)
- **New**: Trackers table with user organization capability
- **New**: Habits table with customization properties
- **New**: HabitCompletions table for tracking daily progress
- **New**: Streaks table for materialized progress calculations
- **New**: Proper indexes for query performance
- **New**: Foreign key constraints and cascade behaviors
- **New**: Check constraints for business rule enforcement

## Implementation Plan
### Backend Implementation Plan
1. **Domain Entity Creation**
   - Create Tracker entity with name, description, and organizational properties
   - Implement Habit entity with frequency, color, icon, and metadata
   - Build HabitCompletion entity for date-specific completion tracking
   - Design Streak entity for materialized progress calculations
   - Add audit fields (CreatedAt, UpdatedAt) to all entities

2. **Entity Framework Configuration**
   - Configure Tracker entity with validation rules and relationships
   - Set up Habit entity with foreign key to Tracker and validation
   - Configure HabitCompletion with composite unique constraint (HabitId, Date)
   - Set up Streak entity with one-to-one relationship to Habit
   - Implement cascade delete behaviors and referential integrity

3. **Database Context Setup**
   - Add DbSets for all entities to ApplicationDbContext
   - Configure entity relationships using Fluent API
   - Set up database connection string management
   - Configure audit field automatic updates (SaveChanges override)
   - Implement query filters and global configurations

4. **Migration Implementation**
   - Create initial migration with all tables and relationships
   - Add migration for performance indexes
   - Configure proper data types and constraints
   - Set up default values and computed columns
   - Validate migration scripts for production deployment

5. **Index Optimization**
   - Add indexes for Tracker queries (UserId, IsActive)
   - Create indexes for Habit lookups (TrackerId, IsActive)
   - Optimize HabitCompletion queries (HabitId, CompletionDate)
   - Index Streak table for efficient progress retrieval
   - Create composite indexes for complex queries

6. **Seed Data Implementation**
   - Create sample trackers for development testing
   - Add sample habits with different frequencies and properties
   - Generate sample completion data for testing analytics
   - Calculate sample streak data for validation
   - Implement seed data execution in development environment

7. **Validation and Business Rules**
   - Implement entity validation using data annotations
   - Add custom validation for business rules (name uniqueness, date constraints)
   - Configure model validation in Entity Framework
   - Set up constraint checks at database level
   - Implement domain-specific validation logic

8. **Testing and Validation**
   - Create unit tests for entity configurations
   - Test database operations (CRUD) for all entities
   - Validate foreign key constraints and cascade behaviors
   - Test index performance with sample data
   - Verify seed data execution and consistency

## References
### Implementation Context References
- Database schema specification: Artefacts/requirements.md (lines 69-145)
- Entity relationship requirements: Artefacts/design.md (database design section)
- .NET Core patterns: References/Gotchas/dotnet_gotchas.md
- Database best practices: References/Gotchas/database_best_practices.md

### Document References
- Requirements with database schema: '../requirements.md'
- Design document with entity relationships: '../design.md'
- Architecture patterns: '../References/Gotchas/architecture_patterns.md'

### External References
- **Entity Framework Core 8**: https://learn.microsoft.com/en-us/ef/core/
  - Database context configuration
  - Migration strategies
  - Fluent API configuration

- **EF Core SQL Server Provider**: https://learn.microsoft.com/en-us/ef/core/providers/sql-server/?tabs=dotnet-core-cli
  - Provider-specific features
  - Migration tools
  - Performance considerations

- **Azure SQL Database**: https://learn.microsoft.com/en-us/azure/azure-sql/database/
  - Connection configuration
  - Performance tuning
  - Index optimization strategies

- **EF Core Best Practices**: https://medium.com/@solomongetachew112/best-practices-for-using-entity-framework-core-in-asp-net-core-applications-with-net-8-9e4d796c02ac
  - Performance optimization
  - Query best practices
  - DbContext lifetime management

- **Database Performance**: https://learn.microsoft.com/en-us/azure/azure-sql/database/performance-guidance?view=azuresql
  - Query optimization techniques
  - Index strategies
  - Monitoring and diagnostics

## Build Commands
```bash
# Create migration
cd server && dotnet ef migrations add InitialCreate --project HabitTracker.Infrastructure --startup-project HabitTracker.Api

# Update database
cd server && dotnet ef database update --project HabitTracker.Infrastructure --startup-project HabitTracker.Api

# Generate SQL script from migration
cd server && dotnet ef migrations script --project HabitTracker.Infrastructure --startup-project HabitTracker.Api

# Remove last migration (if needed)
cd server && dotnet ef migrations remove --project HabitTracker.Infrastructure --startup-project HabitTracker.Api

# Drop database (development only)
cd server && dotnet ef database drop --project HabitTracker.Infrastructure --startup-project HabitTracker.Api

# List migrations
cd server && dotnet ef migrations list --project HabitTracker.Infrastructure --startup-project HabitTracker.Api

# Build and test
cd server && dotnet build && dotnet test
```

## Implementation Validation Strategy
### Database Schema Validation
- [ ] **Table Creation**: All required tables created with correct columns
- [ ] **Relationships**: Foreign key relationships configured correctly
- [ ] **Constraints**: Check constraints and unique constraints enforced
- [ ] **Indexes**: Performance indexes created for optimized queries
- [ ] **Data Types**: Column data types match requirements specification

### Entity Framework Validation
- [ ] **Entity Mapping**: Domain entities map correctly to database tables
- [ ] **Relationships**: Navigation properties work bidirectionally
- [ ] **Cascade Behavior**: Delete cascades work as specified
- [ ] **Validation**: Entity validation rules enforce business constraints
- [ ] **Audit Fields**: CreatedAt and UpdatedAt fields update automatically

### Data Integrity Validation
- [ ] **Foreign Keys**: Referential integrity maintained across all relationships
- [ ] **Unique Constraints**: Duplicate prevention works (HabitId + Date)
- [ ] **Check Constraints**: Business rules enforced at database level
- [ ] **Default Values**: Default values set correctly for new records
- [ ] **Null Constraints**: Required fields properly enforce NOT NULL

### Performance Validation
- [ ] **Index Usage**: Queries use indexes effectively
- [ ] **Query Performance**: Common queries execute under 100ms
- [ ] **Connection Pooling**: Database connections managed efficiently
- [ ] **Migration Performance**: Migrations execute quickly
- [ ] **Seed Data**: Seed data loads without performance issues

### Business Rule Validation
- [ ] **Tracker Limits**: Maximum trackers per user enforced
- [ ] **Habit Limits**: Maximum habits per tracker enforced
- [ ] **Date Constraints**: Completion dates cannot be in future
- [ ] **Frequency Validation**: Target frequency values are valid
- [ ] **Streak Calculation**: Streak logic matches business requirements

## ToDo Tasks
### Phase 1: Entity Creation (Day 1)
- [X] Create Tracker domain entity with properties and validation
- [X] Implement Habit domain entity with relationships to Tracker
- [X] Build HabitCompletion entity with date and completion tracking
- [X] Design Streak entity for materialized progress calculations
- [X] Add audit fields (CreatedAt, UpdatedAt) to all entities

### Phase 2: Entity Framework Configuration (Day 1)
- [X] Configure Tracker entity with Fluent API (validation, relationships)
- [X] Set up Habit entity configuration with foreign keys and constraints
- [X] Configure HabitCompletion with composite unique constraint
- [X] Set up Streak entity with one-to-one relationship to Habit
- [X] Update ApplicationDbContext with all DbSets and configurations

### Phase 3: Migration and Schema (Day 2)
- [X] Create initial Entity Framework migration
- [X] Review and customize migration SQL for optimal schema
- [X] Apply migration to development database
- [X] Validate table creation and relationships in database
- [X] Create additional migration for performance indexes (integrated into initial migration)

### Phase 4: Optimization and Seed Data (Day 2)
- [X] Add performance indexes for common query patterns
- [X] Implement seed data for development environment
- [X] Test database operations (CRUD) for all entities
- [X] Validate foreign key constraints and cascade behaviors
- [X] Performance test with sample data load

### Phase 5: Validation and Documentation (Day 3)
- [X] Write unit tests for entity configurations
- [X] Test complex queries and relationships
- [X] Validate audit field automatic updates
- [X] Document database schema and entity relationships
- [X] Prepare for repository pattern implementation (next task)

This task creates a robust, performant database foundation that supports all habit tracking requirements while following Entity Framework Core best practices and ensuring data integrity through proper constraints and relationships.