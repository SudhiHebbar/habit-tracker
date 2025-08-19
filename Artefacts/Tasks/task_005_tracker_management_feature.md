# Task 005: Tracker Management Feature Implementation

## Requirement Reference
- User Story: CF-001

## Task Overview
Implement complete tracker management functionality allowing users to create, read, update, and delete habit trackers. This includes backend API endpoints with full CRUD operations, frontend React components with Figma-compliant UI, form validation, and seamless integration between frontend and backend. The feature serves as the foundation for organizing different types of habits into logical containers.

## Dependent Tasks
- task_001_react_project_setup.md (Frontend infrastructure required)
- task_002_dotnet_project_setup.md (Backend infrastructure required)
- task_003_database_schema_implementation.md (Database schema must exist)
- task_004_repository_pattern_implementation.md (Data access layer required)

## Tasks
- Create TrackerService in Application layer with business logic
- Implement Tracker API controller with RESTful endpoints
- Create Tracker DTOs for API requests and responses
- Build TrackerRepository business-specific methods
- Implement React tracker management components following Figma designs
- Create tracker creation modal with form validation
- Build tracker selector dropdown component
- Implement tracker editing and deletion functionality
- Add error handling and user feedback
- Create comprehensive unit and integration tests

## Current State
```
server\
├── HabitTracker.Api\
├── HabitTracker.Application\
│   └── Interfaces\ (repository interfaces)
├── HabitTracker.Domain\
│   └── Entities\ (Tracker entity exists)
├── HabitTracker.Infrastructure\
│   └── Repositories\ (TrackerRepository exists)
├── HabitTracker.Tests\
└── HabitTracker.sln

app\
├── src\
│   ├── features\ (empty structure)
│   ├── shared\ (empty structure)
│   └── App.tsx
├── styles\ (empty structure)
└── package.json
```

## Future State
```
server\
├── HabitTracker.Api\
│   └── Controllers\
│       └── TrackersController.cs
├── HabitTracker.Application\
│   ├── Services\
│   │   └── TrackerService.cs
│   ├── DTOs\
│   │   ├── CreateTrackerDto.cs
│   │   ├── UpdateTrackerDto.cs
│   │   └── TrackerResponseDto.cs
│   ├── Validators\
│   │   └── CreateTrackerValidator.cs
│   └── Interfaces\
│       └── ITrackerService.cs
├── HabitTracker.Infrastructure\ (existing)
├── HabitTracker.Tests\
│   ├── Unit\
│   │   ├── Services\
│   │   │   └── TrackerServiceTests.cs
│   │   └── Controllers\
│   │       └── TrackersControllerTests.cs
│   └── Integration\
│       └── TrackerApiTests.cs
└── HabitTracker.sln

app\
├── src\
│   ├── features\
│   │   └── tracker-management\
│   │       ├── components\
│   │       │   ├── TrackerSelector.tsx
│   │       │   ├── CreateTrackerModal.tsx
│   │       │   ├── EditTrackerModal.tsx
│   │       │   ├── TrackerCard.tsx
│   │       │   └── TrackerList.tsx
│   │       ├── hooks\
│   │       │   ├── useTrackers.ts
│   │       │   ├── useCreateTracker.ts
│   │       │   └── useDeleteTracker.ts
│   │       ├── services\
│   │       │   └── trackerApi.ts
│   │       ├── types\
│   │       │   └── tracker.types.ts
│   │       └── index.ts
│   └── shared\
│       └── components\
│           ├── Modal.tsx
│           ├── Button.tsx
│           └── LoadingSpinner.tsx
├── styles\
│   └── features\
│       └── tracker-management\
│           ├── TrackerSelector.module.css
│           ├── CreateTrackerModal.module.css
│           └── TrackerCard.module.css
└── package.json
```

## Development Workflow
1. Create backend service layer with business logic
2. Implement API controller with RESTful endpoints
3. Create DTOs and validation for API contracts
4. Build frontend service layer for API communication
5. Implement React components following Figma designs
6. Add form validation and error handling
7. Create custom hooks for state management
8. Implement integration between frontend and backend
9. Add comprehensive testing coverage
10. Validate against acceptance criteria

## Data Workflow
- Frontend components call tracker API service methods
- API service uses HTTP client to communicate with backend
- Backend controller validates requests and calls TrackerService
- TrackerService implements business logic and calls repository
- Repository performs database operations via Entity Framework
- Responses flow back through the same chain with proper error handling
- Frontend updates UI state based on API responses

