# Backend API Integration Guide

## Overview

This document outlines the API integration setup for the Habit Tracker application. The frontend is prepared to connect with a REST API backend that follows specific conventions.

## API Structure

### Base Configuration

- **Base URL**: Configured via `VITE_API_BASE_URL` environment variable
- **Default**: `http://localhost:5000/api`
- **Authentication**: Bearer token-based
- **Content Type**: `application/json`
- **CORS**: Properly configured for cross-origin requests

### API Client

The application uses a centralized API client (`src/shared/services/api.ts`) with:

- Automatic CORS handling
- Token management
- Error handling and response parsing
- Type-safe request/response interfaces

## API Endpoints Expected

### Authentication (`/auth`)

```
POST   /auth/login              - User login
POST   /auth/register           - User registration
POST   /auth/logout             - User logout
POST   /auth/refresh            - Refresh access token
GET    /auth/me                 - Get current user
PUT    /auth/me                 - Update user profile
PUT    /auth/preferences        - Update user preferences
POST   /auth/change-password    - Change password
POST   /auth/forgot-password    - Request password reset
POST   /auth/reset-password     - Reset password with token
```

### Habits (`/habits`)

```
GET    /habits                  - Get user habits (paginated)
POST   /habits                  - Create new habit
GET    /habits/:id              - Get specific habit
PUT    /habits/:id              - Update habit
DELETE /habits/:id              - Delete habit
PATCH  /habits/:id/toggle       - Toggle habit active status
GET    /habits/:id/stats        - Get habit statistics
GET    /habits/stats            - Get all habits statistics
GET    /habits/:id/streak       - Get habit streak info
GET    /habits/:id/entries      - Get habit entries (paginated)
```

### Habit Entries (`/entries`)

```
GET    /entries                 - Get entries by date range
GET    /entries/today           - Get today's entries
POST   /entries                 - Create habit entry
POST   /entries/complete        - Mark habit completed for today
PUT    /entries/:id             - Update habit entry
DELETE /entries/:id             - Delete habit entry
```

### Dashboard (`/dashboard`)

```
GET    /dashboard/stats         - Get dashboard statistics
GET    /dashboard/today         - Get today's progress
GET    /dashboard/weekly        - Get weekly progress
GET    /dashboard/monthly       - Get monthly progress
GET    /dashboard/trends        - Get completion trends
GET    /dashboard/streaks       - Get streak summary
GET    /dashboard/categories    - Get category statistics
```

## Data Models

### Request/Response Format

All API responses follow this structure:

```typescript
{
  data: T,                    // Response payload
  status: 'success' | 'error',
  message?: string,
  timestamp: string
}
```

### Error Format

```typescript
{
  error: {
    code: string,
    message: string,
    details?: unknown
  },
  status: 'error',
  timestamp: string
}
```

### Pagination Format

```typescript
{
  data: T[],
  meta: {
    currentPage: number,
    totalPages: number,
    totalItems: number,
    itemsPerPage: number
  },
  status: 'success',
  timestamp: string
}
```

## Core Data Models

### User
```typescript
{
  id: string,
  email: string,
  username: string,
  firstName?: string,
  lastName?: string,
  timezone: string,
  preferences: {
    theme: 'light' | 'dark' | 'system',
    notifications: boolean,
    reminderTime?: string,
    weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6
  },
  createdAt: string,
  updatedAt: string
}
```

### Habit
```typescript
{
  id: string,
  userId: string,
  name: string,
  description?: string,
  category: string,
  frequency: 'daily' | 'weekly' | 'monthly',
  targetCount: number,
  isActive: boolean,
  createdAt: string,
  updatedAt: string
}
```

### Habit Entry
```typescript
{
  id: string,
  habitId: string,
  date: string,              // ISO date format (YYYY-MM-DD)
  count: number,
  completed: boolean,
  note?: string,
  createdAt: string,
  updatedAt: string
}
```

## Authentication Flow

1. **Login/Register**: Returns JWT token and refresh token
2. **Token Storage**: Tokens stored in localStorage
3. **API Calls**: Bearer token automatically added to requests
4. **Token Refresh**: Automatic refresh on 401 responses
5. **Logout**: Clears tokens and calls logout endpoint

## CORS Configuration

The frontend is configured to handle CORS with:

- **Credentials**: `include` for authenticated requests
- **Allowed Origins**: Environment-based configuration
- **Allowed Methods**: GET, POST, PUT, PATCH, DELETE, OPTIONS
- **Allowed Headers**: Content-Type, Authorization, X-Requested-With

## Environment Variables

Required environment variables:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_TIMEOUT=10000

# Frontend URL (for CORS)
VITE_FRONTEND_URL=http://localhost:5173
```

## Usage Examples

### Authentication
```typescript
import { authService } from '@shared/services';

// Login
const result = await authService.login({ 
  email: 'user@example.com', 
  password: 'password123' 
});

// Get current user
const user = await authService.getCurrentUser();
```

### Habit Management
```typescript
import { habitService } from '@shared/services';

// Create habit
const habit = await habitService.createHabit({
  name: 'Daily Exercise',
  category: 'Health',
  frequency: 'daily',
  targetCount: 1
});

// Mark habit complete
await habitEntryService.markCompleted(habit.data.id);
```

### Dashboard Data
```typescript
import { dashboardService } from '@shared/services';

// Get dashboard stats
const stats = await dashboardService.getDashboardStats();

// Get today's progress
const todayProgress = await dashboardService.getTodayProgress();
```

## Error Handling

The API client includes comprehensive error handling:

- **Network Errors**: Connection failures, timeouts
- **HTTP Errors**: 400, 401, 403, 404, 500 responses
- **Validation Errors**: Field-specific validation messages
- **Authentication Errors**: Automatic token refresh attempts

## Development vs Production

- **Development**: CORS allows localhost origins
- **Production**: Restricted to production domain
- **API URLs**: Environment-specific configuration
- **Error Details**: More verbose in development

## Backend Requirements

To integrate with this frontend, your backend should:

1. Implement all listed endpoints with matching request/response formats
2. Support JWT-based authentication with refresh tokens
3. Handle CORS properly for your deployment setup
4. Use consistent error response formats
5. Support pagination where indicated
6. Validate all input data and return appropriate errors
7. Implement proper timezone handling for dates

## Testing API Integration

1. Set up your backend server
2. Configure `VITE_API_BASE_URL` in `.env.local`
3. Start the frontend development server
4. Test authentication flow
5. Test habit CRUD operations
6. Test dashboard data loading

The frontend includes comprehensive error boundaries and loading states to handle various API scenarios gracefully.