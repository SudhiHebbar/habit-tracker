# Task 006: Habit Management Feature Implementation

## Requirement Reference
- User Story: CF-002

## Task Overview
Implement comprehensive habit management functionality allowing users to create, edit, and customize habits within their trackers. This includes backend API endpoints for habit CRUD operations, frontend React components with Figma-compliant UI, color and icon customization, frequency selection, and complete integration between frontend and backend. The feature enables users to define the behaviors they want to track with full customization options.

## Dependent Tasks
- task_001_react_project_setup.md (Frontend infrastructure required)
- task_002_dotnet_project_setup.md (Backend infrastructure required)
- task_003_database_schema_implementation.md (Database schema must exist)
- task_004_repository_pattern_implementation.md (Data access layer required)
- task_005_tracker_management_feature.md (Tracker management foundation required)

## Tasks
- Create HabitService in Application layer with business logic
- Implement Habits API controller with RESTful endpoints
- Create Habit DTOs for API requests and responses with validation
- Build HabitRepository enhanced methods for tracker-specific operations
- Implement React habit management components following Figma designs
- Create habit creation modal with step-by-step wizard
- Build color picker and icon selector components
- Implement frequency selection with custom options
- Add habit editing and deletion functionality
- Create comprehensive validation and error handling
- Implement unit and integration tests for all components

## Current State
```
server\
├── HabitTracker.Api\
│   └── Controllers\
│       └── TrackersController.cs
├── HabitTracker.Application\
│   ├── Services\
│   │   └── TrackerService.cs
│   └── DTOs\ (Tracker DTOs exist)
├── HabitTracker.Infrastructure\
│   └── Repositories\ (All repositories exist)
└── HabitTracker.Tests\

app\
├── src\
│   ├── features\
│   │   └── tracker-management\ (complete)
│   └── shared\
│       └── components\ (basic components)
└── styles\ (tracker management styles)
```

## Future State
```
server\
├── HabitTracker.Api\
│   └── Controllers\
│       ├── TrackersController.cs
│       └── HabitsController.cs
├── HabitTracker.Application\
│   ├── Services\
│   │   ├── TrackerService.cs
│   │   └── HabitService.cs
│   ├── DTOs\
│   │   ├── CreateHabitDto.cs
│   │   ├── UpdateHabitDto.cs
│   │   └── HabitResponseDto.cs
│   ├── Validators\
│   │   ├── CreateHabitValidator.cs
│   │   └── UpdateHabitValidator.cs
│   └── Interfaces\
│       └── IHabitService.cs
├── HabitTracker.Tests\
│   ├── Unit\
│   │   ├── Services\
│   │   │   └── HabitServiceTests.cs
│   │   └── Controllers\
│   │       └── HabitsControllerTests.cs
│   └── Integration\
│       └── HabitApiTests.cs

app\
├── src\
│   ├── features\
│   │   ├── tracker-management\ (existing)
│   │   └── habit-management\
│   │       ├── components\
│   │       │   ├── HabitList.tsx
│   │       │   ├── HabitCard.tsx
│   │       │   ├── CreateHabitModal.tsx
│   │       │   ├── EditHabitModal.tsx
│   │       │   ├── ColorPicker.tsx
│   │       │   ├── IconSelector.tsx
│   │       │   ├── FrequencySelector.tsx
│   │       │   └── HabitFormWizard.tsx
│   │       ├── hooks\
│   │       │   ├── useHabits.ts
│   │       │   ├── useCreateHabit.ts
│   │       │   ├── useUpdateHabit.ts
│   │       │   └── useHabitValidation.ts
│   │       ├── services\
│   │       │   └── habitApi.ts
│   │       ├── types\
│   │       │   └── habit.types.ts
│   │       └── index.ts
│   └── shared\
│       └── components\
│           ├── ColorPalette.tsx
│           ├── IconLibrary.tsx
│           └── FormSteps.tsx
├── styles\
│   └── features\
│       └── habit-management\
│           ├── HabitList.module.css
│           ├── HabitCard.module.css
│           ├── CreateHabitModal.module.css
│           ├── ColorPicker.module.css
│           └── IconSelector.module.css
```

## Development Workflow
1. Create backend service layer with habit business logic
2. Implement API controller with RESTful habit endpoints
3. Create DTOs and validation for habit operations
4. Build enhanced repository methods for habit queries
5. Implement React components following Figma wizard design
6. Create color picker component with design system colors
7. Build icon selector with comprehensive icon library
8. Implement frequency selector with custom options
9. Add form validation and error handling throughout
10. Create comprehensive testing coverage for all functionality

## Data Workflow
- Frontend habit components call habit API service methods
- API service communicates with backend using HTTP client
- Backend controller validates requests and calls HabitService
- HabitService implements business logic and validates against tracker ownership
- HabitRepository performs database operations with tracker filtering
- Color and icon selections stored as hex codes and icon identifiers
- Frequency options stored as predefined enum values with target counts
- Responses flow back with proper error handling and validation feedback

