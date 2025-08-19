# Habit Tracker Application - Comprehensive Design Document

## Project Overview
Build a comprehensive habit tracking web application that enables users to create multiple habit trackers, manage habits with customizable properties, track daily completions with one-tap functionality, and visualize progress through streaks and analytics. Transform the current empty project into a fully functional web application with modern UI/UX using React 19 with React Bits components for the frontend and .NET 8 Web API with Entity Framework Core for the backend, storing data in Azure SQL Database.

## Architecture Goals
- **High Testability**: Hexagonal architecture with ports and adapters for easy testing and mocking
- **Performance First**: Sub-200ms response times with optimized database queries and lazy loading
- **Maintainability**: Clean separation of concerns with SOLID principles
- **Scalability**: Support for 10,000+ habits per user with efficient data structures
- **User Experience**: Smooth animations and responsive design across all devices

## Technology Stack

### Frontend
- **Framework**: React 19 with TypeScript (strict mode)
- **UI Library**: React Bits (animated components)
- **Styling**: CSS Modules with dedicated styles folder structure
- **Build Tool**: Vite
- **State Management**: React Context API with useReducer
- **Testing**: React Testing Library + Vitest
- **Architecture**: Vertical Slice Architecture

### Backend
- **Framework**: ASP.NET Core Web API (.NET 8)
- **ORM**: Entity Framework Core 8
- **Database**: Azure SQL Database
- **Authentication**: Prepared for JWT/OAuth 2.0 (future)
- **Testing**: xUnit + Integration Tests
- **Architecture**: Layered Architecture with Clean Architecture principles

### Technology Stack Validation
The chosen stack provides:
- **React 19**: Latest features with concurrent rendering for better performance
- **React Bits**: Animated components for engaging user experience
- **.NET 8**: Latest LTS version with performance improvements
- **EF Core 8**: Advanced querying capabilities and performance optimizations
- **Azure SQL**: Scalable, managed database with excellent performance
- **TypeScript**: Type safety reducing runtime errors
- **CSS Modules**: Scoped styling preventing conflicts

## Style Guidelines

### Backend (.NET 8 Web API)

#### Project Structure (Layered Architecture)
```
server/
├── HabitTracker.Api/              # Presentation Layer
│   ├── Controllers/
│   ├── Middleware/
│   ├── Program.cs
│   └── appsettings.json
├── HabitTracker.Application/      # Application Layer
│   ├── Services/
│   ├── DTOs/
│   ├── Interfaces/
│   └── Validators/
├── HabitTracker.Domain/           # Domain Layer
│   ├── Entities/
│   ├── ValueObjects/
│   ├── Interfaces/
│   └── Exceptions/
├── HabitTracker.Infrastructure/   # Infrastructure Layer
│   ├── Data/
│   ├── Repositories/
│   └── Migrations/
└── HabitTracker.Tests/            # Test Projects
    ├── Unit/
    ├── Integration/
    └── TestHelpers/
```

#### Coding Patterns
- **Repository Pattern**: All data access through repositories
- **Unit of Work**: Transaction management and change tracking
- **DTOs**: Separate models for API contracts vs domain entities
- **Dependency Injection**: Constructor injection for all dependencies
- **Result Pattern**: Explicit error handling without exceptions for business logic

#### Async/Await Usage
- All I/O operations must be async
- Use `ConfigureAwait(false)` in library code
- Async controllers return `Task<ActionResult<T>>`

#### Error Handling Conventions
```csharp
// Global exception handler middleware
// Structured error responses with correlation IDs
// Domain exceptions for business rule violations
// Validation errors with detailed field-level feedback
```

#### Mapping/Conversion Rules
- Use AutoMapper for DTO ↔ Entity mapping
- Explicit mapping configurations
- Profile-based organization by feature

### Frontend (React 19 + TypeScript)

