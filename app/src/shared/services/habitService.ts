// Habit Service - API calls for habit management
import { api } from './api';
import type {
  BaseApiResponse,
  PaginatedApiResponse,
  Habit,
  CreateHabitRequest,
  UpdateHabitRequest,
  HabitEntry,
  CreateHabitEntryRequest,
  UpdateHabitEntryRequest,
  HabitStats,
  ApiQueryParams,
} from '../types/api';

/**
 * Habit CRUD operations
 */
export const habitService = {
  // Get all habits for the current user
  getHabits: async (params?: ApiQueryParams): Promise<PaginatedApiResponse<Habit>> => {
    const response = await api.get<PaginatedApiResponse<Habit>>('/habits', params);
    return response.data;
  },

  // Get a specific habit by ID
  getHabit: async (id: string): Promise<BaseApiResponse<Habit>> => {
    const response = await api.get<BaseApiResponse<Habit>>(`/habits/${id}`);
    return response.data;
  },

  // Create a new habit
  createHabit: async (habitData: CreateHabitRequest): Promise<BaseApiResponse<Habit>> => {
    const response = await api.post<BaseApiResponse<Habit>>('/habits', habitData);
    return response.data;
  },

  // Update an existing habit
  updateHabit: async (id: string, habitData: UpdateHabitRequest): Promise<BaseApiResponse<Habit>> => {
    const response = await api.put<BaseApiResponse<Habit>>(`/habits/${id}`, habitData);
    return response.data;
  },

  // Delete a habit
  deleteHabit: async (id: string): Promise<BaseApiResponse<null>> => {
    const response = await api.delete<BaseApiResponse<null>>(`/habits/${id}`);
    return response.data;
  },

  // Toggle habit active status
  toggleHabitStatus: async (id: string): Promise<BaseApiResponse<Habit>> => {
    const response = await api.patch<BaseApiResponse<Habit>>(`/habits/${id}/toggle`);
    return response.data;
  },
};

/**
 * Habit entry tracking operations
 */
export const habitEntryService = {
  // Get entries for a specific habit
  getHabitEntries: async (
    habitId: string, 
    params?: ApiQueryParams & { startDate?: string; endDate?: string }
  ): Promise<PaginatedApiResponse<HabitEntry>> => {
    const response = await api.get<PaginatedApiResponse<HabitEntry>>(
      `/habits/${habitId}/entries`, 
      params
    );
    return response.data;
  },

  // Get entries for a specific date range (all habits)
  getEntriesForDateRange: async (
    startDate: string, 
    endDate: string, 
    params?: ApiQueryParams
  ): Promise<PaginatedApiResponse<HabitEntry>> => {
    const response = await api.get<PaginatedApiResponse<HabitEntry>>(
      '/entries', 
      { ...params, startDate, endDate }
    );
    return response.data;
  },

  // Get entries for today
  getTodayEntries: async (): Promise<BaseApiResponse<HabitEntry[]>> => {
    const response = await api.get<BaseApiResponse<HabitEntry[]>>('/entries/today');
    return response.data;
  },

  // Create a new habit entry
  createEntry: async (entryData: CreateHabitEntryRequest): Promise<BaseApiResponse<HabitEntry>> => {
    const response = await api.post<BaseApiResponse<HabitEntry>>('/entries', entryData);
    return response.data;
  },

  // Update a habit entry
  updateEntry: async (id: string, entryData: UpdateHabitEntryRequest): Promise<BaseApiResponse<HabitEntry>> => {
    const response = await api.put<BaseApiResponse<HabitEntry>>(`/entries/${id}`, entryData);
    return response.data;
  },

  // Delete a habit entry
  deleteEntry: async (id: string): Promise<BaseApiResponse<null>> => {
    const response = await api.delete<BaseApiResponse<null>>(`/entries/${id}`);
    return response.data;
  },

  // Mark habit as completed for today
  markCompleted: async (habitId: string, count: number = 1, note?: string): Promise<BaseApiResponse<HabitEntry>> => {
    const today = new Date().toISOString().split('T')[0];
    const entryData: CreateHabitEntryRequest = {
      habitId,
      date: today,
      count,
    };
    
    if (note) {
      entryData.note = note;
    }
    
    const response = await api.post<BaseApiResponse<HabitEntry>>('/entries/complete', entryData);
    return response.data;
  },
};

/**
 * Habit statistics and analytics
 */
export const habitStatsService = {
  // Get stats for a specific habit
  getHabitStats: async (habitId: string): Promise<BaseApiResponse<HabitStats>> => {
    const response = await api.get<BaseApiResponse<HabitStats>>(`/habits/${habitId}/stats`);
    return response.data;
  },

  // Get stats for all user habits
  getAllHabitStats: async (): Promise<BaseApiResponse<HabitStats[]>> => {
    const response = await api.get<BaseApiResponse<HabitStats[]>>('/habits/stats');
    return response.data;
  },

  // Get streak information for a habit
  getHabitStreak: async (habitId: string): Promise<BaseApiResponse<{
    currentStreak: number;
    longestStreak: number;
    streakDates: string[];
  }>> => {
    const response = await api.get<BaseApiResponse<{
      currentStreak: number;
      longestStreak: number;
      streakDates: string[];
    }>>(`/habits/${habitId}/streak`);
    return response.data;
  },
};