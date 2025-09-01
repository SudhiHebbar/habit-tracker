import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  useHabitCompletionListener,
  type CompletionEvent,
} from '../../../shared/hooks/useEventBus';
import type { Habit } from '../../habit-management/types/habit.types';

export interface DashboardProgressStats {
  totalHabits: number;
  completedToday: number;
  completionRate: number;
  activeStreaks: number;
  completedThisWeek: number;
  weeklyProgress: number;
}

export interface UseDashboardProgressOptions {
  habits: Habit[];
  timeRange: 'daily' | 'weekly';
  enabled?: boolean;
}

export function useDashboardProgress({
  habits,
  timeRange,
  enabled = true,
}: UseDashboardProgressOptions) {
  // Cache for optimistic updates
  const [optimisticUpdates, setOptimisticUpdates] = useState<
    Map<number, { isCompleted: boolean; timestamp: number }>
  >(new Map());

  // Ref for tracking the latest habits to avoid stale closures
  const habitsRef = useRef(habits);
  habitsRef.current = habits;

  // Clear old optimistic updates (older than 5 seconds)
  useEffect(() => {
    const cleanup = () => {
      const now = Date.now();
      setOptimisticUpdates(prev => {
        const updated = new Map(prev);
        for (const [habitId, update] of updated.entries()) {
          if (now - update.timestamp > 5000) {
            updated.delete(habitId);
          }
        }
        return updated.size !== prev.size ? updated : prev;
      });
    };

    const interval = setInterval(cleanup, 1000);
    return () => clearInterval(interval);
  }, []);

  // Listen to completion events for optimistic updates
  useHabitCompletionListener(
    useCallback(
      (event: CompletionEvent) => {
        if (!enabled) return;

        const { habitId, isCompleted, completionDate } = event.payload;
        const today = new Date().toISOString().split('T')[0];

        // Only handle today's completions for immediate feedback
        if (completionDate === today) {
          setOptimisticUpdates(prev => {
            const updated = new Map(prev);
            updated.set(habitId, {
              isCompleted,
              timestamp: Date.now(),
            });
            return updated;
          });

          // Clear the optimistic update after a delay to let the real data refresh
          setTimeout(() => {
            setOptimisticUpdates(prev => {
              const updated = new Map(prev);
              updated.delete(habitId);
              return updated.size !== prev.size ? updated : prev;
            });
          }, 2000);
        }
      },
      [enabled]
    )
  );

  // Calculate progress statistics with optimistic updates
  const stats: DashboardProgressStats = useMemo(() => {
    if (!enabled || !habits.length) {
      return {
        totalHabits: 0,
        completedToday: 0,
        completionRate: 0,
        activeStreaks: 0,
        completedThisWeek: 0,
        weeklyProgress: 0,
      };
    }

    const today = new Date().toISOString().split('T')[0];
    const activeHabits = habits.filter(h => h.isActive);
    const totalHabits = activeHabits.length;

    if (totalHabits === 0) {
      return {
        totalHabits: 0,
        completedToday: 0,
        completionRate: 0,
        activeStreaks: 0,
        completedThisWeek: 0,
        weeklyProgress: 0,
      };
    }

    // Calculate completed today with optimistic updates
    let completedToday = 0;
    let completedThisWeek = 0;
    let activeStreaks = 0;

    activeHabits.forEach(habit => {
      // Check optimistic update first
      const optimisticUpdate = optimisticUpdates.get(habit.id);

      let isCompletedToday = false;
      if (optimisticUpdate) {
        isCompletedToday = optimisticUpdate.isCompleted;
      } else if (habit.lastCompletedDate) {
        // Extract date-only string directly from the ISO string to avoid timezone issues
        const lastCompletedDateOnly = habit.lastCompletedDate.split('T')[0];
        isCompletedToday = lastCompletedDateOnly === today;
      }

      if (isCompletedToday) {
        completedToday++;
      }

      // Weekly completions
      const weeklyCompletions = habit.completionsThisWeek || 0;
      if (weeklyCompletions > 0 || isCompletedToday) {
        completedThisWeek += weeklyCompletions;
      }

      // Active streaks
      const currentStreak = habit.currentStreak || 0;
      if (currentStreak > 0) {
        activeStreaks++;
      }
    });

    // Calculate rates
    const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
    const weeklyProgress =
      timeRange === 'weekly' && totalHabits > 0
        ? Math.round((completedThisWeek / (totalHabits * 7)) * 100)
        : completionRate;

    const result = {
      totalHabits,
      completedToday,
      completionRate,
      activeStreaks,
      completedThisWeek,
      weeklyProgress,
    };

    return result;
  }, [habits, optimisticUpdates, timeRange, enabled]);

  // Get display stats based on time range
  const displayStats = useMemo(() => {
    if (timeRange === 'weekly') {
      return {
        ...stats,
        completionRate: stats.weeklyProgress,
      };
    }
    return stats;
  }, [stats, timeRange]);

  // Helper function to check if a habit is completed today (with optimistic updates)
  const isHabitCompletedToday = useCallback(
    (habitId: number) => {
      const optimisticUpdate = optimisticUpdates.get(habitId);
      if (optimisticUpdate) {
        return optimisticUpdate.isCompleted;
      }

      const habit = habitsRef.current.find(h => h.id === habitId);
      if (!habit || !habit.lastCompletedDate) return false;

      const today = new Date().toISOString().split('T')[0];
      const lastCompletedDateOnly = habit.lastCompletedDate.split('T')[0];
      return lastCompletedDateOnly === today;
    },
    [optimisticUpdates]
  );

  // Helper function to get habit progress percentage
  const getHabitProgress = useCallback(
    (habitId: number) => {
      const habit = habitsRef.current.find(h => h.id === habitId);
      if (!habit) return 0;

      if (timeRange === 'daily') {
        return isHabitCompletedToday(habitId) ? 100 : 0;
      }

      // Weekly progress calculation
      const weeklyCompletions = habit.completionsThisWeek || 0;
      const targetCount = habit.targetCount || 1;
      return Math.min(100, Math.round((weeklyCompletions / targetCount) * 100));
    },
    [timeRange, isHabitCompletedToday]
  );

  // Debug information
  const debugInfo = useMemo(() => {
    return {
      habitsCount: habits.length,
      activeHabitsCount: habits.filter(h => h.isActive).length,
      optimisticUpdatesCount: optimisticUpdates.size,
      optimisticUpdates: Array.from(optimisticUpdates.entries()),
      enabled,
    };
  }, [habits, optimisticUpdates, enabled]);

  return {
    stats: displayStats,
    isHabitCompletedToday,
    getHabitProgress,
    hasOptimisticUpdates: optimisticUpdates.size > 0,
    debugInfo,
  };
}
