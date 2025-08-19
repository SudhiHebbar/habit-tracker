# Task 001: React Project Setup with TypeScript and React Bits

## Requirement Reference
- User Story: TS-001 (Part 1 - Frontend)

## Task Overview
Set up the React 19 frontend project with TypeScript, Vite, React Bits animated components, and implement the vertical slice architecture foundation. This task establishes the frontend development environment with proper tooling, linting, testing framework, and initial project structure following the design specifications.

## Dependent Tasks
- None (This is a foundational task)

## Tasks
- Create React 19 project with Vite and TypeScript in strict mode
- Configure React Bits animated UI components library
- Set up vertical slice architecture folder structure
- Implement CSS Modules with dedicated styles directory
- Configure ESLint, Prettier, and TypeScript strict mode
- Set up Vitest and React Testing Library
- Create environment configuration files
- Implement design system foundation with CSS custom properties
- Set up build and development scripts
- Configure CORS for backend communication

## Current State
```
D:\Project\18_HabitTracker\
├── Artefacts\
│   ├── design.md
│   ├── requirements.md
│   └── Tasks\
├── References\
│   ├── Build\
│   ├── Gotchas\
│   └── UX\
├── Templates\
└── specifications.md
```

## Future State
```
D:\Project\18_HabitTracker\
├── app\                                    # React Frontend
│   ├── src\
│   │   ├── features\                       # Feature slices
│   │   │   ├── tracker-management\
│   │   │   │   ├── components\
│   │   │   │   ├── hooks\
│   │   │   │   ├── services\
│   │   │   │   ├── types\
│   │   │   │   └── index.ts
│   │   │   ├── habit-management\
│   │   │   │   ├── components\
│   │   │   │   ├── hooks\
│   │   │   │   ├── services\
│   │   │   │   ├── types\
│   │   │   │   └── index.ts
│   │   │   └── dashboard\
│   │   │       ├── components\
│   │   │       ├── hooks\
│   │   │       ├── services\
│   │   │       ├── types\
│   │   │       └── index.ts
│   │   ├── shared\                         # Shared utilities
│   │   │   ├── components\
│   │   │   ├── hooks\
│   │   │   ├── services\
│   │   │   ├── types\
│   │   │   └── utils\
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── styles\                             # Centralized styles
│   │   ├── features\
│   │   │   ├── tracker-management\
│   │   │   ├── habit-management\
│   │   │   └── dashboard\
│   │   ├── shared\
│   │   │   ├── components\
│   │   │   └── layouts\
│   │   └── global\
│   │       ├── variables.css
│   │       ├── reset.css
│   │       └── themes.css
│   ├── public\
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── eslint.config.js
│   ├── .env.development
│   ├── .env.production
│   └── vitest.config.ts
├── server\                                 # .NET Backend (future task)
├── Artefacts\
├── References\
└── Templates\
```

## Development Workflow
1. Initialize React project with Vite template
2. Configure TypeScript in strict mode
3. Install and configure React Bits components
4. Set up vertical slice architecture structure
5. Implement CSS Modules and design system
6. Configure development tooling (ESLint, Prettier)
7. Set up testing framework (Vitest + React Testing Library)
8. Create environment configuration
9. Implement basic App shell and routing foundation
10. Validate build and development processes

## Data Workflow
- Frontend will communicate with backend API via HTTP requests
- Environment variables for API base URL configuration
- CORS configuration for cross-origin requests to backend
- State management using React Context API with useReducer
- Type-safe API contracts using TypeScript interfaces

## Impacted Components
### Frontend (React 19 + TypeScript)
- **New**: Complete React project structure
- **New**: Vite configuration with TypeScript
- **New**: React Bits component integration
- **New**: Vertical slice architecture foundation
- **New**: CSS Modules setup with design system
- **New**: Development tooling configuration
- **New**: Testing framework setup
- **New**: Environment configuration files

## Implementation Plan
### Frontend Implementation Plan
1. **Project Initialization**
   - Create React app with Vite template: `npm create vite@latest app --template react-ts`
   - Navigate to app directory and install dependencies
   - Configure TypeScript strict mode in tsconfig.json

2. **React Bits Integration**
   - Install React Bits: `npm install react-bits`
   - Configure React Bits in vite.config.ts
   - Create sample animated component to validate integration

3. **Architecture Setup**
   - Create vertical slice folder structure for features
   - Set up shared utilities and components structure
   - Create barrel exports (index.ts) for clean module interfaces
   - Implement feature-based co-location pattern

4. **Styling Foundation**
   - Create dedicated styles directory structure
   - Implement CSS Modules configuration
   - Set up design system with CSS custom properties
   - Create global styles (reset, variables, themes)
   - Implement responsive breakpoints and design tokens

5. **Development Tooling**
   - Configure ESLint with React and TypeScript rules
   - Set up Prettier for code formatting
   - Configure VS Code settings for consistent development
   - Set up pre-commit hooks (future enhancement)

6. **Testing Framework**
   - Install and configure Vitest
   - Set up React Testing Library
   - Configure test utilities and helpers
   - Create sample component tests to validate setup

7. **Environment Configuration**
   - Create .env files for different environments
   - Configure environment variables for API URLs
   - Set up type-safe environment variable access

