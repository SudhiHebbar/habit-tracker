import { useState, useEffect, useCallback } from 'react';
import type { Tracker } from '../types/tracker.types';
import { trackerApi } from '../services/trackerApi';

export const useTrackers = (includeInactive = false) => {
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrackers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await trackerApi.getAllTrackers(includeInactive);
      setTrackers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trackers');
    } finally {
      setIsLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => {
    fetchTrackers();
  }, [fetchTrackers]);

  const refetch = useCallback(() => {
    fetchTrackers();
  }, [fetchTrackers]);

  return {
    trackers,
    isLoading,
    error,
    refetch,
  };
};