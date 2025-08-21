import { useState, useCallback } from 'react';
import { habitApi } from '../services/habitApi';
import type { Habit, UpdateHabitRequest, EditHabitRequest } from '../types/habit.types';

interface UseEditHabitReturn {
  editHabit: (id: number, data: EditHabitRequest) => Promise<any>;
  deactivateHabit: (id: number, reason?: string) => Promise<boolean>;
  reactivateHabit: (id: number) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useEditHabit = (): UseEditHabitReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editHabit = useCallback(async (
    id: number, 
    data: EditHabitRequest
  ): Promise<any> => {
    setLoading(true);
    setError(null);

    try {
      const result = await habitApi.editHabit(id, data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to edit habit';
      setError(errorMessage);
      console.error('Error editing habit:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deactivateHabit = useCallback(async (
    id: number,
    reason?: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await habitApi.deactivateHabit(id, reason);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deactivate habit';
      setError(errorMessage);
      console.error('Error deactivating habit:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const reactivateHabit = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await habitApi.reactivateHabit(id);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reactivate habit';
      setError(errorMessage);
      console.error('Error reactivating habit:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    editHabit,
    deactivateHabit,
    reactivateHabit,
    loading,
    error,
    clearError
  };
};