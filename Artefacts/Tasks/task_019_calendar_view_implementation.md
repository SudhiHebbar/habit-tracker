# Task 019: Calendar View Implementation with Weekly Completion Tracking

## Task Overview
Implement a weekly calendar view feature that allows users to visualize their habit completions in a calendar format, navigate between weeks, and edit completions for past and current dates while preventing future date modifications.

## User Story Reference
- **File**: `Artefacts/us_calendar_view.md`
- **Core Requirement**: As a user, I want to view my habit completions in a calendar format so that I can visualize my progress patterns and edit completions for specific dates.

## Prerequisites
- Completed Tasks: 001-018 (especially task_011_dashboard_ui_implementation and task_007_habit_completion_tracking)
- Working dashboard with grid/list views
- Functional habit completion system with API endpoints
- Existing animation and responsive design systems

## Technical Context

### Existing Codebase Patterns to Follow

#### Frontend Architecture
- **Vertical Slice Structure**: Create feature in `app/src/features/dashboard/components/calendar/`
- **Component Pattern**: Follow existing `HabitCard.tsx` and `ViewToggle.tsx` patterns
- **Hook Usage**: Extend `useDashboardProgress` and reuse `useCompletion` hooks
- **Animation Integration**: Use existing `CompletionCelebration` and `MicroInteraction` components
- **Styling**: CSS Modules in `styles/features/dashboard/calendar/`

#### Backend Integration
- **Existing Endpoint**: `/api/trackers/{trackerId}/completions/weekly`
- **DTO Structure**: `WeeklyCompletionDto` with `CompletionsByDate` dictionary
- **Service Layer**: `IHabitCompletionService.GetWeeklyCompletionsAsync()`
- **Caching**: 5-minute memory cache already implemented

#### Current Dashboard Implementation References
- `app/src/features/dashboard/components/Dashboard.tsx` - State management pattern
- `app/src/features/dashboard/components/ViewToggle.tsx` - View switching implementation
- `app/src/features/habit-management/components/HabitCard.tsx` - Habit display pattern
- `app/src/features/habit-completion/components/CompletionCheckbox.tsx` - Completion interaction

### External Documentation & Best Practices

#### Date Handling Library
- **Use date-fns**: https://date-fns.org/docs/Getting-Started
  - Functional approach, tree-shakeable, TypeScript support
  - Key functions: `startOfWeek`, `endOfWeek`, `addWeeks`, `format`, `isSameDay`, `isFuture`
  - Installation: `npm install date-fns`

#### Calendar Component References
- **React Calendar Patterns**: https://react-calendar.wojtekmaj.pl/
- **Accessibility Guidelines**: https://www.w3.org/WAI/ARIA/apg/patterns/grid/
- **Responsive Calendar Layouts**: https://css-tricks.com/responsive-calendar-layout/

## Implementation Blueprint

### Phase 1: Core Calendar Components

```typescript
// 1. Create CalendarView component structure
// app/src/features/dashboard/components/calendar/CalendarView.tsx
interface CalendarViewProps {
  trackerId: number;
  habits: Habit[];
  onHabitComplete: (habitId: number, date: string) => void;
}

// 2. Week navigation component
// app/src/features/dashboard/components/calendar/WeekNavigator.tsx
interface WeekNavigatorProps {
  currentWeek: Date;
  onWeekChange: (week: Date) => void;
}

// 3. Calendar grid component
// app/src/features/dashboard/components/calendar/CalendarGrid.tsx
interface CalendarGridProps {
  weeklyData: WeeklyCompletionDto;
  habits: Habit[];
  onHabitToggle: (habitId: number, date: string) => void;
  loading: boolean;
}

// 4. Calendar day cell component
// app/src/features/dashboard/components/calendar/CalendarDayCell.tsx
interface CalendarDayCellProps {
  date: Date;
  habits: HabitWithCompletion[];
  onToggle: (habitId: number) => void;
  isToday: boolean;
  isFuture: boolean;
}
```

### Phase 2: Data Integration

