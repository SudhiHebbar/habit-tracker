# Habit Tracker Application - Product Requirements Document

## Goal
Build a comprehensive habit tracking application that enables users to create multiple habit trackers, manage habits with customizable properties, track daily completions with one-tap functionality, and visualize progress through streaks and analytics. Transform the current empty project into a fully functional web application with modern UI/UX using React 19 with React Bits components for the frontend and .NET 8 Web API with Entity Framework Core for the backend, storing data in Azure SQL Database.

## Why
- **Business Value**: Provides users with a powerful tool to build and maintain positive habits through consistent tracking and visual feedback
- **User Impact**: Helps users achieve personal goals by making habit formation engaging, measurable, and sustainable
- **Integration Potential**: Foundation for future social features, gamification, and cross-device synchronization
- **Problems Solved**: Addresses the challenge of habit formation by providing accountability, visual progress tracking, and motivation through streaks and achievements
- **Target Users**: Individuals seeking personal development, parents monitoring children's habits, teams building shared accountability

## What
A web-based habit tracking application where users can create multiple trackers (containers), add habits with customizable properties (name, description, frequency, color, icon), mark habits as complete through simple interaction, and view progress through streaks and historical data. The application will feature a minimalist, distraction-free design with smooth animations powered by React Bits components.

### Success Criteria
- [ ] Users can create and manage multiple habit trackers with distinct names and purposes
- [ ] Habits can be created with name, description, target frequency, custom color, and icon
- [ ] One-tap/click completion mechanism updates habit status immediately with visual feedback
- [ ] Dashboard displays all habits for selected tracker with daily/weekly view options
- [ ] Streak calculation shows current and longest streaks for motivation
- [ ] Progress history displays monthly calendar view with completion percentage
- [ ] Application performs with <200ms response time for habit completions
- [ ] Responsive design works seamlessly on desktop, tablet, and mobile devices
- [ ] All CRUD operations include proper error handling and user feedback
- [ ] Application passes all linting and type checking without errors

## Tech Stack
- **Frontend**: React 19, React Bits (animated UI components), TypeScript, CSS Modules/Tailwind CSS
- **Backend**: C# .NET 8, ASP.NET Core Web API, Entity Framework Core 8
- **Database**: Azure SQL Database
- **Architecture**: Layered Architecture with Clean Architecture principles
- **Patterns**: Repository Pattern, Unit of Work, DTOs, Dependency Injection
- **Testing**: xUnit (backend), React Testing Library (frontend)
- **Build Tools**: Vite (frontend), MSBuild/.NET CLI (backend)

## Functional Requirements
1. **Tracker Management**: Create, read, update, delete habit trackers
2. **Habit Management**: CRUD operations for habits within trackers
3. **Completion Tracking**: Mark habits as complete/incomplete for specific dates
4. **Tracker Switching**: Seamless navigation between different trackers
5. **Progress Visualization**: Display streaks, completion rates, and historical data
6. **Data Persistence**: All changes immediately saved to database
7. **Customization**: Color and icon selection for visual distinction
8. **Responsive UI**: Adaptive layout for all screen sizes

## Non-Functional Requirements
1. **Performance**: Page load <2s, API responses <500ms, habit completion <200ms
2. **Scalability**: Support 10,000+ habits per user, 1M+ completion records
3. **Reliability**: 99.9% uptime, automatic retry for failed API calls
4. **Security**: Input validation, SQL injection prevention, XSS protection
5. **Usability**: Intuitive UI requiring no documentation, accessibility compliance (WCAG 2.1 AA)
6. **Maintainability**: Clean code architecture, comprehensive test coverage (>80%)
7. **Compatibility**: Support for Chrome, Firefox, Safari, Edge (latest 2 versions)

## Technical Requirements
1. **API Design**: RESTful endpoints following OpenAPI 3.0 specification
2. **Authentication**: Prepared for future OAuth 2.0/JWT implementation
3. **Database**: Normalized schema with proper indexing for performance
4. **Error Handling**: Global exception handling with structured error responses
5. **Logging**: Structured logging with correlation IDs for request tracing
6. **Configuration**: Environment-based configuration (development, staging, production)
7. **CORS**: Properly configured for frontend-backend communication
8. **Validation**: Model validation on both client and server sides
9. **Async Operations**: All I/O operations use async/await patterns
10. **State Management**: React Context/Zustand for global state

## Data Requirements

### Database Schema

