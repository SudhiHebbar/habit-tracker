import { useState, useCallback } from 'react';
import { habitApi } from '../services/habitApi';

interface UseDeleteHabitReturn {
  deleteHabit: (id: number) => Promise<boolean>;
  restoreHabit: (id: number) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useDeleteHabit = (): UseDeleteHabitReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteHabit = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await habitApi.deleteHabit(id);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete habit';
      setError(errorMessage);
      console.error('Error deleting habit:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const restoreHabit = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await habitApi.restoreHabit(id);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to restore habit';
      setError(errorMessage);
      console.error('Error restoring habit:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    deleteHabit,
    restoreHabit,
    loading,
    error,
    clearError
  };
};