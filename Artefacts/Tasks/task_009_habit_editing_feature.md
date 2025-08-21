# Task 009: Habit Editing Feature Implementation

## Requirement Reference
- User Story: CF-005

## Task Overview
Implement comprehensive habit editing functionality allowing users to modify existing habits while preserving historical completion data. This includes backend API endpoints for habit updates, frontend React components with pre-populated forms, validation for changes that don't break existing data integrity, and the ability to deactivate habits without losing historical tracking information.

## Dependent Tasks
- task_001_react_project_setup.md (Frontend infrastructure required)
- task_002_dotnet_project_setup.md (Backend infrastructure required)
- task_003_database_schema_implementation.md (Database schema must exist)
- task_004_repository_pattern_implementation.md (Data access layer required)
- task_005_tracker_management_feature.md (Tracker management required)
- task_006_habit_management_feature.md (Habit management required)
- task_007_habit_completion_tracking.md (Completion tracking required)

## Tasks
- Create habit update API endpoints with validation
- Implement habit editing service with business logic
- Build habit editing modal with pre-populated forms
- Create habit deactivation/reactivation functionality
- Implement edit validation preserving historical data
- Add habit history preservation during updates
- Create habit change impact analysis
- Implement bulk habit editing capabilities
- Add habit editing permissions and security
- Create comprehensive testing for edit scenarios

## Current State
```
server\
├── HabitTracker.Api\
│   └── Controllers\
│       ├── TrackersController.cs
│       ├── HabitsController.cs (basic CRUD)
│       └── HabitCompletionsController.cs
├── HabitTracker.Application\
│   ├── Services\
│   │   └── HabitService.cs (basic operations)
│   └── DTOs\ (CreateHabitDto, HabitResponseDto)

app\
├── src\
│   ├── features\
│   │   ├── tracker-management\ (complete)
│   │   ├── habit-management\ (creation complete)
│   │   ├── habit-completion\ (complete)
│   │   └── tracker-switching\ (complete)
```

## Future State
```
server\
├── HabitTracker.Api\
│   └── Controllers\
│       ├── TrackersController.cs
│       ├── HabitsController.cs (enhanced with edit operations)
│       └── HabitCompletionsController.cs
├── HabitTracker.Application\
│   ├── Services\
│   │   ├── HabitService.cs (enhanced with edit logic)
│   │   └── HabitEditingService.cs
│   ├── DTOs\
│   │   ├── EditHabitDto.cs
│   │   ├── HabitUpdateDto.cs
│   │   ├── DeactivateHabitDto.cs
│   │   └── HabitEditResponseDto.cs
│   ├── Validators\
│   │   ├── EditHabitValidator.cs
│   │   └── HabitUpdateValidator.cs
│   └── Interfaces\
│       └── IHabitEditingService.cs

app\
├── src\
│   ├── features\
│   │   ├── habit-management\ (existing + editing)
│   │   │   ├── components\
│   │   │   │   ├── EditHabitModal.tsx
│   │   │   │   ├── HabitEditForm.tsx
│   │   │   │   ├── HabitDeactivateDialog.tsx
│   │   │   │   ├── HabitChangePreview.tsx
│   │   │   │   ├── BulkEditModal.tsx
│   │   │   │   └── HabitEditHistory.tsx
│   │   │   ├── hooks\
│   │   │   │   ├── useEditHabit.ts
│   │   │   │   ├── useHabitValidation.ts
│   │   │   │   ├── useHabitDeactivation.ts
│   │   │   │   └── useBulkEdit.ts
│   │   │   └── services\
│   │   │       ├── habitEditingApi.ts
│   │   │       └── habitChangeAnalysis.ts
│   │   └── habit-editing\
│   │       ├── components\
│   │       │   ├── EditModeToggle.tsx
│   │       │   ├── ChangeImpactDialog.tsx
│   │       │   └── EditConfirmation.tsx
│   │       ├── hooks\
│   │       │   ├── useEditMode.ts
│   │       │   └── useChangeTracking.ts
│   │       ├── types\
│   │       │   └── habitEditing.types.ts
│   │       └── index.ts
├── styles\
│   └── features\
│       └── habit-editing\
│           ├── EditHabitModal.module.css
│           ├── HabitEditForm.module.css
│           └── ChangeImpactDialog.module.css
```

## Development Workflow
1. Enhance backend habit service with editing capabilities
2. Create edit-specific API endpoints with validation
3. Implement habit editing DTOs with change tracking
4. Build React editing components with form pre-population
5. Create change impact analysis and preview
6. Implement habit deactivation with history preservation
7. Add bulk editing capabilities for multiple habits
8. Create edit permission and validation systems
9. Add comprehensive edit history tracking
10. Create testing for all edit scenarios and edge cases

## Data Workflow
- User clicks edit button on habit card
- Frontend loads current habit data into edit form
- User modifies habit properties (name, color, icon, frequency)
- Frontend validates changes and shows impact preview
- API called with UpdateHabitDto containing only changed fields
- Backend validates changes don't break historical data integrity
- Database updated with new values, preserving completion history
- Frontend updates UI with new habit data
- Change tracked in audit log for accountability

