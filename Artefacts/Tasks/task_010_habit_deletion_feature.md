# Task 010: Habit Deletion Feature Implementation

## Requirement Reference
- User Story: CF-006

## Task Overview
Implement comprehensive habit deletion functionality with soft delete to preserve historical data, confirmation dialogs to prevent accidental deletions, undo functionality for immediate recovery, and batch deletion capabilities. This includes backend API endpoints with soft delete logic, frontend React components with confirmation flows, and comprehensive data preservation strategies while maintaining clean user interface.

## Dependent Tasks
- task_001_react_project_setup.md (Frontend infrastructure required)
- task_002_dotnet_project_setup.md (Backend infrastructure required)
- task_003_database_schema_implementation.md (Database schema must exist)
- task_004_repository_pattern_implementation.md (Data access layer required)
- task_005_tracker_management_feature.md (Tracker management required)
- task_006_habit_management_feature.md (Habit management required)
- task_009_habit_editing_feature.md (Edit functionality required for deactivation)

## Tasks
- Create soft delete API endpoints preserving historical data
- Implement habit deletion service with business logic
- Build confirmation dialogs preventing accidental deletions
- Create undo functionality with 5-second recovery window
- Implement batch deletion for multiple habits
- Add deleted habit recovery and restoration
- Create deletion impact analysis for users
- Implement deletion permissions and security
- Add comprehensive audit logging for deletions
- Create testing for all deletion scenarios

## Current State
```
server\
├── HabitTracker.Api\
│   └── Controllers\
│       ├── TrackersController.cs
│       ├── HabitsController.cs (with edit operations)
│       └── HabitCompletionsController.cs
├── HabitTracker.Application\
│   ├── Services\
│   │   ├── HabitService.cs (with edit logic)
│   │   └── HabitEditingService.cs
│   └── DTOs\ (edit DTOs exist)

app\
├── src\
│   ├── features\
│   │   ├── tracker-management\ (complete)
│   │   ├── habit-management\ (with editing)
│   │   ├── habit-completion\ (complete)
│   │   ├── tracker-switching\ (complete)
│   │   └── habit-editing\ (complete)
```

## Future State
```
server\
├── HabitTracker.Api\
│   └── Controllers\
│       ├── TrackersController.cs
│       ├── HabitsController.cs (enhanced with deletion)
│       └── HabitCompletionsController.cs
├── HabitTracker.Application\
│   ├── Services\
│   │   ├── HabitService.cs (enhanced with deletion)
│   │   ├── HabitEditingService.cs
│   │   └── HabitDeletionService.cs
│   ├── DTOs\
│   │   ├── DeleteHabitDto.cs
│   │   ├── BulkDeleteDto.cs
│   │   ├── RestoreHabitDto.cs
│   │   └── DeletionImpactDto.cs
│   ├── Validators\
│   │   └── DeleteHabitValidator.cs
│   └── Interfaces\
│       └── IHabitDeletionService.cs

app\
├── src\
│   ├── features\
│   │   ├── habit-management\ (existing + deletion)
│   │   │   ├── components\
│   │   │   │   ├── DeleteHabitDialog.tsx
│   │   │   │   ├── BulkDeleteDialog.tsx
│   │   │   │   ├── UndoDeleteToast.tsx
│   │   │   │   ├── DeletionImpactModal.tsx
│   │   │   │   └── DeletedHabitsView.tsx
│   │   │   ├── hooks\
│   │   │   │   ├── useDeleteHabit.ts
│   │   │   │   ├── useBulkDelete.ts
│   │   │   │   ├── useUndoDelete.ts
│   │   │   │   └── useDeletedHabits.ts
│   │   │   └── services\
│   │   │       ├── habitDeletionApi.ts
│   │   │       └── deletionImpactAnalysis.ts
│   │   └── habit-deletion\
│   │       ├── components\
│   │       │   ├── ConfirmationDialog.tsx
│   │       │   ├── UndoTimer.tsx
│   │       │   ├── DeletionProgress.tsx
│   │       │   └── RestoreHabitDialog.tsx
│   │       ├── hooks\
│   │       │   ├── useDeletionConfirmation.ts
│   │       │   ├── useUndoTimer.ts
│   │       │   └── useHabitRestore.ts
│   │       ├── types\
│   │       │   └── habitDeletion.types.ts
│   │       └── index.ts
├── styles\
│   └── features\
│       └── habit-deletion\
│           ├── DeleteHabitDialog.module.css
│           ├── UndoDeleteToast.module.css
│           └── DeletionImpactModal.module.css
```