#### Trackers Table
```sql
CREATE TABLE Trackers (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    UserId NVARCHAR(450) NULL, -- For future user implementation
    IsShared BIT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    IsActive BIT DEFAULT 1,
    DisplayOrder INT DEFAULT 0
);
CREATE INDEX IX_Trackers_UserId ON Trackers(UserId);
CREATE INDEX IX_Trackers_IsActive ON Trackers(IsActive);
```

#### Habits Table
```sql
CREATE TABLE Habits (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    TrackerId INT NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL,
    TargetFrequency NVARCHAR(20) NOT NULL, -- 'Daily', 'Weekly', 'Custom'
    TargetCount INT DEFAULT 1, -- Times per period
    Color NVARCHAR(7) NOT NULL, -- Hex color code
    Icon NVARCHAR(50) NULL, -- Icon identifier
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    IsActive BIT DEFAULT 1,
    DisplayOrder INT DEFAULT 0,
    CONSTRAINT FK_Habits_Trackers FOREIGN KEY (TrackerId) 
        REFERENCES Trackers(Id) ON DELETE CASCADE
);
CREATE INDEX IX_Habits_TrackerId ON Habits(TrackerId);
CREATE INDEX IX_Habits_IsActive ON Habits(IsActive);
```

#### HabitCompletions Table
```sql
CREATE TABLE HabitCompletions (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    HabitId INT NOT NULL,
    CompletionDate DATE NOT NULL,
    IsCompleted BIT DEFAULT 1,
    Notes NVARCHAR(500) NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    CONSTRAINT FK_HabitCompletions_Habits FOREIGN KEY (HabitId) 
        REFERENCES Habits(Id) ON DELETE CASCADE,
    CONSTRAINT UQ_HabitCompletions_HabitDate UNIQUE(HabitId, CompletionDate)
);
CREATE INDEX IX_HabitCompletions_HabitId ON HabitCompletions(HabitId);
CREATE INDEX IX_HabitCompletions_CompletionDate ON HabitCompletions(CompletionDate);
CREATE INDEX IX_HabitCompletions_HabitId_CompletionDate ON HabitCompletions(HabitId, CompletionDate);
```

#### Streaks Table (Materialized View Pattern)
```sql
CREATE TABLE Streaks (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    HabitId INT NOT NULL UNIQUE,
    CurrentStreak INT DEFAULT 0,
    LongestStreak INT DEFAULT 0,
    LastCompletionDate DATE NULL,
    TotalCompletions INT DEFAULT 0,
    CompletionRate DECIMAL(5,2) DEFAULT 0,
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Streaks_Habits FOREIGN KEY (HabitId) 
        REFERENCES Habits(Id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX IX_Streaks_HabitId ON Streaks(HabitId);
```

## UX Requirements

### Figma Design Reference
**Design URL**: https://c299290be3e64cf3b36350f85c9bb3ff-main.projects.builder.my/

The Figma design file contains the complete visual specifications for the Habit Tracker application, including:
- Component library with all UI elements
- Screen layouts and responsive breakpoints
- Interactive prototypes showing user flows
- Design tokens (colors, typography, spacing)
- Animation specifications for React Bits integration
- Accessibility annotations

**Note**: All UI implementations should follow the Figma designs as the single source of truth for visual specifications. Developers should reference the Figma file for exact measurements, colors, and component behaviors.

### Design System
1. **Color Palette**:
   - Primary: #6366F1 (Indigo for primary actions)
   - Secondary: #8B5CF6 (Purple for accents)
   - Success: #10B981 (Green for completions)
   - Warning: #F59E0B (Amber for streaks at risk)
   - Error: #EF4444 (Red for errors)
   - Background: #FFFFFF (Light mode) / #1F2937 (Dark mode)
   - Surface: #F9FAFB (Light mode) / #374151 (Dark mode)

2. **Typography**:
   - Font Family: Inter, system-ui, -apple-system, sans-serif
   - Headings: 24px-32px, font-weight: 700
   - Body: 14px-16px, font-weight: 400
   - Labels: 12px-14px, font-weight: 500

3. **Spacing & Layout**:
   - Base unit: 4px grid system
   - Container max-width: 1280px
   - Card padding: 16px-24px
   - Component gaps: 8px-16px

### Key UI Components
*All components should be implemented exactly as specified in the Figma design file*

1. **Dashboard View** (Figma: Dashboard Screen):
   - Top navigation bar with tracker selector dropdown per Figma specs
   - Grid/list view toggle following Figma component designs
   - Floating action button styled per Figma FAB component
   - Daily/weekly view selector matching Figma toggle design

