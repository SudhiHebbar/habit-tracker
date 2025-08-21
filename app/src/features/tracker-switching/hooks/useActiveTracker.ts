import { useState, useEffect, useCallback } from 'react';
import { trackerSwitchingApi } from '../services/trackerSwitchingApi';
import { trackerCache } from '../services/trackerCache';
import type { TrackerWithStats } from '../types/trackerSwitching.types';

const ACTIVE_TRACKER_KEY = 'activeTrackerId';
const LAST_ACCESS_KEY = 'lastTrackerAccess';

export function useActiveTracker() {
  const [activeTrackerId, setActiveTrackerId] = useState<number | null>(() => {
    const stored = localStorage.getItem(ACTIVE_TRACKER_KEY);
    return stored ? parseInt(stored, 10) : null;
  });

  const [activeTracker, setActiveTracker] = useState<TrackerWithStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load active tracker data
  useEffect(() => {
    if (!activeTrackerId) {
      setActiveTracker(null);
      return;
    }

    const loadTracker = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Check cache first
        const cached = trackerCache.get(activeTrackerId);
        if (cached) {
          setActiveTracker(cached);
          setIsLoading(false);
          
          // Record access in background
          trackerSwitchingApi.recordTrackerAccess(activeTrackerId).catch(console.error);
          return;
        }

        // Fetch from API
        const trackerData = await trackerSwitchingApi.getTrackerWithStats(activeTrackerId);
        trackerCache.set(activeTrackerId, trackerData);
        setActiveTracker(trackerData);

        // Record access
        await trackerSwitchingApi.recordTrackerAccess(activeTrackerId);
        
        // Update last access time
        localStorage.setItem(LAST_ACCESS_KEY, new Date().toISOString());
      } catch (err) {
        console.error('Failed to load active tracker:', err);
        setError('Failed to load tracker');
        setActiveTracker(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadTracker();
  }, [activeTrackerId]);

  const switchTracker = useCallback(async (trackerId: number) => {
    if (trackerId === activeTrackerId) {
      return;
    }

    // Update localStorage immediately for persistence
    localStorage.setItem(ACTIVE_TRACKER_KEY, trackerId.toString());
    setActiveTrackerId(trackerId);
  }, [activeTrackerId]);

  const clearActiveTracker = useCallback(() => {
    localStorage.removeItem(ACTIVE_TRACKER_KEY);
    localStorage.removeItem(LAST_ACCESS_KEY);
    setActiveTrackerId(null);
    setActiveTracker(null);
  }, []);

  const refreshActiveTracker = useCallback(async () => {
    if (!activeTrackerId) return;

    setIsLoading(true);
    setError(null);

    try {
      const trackerData = await trackerSwitchingApi.getTrackerWithStats(activeTrackerId);
      trackerCache.set(activeTrackerId, trackerData);
      setActiveTracker(trackerData);
    } catch (err) {
      console.error('Failed to refresh active tracker:', err);
      setError('Failed to refresh tracker');
    } finally {
      setIsLoading(false);
    }
  }, [activeTrackerId]);

  const getLastAccessTime = useCallback(() => {
    const stored = localStorage.getItem(LAST_ACCESS_KEY);
    return stored ? new Date(stored) : null;
  }, []);

  return {
    activeTrackerId,
    activeTracker,
    isLoading,
    error,
    switchTracker,
    clearActiveTracker,
    refreshActiveTracker,
    getLastAccessTime
  };
}