## Development Workflow
1. Create backend soft delete service with data preservation
2. Implement deletion API endpoints with confirmation requirements
3. Build deletion DTOs with impact analysis data
4. Create React confirmation dialogs with clear deletion impact
5. Implement undo functionality with timer mechanism
6. Add batch deletion capabilities for multiple habits
7. Create deleted habits management and restoration
8. Implement deletion audit logging and tracking
9. Add comprehensive validation and security
10. Create testing for all deletion and recovery scenarios

## Data Workflow
- User clicks delete button on habit card
- Frontend shows confirmation dialog with deletion impact
- User confirms deletion, API called with DeleteHabitDto
- Backend performs soft delete (sets IsActive = false, DeletedAt = now)
- Habit removed from active lists, completion history preserved
- Frontend shows undo toast with 5-second timer
- If undo clicked, restoration API called immediately
- If timer expires, deletion becomes permanent after grace period
- Audit log tracks all deletion and restoration actions

## Impacted Components
### Backend (.NET 8 Web API)
- **Enhanced**: HabitService with soft delete capabilities
- **New**: HabitDeletionService for complex deletion logic
- **Enhanced**: HabitsController with deletion endpoints
- **New**: Deletion-specific DTOs (DeleteHabitDto, BulkDeleteDto)
- **New**: Deletion impact analysis calculations
- **New**: Soft delete query filtering in repositories
- **New**: Habit restoration functionality
- **New**: Deletion audit logging system

### Frontend (React 19 + TypeScript)
- **New**: DeleteHabitDialog with impact preview
- **New**: BulkDeleteDialog for multiple habit deletion
- **New**: UndoDeleteToast with countdown timer
- **New**: DeletionImpactModal showing deletion consequences
- **New**: DeletedHabitsView for managing deleted habits
- **New**: Restoration functionality for deleted habits
- **Enhanced**: Habit cards with delete action buttons
- **New**: Batch selection for multiple habit operations

## Implementation Plan
### Backend Implementation Plan
1. **Service Enhancement**
   - Enhance HabitService with SoftDeleteHabitAsync method
   - Create HabitDeletionService for complex deletion scenarios
   - Implement RestoreHabitAsync for deletion recovery
   - Add GetDeletedHabitsAsync for deleted habit management
   - Create CalculateDeletionImpactAsync for impact analysis

2. **Soft Delete Implementation**
   - Add IsDeleted and DeletedAt fields to Habit entity
   - Implement global query filters to exclude deleted habits
   - Create soft delete logic preserving all historical data
   - Add restoration logic to reactivate deleted habits
   - Implement permanent deletion for compliance requirements

3. **DTO and Validation Design**
   - Create DeleteHabitDto with deletion reason tracking
   - Implement BulkDeleteDto for multiple habit deletion
   - Build RestoreHabitDto for habit restoration
   - Add DeletionImpactDto with completion and streak data
   - Create validators for deletion business rules

4. **API Endpoint Implementation**
   - Add DELETE /api/habits/{id} for soft deletion
   - Implement POST /api/habits/bulk-delete for batch operations
   - Create PATCH /api/habits/{id}/restore for restoration
   - Add GET /api/habits/deleted for deleted habit management
   - Implement GET /api/habits/{id}/deletion-impact for analysis

5. **Audit and Security**
   - Implement deletion audit logging with user tracking
   - Add permission validation for habit deletion
   - Create deletion reason tracking and reporting
   - Implement deletion analytics for habit management
   - Add security validation preventing unauthorized deletions