## Impacted Components
### Backend (.NET 8 Web API)
- **New**: HabitService with comprehensive business logic
- **New**: HabitsController with RESTful API endpoints
- **New**: Habit DTOs (Create, Update, Response) with validation
- **New**: FluentValidation validators for habit operations
- **Updated**: HabitRepository with tracker-specific filtering
- **New**: Habit business rules (name uniqueness per tracker, limits)
- **New**: AutoMapper profiles for habit entity-DTO mapping
- **New**: Unit and integration tests for habit operations

### Frontend (React 19 + TypeScript)
- **New**: HabitList component with grid/list view toggle
- **New**: HabitCard component following Figma design
- **New**: CreateHabitModal with step-by-step wizard
- **New**: EditHabitModal with pre-populated form
- **New**: ColorPicker component with design system palette
- **New**: IconSelector component with searchable icon library
- **New**: FrequencySelector with daily/weekly/custom options
- **New**: Custom hooks for habit state management
- **New**: Habit API service with full CRUD operations
- **New**: TypeScript interfaces for habit data structures

## Implementation Plan
### Backend Implementation Plan
1. **Service Layer Implementation**
   - Create IHabitService interface in Application layer
   - Implement HabitService with CRUD and business logic
   - Add validation for habit name uniqueness within tracker
   - Implement business rules for maximum habits per tracker
   - Add validation for color hex codes and icon identifiers

2. **DTO and Validation Setup**
   - Create CreateHabitDto with all customization properties
   - Implement UpdateHabitDto with partial update support
   - Build HabitResponseDto with complete habit information
   - Add FluentValidation for name, color, frequency validation
   - Configure AutoMapper profiles for habit entity-DTO mapping

3. **API Controller Implementation**
   - Create HabitsController with RESTful endpoints
   - Implement GET /api/trackers/{trackerId}/habits
   - Add POST /api/trackers/{trackerId}/habits
   - Build PUT /api/habits/{id} for habit updates
   - Implement DELETE /api/habits/{id} with soft delete
   - Add GET /api/habits/{id} for individual habit retrieval

4. **Repository Enhancement**
   - Add GetHabitsByTrackerAsync with filtering and ordering
   - Implement GetHabitByIdAndTrackerAsync for security
   - Create ValidateHabitNameUniqueInTrackerAsync method
   - Add GetHabitCountByTrackerAsync for limit validation
   - Implement SoftDeleteHabitAsync method

5. **Business Logic Implementation**
   - Validate tracker ownership before habit operations
   - Enforce habit name uniqueness within tracker scope
   - Validate color codes are valid hex format
   - Ensure icon identifiers exist in predefined library
   - Implement frequency validation (Daily, Weekly, Custom)

### Frontend Implementation Plan
1. **API Service Layer**
   - Create habitApi.ts with all habit HTTP operations
   - Implement tracker-scoped habit endpoints
   - Add type-safe API calls with proper error handling
   - Configure request/response interceptors
   - Implement optimistic updates for better UX

2. **Core Components Implementation**
   - Build HabitList component with responsive grid layout
   - Create HabitCard component following Figma specifications
   - Implement floating action button for habit creation
   - Add habit sorting and filtering capabilities
   - Create empty state component for trackers without habits

3. **Habit Creation Wizard**
   - Implement CreateHabitModal with step-by-step flow
   - Create HabitFormWizard with progress indicator
   - Build form steps: Basic Info → Customization → Frequency → Review
   - Add form validation with real-time feedback
   - Implement wizard navigation with data persistence

4. **Customization Components**
   - Create ColorPicker with design system color palette
   - Implement IconSelector with searchable icon library
   - Build FrequencySelector with radio button groups
   - Add custom frequency input for specific day counts
   - Create preview component showing habit appearance

5. **State Management and Hooks**
   - Implement useHabits hook for fetching tracker habits
   - Create useCreateHabit with form state management
   - Build useUpdateHabit with optimistic updates
   - Implement useHabitValidation for real-time validation
   - Add useHabitFiltering for search and sort functionality

## References
### Implementation Context References
- Figma habit creation flow: https://c299290be3e64cf3b36350f85c9bb3ff-main.projects.builder.my/
- Color system specification: Artefacts/requirements.md (lines 163-171)
- Icon library requirements: Artefacts/requirements.md (design system section)
- Frequency options: Artefacts/requirements.md (habit entity specification)

### Document References
- Requirements CF-002 acceptance criteria: '../requirements.md'
- Design document habit specifications: '../design.md'
- Database schema habits table: '../requirements.md' (lines 89-109)

### External References
- **React Bits Documentation**: https://reactbits.dev/
  - Wizard component implementation
  - Color picker interactions
  - Icon selector animations

- **FluentValidation**: https://docs.fluentvalidation.net/en/latest/
  - Complex validation rules
  - Conditional validation logic
  - Custom validation messages

