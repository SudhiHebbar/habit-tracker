import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { streakApi, streakQueryKeys } from '../services/streakApi';
import type { StreakResponse } from '../types/streak.types';
import { useToast } from '@shared/hooks/useToast';

export function useStreakCalculation(habitId?: number) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Get streak for a specific habit
  const {
    data: streak,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: habitId ? streakQueryKeys.byHabit(habitId) : ['streaks', 'empty'],
    queryFn: () => (habitId ? streakApi.getStreakByHabitId(habitId) : Promise.resolve(null)),
    enabled: habitId !== undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Recalculate streak mutation
  const recalculateStreak = useMutation({
    mutationFn: (targetHabitId: number) => streakApi.recalculateStreak(targetHabitId),
    onSuccess: (updatedStreak, targetHabitId) => {
      // Update the cache with new streak data
      queryClient.setQueryData(streakQueryKeys.byHabit(targetHabitId), updatedStreak);

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: streakQueryKeys.all,
      });

      showToast({
        type: 'success',
        message: 'Streak recalculated successfully',
      });
    },
    onError: error => {
      console.error('Failed to recalculate streak:', error);
      showToast({
        type: 'error',
        message: 'Failed to recalculate streak',
      });
    },
  });

  // Validate streak consistency
  const validateStreak = useMutation({
    mutationFn: (targetHabitId: number) => streakApi.validateStreakConsistency(targetHabitId),
    onSuccess: result => {
      showToast({
        type: result.isConsistent ? 'success' : 'warning',
        message: result.isConsistent
          ? 'Streak data is consistent'
          : 'Streak data inconsistency detected',
      });
    },
    onError: error => {
      console.error('Failed to validate streak:', error);
      showToast({
        type: 'error',
        message: 'Failed to validate streak',
      });
    },
  });

  // Update streak in cache (useful when receiving updates from completion events)
  const updateStreakInCache = useCallback(
    (updatedStreak: StreakResponse) => {
      queryClient.setQueryData(streakQueryKeys.byHabit(updatedStreak.habitId), updatedStreak);
    },
    [queryClient]
  );

  // Invalidate streak data (force refresh)
  const invalidateStreak = useCallback(
    (targetHabitId: number) => {
      queryClient.invalidateQueries({
        queryKey: streakQueryKeys.byHabit(targetHabitId),
      });
    },
    [queryClient]
  );

  // Get cached streak data without triggering a fetch
  const getCachedStreak = useCallback(
    (targetHabitId: number) => {
      return queryClient.getQueryData<StreakResponse>(streakQueryKeys.byHabit(targetHabitId));
    },
    [queryClient]
  );

  // Prefetch streak data
  const prefetchStreak = useCallback(
    (targetHabitId: number) => {
      return queryClient.prefetchQuery({
        queryKey: streakQueryKeys.byHabit(targetHabitId),
        queryFn: () => streakApi.getStreakByHabitId(targetHabitId),
        staleTime: 5 * 60 * 1000,
      });
    },
    [queryClient]
  );

  return {
    // Data
    streak,
    isLoading,
    error,

    // Actions
    refetch,
    recalculateStreak: recalculateStreak.mutate,
    validateStreak: validateStreak.mutate,
    updateStreakInCache,
    invalidateStreak,
    getCachedStreak,
    prefetchStreak,

    // Mutation states
    isRecalculating: recalculateStreak.isPending,
    isValidating: validateStreak.isPending,
    recalculateError: recalculateStreak.error,
    validateError: validateStreak.error,
  };
}

// Hook for multiple streaks by tracker
export function useTrackerStreaks(trackerId?: number) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const {
    data: streaks,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: trackerId ? streakQueryKeys.byTracker(trackerId) : ['streaks', 'tracker', 'empty'],
    queryFn: () => (trackerId ? streakApi.getStreaksByTracker(trackerId) : Promise.resolve([])),
    enabled: trackerId !== undefined,
    staleTime: 3 * 60 * 1000, // 3 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Recalculate all streaks for tracker
  const recalculateAllStreaks = useMutation({
    mutationFn: (targetTrackerId: number) => streakApi.recalculateAllStreaks(targetTrackerId),
    onSuccess: (updatedStreaks, targetTrackerId) => {
      queryClient.setQueryData(streakQueryKeys.byTracker(targetTrackerId), updatedStreaks);

      // Also update individual streak caches
      updatedStreaks.forEach(streak => {
        queryClient.setQueryData(streakQueryKeys.byHabit(streak.habitId), streak);
      });

      queryClient.invalidateQueries({
        queryKey: streakQueryKeys.all,
      });

      showToast({
        type: 'success',
        message: `Recalculated ${updatedStreaks.length} streaks`,
      });
    },
    onError: error => {
      console.error('Failed to recalculate all streaks:', error);
      showToast({
        type: 'error',
        message: 'Failed to recalculate streaks',
      });
    },
  });

  return {
    streaks: streaks || [],
    isLoading,
    error,
    refetch,
    recalculateAllStreaks: recalculateAllStreaks.mutate,
    isRecalculatingAll: recalculateAllStreaks.isPending,
    recalculateAllError: recalculateAllStreaks.error,
  };
}

// Hook for streaks at risk
export function useStreaksAtRisk(trackerId?: number, warningDays: number = 1) {
  return useQuery({
    queryKey: trackerId
      ? streakQueryKeys.atRisk(trackerId, warningDays)
      : ['streaks', 'at-risk', 'empty'],
    queryFn: () =>
      trackerId ? streakApi.getStreaksAtRisk(trackerId, warningDays) : Promise.resolve([]),
    enabled: trackerId !== undefined,
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent updates for risk data)
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
}