### Frontend Implementation Plan
1. **Confirmation and Impact Analysis**
   - Build DeleteHabitDialog with deletion impact preview
   - Create DeletionImpactModal showing completion statistics
   - Implement confirmation flow with clear consequences
   - Add impact analysis displaying streak and completion loss
   - Create deletion reason selection with predefined options

2. **Undo Functionality**
   - Implement UndoDeleteToast with 5-second countdown
   - Create UndoTimer component with visual countdown
   - Add immediate undo functionality with API restoration
   - Implement undo success feedback and confirmation
   - Create undo history tracking for user awareness

3. **Batch Deletion**
   - Build BulkDeleteDialog for multiple habit selection
   - Create batch selection UI with checkboxes
   - Implement bulk deletion confirmation with impact summary
   - Add progress indicators for bulk deletion operations
   - Create bulk undo functionality for batch operations

4. **Deleted Habits Management**
   - Create DeletedHabitsView for viewing deleted habits
   - Implement RestoreHabitDialog for individual restoration
   - Add bulk restoration for multiple deleted habits
   - Create permanent deletion with additional confirmation
   - Implement deleted habit search and filtering

5. **State Management and Hooks**
   - Implement useDeleteHabit hook for single habit deletion
   - Create useBulkDelete hook for multiple habit operations
   - Add useUndoDelete hook for deletion recovery
   - Implement useDeletedHabits hook for deleted habit management
   - Create useDeletionConfirmation for confirmation flows

## References
### Implementation Context References
- Figma deletion flows: https://c299290be3e64cf3b36350f85c9bb3ff-main.projects.builder.my/
- Soft delete patterns: References/Gotchas/database_best_practices.md
- Data preservation requirements: Artefacts/requirements.md (CF-006)
- Undo UX patterns: References/Gotchas/react_gotchas.md

### Document References
- CF-006 acceptance criteria: '../requirements.md'
- Data preservation requirements: '../requirements.md' (lines 389-394)
- Soft delete implementation: '../design.md' (data layer section)

### External References
- **Soft Delete Patterns**: https://learn.microsoft.com/en-us/ef/core/miscellaneous/soft-delete
  - Global query filters
  - Soft delete implementation
  - Data preservation strategies

- **React Toast Notifications**: https://react-hot-toast.com/
  - Undo toast implementation
  - Timer-based notifications
  - User feedback patterns

- **Confirmation Dialogs**: https://reactbits.dev/
  - Modal confirmation patterns
  - User-friendly confirmation flows
  - Accessible dialog implementation

- **Bulk Operations**: https://developer.mozilla.org/en-US/docs/Web/API/Selection_API
  - Multi-selection interfaces
  - Bulk operation patterns
  - Progress indication

## Build Commands
```bash
# Backend development
cd server && dotnet build
cd server && dotnet run --project HabitTracker.Api
cd server && dotnet test --filter "HabitDeletion"

# Frontend development
cd app && npm run dev
cd app && npm run build
cd app && npm run test -- habit-deletion

# Soft delete testing
cd server && dotnet test --filter "SoftDelete"
cd app && npm run test:deletion

# Integration testing
cd server && dotnet test --filter "Integration"
cd app && npm run test:integration
```

## Implementation Validation Strategy
### Data Preservation Validation
- [ ] **Historical Data**: Completion history preserved after deletion
- [ ] **Soft Delete**: Deleted habits excluded from active queries
- [ ] **Restoration**: Deleted habits can be fully restored
- [ ] **Referential Integrity**: Deletion doesn't break database relationships
- [ ] **Audit Trail**: All deletions logged with timestamps and reasons

### User Experience Validation
- [ ] **Confirmation Dialog**: Clear deletion impact shown before confirmation
- [ ] **Undo Functionality**: 5-second undo window works reliably
- [ ] **Batch Operations**: Multiple habits can be deleted efficiently
- [ ] **Feedback**: Clear feedback for all deletion operations
- [ ] **Error Recovery**: Failed deletions handled gracefully

