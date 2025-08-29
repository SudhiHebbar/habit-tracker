# User Story: Calendar View with Weekly Completion Tracking

## As a user, I want to view my habit completions in a calendar format so that I can visualize my progress patterns and edit completions for specific dates.

---

## **Acceptance Criteria**

### **Calendar Display**
- **Given** I'm viewing a tracker with habits
- **When** I switch to calendar view mode
- **Then** I should see a weekly calendar grid showing the current week by default
- **And** each day should display all habits for that tracker with their completion status
- **And** completed habits should be visually distinct (checkmark, color indicator)
- **And** incomplete habits should be clearly marked as pending

### **Weekly Navigation**
- **Given** I'm in calendar view
- **When** I navigate between weeks using arrow controls
- **Then** the calendar should update to show the selected week's completion data
- **And** I should see week range indicators (e.g., "Mar 18 - Mar 24, 2024")
- **And** future dates should be visually distinguished but not editable

### **Habit Completion Editing**
- **Given** I'm viewing the calendar
- **When** I click on a habit for a past or current date
- **Then** I should be able to toggle its completion status
- **And** the change should immediately reflect in the UI with optimistic updates
- **And** streak calculations should update in real-time
- **But** I should NOT be able to edit completions for future dates
- **And** future date habits should show as disabled/non-interactive

### **Visual Design Integration**
- **Given** habits have custom colors and icons (from existing visual customization system)
- **When** displayed in calendar view
- **Then** each habit should maintain its visual identity
- **And** completion animations should work (from existing animation system)
- **And** the view should be responsive across devices

---

## **Technical Implementation Notes**

Based on existing codebase analysis:

### **Frontend Components Needed**
1. **CalendarView Component** (`app/src/features/dashboard/components/CalendarView.tsx`)
   - Weekly grid layout
   - Date navigation controls
   - Integration with existing `HabitCard` component logic
   
2. **CalendarHabitItem Component**
   - Simplified version of `HabitCard` for calendar display
   - Uses existing `CompletionCheckbox` component
   - Respects date restrictions for future dates

3. **WeekNavigator Component**
   - Week selection controls
   - Integration with existing date handling utilities

### **Backend API Integration**
- Leverage existing `/api/trackers/{trackerId}/completions/weekly` endpoint
- Use existing `WeeklyCompletionDto` structure:
  ```csharp
  public class WeeklyCompletionDto {
      public int TrackerId { get; set; }
      public DateTime WeekStartDate { get; set; }
      public DateTime WeekEndDate { get; set; }
      public Dictionary<DateTime, List<CompletionItemDto>> CompletionsByDate { get; set; }
      public int TotalCompletions { get; set; }
      public double CompletionRate { get; set; }
  }
  ```

### **State Management**
- Extend existing `useDashboardProgress` hook for calendar-specific data
- Reuse `useCompletion` hook with date validation for editing restrictions
- Integration with existing event bus system for real-time updates

### **Date Validation Rules**
- **Current date**: Fully editable
- **Past dates**: Fully editable  
- **Future dates**: Read-only, visually disabled
- **Date boundary**: Use `new Date().toISOString().split('T')[0]` comparison

### **Responsive Design**
- Mobile: Stack days vertically, compact habit display
- Tablet: 2-3 day columns with medium habit cards
- Desktop: Full week view with detailed habit information
- Leverage existing responsive utilities from `features/responsive-design/`

### **Animation Integration**
- Use existing `CompletionCelebration` component for completion toggles
- Leverage `PageTransition` for view mode switching
- Apply existing `MicroInteraction` components for hover states

---

## **User Experience Flow**

1. **Discovery**: User sees calendar view toggle next to existing grid/list toggles
2. **Initial Load**: Calendar shows current week with loading skeletons
3. **Navigation**: User can navigate weeks with clear visual feedback
4. **Interaction**: Click habits to toggle completion (past/current dates only)
5. **Feedback**: Immediate visual updates with celebration animations
6. **Constraints**: Future dates clearly marked as non-editable

