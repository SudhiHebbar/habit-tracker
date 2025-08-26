import { useState, useCallback } from 'react';
import { habitApi } from '../services/habitApi';
import type { UpdateHabitRequest, Habit } from '../types/habit.types';

interface UseUpdateHabitReturn {
  updateHabit: (id: number, data: UpdateHabitRequest) => Promise<Habit | null>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useUpdateHabit = (): UseUpdateHabitReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateHabit = useCallback(
    async (id: number, data: UpdateHabitRequest): Promise<Habit | null> => {
      setLoading(true);
      setError(null);

      try {
        const habit = await habitApi.updateHabit(id, data);
        return habit;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update habit';
        setError(errorMessage);
        console.error('Error updating habit:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    updateHabit,
    loading,
    error,
    clearError,
  };
};