2. **Habit Card** (Figma: Habit Card Component):
   - Color-coded left border following Figma color system
   - Icon and habit name layout per Figma card structure
   - Checkbox/tap area with Figma-specified hit zones (animated with React Bits)
   - Streak counter badge styled per Figma badge component
   - Progress ring matching Figma progress indicator designs

3. **Tracker Selector** (Figma: Tracker Dropdown Component):
   - Dropdown styling per Figma dropdown specifications
   - Search functionality UI following Figma search patterns
   - "Create new tracker" option styled per Figma

4. **Habit Creation Modal** (Figma: Create Habit Flow):
   - Step-by-step wizard following Figma flow screens
   - Color picker matching Figma color selector component
   - Icon selector grid per Figma icon picker design
   - Frequency selector styled per Figma form components

5. **Progress Visualization** (Figma: Analytics Screen):
   - Calendar heatmap following Figma calendar component
   - Line chart styled per Figma chart specifications
   - Circular progress indicators matching Figma progress rings
   - Animated transitions per Figma prototype interactions

### Interaction Patterns
1. **Animations** (React Bits):
   - Smooth checkbox animations on completion
   - Confetti or particle effects on streak milestones
   - Slide transitions between views
   - Skeleton loading states

2. **Feedback Mechanisms**:
   - Toast notifications for actions
   - Haptic feedback on mobile (future)
   - Sound effects for completions (optional)
   - Visual progress celebrations

3. **Mobile Responsiveness**:
   - Bottom navigation on mobile
   - Swipe gestures for tracker switching
   - Pull-to-refresh for data sync
   - Thumb-friendly tap targets (min 44px)

## Core Entities

### Tracker
- Serves as a container for related habits
- Maintains display order and active status
- Supports sharing capabilities (future feature)
- Business rules:
  - Name must be unique per user
  - Cannot delete tracker with active habits without confirmation
  - Maximum 50 trackers per user

### Habit
- Represents a single trackable behavior
- Belongs to exactly one tracker
- Defines frequency and visual properties
- Business rules:
  - Name required, max 100 characters
  - Must have valid hex color code
  - Target frequency must be predefined value
  - Cannot have duplicate names within same tracker

### HabitCompletion
- Records completion status for specific date
- Enforces one record per habit per date
- Supports optional notes for context
- Business rules:
  - Cannot have future dates
  - Automatically creates record on first interaction
  - Updates trigger streak recalculation

### Streak
- Materialized calculation of habit consistency
- Updated via database triggers or application logic
- Provides quick access to progress metrics
- Business rules:
  - Current streak resets if day is missed
  - Longest streak never decreases
  - Completion rate = (completions / days since creation) * 100

## Stories

### Epic: Technical Setup

#### User Story: TS-001
**As a** developer  
**I want** to set up the initial project structure  
**So that** I have a solid foundation for building the application

**Acceptance Criteria:**
- [ ] React 19 project created with Vite and TypeScript
- [ ] .NET 8 Web API project created with proper folder structure
- [ ] React Bits components library integrated
- [ ] Azure SQL database connection configured
- [ ] CORS properly configured between frontend and backend
- [ ] Environment configuration files created
- [ ] Git repository initialized with .gitignore

#### User Story: TS-002
**As a** developer  
**I want** to implement the database schema  
**So that** data can be properly stored and retrieved

**Acceptance Criteria:**
- [ ] All tables created with proper constraints
- [ ] Indexes added for performance optimization
- [ ] Entity Framework Core models generated
- [ ] Database migrations created and applied
- [ ] Seed data script created for testing

#### User Story: TS-003
**As a** developer  
**I want** to implement the repository pattern  
**So that** data access is abstracted and testable

**Acceptance Criteria:**
- [ ] Generic repository interface created
- [ ] Repository implementations for each entity
- [ ] Unit of Work pattern implemented
- [ ] Dependency injection configured
- [ ] Basic CRUD operations tested

### Epic: Core Functionality

#### User Story: CF-001
**As a** user  
**I want** to create a new habit tracker  
**So that** I can organize different types of habits

**Acceptance Criteria:**
- [ ] Form UI matches Figma "Create Tracker" modal design
- [ ] Form validates tracker name (required, max 100 chars)
- [ ] Tracker saves to database on submit
- [ ] Success message styled per Figma toast notification
- [ ] New tracker appears in selector dropdown with Figma styling
- [ ] Error messages follow Figma error state designs

#### User Story: CF-002
**As a** user  
**I want** to add habits to my tracker  
**So that** I can define what behaviors I want to track

