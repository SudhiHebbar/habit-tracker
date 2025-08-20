// Core habit types that match the backend DTOs

export type HabitFrequency = 'Daily' | 'Weekly' | 'Custom';
export type FrequencyType = HabitFrequency;

export interface Habit {
  id: number;
  trackerId: number;
  name: string;
  description?: string;
  targetFrequency: HabitFrequency;
  targetCount: number;
  color: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  displayOrder: number;
  
  // Computed properties from backend
  currentStreak?: number;
  longestStreak?: number;
  lastCompletedDate?: string;
  completionsThisWeek: number;
  completionsThisMonth: number;
}

export interface CreateHabitRequest {
  name: string;
  description?: string;
  targetFrequency: HabitFrequency;
  targetCount: number;
  color: string;
  icon?: string;
  displayOrder: number;
}

export interface UpdateHabitRequest {
  name: string;
  description?: string;
  targetFrequency: HabitFrequency;
  targetCount: number;
  color: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface HabitOrderUpdate {
  habitId: number;
  displayOrder: number;
}

export interface HabitValidationResponse {
  isValid: boolean;
}

export interface HabitStatsByFrequency {
  [frequency: string]: number;
}

// Form types for habit creation/editing wizard
export interface HabitFormData {
  basicInfo: {
    name: string;
    description?: string;
  };
  customization: {
    color: string;
    icon?: string;
  };
  frequency: {
    targetFrequency: HabitFrequency;
    targetCount: number;
  };
}

export interface HabitWizardStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  isValid: boolean;
  isCompleted: boolean;
}

// Color palette for habit customization
export interface ColorOption {
  hex: string;
  name: string;
  category: 'primary' | 'secondary' | 'accent' | 'neutral';
}

// Icon options for habit customization
export interface IconOption {
  id: string;
  name: string;
  svg: string;
  category: 'health' | 'learning' | 'work' | 'lifestyle' | 'nature' | 'misc';
}

// Custom frequency configuration
export interface CustomFrequency {
  timesPerWeek: number;
  specificDays: number[]; // 0=Sunday, 1=Monday, etc.
  timesPerMonth: number | null;
}

// Frequency configuration options
export interface FrequencyOption {
  value: HabitFrequency;
  label: string;
  description: string;
  defaultTargetCount: number;
  maxTargetCount: number;
}

// Habit filtering and sorting
export interface HabitFilter {
  frequency?: HabitFrequency;
  color?: string;
  searchQuery?: string;
  isActive?: boolean;
  hasIcon?: boolean;
}

export interface HabitSortOption {
  field: 'name' | 'createdAt' | 'updatedAt' | 'displayOrder' | 'frequency' | 'targetCount';
  direction: 'asc' | 'desc';
}

// Habit completion types (for future use)
export interface HabitCompletion {
  id: number;
  habitId: number;
  completionDate: string;
  isCompleted: boolean;
  notes?: string;
}

// Error types specific to habit operations
export interface HabitError {
  type: 'validation' | 'network' | 'permission' | 'not_found' | 'limit_exceeded';
  message: string;
  field?: string;
}

// Analytics and progress types
export interface HabitProgress {
  habitId: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number; // percentage
  totalCompletions: number;
  weeklyProgress: number[];
  monthlyProgress: number[];
}

export interface HabitAnalytics {
  totalHabits: number;
  activeHabits: number;
  completionsByFrequency: HabitStatsByFrequency;
  averageStreakLength: number;
  mostCompletedHabit?: Habit;
  longestStreakHabit?: Habit;
}