## Impacted Components
### Backend (.NET 8 Web API)
- **New**: TrackerService with business logic implementation
- **New**: TrackersController with RESTful API endpoints
- **New**: Tracker DTOs for API contracts (Create, Update, Response)
- **New**: FluentValidation validators for request validation
- **Updated**: TrackerRepository with business-specific queries
- **New**: AutoMapper profiles for DTO mapping
- **New**: Unit and integration tests for tracker operations

### Frontend (React 19 + TypeScript)
- **New**: TrackerSelector dropdown component (Figma design)
- **New**: CreateTrackerModal with form validation
- **New**: EditTrackerModal for tracker updates
- **New**: TrackerCard component for tracker display
- **New**: TrackerList component for tracker management
- **New**: Custom hooks for tracker state management
- **New**: Tracker API service with HTTP operations
- **New**: TypeScript interfaces for tracker data

## Implementation Plan
### Backend Implementation Plan
1. **Service Layer Implementation**
   - Create ITrackerService interface in Application layer
   - Implement TrackerService with CRUD business logic
   - Add validation for tracker name uniqueness per user
   - Implement soft delete functionality for tracker deactivation
   - Add business rules for maximum tracker limits

2. **DTO and Validation Setup**
   - Create CreateTrackerDto with name and description
   - Implement UpdateTrackerDto with partial update support
   - Build TrackerResponseDto with full tracker information
   - Add FluentValidation validators for all DTOs
   - Configure AutoMapper profiles for entity-DTO mapping

3. **API Controller Implementation**
   - Create TrackersController with RESTful endpoints
   - Implement GET /api/trackers (list all user trackers)
   - Add POST /api/trackers (create new tracker)
   - Build PUT /api/trackers/{id} (update tracker)
   - Implement DELETE /api/trackers/{id} (soft delete tracker)
   - Add proper HTTP status codes and error responses

4. **Repository Enhancement**
   - Add GetActiveTrackersByUserAsync method
   - Implement GetTrackerByIdAndUserAsync for security
   - Create ValidateTrackerNameUniquenessAsync method
   - Add GetTrackerCountByUserAsync for limit validation
   - Implement SoftDeleteTrackerAsync method

5. **Error Handling and Logging**
   - Add structured logging to all tracker operations
   - Implement custom exceptions for business rule violations
   - Create error response DTOs with user-friendly messages
   - Add correlation ID tracking for request tracing
   - Implement global exception handling for tracker operations

### Frontend Implementation Plan
1. **API Service Layer**
   - Create trackerApi.ts with all HTTP operations
   - Implement type-safe API calls using TypeScript interfaces
   - Add error handling and retry logic for failed requests
   - Configure base URL and headers for API communication
   - Implement request/response interceptors for common handling

2. **React Components Implementation**
   - Build TrackerSelector dropdown following Figma specifications
   - Create CreateTrackerModal with React Bits animations
   - Implement EditTrackerModal with pre-populated form data
   - Build TrackerCard component with action buttons
   - Create TrackerList with grid/list view toggle

3. **Custom Hooks Development**
   - Implement useTrackers hook for fetching and caching
   - Create useCreateTracker hook with optimistic updates
   - Build useUpdateTracker hook with validation
   - Implement useDeleteTracker hook with confirmation
   - Add useTrackerValidation hook for form validation

4. **State Management**
   - Use React Context for global tracker state
   - Implement useReducer for complex tracker operations
   - Add optimistic updates for better user experience
   - Create error state management for API failures
   - Implement loading states for all async operations

5. **UI/UX Implementation**
   - Follow Figma designs exactly for all components
   - Implement responsive design for mobile and desktop
   - Add React Bits animations for smooth interactions
   - Create loading skeletons for better perceived performance
   - Implement proper error states with recovery actions

## References
### Implementation Context References
- Figma design specifications: https://c299290be3e64cf3b36350f85c9bb3ff-main.projects.builder.my/
- Clean architecture patterns: References/Gotchas/architecture_patterns.md
- React component patterns: References/Gotchas/react_gotchas.md
- API design best practices: References/Gotchas/dotnet_gotchas.md

### Document References
- Requirements specification: '../requirements.md' (CF-001 acceptance criteria)
- Design document: '../design.md' (tracker management section)
- Database schema: '../requirements.md' (lines 72-86)

### External References
- **ASP.NET Core Web API**: https://learn.microsoft.com/en-us/aspnet/core/web-api/?view=aspnetcore-8.0
  - RESTful API design principles
  - Controller implementation patterns
  - Error handling best practices

- **React Bits Documentation**: https://reactbits.dev/
  - Modal component animations
  - Form component interactions
  - Button component variants