#### Project Structure (Vertical Slice Architecture)
```
app/
├── src/
│   ├── features/                      # Feature slices
│   │   ├── tracker-management/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   ├── habit-management/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   └── dashboard/
│   ├── shared/                        # Shared utilities
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   └── App.tsx
├── styles/                            # Centralized styles
│   ├── features/
│   │   ├── tracker-management/
│   │   ├── habit-management/
│   │   └── dashboard/
│   ├── shared/
│   │   ├── components/
│   │   └── layouts/
│   └── global/
│       ├── variables.css
│       ├── reset.css
│       └── themes.css
├── public/
├── package.json
├── vite.config.ts
└── tsconfig.json
```

#### Component Organization Structure
- **Feature-based slicing**: Each feature contains all its logic
- **Co-location**: Related components, hooks, and services together
- **Barrel exports**: Clean public interfaces via index.ts files
- **Lazy loading**: Route-level and component-level code splitting

#### TypeScript Settings
- Strict mode enabled (`"strict": true`)
- No implicit any (`"noImplicitAny": true`)
- Exact optional property types (`"exactOptionalPropertyTypes": true`)
- No unused locals/parameters in production builds

#### Styling Approach
- **CSS Modules**: Component-specific styles with `.module.css` extension
- **Styles folder**: All styles organized in dedicated `/styles` directory
- **Design tokens**: CSS custom properties for colors, spacing, typography
- **Theme support**: Light/dark mode via CSS custom properties

#### State Management Patterns
```typescript
// Context + useReducer for complex state
// useState for simple local state
// Custom hooks for state logic
// No external state management libraries initially
```

#### API Communication Standards
- Custom hooks for data fetching (`useQuery`, `useMutation`)
- Axios with interceptors for error handling
- TypeScript interfaces for API contracts
- Optimistic updates for better UX

### File and Function Size Limits
- **Source Files**: 500 lines maximum
- **Functions/Methods**: 50 lines maximum
- **React Components**: 200 lines maximum (including JSX)
- **Test Files**: 800 lines maximum
- **Line Length**: 100 characters maximum

### UI/UX Guidelines
- **Design System**: Consistent colors, typography, spacing from Figma
- **Responsive Design**: Mobile-first approach with breakpoints at 768px, 1024px
- **Animations**: React Bits components for micro-interactions
- **Loading States**: Skeleton screens and progressive loading
- **Error States**: User-friendly error messages with recovery actions
- **Accessibility**: WCAG 2.1 AA compliance with keyboard navigation

### Project Guidelines
- **No Inline Styles**: All styles in dedicated CSS files
- **TypeScript First**: Strict typing, no `any` types
- **Test Coverage**: Minimum 80% code coverage
- **Performance Budget**: Bundle size <300KB, FCP <2s
- **Git Conventions**: Conventional commits, feature branch workflow
- **Documentation**: JSDoc for public APIs, README for setup

### Testing

#### Unit Tests
- **Principles**: Arrange-Act-Assert pattern
- **Mocking**: Jest mocks for external dependencies
- **Coverage**: Focus on business logic and edge cases
- **Isolation**: Tests should not depend on each other

#### Integration Tests
- **Approach**: TestContainers for database tests
- **Environment**: In-memory database for fast execution
- **Scope**: API endpoints and database integration
- **Data**: Seed data for consistent test scenarios

#### Coverage Expectations
- **Minimum**: 80% line coverage
- **Business Logic**: 95% coverage
- **Happy Path**: 100% coverage
- **Error Handling**: 90% coverage

#### Test Patterns
- **AAA Pattern**: Arrange, Act, Assert
- **Given-When-Then**: For BDD-style tests
- **Test Data Builders**: For complex object creation
- **Page Object Model**: For integration tests

## Naming Conventions

### Backend (.NET)

#### Entities
- **Pattern**: PascalCase nouns (User, Habit, Tracker)
- **Collections**: Plural names (Users, Habits, Trackers)
- **Relationships**: Clear navigation property names (UserHabits, TrackerHabits)

#### Services
- **Pattern**: PascalCase with descriptive suffix
- **Examples**: UserService, HabitService, NotificationService
- **Interfaces**: IUserService, IHabitService