**Acceptance Criteria:**
- [ ] Habit creation form follows Figma "Add Habit" modal layout
- [ ] Color picker implements Figma color selector component
- [ ] Icon selector matches Figma icon grid design
- [ ] Frequency options styled per Figma radio button group
- [ ] Habit card appears with Figma card component styling
- [ ] Validation errors follow Figma inline error patterns

#### User Story: CF-003
**As a** user  
**I want** to mark habits as complete with one tap  
**So that** tracking is quick and effortless

**Acceptance Criteria:**
- [ ] Checkbox design matches Figma checkbox component specs
- [ ] Tap area follows Figma touch target guidelines (min 44px)
- [ ] Completion animation per Figma interaction prototype
- [ ] Visual feedback follows Figma state transitions
- [ ] Streak counter animation matches Figma specs
- [ ] Toggle states follow Figma component states
- [ ] Offline indicator styled per Figma status component

#### User Story: CF-004
**As a** user  
**I want** to switch between my different trackers  
**So that** I can manage multiple habit categories

**Acceptance Criteria:**
- [ ] Dropdown shows all user's trackers
- [ ] Current tracker clearly indicated
- [ ] Switch completes in <500ms
- [ ] Dashboard updates with new tracker's habits
- [ ] Last selected tracker persists in session

#### User Story: CF-005
**As a** user  
**I want** to edit existing habits  
**So that** I can adjust my goals as needed

**Acceptance Criteria:**
- [ ] Edit button accessible on each habit card
- [ ] Form pre-populates with current values
- [ ] Changes save and reflect immediately
- [ ] History data remains unchanged
- [ ] Can deactivate habit without deleting

#### User Story: CF-006
**As a** user  
**I want** to delete habits I no longer need  
**So that** my dashboard stays relevant

**Acceptance Criteria:**
- [ ] Delete requires confirmation dialog
- [ ] Soft delete maintains historical data
- [ ] Habit removed from dashboard immediately
- [ ] Undo option available for 5 seconds
- [ ] Batch delete for multiple habits

### Epic: User Interface & Experience

#### User Story: UX-001
**As a** user  
**I want** a clean dashboard view  
**So that** I can see all my habits at a glance

**Acceptance Criteria:**
- [ ] Implementation matches Figma dashboard design specifications
- [ ] Grid layout on desktop (3-4 columns) as shown in Figma
- [ ] List layout on mobile (1 column) per Figma mobile views
- [ ] Today's date prominently displayed following Figma typography
- [ ] Completion progress bar styled per Figma components
- [ ] Quick stats (total habits, completions today) positioned per Figma
- [ ] Empty state design matches Figma empty state component

#### User Story: UX-002
**As a** user  
**I want** visual customization for each habit  
**So that** I can quickly identify them

**Acceptance Criteria:**
- [ ] Color palette matches Figma design system colors
- [ ] Icon library implementation follows Figma icon specifications
- [ ] Preview component styled per Figma customization modal
- [ ] Color contrast ratios meet Figma accessibility guidelines
- [ ] Icon sizes follow Figma component size variants

#### User Story: UX-003
**As a** user  
**I want** smooth animations and transitions  
**So that** the app feels responsive and polished

**Acceptance Criteria:**
- [ ] Animations follow Figma prototype interactions and timing
- [ ] Checkbox animations use React Bits components per Figma specs
- [ ] Page transitions match Figma prototype transitions (<300ms)
- [ ] Loading states use Figma skeleton components
- [ ] Micro-interactions implement Figma hover/tap states
- [ ] Animations respect prefers-reduced-motion per Figma guidelines

#### User Story: UX-004
**As a** user  
**I want** the app to work on all my devices  
**So that** I can track habits anywhere

**Acceptance Criteria:**
- [ ] Responsive breakpoints: mobile (<768px), tablet (768-1024px), desktop (>1024px)
- [ ] Touch targets minimum 44px on mobile
- [ ] Text remains readable at all sizes
- [ ] Images and icons scale appropriately
- [ ] Horizontal scrolling prevented

### Epic: Data & Analytics

#### User Story: DA-001
**As a** user  
**I want** to see my current streak for each habit  
**So that** I stay motivated to maintain consistency

**Acceptance Criteria:**
- [ ] Current streak displays on habit card
- [ ] Streak increments after completion
- [ ] Streak resets if day is missed
- [ ] Visual indicator for streaks at risk
- [ ] Celebration animation at milestones (7, 30, 100 days)

