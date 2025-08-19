import { useState, useCallback } from 'react';
import { trackerApi } from '../services/trackerApi';

export const useDeleteTracker = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteTracker = useCallback(async (id: number) => {
    setIsDeleting(true);
    setError(null);
    
    try {
      await trackerApi.deleteTracker(id);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete tracker';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  }, []);

  const restoreTracker = useCallback(async (id: number) => {
    setIsDeleting(true);
    setError(null);
    
    try {
      await trackerApi.restoreTracker(id);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to restore tracker';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  return {
    deleteTracker,
    restoreTracker,
    isDeleting,
    error,
    reset,
  };
};