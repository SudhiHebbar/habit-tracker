import { useEffect, useCallback } from 'react';
import { trackerSwitchingApi } from '../services/trackerSwitchingApi';
import { trackerCache } from '../services/trackerCache';
import type { TrackerSummary } from '../types/trackerSwitching.types';

interface PreloadingOptions {
  enabled?: boolean;
  maxConcurrent?: number;
  priorityStrategy?: 'recent' | 'favorite' | 'adjacent' | 'all';
}

export function useTrackerPreloading(
  trackerSummaries: TrackerSummary[],
  activeTrackerId: number | null,
  options: PreloadingOptions = {}
) {
  const {
    enabled = true,
    maxConcurrent = 3,
    priorityStrategy = 'recent'
  } = options;

  const preloadTracker = useCallback(async (trackerId: number) => {
    // Skip if already cached
    if (trackerCache.has(trackerId)) {
      return;
    }

    try {
      const data = await trackerSwitchingApi.getTrackerWithStats(trackerId);
      trackerCache.set(trackerId, data);
    } catch (error) {
      console.error(`Failed to preload tracker ${trackerId}:`, error);
    }
  }, []);

  const preloadMultiple = useCallback(async (trackerIds: number[]) => {
    // Limit concurrent requests
    const chunks: number[][] = [];
    for (let i = 0; i < trackerIds.length; i += maxConcurrent) {
      chunks.push(trackerIds.slice(i, i + maxConcurrent));
    }

    for (const chunk of chunks) {
      await Promise.all(chunk.map(id => preloadTracker(id)));
    }
  }, [maxConcurrent, preloadTracker]);

  const getPreloadPriority = useCallback(() => {
    const trackerIds: number[] = [];

    if (!trackerSummaries.length) {
      return trackerIds;
    }

    switch (priorityStrategy) {
      case 'recent':
        // Sort by last accessed time
        const sortedByRecent = [...trackerSummaries]
          .sort((a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime())
          .slice(0, 5)
          .map(t => t.id);
        trackerIds.push(...sortedByRecent);
        break;

      case 'favorite':
        // Sort by completion count and streaks
        const sortedByFavorite = [...trackerSummaries]
          .sort((a, b) => {
            const scoreA = a.todayCompletionsCount + a.currentStreak;
            const scoreB = b.todayCompletionsCount + b.currentStreak;
            return scoreB - scoreA;
          })
          .slice(0, 5)
          .map(t => t.id);
        trackerIds.push(...sortedByFavorite);
        break;

      case 'adjacent':
        // Preload trackers adjacent to the active one
        if (activeTrackerId) {
          const currentIndex = trackerSummaries.findIndex(t => t.id === activeTrackerId);
          if (currentIndex > 0) {
            trackerIds.push(trackerSummaries[currentIndex - 1].id);
          }
          if (currentIndex < trackerSummaries.length - 1) {
            trackerIds.push(trackerSummaries[currentIndex + 1].id);
          }
        }
        break;

      case 'all':
        // Preload all trackers (use with caution)
        trackerIds.push(...trackerSummaries.map(t => t.id));
        break;
    }

    // Remove active tracker and duplicates
    return [...new Set(trackerIds)].filter(id => id !== activeTrackerId);
  }, [trackerSummaries, activeTrackerId, priorityStrategy]);

  // Automatic preloading based on strategy
  useEffect(() => {
    if (!enabled || !trackerSummaries.length) {
      return;
    }

    const trackerIds = getPreloadPriority();
    if (trackerIds.length > 0) {
      preloadMultiple(trackerIds);
    }
  }, [enabled, trackerSummaries, getPreloadPriority, preloadMultiple]);

  // Preload on visibility change
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const trackerIds = getPreloadPriority();
        if (trackerIds.length > 0) {
          preloadMultiple(trackerIds.slice(0, 2)); // Preload top 2 on tab focus
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, getPreloadPriority, preloadMultiple]);

  // Preload on network idle
  useEffect(() => {
    if (!enabled || !('requestIdleCallback' in window)) {
      return;
    }

    const idleCallbackId = requestIdleCallback(() => {
      const trackerIds = getPreloadPriority();
      if (trackerIds.length > 0) {
        preloadMultiple(trackerIds);
      }
    }, { timeout: 5000 });

    return () => {
      if ('cancelIdleCallback' in window) {
        cancelIdleCallback(idleCallbackId);
      }
    };
  }, [enabled, getPreloadPriority, preloadMultiple]);

  return {
    preloadTracker,
    preloadMultiple,
    getPreloadPriority
  };
}