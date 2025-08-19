# Task 015: Streak Calculation System Implementation

## Requirement Reference
- User Story: DA-001

## Task Overview
Implement comprehensive streak calculation system that tracks current and longest streaks for each habit, automatically updates based on completion patterns, provides visual indicators for streaks at risk, and triggers celebration animations for milestone achievements. This includes backend calculation logic, frontend display components, real-time updates, and performance optimization for large datasets.

## Dependent Tasks
- task_003_database_schema_implementation.md (Streak table required)
- task_004_repository_pattern_implementation.md (Data access layer required)
- task_007_habit_completion_tracking.md (Completion tracking required)
- task_013_animations_transitions.md (Celebration animations required)

## Tasks
- Create streak calculation service with business logic
- Implement automatic streak updates on habit completion
- Build streak display components with visual indicators
- Create streak milestone detection and celebration system
- Implement streak risk warnings for missed days
- Add streak analytics and historical tracking
- Create performance optimization for streak calculations
- Implement streak recalculation for frequency changes
- Add comprehensive streak testing and validation
- Create streak export and reporting features

## Current State
```
server\
├── HabitTracker.Infrastructure\
│   └── Repositories\
│       └── StreakRepository.cs (basic implementation)
├── HabitTracker.Domain\
│   └── Entities\
│       └── Streak.cs (entity exists)

app\
├── src\
│   ├── features\
│   │   ├── habit-completion\ (basic completion)
│   │   └── animations\ (celebration system)
```

## Future State
```
server\
├── HabitTracker.Api\
│   └── Controllers\
│       └── StreaksController.cs
├── HabitTracker.Application\
│   ├── Services\
│   │   ├── StreakCalculationService.cs
│   │   ├── StreakAnalyticsService.cs
│   │   └── StreakMilestoneService.cs
│   ├── DTOs\
│   │   ├── StreakResponseDto.cs
│   │   ├── StreakAnalyticsDto.cs
│   │   └── MilestoneAchievementDto.cs
│   └── Interfaces\
│       ├── IStreakCalculationService.cs
│       ├── IStreakAnalyticsService.cs
│       └── IStreakMilestoneService.cs

app\
├── src\
│   ├── features\
│   │   ├── streak-tracking\
│   │   │   ├── components\
│   │   │   │   ├── StreakCounter.tsx
│   │   │   │   ├── StreakBadge.tsx
│   │   │   │   ├── StreakMilestone.tsx
│   │   │   │   ├── StreakRiskWarning.tsx
│   │   │   │   ├── StreakCelebration.tsx
│   │   │   │   ├── StreakHistory.tsx
│   │   │   │   ├── StreakAnalytics.tsx
│   │   │   │   └── LongestStreakDisplay.tsx
│   │   │   ├── hooks\
│   │   │   │   ├── useStreakCalculation.ts
│   │   │   │   ├── useStreakMilestones.ts
│   │   │   │   ├── useStreakAnalytics.ts
│   │   │   │   └── useStreakWarnings.ts
│   │   │   ├── services\
│   │   │   │   ├── streakApi.ts
│   │   │   │   ├── streakCalculator.ts
│   │   │   │   └── milestoneDetector.ts
│   │   │   ├── types\
│   │   │   │   └── streak.types.ts
│   │   │   └── index.ts
│   │   └── (existing features)
├── styles\
│   └── features\
│       └── streak-tracking\
│           ├── StreakCounter.module.css
│           ├── StreakBadge.module.css
│           ├── StreakMilestone.module.css
│           └── StreakCelebration.module.css
```

## Development Workflow
1. Create streak calculation service with business logic
2. Implement automatic streak updates triggered by completions
3. Build streak display components with visual indicators
4. Create milestone detection system with celebration triggers
5. Implement streak risk warning system
6. Add streak analytics and historical data
7. Create performance optimization for large datasets
8. Implement streak recalculation for habit changes
9. Add comprehensive testing for edge cases
10. Create streak export and reporting capabilities

## Data Workflow
- User completes habit, triggering completion API
- Streak calculation service automatically updates streak data
- Current streak incremented if completion maintains consistency
- Longest streak updated if current streak exceeds previous record
- Streak risk calculated based on habit frequency and last completion
- Milestone achievements detected and celebration triggered
- Frontend receives updated streak data and displays changes
- Analytics aggregated for streak insights and trends

## Impacted Components
### Backend (.NET 8 Web API)
- **New**: StreakCalculationService with comprehensive business logic
- **New**: StreakAnalyticsService for streak insights and trends
- **New**: StreakMilestoneService for achievement detection
- **New**: StreaksController with streak API endpoints
- **Enhanced**: StreakRepository with advanced query methods
- **New**: Streak DTOs for API responses and analytics
- **New**: Background service for streak maintenance
- **New**: Streak recalculation for habit modifications

