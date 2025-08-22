import { useState, useCallback } from 'react';
import { habitApi } from '../services/habitApi';
import type { 
  DeleteHabitRequest, 
  DeleteHabitResponse,
  RestoreHabitRequest,
  RestoreHabitResponse,
  DeletionImpact,
  UndoDeleteResponse
} from '../types/habit.types';

interface UseDeleteHabitReturn {
  // New enhanced deletion methods
  getDeletionImpact: (id: number) => Promise<DeletionImpact | null>;
  deleteHabitWithConfirmation: (id: number, data: DeleteHabitRequest) => Promise<DeleteHabitResponse | null>;
  restoreHabitWithConfirmation: (id: number, data: RestoreHabitRequest) => Promise<RestoreHabitResponse | null>;
  undoDelete: (id: number) => Promise<UndoDeleteResponse | null>;
  getDeletedHabits: (trackerId: number) => Promise<any[] | null>;
  
  // Legacy methods for backward compatibility
  deleteHabit: (id: number) => Promise<boolean>;
  restoreHabit: (id: number) => Promise<boolean>;
  
  // State
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useDeleteHabit = (): UseDeleteHabitReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDeletionImpact = useCallback(async (id: number): Promise<DeletionImpact | null> => {
    setLoading(true);
    setError(null);

    try {
      const impact = await habitApi.getDeletionImpact(id);
      return impact;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get deletion impact';
      setError(errorMessage);
      console.error('Error getting deletion impact:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteHabitWithConfirmation = useCallback(async (
    id: number, 
    data: DeleteHabitRequest
  ): Promise<DeleteHabitResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await habitApi.deleteHabit(id, data);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete habit';
      setError(errorMessage);
      console.error('Error deleting habit:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const restoreHabitWithConfirmation = useCallback(async (
    id: number, 
    data: RestoreHabitRequest
  ): Promise<RestoreHabitResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await habitApi.restoreHabit(id, data);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to restore habit';
      setError(errorMessage);
      console.error('Error restoring habit:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const undoDelete = useCallback(async (id: number): Promise<UndoDeleteResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await habitApi.undoDelete(id);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to undo deletion';
      setError(errorMessage);
      console.error('Error undoing deletion:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getDeletedHabits = useCallback(async (trackerId: number): Promise<any[] | null> => {
    setLoading(true);
    setError(null);

    try {
      const habits = await habitApi.getDeletedHabits(trackerId);
      return habits;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get deleted habits';
      setError(errorMessage);
      console.error('Error getting deleted habits:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Legacy methods for backward compatibility
  const deleteHabit = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await habitApi.legacyDeleteHabit(id);
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
      await habitApi.legacyRestoreHabit(id);
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
    // New enhanced methods
    getDeletionImpact,
    deleteHabitWithConfirmation,
    restoreHabitWithConfirmation,
    undoDelete,
    getDeletedHabits,
    
    // Legacy methods
    deleteHabit,
    restoreHabit,
    
    // State
    loading,
    error,
    clearError
  };
};