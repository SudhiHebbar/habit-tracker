# Task 002: .NET 8 Web API Project Setup with Layered Architecture

## Requirement Reference
- User Story: TS-001 (Part 2 - Backend)

## Task Overview
Set up the .NET 8 Web API backend project with layered architecture, Entity Framework Core 8, Azure SQL Database connection, and comprehensive development tooling. This task establishes the backend foundation with proper separation of concerns, dependency injection, configuration management, and testing infrastructure following clean architecture principles.

## Dependent Tasks
- None (This is a foundational task, can run parallel with task_001)

## Tasks
- Create .NET 8 Web API project with proper layered architecture
- Set up Entity Framework Core 8 with Azure SQL Database provider
- Implement dependency injection container configuration
- Configure CORS for React frontend communication
- Set up comprehensive logging and configuration management
- Implement global exception handling middleware
- Configure development and production environments
- Set up testing infrastructure with xUnit and integration tests
- Implement OpenAPI/Swagger documentation
- Configure database connection and connection string management

## Current State
```
D:\Project\18_HabitTracker\
├── Artefacts\
│   ├── design.md
│   ├── requirements.md
│   └── Tasks\
├── References\
│   ├── Build\
│   ├── Gotchas\
│   └── UX\
├── Templates\
└── specifications.md
```

## Future State
```
D:\Project\18_HabitTracker\
├── app\                                    # React Frontend (task_001)
├── server\                                 # .NET Backend
│   ├── HabitTracker.Api\                   # Presentation Layer
│   │   ├── Controllers\
│   │   ├── Middleware\
│   │   ├── Extensions\
│   │   ├── Program.cs
│   │   ├── appsettings.json
│   │   ├── appsettings.Development.json
│   │   └── HabitTracker.Api.csproj
│   ├── HabitTracker.Application\           # Application Layer
│   │   ├── Services\
│   │   ├── DTOs\
│   │   ├── Interfaces\
│   │   ├── Validators\
│   │   ├── Mappings\
│   │   └── HabitTracker.Application.csproj
│   ├── HabitTracker.Domain\                # Domain Layer
│   │   ├── Entities\
│   │   ├── ValueObjects\
│   │   ├── Interfaces\
│   │   ├── Exceptions\
│   │   └── HabitTracker.Domain.csproj
│   ├── HabitTracker.Infrastructure\        # Infrastructure Layer
│   │   ├── Data\
│   │   ├── Repositories\
│   │   ├── Configurations\
│   │   └── HabitTracker.Infrastructure.csproj
│   ├── HabitTracker.Tests\                 # Test Projects
│   │   ├── Unit\
│   │   ├── Integration\
│   │   ├── TestHelpers\
│   │   └── HabitTracker.Tests.csproj
│   └── HabitTracker.sln                    # Solution file
├── Artefacts\
├── References\
└── Templates\
```

## Development Workflow
1. Create solution and project structure using .NET CLI
2. Set up layered architecture with proper dependencies
3. Configure Entity Framework Core with Azure SQL provider
4. Implement dependency injection and service registration
5. Set up CORS for frontend communication
6. Configure logging, configuration, and middleware pipeline
7. Implement global exception handling
8. Set up testing infrastructure
9. Configure OpenAPI documentation
10. Validate build and testing processes

## Data Workflow
- API endpoints will serve React frontend via HTTP/HTTPS
- Entity Framework Core for database operations with Azure SQL
- Repository pattern for data access abstraction
- Unit of Work pattern for transaction management
- DTOs for API data contracts separate from domain entities
- Async/await patterns for all I/O operations

## Impacted Components
### Backend (.NET 8 Web API)
- **New**: Complete .NET solution with layered architecture
- **New**: Entity Framework Core 8 configuration
- **New**: Azure SQL Database connection setup
- **New**: Dependency injection container configuration
- **New**: CORS middleware for React communication
- **New**: Global exception handling middleware
- **New**: Logging and configuration infrastructure
- **New**: Testing framework with xUnit
- **New**: OpenAPI/Swagger documentation
- **New**: Environment-based configuration management

## Implementation Plan
### Backend Implementation Plan
1. **Solution Structure Creation**
   - Create solution: `dotnet new sln -n HabitTracker`
   - Create API project: `dotnet new webapi -n HabitTracker.Api`
   - Create class libraries for each layer (Application, Domain, Infrastructure)
   - Add projects to solution and configure project references

2. **Layered Architecture Setup**
   - Configure project dependencies following clean architecture
   - Set up proper assembly references (Domain → Application → Infrastructure → API)
   - Create folder structures for each layer
   - Implement separation of concerns