### Frontend (React 19 + TypeScript)
- **New**: StreakCounter displaying current streak with animation
- **New**: StreakBadge showing streak achievements and milestones
- **New**: StreakMilestone component for celebration displays
- **New**: StreakRiskWarning alerting users to potential breaks
- **New**: StreakCelebration with animations for achievements
- **New**: StreakHistory showing historical streak data
- **New**: StreakAnalytics with insights and trends
- **Enhanced**: Habit cards with integrated streak displays

## Implementation Plan
### Backend Implementation Plan
1. **Streak Calculation Service**
   - Create StreakCalculationService with core streak logic
   - Implement CalculateCurrentStreakAsync based on completion history
   - Build UpdateStreakOnCompletionAsync for real-time updates
   - Add RecalculateStreakAsync for habit frequency changes
   - Create ValidateStreakConsistencyAsync for data integrity

2. **Milestone and Analytics Services**
   - Implement StreakMilestoneService for achievement detection
   - Create DetectMilestoneAchievementAsync for celebration triggers
   - Build StreakAnalyticsService for insights and trends
   - Add GetStreakTrendsAsync for analytics calculations
   - Implement GetStreakLeaderboardAsync for motivation

3. **API Endpoints**
   - Create StreaksController with comprehensive endpoints
   - Add GET /api/habits/{habitId}/streak for current streak data
   - Implement GET /api/streaks/analytics/{trackerId} for insights
   - Build POST /api/streaks/recalculate for manual recalculation
   - Add GET /api/streaks/milestones for achievement history

4. **Repository Enhancement**
   - Enhance StreakRepository with performance-optimized queries
   - Add GetStreakWithHistoryAsync for detailed streak data
   - Implement BulkUpdateStreaksAsync for batch operations
   - Create GetStreaksAtRiskAsync for warning calculations
   - Add GetStreakAnalyticsAsync for aggregated insights

5. **Background Processing**
   - Create background service for daily streak maintenance
   - Implement streak risk calculation for all active habits
   - Add streak cleanup for inactive habits
   - Create streak data validation and correction
   - Implement performance monitoring for streak operations

### Frontend Implementation Plan
1. **Core Streak Display Components**
   - Build StreakCounter with animated number display
   - Create StreakBadge showing current and longest streaks
   - Implement LongestStreakDisplay with trophy indicators
   - Add streak visualization with progress indicators
   - Create responsive streak display for different screen sizes

2. **Milestone and Celebration System**
   - Implement StreakMilestone component for achievement display
   - Create StreakCelebration with confetti and animations
   - Build milestone notification system with toast messages
   - Add achievement sharing preparation (social features)
   - Create milestone history and badge collection

3. **Risk Warning System**
   - Build StreakRiskWarning component for missed days
   - Implement risk calculation based on habit frequency
   - Create visual indicators for streaks in danger
   - Add reminder functionality for maintaining streaks
   - Create streak recovery encouragement messages

4. **Analytics and History**
   - Create StreakHistory component with timeline visualization
   - Implement StreakAnalytics with charts and insights
   - Build streak trend analysis with visual graphs
   - Add comparative analytics across habits
   - Create streak performance insights and recommendations

5. **State Management and Hooks**
   - Implement useStreakCalculation hook for real-time updates
   - Create useStreakMilestones hook for achievement tracking
   - Build useStreakAnalytics hook for insights and trends
   - Add useStreakWarnings hook for risk notifications
   - Create streak data caching and optimization

## References
### Implementation Context References
- Streak requirements: Artefacts/requirements.md (lines 451-461)
- Milestone celebrations: Artefacts/requirements.md (line 460)
- Database streak schema: Artefacts/requirements.md (lines 130-145)
- Performance requirements: Artefacts/requirements.md (lines 48-53)

### Document References
- DA-001 acceptance criteria: '../requirements.md'
- Streak calculation business rules: '../requirements.md' (lines 266-273)
- Database schema: '../requirements.md' (lines 130-145)

### External References
- **Habit Formation Psychology**: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3505409/
  - Habit formation research
  - Streak motivation psychology
  - Behavioral reinforcement patterns

- **Gamification Principles**: https://www.interaction-design.org/literature/article/gamification-in-ux-increasing-user-engagement
  - Achievement systems
  - Progress visualization
  - Motivation through milestones

- **Chart.js Documentation**: https://www.chartjs.org/docs/latest/
  - Streak visualization patterns
  - Timeline chart implementation
  - Analytics dashboard design

- **Performance Optimization**: https://learn.microsoft.com/en-us/azure/azure-sql/database/performance-guidance?view=azuresql
  - Database query optimization
  - Aggregation performance
  - Index optimization strategies

## Build Commands
```bash
# Backend development
cd server && dotnet build
cd server && dotnet run --project HabitTracker.Api
cd server && dotnet test --filter "Streak"

# Frontend development
cd app && npm run dev
cd app && npm run build
cd app && npm run test -- streak

# Performance testing
cd server && dotnet test --filter "StreakPerformance"
cd app && npm run test:performance

# Analytics testing
cd server && dotnet test --filter "StreakAnalytics"
cd app && npm run test:analytics

# Integration testing
cd server && dotnet test --filter "Integration"
cd app && npm run test:integration
```

