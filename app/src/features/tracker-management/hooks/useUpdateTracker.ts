import { useState, useCallback } from 'react';
import type { UpdateTrackerDto, Tracker } from '../types/tracker.types';
import { trackerApi } from '../services/trackerApi';

export const useUpdateTracker = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedTracker, setUpdatedTracker] = useState<Tracker | null>(null);

  const updateTracker = useCallback(async (id: number, data: UpdateTrackerDto) => {
    setIsUpdating(true);
    setError(null);
    setUpdatedTracker(null);
    
    try {
      const tracker = await trackerApi.updateTracker(id, data);
      setUpdatedTracker(tracker);
      return tracker;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update tracker';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setUpdatedTracker(null);
  }, []);

  return {
    updateTracker,
    isUpdating,
    error,
    updatedTracker,
    reset,
  };
};