# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Habit Tracker application with:
- **Frontend**: React 19 + TypeScript + Vite + React Router
- **Backend**: C# .NET 8 + ASP.NET Core Web API + Entity Framework Core
- **Database**: SQL Server (LocalDB for development)
- **Architecture**: Vertical slice frontend, Clean Architecture backend

## Development Commands

### Frontend (React/TypeScript) - app/

```bash
# Navigate to frontend directory
cd app

# Install dependencies
npm install

# Start development server (runs on http://localhost:5173)
npm run dev

# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build

# Linting and formatting
npm run lint           # Check ESLint rules
npm run lint:fix       # Fix auto-fixable issues
npm run format         # Format with Prettier
npm run format:check   # Check formatting without fixing
npm run type-check     # TypeScript type checking
```

### Backend (.NET/C#) - server/

```bash
# Navigate to server directory
cd server

# Build the solution
dotnet build

# Run the API (runs on http://localhost:5281 or https://localhost:7141)
dotnet run --project HabitTracker.Api

# Run tests
dotnet test

# Run tests with coverage
dotnet test --collect:"XPlat Code Coverage"

# Format code
dotnet format

# Database migrations
dotnet ef migrations add [MigrationName] --project HabitTracker.Infrastructure --startup-project HabitTracker.Api
dotnet ef database update --project HabitTracker.Infrastructure --startup-project HabitTracker.Api
```

## Project Structure

### Frontend Architecture (app/)
- **src/features/**: Feature modules using vertical slice architecture
  - Each feature has: components/, hooks/, services/, types/
  - Pages: dashboard/, habits/, settings/, home/, 404/
- **src/shared/**: Shared utilities and components
  - components/: Reusable UI components with tests
  - services/: API integration services (api.ts, authService.ts, etc.)
  - types/: TypeScript type definitions
  - utils/: Helper functions (cors.ts, env.ts, navigation.ts)
- **styles/**: Global styles and CSS modules
  - global/: Reset, themes, variables, grid system
  - features/: Feature-specific styles
  - shared/: Component styles

### Backend Architecture (server/)
- **HabitTracker.Api**: Web API layer with controllers and middleware
- **HabitTracker.Application**: Business logic, DTOs, interfaces, services
- **HabitTracker.Domain**: Domain entities and value objects
- **HabitTracker.Infrastructure**: Data access, EF Core, repositories
- **HabitTracker.Tests**: Unit and integration tests

## Key Patterns and Conventions

### Frontend
- Use CSS Modules for component styling (.module.css files)
- Import aliases: @/, @features/, @shared/, @styles/
- Functional components with TypeScript interfaces for props
- React Testing Library for component tests
- API integration through centralized services in shared/services/

### Backend
- Repository pattern with Unit of Work
- Clean Architecture principles
- Entity Framework Core with SQL Server
- Fluent API for entity configuration
- xUnit for testing with FluentAssertions

## API Integration

Frontend expects backend API at `http://localhost:5281/api` with:
- JWT authentication (future implementation)
- CORS configured for localhost:3000 and localhost:5173
- RESTful endpoints for trackers, habits, completions, streaks
- Swagger available at `/swagger` in development

## Database

LocalDB instance: `(localdb)\\mssqllocaldb`
Database name: `HabitTrackerDb`

Entities:
- Tracker: Container for habits
- Habit: Individual habits within trackers
- HabitCompletion: Tracking habit completions
- Streak: Streak calculations for habits

## Testing Strategy

### Frontend Testing
- Component tests with React Testing Library and Vitest
- Run `npm test` for watch mode during development
- Run `npm run test:run` for single test execution
- Run `npm run test:coverage` for coverage reports
- Run `npm run test:ui` for Vitest UI interface
- E2E tests with Cypress: `cypress/e2e/` directory

### Backend Testing
- Unit tests for controllers and services
- Integration tests with in-memory database
- Run `dotnet test` to execute all tests

## Environment Configuration

### Frontend Environment Variables

Copy `app/.env.example` to `app/.env.local` and configure:

**Required Variables:**
- `VITE_API_BASE_URL`: Backend API URL (default: `http://localhost:5281/api`)
- `VITE_API_TIMEOUT`: API request timeout in milliseconds (default: `10000`)

**Feature Flags:**
- `VITE_FEATURE_ANALYTICS`: Enable analytics tracking (default: `false`)
- `VITE_FEATURE_DEBUG`: Enable debug mode (default: `false`)
- `VITE_FEATURE_MOCK_API`: Use mock API instead of real backend (default: `false`)

**Application Settings:**
- `VITE_APP_NAME`: Application display name (default: `Habit Tracker`)
- `VITE_APP_VERSION`: Application version (default: `1.0.0`)
- `VITE_APP_ENVIRONMENT`: Current environment (default: `development`)

**UI Configuration:**
- `VITE_DEFAULT_THEME`: Default UI theme (`light` or `dark`)
- `VITE_ENABLE_ANIMATIONS`: Enable UI animations (default: `true`)
- `VITE_MAX_HABITS_PER_TRACKER`: Maximum habits per tracker (default: `500`)
- `VITE_MAX_TRACKERS_PER_USER`: Maximum trackers per user (default: `50`)

**Development Tools:**
- `VITE_REACT_DEVTOOLS`: Enable React DevTools (default: `true`)
- `VITE_LOG_LEVEL`: Logging level (`debug`, `info`, `warn`, `error`)

**Optional Third-party Services:**
- `VITE_SENTRY_DSN`: Sentry error tracking DSN
- `VITE_ANALYTICS_ID`: Analytics service ID

## Development Workflow

### Running Both Frontend and Backend
1. **Backend first**: `cd server && dotnet run --project HabitTracker.Api`
2. **Frontend second**: `cd app && npm run dev`
3. **Access**: Frontend at http://localhost:5173, Backend at http://localhost:5281

### Single Test Execution
- **Frontend specific test**: `cd app && npm run test:run -- --reporter=verbose [test-file-pattern]`
- **Backend specific test**: `cd server && dotnet test --filter "FullyQualifiedName~[TestClassName]"`
- **Single backend test method**: `cd server && dotnet test --filter "Method~[MethodName]"`

## Important Notes

- Frontend uses Vite for fast development and hot module replacement
- Backend uses Serilog for structured logging  
- CORS is pre-configured for local development (ports 3000 and 5173)
- Database migrations are managed through EF Core
- Authentication is planned but not yet implemented
- CSS Modules are configured with scoped naming: `[name]__[local]___[hash:base64:5]`
- Import aliases configured: @/, @features/, @shared/, @styles/
- Cypress E2E tests available for workflow testing
- React Testing Library with Vitest for unit/component testing
- FluentAssertions used for .NET test assertions