- **FluentValidation**: https://docs.fluentvalidation.net/en/latest/
  - Validation rule implementation
  - Custom validation logic
  - Error message customization

- **AutoMapper**: https://automapper.org/
  - Entity to DTO mapping
  - Configuration best practices
  - Performance optimization

## Build Commands
```bash
# Backend development
cd server && dotnet build
cd server && dotnet run --project HabitTracker.Api
cd server && dotnet test --filter "Tracker"

# Frontend development  
cd app && npm run dev
cd app && npm run build
cd app && npm run test -- tracker

# Integration testing
cd server && dotnet test --filter "Integration"
cd app && npm run test:integration

# Code quality
cd server && dotnet format
cd app && npm run lint
cd app && npm run type-check
```

## Implementation Validation Strategy
### API Validation
- [ ] **CRUD Operations**: All tracker CRUD operations work correctly
- [ ] **Validation**: Request validation prevents invalid data
- [ ] **Error Handling**: Proper error responses for all failure scenarios
- [ ] **Security**: User can only access their own trackers
- [ ] **Performance**: API responses under 200ms for tracker operations

### Frontend Validation
- [ ] **Figma Compliance**: UI components match Figma designs exactly
- [ ] **Responsiveness**: Components work on mobile, tablet, and desktop
- [ ] **Animations**: React Bits animations enhance user experience
- [ ] **Error States**: Proper error handling with user-friendly messages
- [ ] **Loading States**: Loading indicators for all async operations

### Integration Validation
- [ ] **End-to-End**: Complete tracker workflow from creation to deletion
- [ ] **State Management**: UI state stays consistent with backend data
- [ ] **Optimistic Updates**: UI updates immediately with proper rollback
- [ ] **Form Validation**: Client and server validation work together
- [ ] **Error Recovery**: Users can recover from errors gracefully

### Business Logic Validation
- [ ] **Name Uniqueness**: Tracker names are unique per user
- [ ] **Soft Delete**: Deleted trackers are hidden but data preserved
- [ ] **Tracker Limits**: Maximum tracker per user limit enforced
- [ ] **Data Integrity**: Tracker operations maintain data consistency
- [ ] **Audit Trail**: Created/updated timestamps tracked correctly

## ToDo Tasks
### Phase 1: Backend Foundation (Day 1)
- [ ] Create TrackerService interface and implementation
- [ ] Build Tracker DTOs (Create, Update, Response)
- [ ] Implement FluentValidation validators for all DTOs
- [ ] Configure AutoMapper profiles for entity-DTO mapping
- [ ] Add business logic for tracker name uniqueness validation

### Phase 2: API Implementation (Day 1)
- [ ] Create TrackersController with RESTful endpoints
- [ ] Implement GET /api/trackers endpoint with user filtering
- [ ] Build POST /api/trackers endpoint with validation
- [ ] Create PUT /api/trackers/{id} endpoint for updates
- [ ] Implement DELETE /api/trackers/{id} with soft delete
- [ ] Add proper HTTP status codes and error responses

### Phase 3: Frontend Service Layer (Day 2)
- [ ] Create trackerApi.ts with TypeScript interfaces
- [ ] Implement all HTTP operations (GET, POST, PUT, DELETE)
- [ ] Add error handling and retry logic
- [ ] Configure API base URL and headers
- [ ] Create TypeScript types for all tracker data structures

### Phase 4: React Components (Day 2-3)
- [ ] Build TrackerSelector dropdown component per Figma
- [ ] Create CreateTrackerModal with React Bits animations
- [ ] Implement EditTrackerModal with form pre-population
- [ ] Build TrackerCard component with action buttons
- [ ] Create TrackerList with responsive grid layout

### Phase 5: State Management and Hooks (Day 3)
- [ ] Implement useTrackers hook for data fetching
- [ ] Create useCreateTracker with optimistic updates
- [ ] Build useUpdateTracker and useDeleteTracker hooks
- [ ] Add form validation hooks with real-time feedback
- [ ] Implement error and loading state management

### Phase 6: Testing and Validation (Day 4)
- [ ] Write unit tests for TrackerService business logic
- [ ] Create API integration tests for all endpoints
- [ ] Implement React component tests with React Testing Library
- [ ] Add end-to-end tests for complete tracker workflows
- [ ] Validate Figma design compliance and responsiveness
- [ ] Performance test API endpoints and frontend components

This task creates a complete, production-ready tracker management feature that serves as the foundation for the entire habit tracking application while following clean architecture principles and modern development practices.