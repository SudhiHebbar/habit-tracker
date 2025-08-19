// Dashboard Service - API calls for dashboard data and analytics
import { api } from './api';
import type {
  BaseApiResponse,
  DashboardStats,
  HabitEntry,
  Habit,
} from '../types/api';

/**
 * Dashboard data service
 */
export const dashboardService = {
  // Get comprehensive dashboard statistics
  getDashboardStats: async (): Promise<BaseApiResponse<DashboardStats>> => {
    const response = await api.get<BaseApiResponse<DashboardStats>>('/dashboard/stats');
    return response.data;
  },

  // Get today's habit progress
  getTodayProgress: async (): Promise<BaseApiResponse<{
    habits: Array<Habit & { 
      todayEntry?: HabitEntry; 
      isCompleted: boolean;
      completionPercentage: number;
    }>;
    totalHabits: number;
    completedHabits: number;
    completionRate: number;
  }>> => {
    const response = await api.get<BaseApiResponse<{
      habits: Array<Habit & { 
        todayEntry?: HabitEntry; 
        isCompleted: boolean;
        completionPercentage: number;
      }>;
      totalHabits: number;
      completedHabits: number;
      completionRate: number;
    }>>('/dashboard/today');
    return response.data;
  },

  // Get weekly progress summary
  getWeeklyProgress: async (): Promise<BaseApiResponse<{
    weekDates: string[];
    habitProgress: Array<{
      habitId: string;
      habitName: string;
      weeklyEntries: Array<{
        date: string;
        completed: boolean;
        count: number;
      }>;
      weeklyCompletionRate: number;
    }>;
    overallWeeklyRate: number;
  }>> => {
    const response = await api.get<BaseApiResponse<{
      weekDates: string[];
      habitProgress: Array<{
        habitId: string;
        habitName: string;
        weeklyEntries: Array<{
          date: string;
          completed: boolean;
          count: number;
        }>;
        weeklyCompletionRate: number;
      }>;
      overallWeeklyRate: number;
    }>>('/dashboard/weekly');
    return response.data;
  },

  // Get monthly progress summary
  getMonthlyProgress: async (year?: number, month?: number): Promise<BaseApiResponse<{
    monthDates: string[];
    habitProgress: Array<{
      habitId: string;
      habitName: string;
      monthlyEntries: Array<{
        date: string;
        completed: boolean;
        count: number;
      }>;
      monthlyCompletionRate: number;
    }>;
    overallMonthlyRate: number;
  }>> => {
    const params: Record<string, string> = {};
    if (year) params.year = year.toString();
    if (month) params.month = month.toString();

    const response = await api.get<BaseApiResponse<{
      monthDates: string[];
      habitProgress: Array<{
        habitId: string;
        habitName: string;
        monthlyEntries: Array<{
          date: string;
          completed: boolean;
          count: number;
        }>;
        monthlyCompletionRate: number;
      }>;
      overallMonthlyRate: number;
    }>>('/dashboard/monthly', params);
    return response.data;
  },

  // Get habit completion trends
  getCompletionTrends: async (days: number = 30): Promise<BaseApiResponse<{
    trends: Array<{
      date: string;
      totalHabits: number;
      completedHabits: number;
      completionRate: number;
    }>;
    averageCompletionRate: number;
    trend: 'improving' | 'declining' | 'stable';
  }>> => {
    const response = await api.get<BaseApiResponse<{
      trends: Array<{
        date: string;
        totalHabits: number;
        completedHabits: number;
        completionRate: number;
      }>;
      averageCompletionRate: number;
      trend: 'improving' | 'declining' | 'stable';
    }>>('/dashboard/trends', { days: days.toString() });
    return response.data;
  },

  // Get streak summaries for all habits
  getStreakSummary: async (): Promise<BaseApiResponse<{
    totalActiveStreaks: number;
    longestCurrentStreak: number;
    longestOverallStreak: number;
    habitStreaks: Array<{
      habitId: string;
      habitName: string;
      currentStreak: number;
      longestStreak: number;
      isActive: boolean;
    }>;
  }>> => {
    const response = await api.get<BaseApiResponse<{
      totalActiveStreaks: number;
      longestCurrentStreak: number;
      longestOverallStreak: number;
      habitStreaks: Array<{
        habitId: string;
        habitName: string;
        currentStreak: number;
        longestStreak: number;
        isActive: boolean;
      }>;
    }>>('/dashboard/streaks');
    return response.data;
  },

  // Get category-based habit distribution
  getCategoryStats: async (): Promise<BaseApiResponse<{
    categories: Array<{
      name: string;
      count: number;
      completionRate: number;
      activeHabits: number;
    }>;
    mostPopularCategory: string;
    bestPerformingCategory: string;
  }>> => {
    const response = await api.get<BaseApiResponse<{
      categories: Array<{
        name: string;
        count: number;
        completionRate: number;
        activeHabits: number;
      }>;
      mostPopularCategory: string;
      bestPerformingCategory: string;
    }>>('/dashboard/categories');
    return response.data;
  },
};