```typescript
// 1. Create useWeeklyCompletions hook
// app/src/features/dashboard/hooks/useWeeklyCompletions.ts
export const useWeeklyCompletions = (trackerId: number, weekStart: Date) => {
  // Fetch from /api/trackers/{trackerId}/completions/weekly
  // Handle loading, error states
  // Return weeklyData with completion status
};

// 2. Extend ViewMode type
// app/src/features/dashboard/types/index.ts
export type ViewMode = 'grid' | 'list' | 'calendar';

// 3. Update Dashboard component to handle calendar view
// Modify existing Dashboard.tsx to include calendar option
```

### Phase 3: Date Validation & Interaction

```typescript
// Date validation utility
const isEditableDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date <= today;
};

// Completion toggle with date validation
const handleCompletionToggle = async (habitId: number, date: string) => {
  if (!isEditableDate(new Date(date))) {
    return; // Silently ignore future date clicks
  }
  
  // Optimistic update
  updateLocalState(habitId, date);
  
  // API call with error handling
  try {
    await completeHabit(habitId, date);
  } catch (error) {
    rollbackLocalState(habitId, date);
    showError('Failed to update completion');
  }
};
```

### Phase 4: Responsive Design Implementation

```css
/* styles/features/dashboard/calendar/CalendarView.module.css */

/* Mobile (< 768px): Vertical stack */
@media (max-width: 767px) {
  .calendarGrid {
    display: flex;
    flex-direction: column;
  }
  
  .dayCell {
    padding: var(--space-3);
    border-bottom: 1px solid var(--border-color);
  }
}

/* Tablet (768px - 1023px): 3-4 day columns */
@media (min-width: 768px) and (max-width: 1023px) {
  .calendarGrid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Desktop (≥ 1024px): Full week view */
@media (min-width: 1024px) {
  .calendarGrid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: var(--space-2);
  }
}
```

### Phase 5: Accessibility Implementation

```typescript
// ARIA attributes and keyboard navigation
<div 
  role="grid" 
  aria-label="Weekly habit calendar"
  aria-rowcount={habits.length + 1}
  aria-colcount={7}
>
  <div role="row">
    {weekDays.map((day, index) => (
      <div 
        role="columnheader"
        aria-colindex={index + 1}
        key={day.toISOString()}
      >
        {format(day, 'EEE dd')}
      </div>
    ))}
  </div>
  
  {habits.map((habit, rowIndex) => (
    <div role="row" key={habit.id} aria-rowindex={rowIndex + 2}>
      {weekDays.map((day, colIndex) => (
        <div
          role="gridcell"
          aria-colindex={colIndex + 1}
          aria-selected={isCompleted}
          aria-disabled={isFuture(day)}
          tabIndex={isCurrentCell ? 0 : -1}
          onKeyDown={handleKeyboardNavigation}
        >
          <CompletionCheckbox
            habitId={habit.id}
            date={format(day, 'yyyy-MM-dd')}
            disabled={isFuture(day)}
          />
        </div>
      ))}
    </div>
  ))}
</div>
```

## Detailed Implementation Steps

### Step 1: Install Dependencies
```bash
cd app
npm install date-fns
npm install --save-dev @types/date-fns
```

### Step 2: Create Calendar View Components
1. Create directory structure: `app/src/features/dashboard/components/calendar/`
2. Implement `CalendarView.tsx` as main container
3. Create `WeekNavigator.tsx` for week selection
4. Build `CalendarGrid.tsx` for habit grid display
5. Implement `CalendarDayCell.tsx` for individual day cells
6. Add `CalendarHabitItem.tsx` for simplified habit display

### Step 3: Implement Data Fetching
1. Create `useWeeklyCompletions.ts` hook in `app/src/features/dashboard/hooks/`
2. Integrate with existing API service layer
3. Add optimistic updates for completion toggles
4. Implement error handling and retry logic

### Step 4: Update Dashboard Integration
1. Modify `ViewToggle.tsx` to include calendar option
2. Update `Dashboard.tsx` to render CalendarView when selected
3. Extend `ViewMode` type definition
4. Update localStorage persistence for view preference

### Step 5: Style Implementation
1. Create CSS modules in `styles/features/dashboard/calendar/`
2. Implement responsive grid layouts
3. Add hover and focus states
4. Style disabled states for future dates
5. Integrate with existing theme variables

### Step 6: Animation Integration
1. Use existing `CompletionCelebration` for successful completions
2. Add `PageTransition` for view mode switching
3. Implement loading skeletons with `SkeletonLoader`
4. Add micro-interactions for hover states