## **Out of Scope for Current Release**
- Bulk actions/editing multiple habits at once
- Monthly or yearly calendar views  
- Habit scheduling for future dates
- Calendar export functionality
- Custom calendar themes beyond existing color system

---

## **Component Architecture**

### **CalendarView Component Structure**
```typescript
interface CalendarViewProps {
  trackerId: number;
  habits: Habit[];
  onHabitComplete: (habitId: number, date: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  trackerId,
  habits,
  onHabitComplete
}) => {
  const [currentWeek, setCurrentWeek] = useState(getCurrentWeek());
  const { weeklyData, loading } = useWeeklyCompletions(trackerId, currentWeek);
  
  return (
    <div className={styles.calendarView}>
      <WeekNavigator
        currentWeek={currentWeek}
        onWeekChange={setCurrentWeek}
      />
      <CalendarGrid
        weeklyData={weeklyData}
        habits={habits}
        onHabitToggle={onHabitComplete}
        loading={loading}
      />
    </div>
  );
};
```

### **Integration with Existing Dashboard**
- Add calendar option to existing `ViewToggle` component
- Extend `ViewMode` type: `'grid' | 'list' | 'calendar'`
- Reuse existing loading states and error handling

### **Data Flow**
1. Dashboard fetches habits for selected tracker
2. CalendarView requests weekly completion data
3. User interactions trigger optimistic updates
4. Event bus notifies other components of changes
5. Background sync ensures data consistency

---

## **Accessibility Considerations**

- **Keyboard Navigation**: Full keyboard support for date navigation and habit toggling
- **Screen Readers**: Proper ARIA labels and date announcements
- **Focus Management**: Clear focus indicators and logical tab order
- **Date Formatting**: Consistent, localized date formats
- **Status Announcements**: Live regions for completion status changes

## **Testing Strategy**

### **Unit Tests**
- Component rendering with various data states
- Date validation logic
- User interaction handling
- Responsive behavior

### **Integration Tests**
- API integration with weekly completion endpoint
- Event bus communication
- Optimistic update behavior
- Error handling scenarios

### **E2E Tests**
- Complete user workflow from dashboard to calendar view
- Week navigation and habit completion
- Cross-device responsive behavior
- Accessibility compliance

---

## **Performance Considerations**

- **Lazy Loading**: Calendar data loaded on-demand when view is activated
- **Caching**: Implement week-based caching for previously loaded data
- **Virtualization**: Consider for users with many habits (>50)
- **Debouncing**: Prevent excessive API calls during rapid navigation

## **Migration Plan**

1. **Phase 1**: Create CalendarView component infrastructure
2. **Phase 2**: Implement WeekNavigator and basic calendar grid
3. **Phase 3**: Integrate with existing completion system
4. **Phase 4**: Add responsive design and animations
5. **Phase 5**: Testing, accessibility, and performance optimization

---

## **Definition of Done**

- [ ] Calendar view toggle appears in dashboard view options
- [ ] Weekly calendar grid displays current week by default
- [ ] All habits for selected tracker show with completion status
- [ ] Week navigation works (previous/next week)
- [ ] Habit completion can be toggled for past and current dates
- [ ] Future dates are visually disabled and non-interactive
- [ ] Completion changes trigger real-time UI updates
- [ ] Streak calculations update immediately
- [ ] Calendar integrates with existing visual customization (colors/icons)
- [ ] Completion animations work in calendar view
- [ ] View is responsive across mobile, tablet, and desktop
- [ ] Keyboard navigation fully functional
- [ ] Screen reader accessibility implemented
- [ ] Loading states and error handling work properly
- [ ] Component tests cover all major functionality
- [ ] Integration tests verify API communication
- [ ] E2E tests validate complete user workflow

This implementation leverages the robust existing architecture while providing a focused, intuitive calendar interface for habit completion tracking.