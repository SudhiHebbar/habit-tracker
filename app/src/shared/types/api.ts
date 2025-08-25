// API Types for Backend Integration
// Define types for API requests and responses

/**
 * Base API response structure
 */
export interface BaseApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: 'success' | 'error';
  timestamp: string;
}

/**
 * API Error response
 */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  status: 'error';
  timestamp: string;
}

/**
 * Paginated API response
 */
export interface PaginatedApiResponse<T> extends BaseApiResponse<T[]> {
  meta: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

/**
 * Common query parameters for API requests
 */
export interface ApiQueryParams extends Record<string, string | number | undefined> {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

/**
 * Habit-related API types
 */
export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHabitRequest {
  name: string;
  description?: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetCount: number;
}

export interface UpdateHabitRequest extends Partial<CreateHabitRequest> {
  isActive?: boolean;
}

/**
 * Habit tracking API types
 */
export interface HabitEntry {
  id: string;
  habitId: string;
  date: string;
  count: number;
  completed: boolean;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHabitEntryRequest {
  habitId: string;
  date: string;
  count: number;
  note?: string;
}

export interface UpdateHabitEntryRequest
  extends Partial<Omit<CreateHabitEntryRequest, 'habitId'>> {}

/**
 * User-related API types
 */
export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  timezone: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  reminderTime?: string;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse
  extends BaseApiResponse<{
    user: User;
    token: string;
    refreshToken: string;
    expiresAt: string;
  }> {}

/**
 * Statistics and analytics API types
 */
export interface HabitStats {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  totalEntries: number;
  entriesThisWeek: number;
  entriesThisMonth: number;
}

export interface DashboardStats {
  totalHabits: number;
  activeHabits: number;
  completedToday: number;
  currentStreaks: HabitStats[];
  weeklyProgress: Array<{
    date: string;
    completed: number;
    total: number;
  }>;
}
