import { useState, useEffect, useCallback } from 'react';
import { completionApi } from '../services/completionApi';
import { useOptimisticCompletion } from './useOptimisticCompletion';
import type {
  HabitCompletion,
  CompletionStatus,
  CompletionStats,
  ToggleCompletionRequest
} from '../types/completion.types';

interface UseCompletionOptions {
  habitId: number;
  date?: string;
  autoFetch?: boolean;
  onToggleSuccess?: (completion: HabitCompletion) => void;
  onToggleError?: (error: Error) => void;
}

export function useCompletion({
  habitId,
  date = new Date().toISOString().split('T')[0],
  autoFetch = true,
  onToggleSuccess,
  onToggleError
}: UseCompletionOptions) {
  const [status, setStatus] = useState<CompletionStatus | null>(null);
  const [stats, setStats] = useState<CompletionStats | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const {
    toggleCompletion: optimisticToggle,
    getOptimisticState,
    hasOptimisticUpdate,
    isLoading: isToggling
  } = useOptimisticCompletion({
    onSuccess: (completion) => {
      // Update local state with new completion data
      if (status) {
        const newLastCompletedDate = completion.isCompleted 
          ? completion.completionDate 
          : status.lastCompletedDate;
        
        const updatedStatus: CompletionStatus = {
          ...status,
          isCompleted: completion.isCompleted,
          currentStreak: completion.currentStreak,
          longestStreak: completion.longestStreak,
        };
        
        if (newLastCompletedDate) {
          updatedStatus.lastCompletedDate = newLastCompletedDate;
        }
        
        setStatus(updatedStatus);
      }
      
      // Refresh both status and stats immediately with cache-busting
      setTimeout(() => {
        fetchStatus(true); // Force refresh status to get latest streak from API
        fetchStats(true);  // Force refresh stats to bypass cache
      }, 100); // Small delay to ensure backend calculations are complete
      
      if (onToggleSuccess) {
        onToggleSuccess(completion);
      }
    },
    onError: onToggleError || undefined
  });

  const fetchStatus = useCallback(async (forceRefresh: boolean = false) => {
    if (!habitId) return;
    
    setIsLoadingStatus(true);
    setError(null);
    
    try {
      const result = await completionApi.getCompletionStatus(habitId, date, forceRefresh);
      setStatus(result);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch completion status:', err);
    } finally {
      setIsLoadingStatus(false);
    }
  }, [habitId, date]);

  const fetchStats = useCallback(async (forceRefresh: boolean = false) => {
    if (!habitId) return;
    
    setIsLoadingStats(true);
    
    try {
      const result = await completionApi.getCompletionStats(habitId, forceRefresh);
      setStats(result);
    } catch (err) {
      console.error('Failed to fetch completion stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  }, [habitId]);

  const toggleCompletion = useCallback(async (request?: ToggleCompletionRequest) => {
    if (!habitId || !status) return;
    
    try {
      await optimisticToggle(habitId, status.isCompleted, request || { date });
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [habitId, status, date, optimisticToggle]);

  const isCompleted = useCallback(() => {
    if (!status) return false;
    return getOptimisticState(habitId, date, status.isCompleted);
  }, [status, habitId, date, getOptimisticState]);

  const isOptimistic = useCallback(() => {
    return hasOptimisticUpdate(habitId, date);
  }, [habitId, date, hasOptimisticUpdate]);

  // Auto-fetch on mount and when habitId/date changes
  useEffect(() => {
    if (autoFetch && habitId) {
      fetchStatus(false); // Don't force refresh on initial load
      fetchStats(false);  // Don't force refresh on initial load
    }
  }, [habitId, date, autoFetch, fetchStatus, fetchStats]);

  return {
    // State
    status,
    stats,
    error,
    
    // Loading states
    isLoadingStatus,
    isLoadingStats,
    isToggling,
    
    // Actions
    toggleCompletion,
    fetchStatus,
    fetchStats,
    
    // Computed values
    isCompleted: isCompleted(),
    isOptimistic: isOptimistic(),
    currentStreak: status?.currentStreak || 0,
    longestStreak: status?.longestStreak || 0,
    completionRate: stats?.completionRate || 0
  };
}