#### DTOs
- **Pattern**: EntityName + Purpose + Dto
- **Examples**: CreateUserDto, UpdateHabitDto, HabitResponseDto
- **Validation**: FluentValidation with descriptive error messages

#### Repositories
- **Pattern**: EntityName + Repository
- **Examples**: UserRepository, HabitRepository
- **Interfaces**: IUserRepository, IHabitRepository

#### Method Names
- **Pattern**: Verb + Object + Async suffix
- **Examples**: GetUserByIdAsync, CreateHabitAsync, UpdateTrackerAsync
- **Consistency**: Same verb patterns across all services

#### Class Names
- **Pattern**: Descriptive noun with single responsibility
- **Examples**: DatabaseContext, AuthenticationMiddleware, ValidationPipeline
- **Avoid**: Helper, Manager, Utility classes

#### Variable Names
- **Public**: PascalCase (UserId, EmailAddress)
- **Private**: _camelCase with underscore prefix (_userId, _dbContext)
- **Static**: PascalCase (ConnectionString, MaxRetryAttempts)
- **ReadOnly**: PascalCase (DefaultTimeout, ApiBaseUrl)
- **Const**: PascalCase (MaxUsernameLength, ApiVersion)

### Frontend (React + TypeScript)

#### Components
- **Pattern**: PascalCase functional components
- **Examples**: HabitCard, TrackerSelector, DashboardLayout
- **Files**: ComponentName.tsx with matching folder

#### Hooks
- **Pattern**: use + PascalCase
- **Examples**: useHabits, useTrackerData, useLocalStorage
- **Custom**: Always start with "use" prefix

#### Services
- **Pattern**: camelCase with descriptive names
- **Examples**: apiService, storageService, validationService
- **Export**: Named exports preferred over default

#### Types/Interfaces
- **Pattern**: PascalCase with descriptive names
- **Examples**: User, Habit, CreateHabitRequest
- **Props**: ComponentNameProps (HabitCardProps)

#### Method Names
- **Pattern**: camelCase verbs
- **Examples**: handleSubmit, validateForm, updateHabit
- **Event Handlers**: handle + EventType

#### Variable Names
- **Pattern**: camelCase descriptive names
- **Examples**: userId, habitData, isLoading
- **Boolean**: is/has/can prefixes (isVisible, hasError, canEdit)
- **Constants**: SCREAMING_SNAKE_CASE (API_BASE_URL, MAX_RETRIES)

## Technical Constraints and Requirements

### Security
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection**: Parameterized queries only, no dynamic SQL
- **XSS Prevention**: Content Security Policy headers
- **CORS**: Configured for specific origins only
- **Rate Limiting**: API endpoints protected from abuse
- **Data Encryption**: Sensitive data encrypted at rest and in transit
- **Authentication**: JWT tokens with expiration and refresh
- **Authorization**: Role-based access control (future implementation)

### Performance
- **Response Times**: API responses <500ms, habit completion <200ms
- **Database**: Proper indexing, query optimization, connection pooling
- **Caching**: In-memory caching for frequent queries
- **Bundle Size**: Initial load <300KB gzipped
- **Lazy Loading**: Route and component-level code splitting
- **Image Optimization**: WebP format with lazy loading
- **Memory Management**: Proper cleanup of event listeners and timers

### Data Integrity
- **Transactions**: ACID properties for related operations
- **Constraints**: Database-level constraints for data validity
- **Validation**: Multi-layer validation (client, API, database)
- **Backup**: Automated backups with point-in-time recovery
- **Migration**: Versioned database migrations
- **Referential Integrity**: Foreign key constraints enforced
- **Concurrency**: Optimistic concurrency control for updates

### Business Rules
- **Habit Limits**: Maximum 500 habits per tracker, 50 trackers per user
- **Completion Rules**: One completion record per habit per date
- **Streak Calculation**: Consecutive days based on habit frequency
- **Data Retention**: Historical data retained for 2 years
- **Soft Deletes**: Logical deletion to preserve audit trail
- **Timezone**: All dates stored in UTC, displayed in user timezone