- **Color Palette Design**: https://tailwindcss.com/docs/customizing-colors
  - Color system implementation
  - Hex code validation
  - Accessibility considerations

- **Icon Libraries**: https://react-icons.github.io/react-icons/
  - Icon component integration
  - Icon search and filtering
  - Icon accessibility patterns

## Build Commands
```bash
# Backend development
cd server && dotnet build
cd server && dotnet run --project HabitTracker.Api
cd server && dotnet test --filter "Habit"

# Frontend development
cd app && npm run dev
cd app && npm run build
cd app && npm run test -- habit

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
- [ ] **CRUD Operations**: All habit CRUD operations work within tracker scope
- [ ] **Validation**: Request validation enforces business rules
- [ ] **Security**: Users can only manage habits in their trackers
- [ ] **Data Integrity**: Habit operations maintain referential integrity
- [ ] **Performance**: Habit queries optimized for large datasets

### Frontend Validation
- [ ] **Figma Compliance**: Habit creation flow matches Figma design exactly
- [ ] **Wizard UX**: Step-by-step wizard provides smooth user experience
- [ ] **Color System**: Color picker uses exact design system colors
- [ ] **Icon Library**: Icon selector provides comprehensive icon options
- [ ] **Responsive Design**: All components work across device sizes

### Customization Validation
- [ ] **Color Picker**: Color selection works with design system palette
- [ ] **Icon Selector**: Icon search and selection functions correctly
- [ ] **Frequency Options**: All frequency types (Daily, Weekly, Custom) work
- [ ] **Form Validation**: Real-time validation provides immediate feedback
- [ ] **Preview**: Habit preview shows accurate appearance

### Integration Validation
- [ ] **End-to-End**: Complete habit creation to display workflow
- [ ] **State Synchronization**: Frontend state matches backend data
- [ ] **Error Handling**: Graceful error handling throughout flow
- [ ] **Form Persistence**: Wizard maintains data across steps
- [ ] **Optimistic Updates**: UI updates immediately with proper rollback

### Business Logic Validation
- [ ] **Name Uniqueness**: Habit names unique within tracker scope
- [ ] **Tracker Association**: Habits properly associated with trackers
- [ ] **Habit Limits**: Maximum habits per tracker enforced
- [ ] **Color Validation**: Hex color codes validated properly
- [ ] **Icon Validation**: Icon identifiers validated against library

## ToDo Tasks
### Phase 1: Backend Foundation (Day 1)
- [ ] Create HabitService interface and implementation
- [ ] Build Habit DTOs (Create, Update, Response) with validation
- [ ] Implement FluentValidation validators for habit operations
- [ ] Configure AutoMapper profiles for habit entity-DTO mapping
- [ ] Add business logic for habit name uniqueness in tracker

### Phase 2: API Implementation (Day 1-2)
- [ ] Create HabitsController with RESTful endpoints
- [ ] Implement GET /api/trackers/{trackerId}/habits endpoint
- [ ] Build POST /api/trackers/{trackerId}/habits with validation
- [ ] Create PUT /api/habits/{id} for habit updates
- [ ] Implement DELETE /api/habits/{id} with soft delete
- [ ] Add proper HTTP status codes and error responses

### Phase 3: Frontend Service Layer (Day 2)
- [ ] Create habitApi.ts with TypeScript interfaces
- [ ] Implement all HTTP operations for habit management
- [ ] Add error handling and retry logic
- [ ] Configure API base URL and authentication headers
- [ ] Create TypeScript types for habit data structures

### Phase 4: Core Components (Day 2-3)
- [ ] Build HabitList component with responsive grid layout
- [ ] Create HabitCard component per Figma specifications
- [ ] Implement floating action button for habit creation
- [ ] Add habit filtering and sorting capabilities
- [ ] Create empty state component for new trackers

### Phase 5: Customization Components (Day 3-4)
- [ ] Build ColorPicker component with design system palette
- [ ] Create IconSelector with searchable icon library
- [ ] Implement FrequencySelector with all frequency options
- [ ] Create habit preview component showing final appearance
- [ ] Add real-time validation feedback for all inputs

### Phase 6: Habit Creation Wizard (Day 4)
- [ ] Implement CreateHabitModal with step-by-step wizard
- [ ] Create wizard navigation with progress indicator
- [ ] Build form steps: Basic Info → Customization → Frequency → Review
- [ ] Add form persistence across wizard steps
- [ ] Implement form validation with error recovery

### Phase 7: Testing and Validation (Day 5)
- [ ] Write unit tests for HabitService business logic
- [ ] Create API integration tests for all endpoints
- [ ] Implement React component tests with React Testing Library
- [ ] Add end-to-end tests for habit creation workflow
- [ ] Validate Figma design compliance across all components
- [ ] Performance test with large numbers of habits per tracker

This task creates a comprehensive habit management system that provides users with full customization capabilities while maintaining excellent user experience and following modern development practices.