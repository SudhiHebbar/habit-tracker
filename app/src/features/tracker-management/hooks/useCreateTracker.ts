import { useState, useCallback } from 'react';
import type { CreateTrackerDto, Tracker } from '../types/tracker.types';
import { trackerApi } from '../services/trackerApi';

export const useCreateTracker = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdTracker, setCreatedTracker] = useState<Tracker | null>(null);

  const createTracker = useCallback(async (data: CreateTrackerDto) => {
    setIsCreating(true);
    setError(null);
    setCreatedTracker(null);

    try {
      const tracker = await trackerApi.createTracker(data);
      setCreatedTracker(tracker);
      return tracker;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create tracker';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setCreatedTracker(null);
  }, []);

  return {
    createTracker,
    isCreating,
    error,
    createdTracker,
    reset,
  };
};