## Development Workflow

### 1. Database-First Changes
- Create Entity Framework migration
- Update domain entities and configurations
- Run migration in development environment
- Update repository interfaces and implementations
- Write unit tests for data access layer

### 2. API-First Development
- Define API contracts with OpenAPI specification
- Implement controller endpoints with proper HTTP status codes
- Add request/response DTOs with validation
- Write integration tests for API endpoints
- Update API documentation

### 3. Frontend Implementation
- Create feature slice with all necessary components
- Implement UI components with React Bits animations
- Add TypeScript types and interfaces
- Write component tests with React Testing Library
- Integrate with backend API using custom hooks

### 4. Testing Strategy
- Unit tests for business logic (80% coverage minimum)
- Integration tests for API endpoints
- Component tests for React components
- End-to-end tests for critical user journeys
- Performance tests for database queries

### 5. Quality Assurance
- Code review with checklist validation
- Static analysis with ESLint/SonarQube
- Security scanning for vulnerabilities
- Performance testing with load tests
- Accessibility testing with axe-core

## Future Considerations

### Phase 1 Extensions (Post-MVP)
- **User Authentication**: JWT-based authentication with OAuth providers
- **Real-time Notifications**: SignalR for live updates
- **PWA Features**: Service worker for offline functionality
- **Advanced Analytics**: Charts and insights using Chart.js
- **Export Functionality**: PDF/CSV export of habit data

### Phase 2 Enhancements
- **Mobile App**: React Native application
- **Social Features**: Habit sharing and community challenges
- **Gamification**: Badges, levels, and achievement system
- **AI Insights**: Machine learning for habit recommendations
- **Integration**: Third-party app integrations (Google Fit, Apple Health)

## All Needed Context

### Documentation & References 

#### Design Specifications
- **Figma Design File**: https://c299290be3e64cf3b36350f85c9bb3ff-main.projects.builder.my/
  - Complete UI/UX specifications and component library
  - Primary reference for all visual implementations
  - Interactive prototypes showing user flows
  - Design tokens for colors, typography, spacing

#### Frontend Development
- **React Bits Documentation**: https://reactbits.dev/
  - Animated UI components library
  - Integration patterns with React 19
  - Component API and customization options

- **React 19 Features**: https://react.dev/blog/2024/04/25/react-19
  - New concurrent features and performance improvements
  - Server Components and streaming
  - Enhanced developer experience

- **Vite Configuration**: https://vitejs.dev/guide/
  - Build tool setup and optimization
  - Development server configuration
  - Bundle splitting strategies

- **TypeScript React Handbook**: https://www.typescriptlang.org/docs/handbook/react.html
  - Type definitions for React components
  - Props typing and event handling
  - Advanced TypeScript patterns

#### Backend Development
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

#### Database Design
- **Azure SQL Database**: https://learn.microsoft.com/en-us/azure/azure-sql/database/
  - Connection configuration
  - Performance tuning
  - Security best practices

- **EF Core SQL Server Provider**: https://learn.microsoft.com/en-us/ef/core/providers/sql-server/?tabs=dotnet-core-cli
  - Provider-specific features
  - Migration tools
  - Performance considerations

#### Architecture & Patterns
- **File Reference**: References/Gotchas/architecture_patterns.md
  - Layered architecture implementation
  - Clean Architecture principles
  - Common pitfalls and solutions

- **File Reference**: References/Gotchas/dotnet_gotchas.md
  - .NET-specific best practices
  - Common mistakes and fixes
  - Performance optimization tips

- **File Reference**: References/Gotchas/react_gotchas.md
  - React patterns and anti-patterns
  - Performance optimization
  - State management strategies

#### Best Practices
- **Web API Best Practices**: https://code-maze.com/aspnetcore-webapi-best-practices/
  - RESTful API design principles
  - Error handling patterns
  - Security implementation