#### User Story: DA-002
**As a** user  
**I want** to view my longest streak  
**So that** I can see my best performance

**Acceptance Criteria:**
- [ ] Longest streak shown in habit details
- [ ] Never decreases even if current streak ends
- [ ] Trophy icon for personal records
- [ ] Comparison with current streak
- [ ] Date range of longest streak displayed

#### User Story: DA-003
**As a** user  
**I want** to see a calendar view of my progress  
**So that** I can identify patterns in my behavior

**Acceptance Criteria:**
- [ ] Calendar layout matches Figma calendar component design
- [ ] Completion indicators styled per Figma heatmap specs
- [ ] Color intensity follows Figma color scale system
- [ ] Date interaction follows Figma clickable states
- [ ] Month navigation matches Figma navigation controls
- [ ] Export button styled per Figma button component (future)

#### User Story: DA-004
**As a** user  
**I want** to see my overall completion percentage  
**So that** I can track my general consistency

**Acceptance Criteria:**
- [ ] Percentage calculated since habit creation
- [ ] Weekly, monthly, all-time views
- [ ] Visual progress ring or bar chart
- [ ] Trends indicator (improving/declining)
- [ ] Breakdown by habit category

#### User Story: DA-005
**As a** user  
**I want** detailed statistics for each habit  
**So that** I can analyze my performance deeply

**Acceptance Criteria:**
- [ ] Total completions count
- [ ] Average completions per week
- [ ] Best day of week for completions
- [ ] Time since last completion
- [ ] Graphs showing trends over time

### Epic: Future Development

#### User Story: FD-001
**As a** user  
**I want** to receive reminders for my habits  
**So that** I don't forget to complete them

**Acceptance Criteria:**
- [ ] Set reminder time per habit
- [ ] Multiple reminders per day
- [ ] Push notifications (with permission)
- [ ] Email reminders option
- [ ] Snooze functionality
- [ ] Quiet hours configuration

#### User Story: FD-002
**As a** user  
**I want** to share a tracker with family/friends  
**So that** we can have mutual accountability

**Acceptance Criteria:**
- [ ] Generate shareable link
- [ ] Set view/edit permissions
- [ ] See who else is viewing
- [ ] Collaborative comments
- [ ] Privacy controls
- [ ] Revoke access anytime

#### User Story: FD-003
**As a** user  
**I want** gamification elements  
**So that** tracking habits is more engaging

**Acceptance Criteria:**
- [ ] Unlock badges for achievements
- [ ] Level system based on consistency
- [ ] Daily challenges
- [ ] Leaderboards (opt-in)
- [ ] Virtual rewards/points
- [ ] Achievement sharing on social media

#### User Story: FD-004
**As a** user  
**I want** my data synced across devices  
**So that** I can track habits anywhere

**Acceptance Criteria:**
- [ ] User authentication system
- [ ] Real-time sync with conflict resolution
- [ ] Offline mode with queue
- [ ] Data export/import
- [ ] Account recovery options
- [ ] Data encryption at rest and in transit

## Risks & Mitigations

1. **Performance Degradation with Large Datasets**
   - Risk: Slow loading with thousands of completion records
   - Mitigation: Implement pagination, use materialized views for aggregates, add proper indexes

2. **State Management Complexity**
   - Risk: Complex state updates causing bugs
   - Mitigation: Use established state management library (Zustand/Redux Toolkit), implement optimistic updates carefully

3. **Browser Compatibility Issues**
   - Risk: React 19 features not supported in older browsers
   - Mitigation: Use polyfills, progressive enhancement, clear browser requirements

4. **Database Connection Pool Exhaustion**
   - Risk: Too many concurrent connections in high usage
   - Mitigation: Implement connection pooling, use async/await properly, implement caching layer

5. **Data Loss During Offline Periods**
   - Risk: User loses progress when offline
   - Mitigation: Implement local storage queue, sync on reconnection, show offline indicator

## Constraints & Assumptions

### Constraints
1. Initial version will not include user authentication (single-user mode)
2. Limited to web platform initially (no native mobile apps)
3. English language only in first release
4. Maximum 50 trackers and 500 habits per user
5. Data retention limited to 2 years of history

### Assumptions
1. Users have modern browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)
2. Stable internet connection for real-time updates
3. Azure SQL Database will handle expected load
4. Users understand basic habit tracking concepts
5. Mobile devices have minimum 4GB RAM for smooth performance

## All Needed Context

