export interface HabitCompletion {
  id: number;
  habitId: number;
  completionDate: string;
  isCompleted: boolean;
  notes?: string;
  currentStreak: number;
  longestStreak: number;
  updatedAt: string;
}

export interface ToggleCompletionRequest {
  date?: string;
  notes?: string;
}

export interface CompleteHabitRequest {
  date: string;
  isCompleted: boolean;
  notes?: string;
}

export interface BulkCompletionRequest {
  habitIds: number[];
  date: string;
  notes?: string;
}

export interface BulkCompletionResponse {
  completions: HabitCompletion[];
  successCount: number;
  failureCount: number;
  errors: string[];
}

export interface CompletionStatus {
  habitId: number;
  date: string;
  isCompleted: boolean;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string;
}

export interface CompletionHistory {
  habitId: number;
  completions: HabitCompletion[];
  totalCompletions: number;
  completionRate: number;
  currentPage: number;
  totalPages: number;
}

export interface WeeklyCompletions {
  trackerId: number;
  weekStartDate: string;
  weekEndDate: string;
  completionsByDate: Record<string, CompletionItem[]>;
  totalCompletions: number;
  completionRate: number;
}

export interface CompletionItem {
  habitId: number;
  habitName: string;
  habitColor: string;
  habitIcon?: string;
  isCompleted: boolean;
}

export interface CompletionStats {
  habitId: number;
  totalCompletions: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  firstCompletionDate?: string;
  lastCompletionDate?: string;
  completionsByDayOfWeek: Record<number, number>;
}

export interface CompletionError {
  habitId: number;
  error: string;
  timestamp: number;
}

export interface OptimisticUpdate {
  habitId: number;
  date: string;
  previousState: boolean;
  newState: boolean;
  timestamp: number;
}

export interface OfflineQueueItem {
  id: string;
  type: 'toggle' | 'complete' | 'bulk';
  habitId?: number;
  data: any;
  timestamp: number;
  retryCount: number;
}