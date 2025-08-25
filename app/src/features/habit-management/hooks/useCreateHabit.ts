import { useState, useCallback } from 'react';
import { habitApi } from '../services/habitApi';
import type { CreateHabitRequest, Habit } from '../types/habit.types';

interface UseCreateHabitReturn {
  createHabit: (trackerId: number, data: CreateHabitRequest) => Promise<Habit | null>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useCreateHabit = (): UseCreateHabitReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createHabit = useCallback(
    async (trackerId: number, data: CreateHabitRequest): Promise<Habit | null> => {
      setLoading(true);
      setError(null);

      try {
        const habit = await habitApi.createHabit(trackerId, data);
        return habit;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create habit';
        setError(errorMessage);
        console.error('Error creating habit:', err);
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
    createHabit,
    loading,
    error,
    clearError,
  };
};