### Documentation & References
```yaml
# Design Specifications
- url: https://c299290be3e64cf3b36350f85c9bb3ff-main.projects.builder.my/
  why: Figma design file with complete UI/UX specifications and component library
  note: Primary reference for all visual implementations

# Frontend Development
- url: https://reactbits.dev/
  why: React Bits component library documentation for animated UI components
  
- url: https://react.dev/blog/2024/04/25/react-19
  why: React 19 features and migration guide
  
- url: https://vitejs.dev/guide/
  why: Vite configuration for React project setup

- url: https://www.typescriptlang.org/docs/handbook/react.html
  why: TypeScript with React best practices

# Backend Development
- url: https://learn.microsoft.com/en-us/aspnet/core/web-api/?view=aspnetcore-8.0
  why: ASP.NET Core Web API documentation for .NET 8
  
- url: https://learn.microsoft.com/en-us/ef/core/
  why: Entity Framework Core 8 documentation for data access
  
- url: https://learn.microsoft.com/en-us/aspnet/core/tutorials/first-web-api?view=aspnetcore-8.0
  why: Step-by-step Web API creation tutorial

# Database
- url: https://learn.microsoft.com/en-us/azure/azure-sql/database/
  why: Azure SQL Database setup and configuration
  
- url: https://learn.microsoft.com/en-us/ef/core/providers/sql-server/?tabs=dotnet-core-cli
  why: SQL Server provider for Entity Framework Core

# Architecture & Patterns
- file: References/Gotchas/architecture_patterns.md
  why: Layered architecture implementation guidelines and gotchas
  
- file: References/Gotchas/dotnet_gotchas.md
  why: Common .NET pitfalls and their solutions
  
- file: References/Gotchas/react_gotchas.md
  why: React-specific issues and best practices

# Best Practices
- url: https://code-maze.com/aspnetcore-webapi-best-practices/
  why: Comprehensive Web API best practices guide
  
- url: https://medium.com/@solomongetachew112/best-practices-for-using-entity-framework-core-in-asp-net-core-applications-with-net-8-9e4d796c02ac
  why: Entity Framework Core best practices for .NET 8

# Testing
- url: https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests?view=aspnetcore-8.0
  why: Integration testing for ASP.NET Core
  
- url: https://testing-library.com/docs/react-testing-library/intro/
  why: React Testing Library documentation

# State Management
- url: https://zustand-demo.pmnd.rs/
  why: Zustand state management for React (alternative to Redux)

# Performance
- url: https://learn.microsoft.com/en-us/azure/azure-sql/database/performance-guidance?view=azuresql
  why: Azure SQL performance optimization techniques
```

## Areas for Potential Improvement

1. **Progressive Web App (PWA)** - Add service worker for offline functionality and installability
2. **Data Visualization** - Integrate advanced charting library (Chart.js/D3.js) for richer analytics
3. **Habit Templates** - Pre-built habit templates for common goals (fitness, reading, meditation)
4. **Smart Suggestions** - ML-based recommendations for optimal reminder times
5. **Voice Input** - Voice commands for hands-free habit completion
6. **Wearable Integration** - Apple Watch/Wear OS companion apps
7. **Batch Operations** - Bulk edit/complete multiple habits simultaneously
8. **Habit Chains** - Link related habits that should be done together
9. **Export Functionality** - PDF/CSV reports for progress sharing
10. **Theming System** - Multiple theme options beyond light/dark mode
11. **Accessibility** - Screen reader optimization and keyboard navigation improvements
12. **Performance Monitoring** - Application insights and error tracking (Sentry/AppInsights)
13. **A/B Testing** - Feature flags for gradual rollouts
14. **Habit Insights** - AI-powered insights about habit patterns and correlations
15. **Social Features** - Comments, likes, and encouragement between shared tracker users

---

## Implementation Priority

### Phase 1 (MVP) - Weeks 1-4
- Technical setup and database schema
- Basic CRUD for trackers and habits
- Simple completion tracking
- Minimal viable UI with React Bits

### Phase 2 (Core Features) - Weeks 5-8
- Streak calculations
- Calendar view
- Progress visualizations
- Mobile responsiveness

### Phase 3 (Polish) - Weeks 9-10
- Animations and transitions
- Performance optimization
- Error handling improvements
- Testing coverage

### Phase 4 (Future) - Post-MVP
- User authentication
- Reminders
- Sharing capabilities
- Gamification

---

*Generated with comprehensive research including React Bits documentation, .NET 8/EF Core best practices, Azure SQL patterns, and architectural guidelines from the project's reference materials.*