## Implementation Validation Strategy
### Calculation Accuracy Validation
- [ ] **Current Streak**: Accurately calculates current consecutive completion streak
- [ ] **Longest Streak**: Correctly maintains longest streak record
- [ ] **Streak Reset**: Properly resets streak when consistency broken
- [ ] **Frequency Handling**: Correctly handles different habit frequencies
- [ ] **Edge Cases**: Handles timezone changes, leap years, and data gaps

### Performance Validation
- [ ] **Calculation Speed**: Streak calculations complete under 100ms
- [ ] **Bulk Updates**: Efficient batch processing for multiple habits
- [ ] **Database Performance**: Optimized queries for streak data retrieval
- [ ] **Memory Usage**: Efficient memory usage for large datasets
- [ ] **Real-time Updates**: Immediate streak updates after completions

### User Experience Validation
- [ ] **Visual Feedback**: Clear visual indication of current and longest streaks
- [ ] **Milestone Celebrations**: Satisfying animations for achievements
- [ ] **Risk Warnings**: Helpful warnings for streaks at risk
- [ ] **Analytics Insights**: Useful insights from streak data
- [ ] **Responsive Design**: Streak components work on all devices

### Business Logic Validation
- [ ] **Consistency Rules**: Streak calculations follow business requirements
- [ ] **Milestone Detection**: Correct detection of 7, 30, 100+ day milestones
- [ ] **Risk Calculation**: Accurate risk assessment based on frequency
- [ ] **Data Integrity**: Streak data remains consistent during updates
- [ ] **Recalculation**: Correct streak recalculation when habits modified

### Integration Validation
- [ ] **Completion Integration**: Streak updates triggered by habit completions
- [ ] **Dashboard Display**: Streaks display correctly on dashboard
- [ ] **Animation Integration**: Celebrations trigger appropriate animations
- [ ] **Analytics Integration**: Streak data feeds into analytics correctly
- [ ] **Export Integration**: Streak data included in exports and reports

## ToDo Tasks
### Phase 1: Backend Calculation Logic (Day 1)
- [ ] Create StreakCalculationService with core streak business logic
- [ ] Implement CalculateCurrentStreakAsync based on completion patterns
- [ ] Build UpdateStreakOnCompletionAsync for real-time updates
- [ ] Add RecalculateStreakAsync for habit frequency changes
- [ ] Create streak validation and data integrity checks

### Phase 2: Milestone and Analytics Services (Day 1)
- [ ] Implement StreakMilestoneService for achievement detection
- [ ] Create DetectMilestoneAchievementAsync for celebration triggers
- [ ] Build StreakAnalyticsService for insights and trends
- [ ] Add GetStreakTrendsAsync for analytics calculations
- [ ] Enhance StreakRepository with performance-optimized queries

### Phase 3: API Endpoints (Day 2)
- [ ] Create StreaksController with comprehensive endpoints
- [ ] Add GET /api/habits/{habitId}/streak for current data
- [ ] Implement GET /api/streaks/analytics/{trackerId} for insights
- [ ] Build POST /api/streaks/recalculate for manual recalculation
- [ ] Add milestone achievement API endpoints

### Phase 4: Frontend Core Components (Day 2)
- [ ] Build StreakCounter with animated number display
- [ ] Create StreakBadge showing current and longest streaks
- [ ] Implement LongestStreakDisplay with trophy indicators
- [ ] Add StreakRiskWarning for missed days alerts
- [ ] Create responsive streak display components

### Phase 5: Celebration and Milestone System (Day 3)
- [ ] Implement StreakMilestone component for achievements
- [ ] Create StreakCelebration with confetti animations
- [ ] Build milestone notification system with toast messages
- [ ] Add achievement history and badge collection
- [ ] Create milestone sharing preparation hooks

### Phase 6: Analytics and History (Day 3)
- [ ] Create StreakHistory component with timeline visualization
- [ ] Implement StreakAnalytics with charts and insights
- [ ] Build streak trend analysis with visual graphs
- [ ] Add comparative analytics across habits
- [ ] Create performance insights and recommendations

### Phase 7: Testing and Validation (Day 4)
- [ ] Write unit tests for all streak calculation logic
- [ ] Create integration tests for streak updates and completions
- [ ] Test milestone detection and celebration triggers
- [ ] Validate streak risk warnings and accuracy
- [ ] Performance test with large datasets and multiple habits
- [ ] Test streak recalculation for habit frequency changes
- [ ] Validate analytics accuracy and chart visualizations

This task creates a comprehensive streak tracking system that motivates users through visual progress indicators, milestone celebrations, and helpful risk warnings while maintaining high performance and calculation accuracy.