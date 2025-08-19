# Development Workflow

## Project Overview
React 19 + TypeScript habit tracker application with vertical slice architecture and React Bits animated components.

## Quick Start
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests in watch mode
npm test

# Build for production
npm run build
```

## Available Scripts

### Development
- `npm run dev` - Start Vite dev server (hot reload enabled)
- `npm run preview` - Preview production build locally

### Testing
- `npm test` - Run tests in watch mode with Vitest
- `npm run test:run` - Run tests once and exit
- `npm run test:coverage` - Run tests with coverage report

### Code Quality
- `npm run lint` - Check ESLint rules
- `npm run lint:fix` - Fix auto-fixable ESLint issues
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript compiler check

### Production
- `npm run build` - Build for production (includes type checking)

## Architecture

### Folder Structure
```
src/
├── features/          # Feature-based modules (vertical slices)
├── shared/           # Shared components, utilities, types
│   ├── components/   # Reusable UI components
│   ├── utils/        # Utility functions
│   └── types/        # TypeScript type definitions
├── styles/           # Global styles and design system
│   ├── global/       # Global CSS files
│   └── variables/    # CSS custom properties
└── test/            # Test utilities and setup
```

### Import Aliases
- `@/*` - Maps to `src/*`
- `@features/*` - Maps to `src/features/*`
- `@shared/*` - Maps to `src/shared/*`
- `@styles/*` - Maps to `styles/*`

## Component Development

### Creating Components
1. Create component file in appropriate directory
2. Create corresponding `.module.css` file for styles
3. Create `.test.tsx` file for tests
4. Export from `index.ts` barrel file

### Component Structure
```typescript
// Component.tsx
import React from 'react';
import styles from './Component.module.css';

interface ComponentProps {
  // Define props with TypeScript
}

const Component: React.FC<ComponentProps> = ({ ...props }) => {
  return (
    <div className={styles.component}>
      {/* Component JSX */}
    </div>
  );
};

export default Component;
```

### Testing Guidelines
- Use React Testing Library for component tests
- Test user interactions, not implementation details
- Mock external dependencies when needed
- Aim for high coverage on critical paths

### CSS Guidelines
- Use CSS Modules for component styles
- Follow BEM-like naming conventions
- Leverage CSS custom properties for theming
- Use the responsive grid system for layouts

## Development Best Practices

### TypeScript
- Enable strict mode (already configured)
- Use proper typing for all props and state
- Avoid `any` types - use proper interfaces
- Leverage union types for better type safety

### Code Style
- Use ESLint and Prettier (pre-configured)
- Follow React best practices
- Use functional components with hooks
- Implement proper error boundaries

### Performance
- Use React.memo for expensive components
- Implement code splitting for large features
- Optimize bundle size regularly
- Monitor performance metrics

## Build & Deployment

### Bundle Analysis
```bash
# Build and analyze bundle
npm run build
# Check dist/ folder for output files
```

### Environment Variables
- Use `import.meta.env` for Vite environment variables
- Add variables to `.env` files (not committed)
- Type environment variables in `vite-env.d.ts`

## Troubleshooting

### Common Issues
1. **Type errors**: Run `npm run type-check` to identify issues
2. **Test failures**: Check test output and use `npm run test:run` for debugging
3. **Build failures**: Ensure all TypeScript errors are resolved
4. **Hot reload issues**: Restart dev server with `npm run dev`

### Dependencies
- **React 19**: Latest React with concurrent features
- **TypeScript**: Strict mode enabled for better type safety
- **Vite**: Fast development and build tool
- **Vitest**: Testing framework optimized for Vite
- **ESLint + Prettier**: Code quality and formatting

## Next Steps
- Set up API integration layer
- Implement routing with React Router
- Add authentication flow
- Create feature-specific modules
- Set up state management (Context API or Zustand)