3. **Entity Framework Core Configuration**
   - Install EF Core packages and Azure SQL provider
   - Create DbContext with proper configuration
   - Set up connection string management with user secrets
   - Configure EF Core services in dependency injection

4. **Dependency Injection Setup**
   - Configure service container in Program.cs
   - Register application services with proper lifetimes
   - Set up repository pattern registrations
   - Implement service extensions for clean startup

5. **Middleware Pipeline Configuration**
   - Set up CORS middleware for React frontend
   - Implement global exception handling middleware
   - Configure request/response logging
   - Set up health checks and monitoring

6. **Configuration Management**
   - Set up appsettings.json for different environments
   - Configure user secrets for development
   - Implement strongly-typed configuration classes
   - Set up environment variable support

7. **API Documentation Setup**
   - Configure Swagger/OpenAPI generation
   - Set up API versioning foundation
   - Configure XML documentation generation
   - Implement API response conventions

8. **Testing Infrastructure**
   - Create test project with xUnit
   - Set up integration testing with WebApplicationFactory
   - Configure test database setup (in-memory)
   - Create test utilities and helpers

9. **Logging and Monitoring**
   - Configure structured logging with Serilog
   - Set up correlation ID tracking
   - Implement performance monitoring
   - Configure health checks

## References
### Implementation Context References
- Design specifications: Artefacts/design.md (sections 40-100)
- Layered architecture patterns: References/Gotchas/architecture_patterns.md
- .NET-specific gotchas: References/Gotchas/dotnet_gotchas.md
- Database best practices: References/Gotchas/database_best_practices.md

### Document References
- Main design document: '../design.md'
- Requirements document: '../requirements.md'
- .NET configuration reference: '../References/Build/dotnet_config.yaml'

### External References
- **ASP.NET Core Web API (.NET 8)**: https://learn.microsoft.com/en-us/aspnet/core/web-api/?view=aspnetcore-8.0
  - Controller setup and routing
  - Dependency injection patterns
  - Middleware pipeline configuration

- **Entity Framework Core 8**: https://learn.microsoft.com/en-us/ef/core/
  - Database context configuration
  - Migration strategies
  - Performance optimization techniques

- **Web API Tutorial**: https://learn.microsoft.com/en-us/aspnet/core/tutorials/first-web-api?view=aspnetcore-8.0
  - Step-by-step API creation
  - CRUD operation implementation
  - Testing strategies

- **Azure SQL Database**: https://learn.microsoft.com/en-us/azure/azure-sql/database/
  - Connection configuration
  - Performance tuning
  - Security best practices

- **Web API Best Practices**: https://code-maze.com/aspnetcore-webapi-best-practices/
  - RESTful API design principles
  - Error handling patterns
  - Security implementation

- **EF Core Best Practices**: https://medium.com/@solomongetachew112/best-practices-for-using-entity-framework-core-in-asp-net-core-applications-with-net-8-9e4d796c02ac
  - Performance optimization
  - Query best practices
  - DbContext lifetime management

## Build Commands
```bash
# Build entire solution
cd server && dotnet build

# Run API project
cd server && dotnet run --project HabitTracker.Api

# Run tests
cd server && dotnet test

# Run tests with coverage
cd server && dotnet test --collect:"XPlat Code Coverage"

# Restore packages
cd server && dotnet restore

# Create migration (after DB setup)
cd server && dotnet ef migrations add InitialCreate --project HabitTracker.Infrastructure --startup-project HabitTracker.Api

# Update database (after migration)
cd server && dotnet ef database update --project HabitTracker.Infrastructure --startup-project HabitTracker.Api

# Format code
cd server && dotnet format

# Watch run for development
cd server && dotnet watch run --project HabitTracker.Api
```

## Implementation Validation Strategy
### Architecture Validation
- [ ] **Layered Architecture**: Clean separation between API, Application, Domain, and Infrastructure
- [ ] **Dependency Direction**: Dependencies flow toward stable abstractions
- [ ] **Single Responsibility**: Each layer has distinct, focused responsibility
- [ ] **Interface Segregation**: Interfaces are focused on specific capabilities
- [ ] **No Circular Dependencies**: Project references follow clean architecture rules

### Code Quality Gates
- [ ] **Build Success**: Solution builds without errors or warnings
- [ ] **Test Coverage**: Unit tests run successfully with setup validation
- [ ] **Code Analysis**: Static code analysis passes (.NET analyzers)
- [ ] **Security**: No hardcoded secrets or connection strings in code
- [ ] **Performance**: Startup time under 5 seconds in development