- **EF Core Best Practices**: https://medium.com/@solomongetachew112/best-practices-for-using-entity-framework-core-in-asp-net-core-applications-with-net-8-9e4d796c02ac
  - Performance optimization
  - Query best practices
  - DbContext lifetime management

#### Testing Resources
- **ASP.NET Core Integration Tests**: https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests?view=aspnetcore-8.0
  - TestServer setup
  - Database testing strategies
  - Mocking external dependencies

- **React Testing Library**: https://testing-library.com/docs/react-testing-library/intro/
  - Component testing patterns
  - User interaction simulation
  - Accessibility testing

#### State Management
- **Zustand Documentation**: https://zustand-demo.pmnd.rs/
  - Lightweight state management
  - TypeScript integration
  - Performance considerations

#### Performance
- **Azure SQL Performance**: https://learn.microsoft.com/en-us/azure/azure-sql/database/performance-guidance?view=azuresql
  - Query optimization techniques
  - Index strategies
  - Monitoring and diagnostics

## Implementation Blueprint

### Phase 1: Foundation Setup (Week 1)
```typescript
// 1. Initialize projects with proper structure
// 2. Configure development environment
// 3. Set up database schema and migrations
// 4. Implement basic CRUD operations
// 5. Create foundational UI components
```

### Phase 2: Core Features (Weeks 2-3)
```typescript
// 1. Implement habit management features
// 2. Add completion tracking functionality
// 3. Create dashboard with basic statistics
// 4. Implement tracker switching
// 5. Add responsive design
```

### Phase 3: Advanced Features (Week 4)
```typescript
// 1. Implement streak calculations
// 2. Add progress visualization
// 3. Create calendar view
// 4. Add animations and micro-interactions
// 5. Implement error handling and edge cases
```

### Phase 4: Polish & Testing (Week 5)
```typescript
// 1. Complete test coverage
// 2. Performance optimization
// 3. Accessibility compliance
// 4. Security hardening
// 5. Documentation completion
```

## Validation Gates

### Architecture Validation
- [ ] **Vertical Slice Architecture**: Frontend features are self-contained with all necessary components, hooks, services, and types
- [ ] **Layered Architecture**: Backend follows clean separation between API, Application, Domain, and Infrastructure layers
- [ ] **Dependency Direction**: Dependencies point toward stable abstractions, no circular references
- [ ] **Single Responsibility**: Each component/service has one clear purpose
- [ ] **Interface Segregation**: Interfaces are focused on specific capabilities

### Code Quality Gates
- [ ] **TypeScript Strict Mode**: No any types, all interfaces properly defined
- [ ] **Linting**: ESLint passes with zero warnings
- [ ] **Testing**: Minimum 80% code coverage with meaningful tests
- [ ] **Performance**: Bundle size under 300KB, API responses under 500ms
- [ ] **Security**: No hardcoded secrets, input validation implemented

### Database Design Validation
- [ ] **Normalization**: Database schema follows 3NF principles
- [ ] **Indexes**: Proper indexing for query performance
- [ ] **Constraints**: Foreign keys and business rule constraints implemented
- [ ] **Migrations**: All schema changes properly versioned
- [ ] **Performance**: Query execution plans optimized

### UI/UX Validation
- [ ] **Responsive Design**: Works on mobile, tablet, and desktop
- [ ] **Accessibility**: WCAG 2.1 AA compliance
- [ ] **Performance**: Core Web Vitals meet standards
- [ ] **Design System**: Consistent with Figma specifications
- [ ] **Loading States**: Proper feedback for all async operations

### Integration Validation
- [ ] **API Contracts**: OpenAPI specification complete and accurate
- [ ] **Error Handling**: Proper error responses with correlation IDs
- [ ] **Data Flow**: End-to-end functionality working correctly
- [ ] **Cross-Browser**: Testing in Chrome, Firefox, Safari, Edge
- [ ] **Environment**: Configuration works across dev/staging/production

This comprehensive design document provides all necessary context for implementing a production-ready habit tracking application following modern architectural patterns and best practices.