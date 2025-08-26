import { useState, useEffect, useCallback } from 'react';
import { habitApi } from '../services/habitApi';
import type { Habit } from '../types/habit.types';

interface UseHabitsReturn {
  habits: Habit[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useHabits = (trackerId: number | null): UseHabitsReturn => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHabits = useCallback(
    async (showLoading = true) => {
      if (!trackerId) {
        setHabits([]);
        setError(null);
        return;
      }

      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      try {
        // Use the endpoint that includes completion data to get lastCompletedDate
        const fetchedHabits = await habitApi.getHabitsWithCompletions(trackerId);
        setHabits(fetchedHabits);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch habits';
        setError(errorMessage);
        console.error('Error fetching habits:', err);
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [trackerId]
  );

  const refetch = useCallback(() => fetchHabits(true), [fetchHabits]);
  const refresh = useCallback(() => fetchHabits(false), [fetchHabits]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  return {
    habits,
    loading,
    error,
    refetch,
    refresh,
  };
};