## Impacted Components
### Backend (.NET 8 Web API)
- **Enhanced**: HabitService with editing and validation logic
- **New**: HabitEditingService for complex edit operations
- **Enhanced**: HabitsController with edit-specific endpoints
- **New**: Edit-specific DTOs (EditHabitDto, HabitUpdateDto)
- **New**: Edit validation preventing data integrity issues
- **New**: Habit deactivation/reactivation logic
- **New**: Change impact analysis for frequency modifications
- **New**: Audit logging for habit modifications

### Frontend (React 19 + TypeScript)
- **New**: EditHabitModal with pre-populated form data
- **New**: HabitEditForm with validation and preview
- **New**: HabitDeactivateDialog with confirmation
- **New**: HabitChangePreview showing edit impact
- **New**: BulkEditModal for editing multiple habits
- **New**: Edit mode toggle for habit cards
- **New**: Change tracking and conflict resolution
- **Enhanced**: Habit cards with edit/deactivate actions

## Implementation Plan
### Backend Implementation Plan
1. **Service Enhancement**
   - Enhance HabitService with UpdateHabitAsync method
   - Create HabitEditingService for complex edit scenarios
   - Implement DeactivateHabitAsync preserving historical data
   - Add ReactivateHabitAsync for habit restoration
   - Create ValidateHabitEditAsync for edit validation

2. **DTO and Validation Design**
   - Create EditHabitDto with all editable properties
   - Implement HabitUpdateDto with partial update support
   - Build DeactivateHabitDto with reason tracking
   - Add HabitEditResponseDto with change summary
   - Create validators preventing destructive changes

3. **API Endpoint Implementation**
   - Enhance PUT /api/habits/{id} with comprehensive updates
   - Add PATCH /api/habits/{id}/deactivate for deactivation
   - Implement PATCH /api/habits/{id}/reactivate for restoration
   - Create POST /api/habits/bulk-edit for multiple habits
   - Add GET /api/habits/{id}/edit-history for change tracking

4. **Change Impact Analysis**
   - Implement frequency change impact analysis
   - Create streak recalculation for frequency modifications
   - Add validation for color and icon changes
   - Implement name uniqueness validation within tracker
   - Create change preview generation for frontend

5. **History Preservation**
   - Ensure completion history remains intact during edits
   - Implement soft deletion for habit deactivation
   - Create habit change audit log
   - Add timestamp tracking for all modifications
   - Implement rollback capabilities for erroneous edits

### Frontend Implementation Plan
1. **Edit Modal and Forms**
   - Build EditHabitModal with pre-populated current values
   - Create HabitEditForm with validation and change tracking
   - Implement form state management with dirty field detection
   - Add real-time validation with user-friendly error messages
   - Create form submission with optimistic updates

2. **Change Preview and Impact**
   - Implement HabitChangePreview showing before/after comparison
   - Create ChangeImpactDialog explaining edit consequences
   - Add visual indicators for fields being modified
   - Implement change confirmation for significant modifications
   - Create preview of streak impact for frequency changes

3. **Deactivation and Bulk Operations**
   - Build HabitDeactivateDialog with reason selection
   - Create BulkEditModal for editing multiple habits
   - Implement bulk selection with checkbox interface
   - Add bulk deactivation with confirmation
   - Create progress indicators for bulk operations

4. **Edit Mode and State Management**
   - Implement EditModeToggle for habit cards
   - Create useEditMode hook for edit state management
   - Add useEditHabit hook for single habit editing
   - Implement useBulkEdit hook for multiple habit operations
   - Create edit conflict resolution for concurrent edits

5. **Validation and Error Handling**
   - Implement real-time form validation
   - Create useHabitValidation hook for edit-specific validation
   - Add error recovery for failed edit operations
   - Implement change rollback for validation failures
   - Create user-friendly error messages for edit constraints

## References
### Implementation Context References
- Figma edit interfaces: https://c299290be3e64cf3b36350f85c9bb3ff-main.projects.builder.my/
- Data integrity requirements: Artefacts/requirements.md (CF-005)
- Historical data preservation: Artefacts/requirements.md (lines 378-381)
- Validation patterns: References/Gotchas/react_gotchas.md

### Document References
- CF-005 acceptance criteria: '../requirements.md'
- Habit entity specification: '../requirements.md' (lines 89-109)
- Data preservation requirements: '../requirements.md' (lines 378-381)

### External References
- **React Hook Form**: https://react-hook-form.com/
  - Form state management
  - Validation patterns
  - Performance optimization

- **FluentValidation**: https://docs.fluentvalidation.net/en/latest/
  - Complex validation scenarios
  - Conditional validation
  - Custom validation rules

- **Entity Framework Updates**: https://learn.microsoft.com/en-us/ef/core/saving/basic
  - Partial entity updates
  - Change tracking
  - Optimistic concurrency

- **Audit Logging**: https://learn.microsoft.com/en-us/ef/core/logging-events-diagnostics/
  - Change tracking implementation
  - Audit trail creation
  - Historical data preservation