### Database Integration
- [ ] **Connection Setup**: EF Core connects to database successfully
- [ ] **Context Configuration**: DbContext configured with proper options
- [ ] **Migration Ready**: EF migration tools work correctly
- [ ] **Connection Pooling**: Database connection pooling configured
- [ ] **Error Handling**: Database connection failures handled gracefully

### API Foundation
- [ ] **CORS Configuration**: React frontend can communicate with API
- [ ] **Swagger Documentation**: API documentation generates correctly
- [ ] **Health Checks**: API health endpoints respond correctly
- [ ] **Error Handling**: Global exception handling works properly
- [ ] **Request Logging**: HTTP requests are logged appropriately

### Development Experience
- [ ] **Hot Reload**: Changes reflect quickly during development
- [ ] **Debugging**: Breakpoints and debugging work correctly
- [ ] **Configuration**: Environment-based configuration loads properly
- [ ] **Logging**: Structured logging outputs to console and files
- [ ] **Testing**: Integration tests can be executed successfully

## ToDo Tasks
### Phase 1: Core Structure (Day 1) ✅ COMPLETED
- [X] Create .NET solution and project structure
- [X] Set up layered architecture with proper dependencies
- [X] Configure project references and assembly relationships
- [X] Install Entity Framework Core packages
- [X] Set up basic dependency injection container

### Phase 2: Infrastructure Setup (Day 1) ✅ COMPLETED
- [X] Configure Entity Framework Core with Azure SQL provider
- [X] Set up connection string management with user secrets
- [X] Configure appsettings.json for different environments
- [X] Implement basic DbContext configuration
- [X] Set up health checks for database connectivity

### Phase 3: API Foundation (Day 2) ✅ COMPLETED
- [X] Configure CORS middleware for React frontend communication
- [X] Implement global exception handling middleware
- [X] Set up structured logging with Serilog
- [X] Configure Swagger/OpenAPI documentation
- [X] Create basic API controller template

### Phase 4: Testing Infrastructure (Day 2) ✅ COMPLETED
- [X] Create test project with xUnit framework
- [X] Set up integration testing with WebApplicationFactory
- [X] Configure in-memory database for testing
- [X] Create test utilities and helper methods
- [X] Write basic API integration tests

### Phase 5: Validation & Documentation (Day 3) ✅ COMPLETED
- [X] Test build process for all environments
- [X] Validate CORS communication with frontend
- [X] Test database connection and migration tools
- [X] Document API setup and development workflow
- [X] Prepare for database schema implementation (task_003)

## Implementation Summary

**✅ TASK COMPLETED SUCCESSFULLY**

All required components have been implemented and validated:

### 🏗️ Architecture Implemented
- **Clean Architecture**: Proper layered separation with Domain, Application, Infrastructure, and Presentation layers
- **Dependency Injection**: Fully configured DI container with service registrations
- **CORS**: Configured for React frontend communication (ports 3000, 5173)
- **Global Exception Handling**: Custom middleware with correlation IDs and structured error responses

### 🔧 Technology Stack
- **.NET 8 Web API**: Latest LTS version with minimal APIs and controllers
- **Entity Framework Core 8.0.8**: With Azure SQL Server provider
- **Serilog**: Structured logging with console output and configurable levels
- **Swagger/OpenAPI**: Comprehensive API documentation with UI
- **Health Checks**: Database connectivity monitoring

### 🧪 Testing Infrastructure
- **xUnit**: Modern testing framework with parallel execution
- **Integration Tests**: WebApplicationFactory with in-memory database
- **Unit Tests**: Controller testing with NSubstitute mocking
- **FluentAssertions**: Readable test assertions
- **Test Coverage**: 9 tests passing (5 unit, 4 integration)

### 📊 Validation Results
```bash
Build Status: ✅ SUCCESS (0 warnings, 0 errors)
Test Status:  ✅ ALL PASSING (9/9 tests)
API Status:   ✅ RUNNING (http://localhost:5281)
Health Check: ✅ RESPONSIVE
Swagger UI:   ✅ AVAILABLE (/swagger)
```

### 🚀 Ready for Next Phase
The foundation is now ready for **task_003** (Database Schema Implementation) with:
- Proper DbContext configuration for entity mapping
- Migration tools configured and tested
- Connection string management in place
- Test infrastructure ready for domain entities

### 🛠️ Development Commands
```bash
# Build solution
cd server && dotnet build

# Run API
cd server && dotnet run --project HabitTracker.Api

# Run tests
cd server && dotnet test

# API endpoints
http://localhost:5281/api/health
http://localhost:5281/health
http://localhost:5281/swagger
```

This task establishes a production-ready .NET Web API backend foundation that follows clean architecture principles and modern development practices while providing excellent developer experience and maintainability.