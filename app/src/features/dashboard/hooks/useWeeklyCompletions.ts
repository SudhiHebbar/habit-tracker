import { useState, useEffect, useMemo, useCallback } from 'react';
import { startOfWeek, format } from 'date-fns';
import { completionApi } from '../../habit-completion/services/completionApi';
import type { WeeklyCompletions } from '../../habit-completion/types/completion.types';

interface UseWeeklyCompletionsOptions {
  trackerId: number | null;
  weekStart: Date;
  enabled?: boolean;
}

interface UseWeeklyCompletionsResult {
  weeklyData: WeeklyCompletions | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isRefetching: boolean;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const weeklyDataCache = new Map<string, { data: WeeklyCompletions; timestamp: number }>();

export const useWeeklyCompletions = ({
  trackerId,
  weekStart,
  enabled = true,
}: UseWeeklyCompletionsOptions): UseWeeklyCompletionsResult => {
  const [weeklyData, setWeeklyData] = useState<WeeklyCompletions | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate cache key
  const cacheKey = useMemo(() => {
    if (!trackerId) return null;
    const weekStartFormatted = format(startOfWeek(weekStart, { weekStartsOn: 0 }), 'yyyy-MM-dd');
    return `weekly_${trackerId}_${weekStartFormatted}`;
  }, [trackerId, weekStart]);

  // Check cache
  const getCachedData = useCallback((key: string): WeeklyCompletions | null => {
    const cached = weeklyDataCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    if (cached) {
      weeklyDataCache.delete(key);
    }
    return null;
  }, []);

  // Set cache
  const setCachedData = useCallback((key: string, data: WeeklyCompletions) => {
    weeklyDataCache.set(key, { data, timestamp: Date.now() });
  }, []);

  // Fetch data function
  const fetchWeeklyData = useCallback(
    async (isRetry = false) => {
      if (!trackerId || !cacheKey || !enabled) {
        setWeeklyData(null);
        setLoading(false);
        setIsRefetching(false);
        return;
      }

      // Check cache first (skip cache on retry)
      if (!isRetry) {
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
          setWeeklyData(cachedData);
          setLoading(false);
          setError(null);
          return;
        }
      }

      if (isRetry) {
        setIsRefetching(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const weekStartFormatted = format(
          startOfWeek(weekStart, { weekStartsOn: 0 }),
          'yyyy-MM-dd'
        );
        const data = await completionApi.getWeeklyCompletions(trackerId, weekStartFormatted);

        setWeeklyData(data);
        setCachedData(cacheKey, data);
        setError(null);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch weekly completions';
        setError(errorMessage);
        // eslint-disable-next-line no-console
        console.error('Error fetching weekly completions:', err);

        // Keep existing data on error to avoid blank state
        if (!weeklyData) {
          setWeeklyData(null);
        }
      } finally {
        setLoading(false);
        setIsRefetching(false);
      }
    },
    [trackerId, weekStart, cacheKey, enabled, getCachedData, setCachedData, weeklyData]
  );

  // Refetch function for manual refresh
  const refetch = useCallback(async () => {
    await fetchWeeklyData(true);
  }, [fetchWeeklyData]);

  // Initial data fetch and dependency changes
  useEffect(() => {
    fetchWeeklyData();
  }, [fetchWeeklyData]);

  // Clear cache when trackerId changes
  useEffect(() => {
    if (trackerId) {
      // Clear any cached data for this tracker when switching
      const keysToDelete: string[] = [];
      weeklyDataCache.forEach((_, key) => {
        if (key.startsWith(`weekly_${trackerId}_`)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => weeklyDataCache.delete(key));
    }
  }, [trackerId]);

  return {
    weeklyData,
    loading,
    error,
    refetch,
    isRefetching,
  };
};

export default useWeeklyCompletions;