## Build Commands
```bash
# Backend development
cd server && dotnet build
cd server && dotnet run --project HabitTracker.Api
cd server && dotnet test --filter "HabitEdit"

# Frontend development
cd app && npm run dev
cd app && npm run build
cd app && npm run test -- habit-edit

# Validation testing
cd server && dotnet test --filter "Validation"
cd app && npm run test:validation

# Integration testing
cd server && dotnet test --filter "Integration"
cd app && npm run test:integration
```

## Implementation Validation Strategy
### Data Integrity Validation
- [ ] **History Preservation**: Completion history remains intact during edits
- [ ] **Referential Integrity**: Edit operations don't break database relationships
- [ ] **Constraint Validation**: Business rules enforced during updates
- [ ] **Concurrency Handling**: Concurrent edits handled gracefully
- [ ] **Rollback Capability**: Failed edits can be rolled back completely

### User Experience Validation
- [ ] **Form Pre-population**: Edit forms load with current habit values
- [ ] **Real-time Validation**: Validation feedback provided immediately
- [ ] **Change Preview**: Users can preview edit impact before confirmation
- [ ] **Bulk Operations**: Multiple habits can be edited efficiently
- [ ] **Error Recovery**: Users can recover gracefully from edit errors

### Business Logic Validation
- [ ] **Name Uniqueness**: Habit names remain unique within tracker
- [ ] **Frequency Changes**: Frequency edits don't corrupt streak calculations
- [ ] **Deactivation Logic**: Deactivated habits hidden but data preserved
- [ ] **Reactivation Logic**: Deactivated habits can be restored
- [ ] **Edit Permissions**: Users can only edit their own habits

### API Validation
- [ ] **Partial Updates**: PATCH operations update only specified fields
- [ ] **Validation Response**: Clear validation errors returned for invalid edits
- [ ] **Change Tracking**: All modifications logged with timestamps
- [ ] **Impact Analysis**: Edit impact calculated and returned
- [ ] **Bulk Performance**: Bulk operations perform efficiently

### Security Validation
- [ ] **Authorization**: Users can only edit habits in their trackers
- [ ] **Input Validation**: All edit inputs validated server-side
- [ ] **SQL Injection**: Parameterized queries prevent injection attacks
- [ ] **Data Sanitization**: User inputs sanitized before storage
- [ ] **Audit Trail**: All edits logged for security and compliance

## ToDo Tasks
### Phase 1: Backend Edit Logic (Day 1) ✅ COMPLETED
- [X] Enhance HabitService with UpdateHabitAsync method
- [X] Create HabitEditingService for complex edit scenarios
- [X] Implement EditHabitDto and HabitUpdateDto
- [X] Add FluentValidation for edit operations
- [X] Configure AutoMapper for edit DTO mappings

### Phase 2: API Endpoints (Day 1) ✅ COMPLETED
- [X] Enhance PUT /api/habits/{id} with comprehensive updates
- [X] Add PATCH /api/habits/{id}/deactivate endpoint
- [X] Implement PATCH /api/habits/{id}/reactivate endpoint
- [X] Create change impact analysis in edit responses
- [X] Add proper HTTP status codes for edit operations

### Phase 3: Frontend Edit Components (Day 2) ✅ COMPLETED
- [X] Build EditHabitModal with pre-populated form data
- [X] Create HabitEditForm with validation and change tracking
- [X] Implement form state management with dirty field detection
- [X] Add real-time validation with user-friendly messages
- [X] Create form submission with optimistic updates

### Phase 4: Change Preview and Validation (Day 2) ✅ COMPLETED
- [X] Implement HabitChangePreview component
- [X] Create ChangeImpactDialog explaining edit consequences
- [X] Add visual indicators for modified fields
- [X] Implement change confirmation for significant modifications
- [X] Create preview of streak impact for frequency changes

### Phase 5: Deactivation and Bulk Operations (Day 3) ⚠️ PARTIALLY COMPLETED
- [X] Build HabitDeactivateDialog with reason selection
- [ ] Create BulkEditModal for editing multiple habits
- [ ] Implement bulk selection with checkbox interface
- [ ] Add bulk deactivation with confirmation dialog
- [ ] Create progress indicators for bulk operations

### Phase 6: State Management and Hooks (Day 3) ✅ COMPLETED
- [X] Implement useEditHabit hook for single habit editing
- [ ] Create useBulkEdit hook for multiple habit operations
- [X] Add useHabitValidation hook for edit-specific validation
- [ ] Implement useEditMode hook for edit state management
- [ ] Create edit conflict resolution for concurrent edits

### Phase 7: Testing and Validation (Day 4)
- [ ] Write unit tests for HabitEditingService
- [ ] Create API integration tests for all edit endpoints
- [ ] Implement React component tests for edit components
- [ ] Add validation tests for edit constraints
- [ ] Test data integrity preservation during edits
- [ ] Validate bulk operation performance and accuracy
- [ ] Test edit conflict resolution and concurrent updates

This task creates a comprehensive habit editing system that allows users to modify their habits while maintaining data integrity and providing excellent user experience with proper validation and feedback mechanisms.