8. **App Shell Creation**
   - Implement basic App.tsx with routing foundation
   - Create main layout components
   - Set up error boundary for error handling
   - Implement loading states and suspense boundaries

9. **Build Configuration**
   - Optimize Vite build configuration
   - Configure bundle splitting for performance
   - Set up build scripts for different environments
   - Configure asset optimization

## References
### Implementation Context References
- Design specifications: Artefacts/design.md (sections 100-200)
- Vertical slice architecture patterns: References/Gotchas/architecture_patterns.md
- React-specific gotchas: References/Gotchas/react_gotchas.md
- Frontend best practices: References/Gotchas/frontend_best_practices.md

### Document References
- Main design document: '../design.md'
- Requirements document: '../requirements.md'
- React configuration reference: '../References/Build/react_config.yaml'

### External References
- **React Bits Documentation**: https://reactbits.dev/
  - Component API and customization options
  - Integration patterns with React 19
  - Animation and interaction examples

- **React 19 Features**: https://react.dev/blog/2024/04/25/react-19
  - New concurrent features and performance improvements
  - Server Components and streaming capabilities
  - Enhanced developer experience

- **Vite Configuration**: https://vitejs.dev/guide/
  - Build tool setup and optimization
  - Development server configuration
  - Bundle splitting strategies

- **TypeScript React Handbook**: https://www.typescriptlang.org/docs/handbook/react.html
  - Type definitions for React components
  - Props typing and event handling
  - Advanced TypeScript patterns

- **CSS Modules Guide**: https://github.com/css-modules/css-modules
  - Scoped styling implementation
  - Class name generation and usage
  - Integration with TypeScript

## Build Commands
```bash
# Development server
cd app && npm run dev

# Build for production
cd app && npm run build

# Run tests
cd app && npm run test

# Run tests with coverage
cd app && npm run test:coverage

# Lint code
cd app && npm run lint

# Format code
cd app && npm run format

# Type check
cd app && npm run type-check

# Preview production build
cd app && npm run preview
```

## Implementation Validation Strategy
### Architecture Validation
- [ ] **Vertical Slice Structure**: Each feature contains components, hooks, services, and types
- [ ] **Clean Interfaces**: Barrel exports provide clean public APIs
- [ ] **No Circular Dependencies**: Feature modules don't create circular references
- [ ] **Separation of Concerns**: Shared utilities separate from feature-specific code

### Code Quality Gates
- [ ] **TypeScript Strict Mode**: No any types, all interfaces properly defined
- [ ] **ESLint Zero Warnings**: All linting rules pass without issues
- [ ] **Build Success**: Production build completes without errors
- [ ] **Bundle Size**: Initial bundle under 300KB gzipped
- [ ] **Performance**: First Contentful Paint under 2 seconds

### React Bits Integration
- [ ] **Component Library**: React Bits components render correctly
- [ ] **Animation Performance**: Smooth animations at 60fps
- [ ] **TypeScript Support**: React Bits types work with strict TypeScript
- [ ] **Build Integration**: React Bits bundles correctly with Vite

### Testing Foundation
- [ ] **Test Runner**: Vitest executes tests successfully
- [ ] **Component Testing**: React Testing Library renders components
- [ ] **Coverage Setup**: Code coverage reports generate correctly
- [ ] **Mock Support**: API mocking works for component tests

### Development Experience
- [ ] **Hot Reload**: Changes reflect immediately in development
- [ ] **Type Checking**: TypeScript errors show in real-time
- [ ] **Linting Integration**: ESLint warnings appear in IDE
- [ ] **Debugging**: React DevTools work correctly

## ToDo Tasks
### Phase 1: Core Setup (Day 1)
- [X] Initialize React project with Vite and TypeScript
- [X] Configure TypeScript strict mode settings
- [X] Install React Bits and validate basic integration
- [X] Create vertical slice architecture folder structure
- [X] Set up CSS Modules configuration

### Phase 2: Development Environment (Day 1)
- [X] Configure ESLint with React and TypeScript rules
- [X] Set up Prettier for consistent formatting
- [X] Install and configure Vitest testing framework
- [X] Set up React Testing Library with custom render utilities
- [X] Create environment configuration files

### Phase 3: Foundation Implementation (Day 2)
- [X] Implement design system with CSS custom properties
- [X] Create global styles (reset, variables, themes)
- [ ] Set up responsive breakpoints and grid system
- [ ] Implement basic App shell with error boundaries
- [ ] Create shared component foundation

### Phase 4: Validation & Testing (Day 2)
- [ ] Create sample components using React Bits
- [ ] Write component tests to validate testing setup
- [X] Test build process for all environments
- [ ] Validate bundle size and performance metrics
- [ ] Document development workflow and commands

### Phase 5: Integration Preparation (Day 3)
- [ ] Set up API service foundation for backend integration
- [ ] Configure CORS handling for cross-origin requests
- [X] Implement type-safe environment variable access
- [ ] Create routing foundation for future pages
- [ ] Prepare for backend API integration

This task establishes a production-ready React frontend foundation that follows modern development practices and architectural patterns while providing excellent developer experience and performance.