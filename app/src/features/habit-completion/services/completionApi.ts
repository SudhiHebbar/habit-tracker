import { api } from '@/shared/services/api';
import type {
  HabitCompletion,
  ToggleCompletionRequest,
  CompleteHabitRequest,
  BulkCompletionRequest,
  BulkCompletionResponse,
  CompletionStatus,
  CompletionHistory,
  WeeklyCompletions,
  CompletionStats,
} from '../types/completion.types';

const COMPLETION_CACHE = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

class CompletionApiService {
  private getCacheKey(habitId: number, ...params: any[]): string {
    return `completion_${habitId}_${params.join('_')}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = COMPLETION_CACHE.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data as T;
    }
    COMPLETION_CACHE.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    COMPLETION_CACHE.set(key, { data, timestamp: Date.now() });
  }

  private clearHabitCache(habitId: number): void {
    const keysToDelete: string[] = [];
    COMPLETION_CACHE.forEach((_, key) => {
      if (key.includes(`completion_${habitId}_`)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => COMPLETION_CACHE.delete(key));
  }

  async toggleCompletion(
    habitId: number,
    request?: ToggleCompletionRequest
  ): Promise<HabitCompletion> {
    // Clear cache BEFORE making the call to ensure fresh data
    this.clearHabitCache(habitId);

    const response = await api.post<HabitCompletion>(
      `/habits/${habitId}/completions/toggle`,
      request || {}
    );

    // Clear cache again after the call to ensure no stale data
    this.clearHabitCache(habitId);

    return response.data;
  }

  async completeHabit(habitId: number, request: CompleteHabitRequest): Promise<HabitCompletion> {
    const response = await api.post<HabitCompletion>(
      `/habits/${habitId}/completions/complete`,
      request
    );

    // Clear cache for this habit
    this.clearHabitCache(habitId);

    return response.data;
  }

  async getCompletions(
    habitId: number,
    startDate?: string,
    endDate?: string
  ): Promise<HabitCompletion[]> {
    const cacheKey = this.getCacheKey(habitId, startDate, endDate);
    const cached = this.getFromCache<HabitCompletion[]>(cacheKey);
    if (cached) return cached;

    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get<HabitCompletion[]>(
      `/habits/${habitId}/completions${params.toString() ? `?${params}` : ''}`
    );

    this.setCache(cacheKey, response.data);
    return response.data;
  }

  async getCompletionStatus(
    habitId: number,
    date?: string,
    forceRefresh: boolean = false
  ): Promise<CompletionStatus> {
    const cacheKey = this.getCacheKey(habitId, 'status', date);

    if (!forceRefresh) {
      const cached = this.getFromCache<CompletionStatus>(cacheKey);
      if (cached) return cached;
    }

    const params = date ? `?date=${date}` : '';
    const response = await api.get<CompletionStatus>(
      `/habits/${habitId}/completions/status${params}`
    );

    this.setCache(cacheKey, response.data);
    return response.data;
  }

  async getCompletionHistory(habitId: number, page = 1, pageSize = 30): Promise<CompletionHistory> {
    const response = await api.get<CompletionHistory>(
      `/habits/${habitId}/completions/history?page=${page}&pageSize=${pageSize}`
    );
    return response.data;
  }

  async getCompletionStats(
    habitId: number,
    forceRefresh: boolean = false
  ): Promise<CompletionStats> {
    const cacheKey = this.getCacheKey(habitId, 'stats');

    if (!forceRefresh) {
      const cached = this.getFromCache<CompletionStats>(cacheKey);
      if (cached) return cached;
    }

    const response = await api.get<CompletionStats>(`/habits/${habitId}/completions/stats`);

    this.setCache(cacheKey, response.data);
    return response.data;
  }

  async bulkToggleCompletions(request: BulkCompletionRequest): Promise<BulkCompletionResponse> {
    const response = await api.post<BulkCompletionResponse>('/completions/bulk', request);

    // Clear cache for all affected habits
    request.habitIds.forEach(habitId => this.clearHabitCache(habitId));

    return response.data;
  }

  async getWeeklyCompletions(
    trackerId: number,
    weekStartDate?: string
  ): Promise<WeeklyCompletions> {
    const params = weekStartDate ? `?weekStartDate=${weekStartDate}` : '';
    const response = await api.get<WeeklyCompletions>(
      `/trackers/${trackerId}/completions/weekly${params}`
    );
    return response.data;
  }

  // Optimistic update support
  async toggleCompletionOptimistic(
    habitId: number,
    request?: ToggleCompletionRequest,
    onOptimisticUpdate?: (completion: Partial<HabitCompletion>) => void,
    onRollback?: () => void
  ): Promise<HabitCompletion> {
    // Immediately call optimistic update
    if (onOptimisticUpdate) {
      const optimisticCompletion: Partial<HabitCompletion> = {
        habitId,
        completionDate: request?.date || new Date().toISOString(),
        isCompleted: true, // Will be toggled
      };

      if (request?.notes) {
        optimisticCompletion.notes = request.notes;
      }

      onOptimisticUpdate(optimisticCompletion);
    }

    try {
      const result = await this.toggleCompletion(habitId, request);
      return result;
    } catch (error) {
      // Rollback on error
      if (onRollback) {
        onRollback();
      }
      throw error;
    }
  }

  // Retry logic for failed requests
  async retryToggleCompletion(
    habitId: number,
    request?: ToggleCompletionRequest,
    maxRetries = 3,
    delay = 1000
  ): Promise<HabitCompletion> {
    let lastError: any;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.toggleCompletion(habitId, request);
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    }

    throw lastError;
  }

  // Request deduplication
  private pendingRequests = new Map<string, Promise<any>>();

  async toggleCompletionDeduped(
    habitId: number,
    request?: ToggleCompletionRequest
  ): Promise<HabitCompletion> {
    const key = `toggle_${habitId}_${request?.date || 'today'}`;

    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    const promise = this.toggleCompletion(habitId, request).finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }
}

export const completionApi = new CompletionApiService();
export default completionApi;
