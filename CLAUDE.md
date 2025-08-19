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

# Build for production
npm run build

# Linting and formatting
npm run lint           # Check ESLint rules
npm run lint:fix       # Fix auto-fixable issues
npm run format         # Format with Prettier
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
- Component tests with React Testing Library
- Run `npm test` for watch mode during development
- Use `npm run test:coverage` for coverage reports

### Backend Testing
- Unit tests for controllers and services
- Integration tests with in-memory database
- Run `dotnet test` to execute all tests

## Important Notes

- Frontend uses Vite for fast development and hot module replacement
- Backend uses Serilog for structured logging
- CORS is pre-configured for local development
- Database migrations are managed through EF Core
- Authentication is planned but not yet implemented
- React Bits components are available for UI development