### Business Logic Validation
- [ ] **Permission Validation**: Users can only delete their own habits
- [ ] **Impact Analysis**: Deletion impact calculated and displayed accurately
- [ ] **Restoration Logic**: Restored habits return to exact previous state
- [ ] **Batch Validation**: Bulk operations maintain data integrity
- [ ] **Deletion Reasons**: Deletion reasons tracked for analytics

### Security Validation
- [ ] **Authorization**: Proper authorization for deletion operations
- [ ] **Input Validation**: Deletion requests validated server-side
- [ ] **Audit Logging**: All deletions logged for security compliance
- [ ] **Permission Checks**: Users cannot delete habits in other trackers
- [ ] **Rate Limiting**: Bulk deletion operations rate-limited

### Performance Validation
- [ ] **Query Performance**: Soft delete queries optimized with indexes
- [ ] **Bulk Operations**: Batch deletions perform efficiently
- [ ] **UI Responsiveness**: Deletion operations don't block UI
- [ ] **Undo Performance**: Undo operations complete quickly
- [ ] **Database Load**: Deletion operations don't overload database

## ToDo Tasks
### Phase 1: Backend Soft Delete Logic (Day 1) ✅
- [x] Enhance Habit entity with IsDeleted and DeletedAt fields
- [x] Implement global query filters to exclude deleted habits
- [x] Create HabitDeletionService with soft delete logic
- [x] Add SoftDeleteHabitAsync and RestoreHabitAsync methods
- [x] Configure Entity Framework for soft delete queries

### Phase 2: API Endpoints (Day 1) ✅
- [x] Add DELETE /api/habits/{id} endpoint for soft deletion
- [x] Implement POST /api/habits/bulk-delete for batch operations
- [x] Create PATCH /api/habits/{id}/restore for restoration
- [x] Add GET /api/habits/deleted for deleted habit management
- [x] Implement deletion impact analysis in API responses

### Phase 3: Frontend Confirmation Components (Day 2) ✅
- [x] Build DeleteHabitDialog with deletion impact preview
- [x] Create DeletionImpactModal showing completion statistics
- [x] Implement confirmation flow with clear consequences
- [x] Add deletion reason selection with predefined options
- [x] Create impact analysis displaying streak and completion data

### Phase 4: Undo Functionality (Day 2) ✅
- [x] Implement UndoDeleteToast with 5-second countdown
- [x] Create UndoTimer component with visual countdown
- [x] Add immediate undo functionality with API restoration
- [x] Implement undo success feedback and confirmation
- [x] Create undo history tracking for user awareness

### Phase 5: Batch Deletion (Day 3) ⚠️ SCOPE REDUCED
- [ ] Build BulkDeleteDialog for multiple habit selection (OUT OF SCOPE)
- [ ] Create batch selection UI with checkboxes (OUT OF SCOPE)
- [ ] Implement bulk deletion confirmation with impact summary (OUT OF SCOPE)
- [ ] Add progress indicators for bulk deletion operations (OUT OF SCOPE)
- [ ] Create bulk undo functionality for batch operations (OUT OF SCOPE)
*Note: Batch deletion APIs implemented but UI marked as out of current scope*

### Phase 6: Deleted Habits Management (Day 3) ✅
- [x] Create DeletedHabitsView for viewing deleted habits
- [x] Implement RestoreHabitDialog for individual restoration
- [x] Add bulk restoration for multiple deleted habits
- [x] Create permanent deletion with additional confirmation
- [x] Implement deleted habit search and filtering

### Phase 7: Testing and Validation (Day 4) ✅
- [x] Write unit tests for HabitDeletionService
- [x] Create API integration tests for all deletion endpoints
- [x] Implement React component tests for deletion components
- [x] Add soft delete query filter tests
- [x] Test undo functionality with timer mechanics
- [x] Validate batch deletion performance and accuracy
- [x] Test data preservation and restoration integrity

This task creates a comprehensive habit deletion system that prioritizes data preservation while providing users with clear feedback, confirmation flows, and recovery options to prevent accidental data loss.