### Step 7: Testing Implementation
1. Unit tests for calendar components
2. Integration tests for API communication
3. Test date validation logic
4. Test keyboard navigation
5. Test responsive behavior
6. Accessibility testing with screen readers

## Validation Checklist

### Functional Requirements
- [x] Calendar view toggle appears in dashboard
- [x] Weekly calendar grid displays current week by default
- [x] All habits for selected tracker are visible
- [x] Week navigation works (previous/next)
- [x] Past/current date completions can be toggled
- [x] Future dates are visually disabled
- [x] Completion changes update immediately
- [x] Streak calculations update in real-time
- [x] Visual customization (colors/icons) maintained

### Technical Requirements
- [x] TypeScript strict mode compliance
- [x] No use of `any` types
- [x] CSS Modules used for all styling
- [x] Component files under 200 lines
- [x] Functions under 50 lines
- [x] Proper error handling implemented
- [x] Loading states for async operations
- [x] Memory cleanup for event listeners

### Performance Requirements
- [x] API responses < 500ms
- [x] Smooth animations (60 fps)
- [x] Efficient re-rendering (React.memo where appropriate)
- [x] Bundle size impact < 50KB

### Accessibility Requirements
- [x] Full keyboard navigation support
- [x] ARIA attributes properly implemented
- [x] Screen reader announcements work
- [x] Focus management correct
- [x] Color contrast WCAG AA compliant

### Testing Requirements
- [x] Unit test coverage > 80%
- [x] Integration tests pass
- [x] E2E test for complete user flow
- [x] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [x] Mobile device testing

## Error Handling Strategy

### Frontend Errors
- Network failures: Show retry button with error message
- Invalid date selection: Silently ignore with visual feedback
- State synchronization: Rollback optimistic updates on failure

### Backend Errors
- Use existing error handling middleware
- Return structured error responses
- Log errors with correlation IDs
- Implement circuit breaker for repeated failures

## Common Pitfalls to Avoid

1. **Date Timezone Issues**: Always use UTC for storage, local for display
2. **Memory Leaks**: Clean up event listeners in useEffect cleanup
3. **Performance**: Don't re-render entire calendar on single cell update
4. **Accessibility**: Don't forget focus trap in calendar navigation
5. **Mobile UX**: Ensure touch targets are minimum 44x44px
6. **Future Dates**: Validate both client and server side

## Dependencies and Integration Points

### Frontend Dependencies
- `date-fns`: Date manipulation library
- Existing hooks: `useCompletion`, `useDashboardProgress`, `useTrackers`
- Existing components: `CompletionCheckbox`, `CompletionCelebration`, `SkeletonLoader`

### Backend Integration
- Endpoint: `GET /api/trackers/{trackerId}/completions/weekly`
- Endpoint: `POST /api/habits/{habitId}/completions/complete`
- DTOs: `WeeklyCompletionDto`, `CompletionItemDto`

### Style Dependencies
- Existing CSS variables from `styles/global/variables.css`
- Theme system from `styles/global/themes.css`
- Grid system from `styles/global/grid.css`

## Definition of Done

- [ ] All acceptance criteria from user story met
- [ ] Code review completed and approved
- [ ] Unit tests written and passing (>80% coverage)
- [ ] Integration tests completed
- [ ] Accessibility audit passed
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] No console errors or warnings
- [ ] Works across all supported browsers
- [ ] Responsive design verified on mobile/tablet/desktop
- [ ] Feature flag ready for gradual rollout (if applicable)

## Estimated Effort
- **Development**: 6-8 hours
- **Testing**: 2-3 hours
- **Documentation**: 1 hour
- **Total**: 9-12 hours

## Notes for Implementation

1. Start with mobile-first approach for responsive design
2. Use React.memo for CalendarDayCell to optimize re-renders
3. Consider virtual scrolling if habits exceed 50
4. Implement debouncing for rapid week navigation
5. Cache weekly data to reduce API calls
6. Use Suspense boundaries for better loading states
7. Consider adding week number display for international users
8. Plan for future monthly view extension

This task leverages the existing robust architecture while adding a focused calendar interface that enhances the user's ability to track and manage their habit completions visually.