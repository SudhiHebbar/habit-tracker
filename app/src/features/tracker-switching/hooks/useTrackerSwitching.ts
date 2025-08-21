import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackerSwitchingApi } from '../services/trackerSwitchingApi';
import { trackerCache } from '../services/trackerCache';
import { useActiveTracker } from './useActiveTracker';
import type { 
  TrackerSummary, 
  TrackerSwitchData,
  TrackerSwitchOptions 
} from '../types/trackerSwitching.types';

export function useTrackerSwitching() {
  const navigate = useNavigate();
  const { activeTrackerId, switchTracker } = useActiveTracker();
  
  const [isSwitching, setIsSwitching] = useState(false);
  const [switchData, setSwitchData] = useState<TrackerSwitchData | null>(null);
  const [trackerSummaries, setTrackerSummaries] = useState<TrackerSummary[]>([]);
  const [loadingSummaries, setLoadingSummaries] = useState(false);

  // Load tracker summaries
  useEffect(() => {
    const loadSummaries = async () => {
      setLoadingSummaries(true);
      try {
        const summaries = await trackerSwitchingApi.getTrackerSummaries();
        setTrackerSummaries(summaries);
      } catch (error) {
        console.error('Failed to load tracker summaries:', error);
      } finally {
        setLoadingSummaries(false);
      }
    };

    loadSummaries();
  }, []);

  // Load switch data when active tracker changes
  useEffect(() => {
    if (!activeTrackerId) return;

    const loadSwitchData = async () => {
      try {
        const data = await trackerSwitchingApi.getTrackerSwitchData(activeTrackerId);
        setSwitchData(data);
      } catch (error) {
        console.error('Failed to load switch data:', error);
      }
    };

    loadSwitchData();
  }, [activeTrackerId]);

  const performSwitch = useCallback(async (
    trackerId: number, 
    options: TrackerSwitchOptions = {}
  ) => {
    const { 
      preload = true, 
      animate = true, 
      recordAccess = true 
    } = options;

    if (trackerId === activeTrackerId || isSwitching) {
      return;
    }

    setIsSwitching(true);
    const startTime = performance.now();

    try {
      // Check if data is cached
      const cached = trackerCache.has(trackerId);
      
      // If not cached and preload is enabled, start loading
      if (!cached && preload) {
        const loadPromise = trackerSwitchingApi.getTrackerWithStats(trackerId);
        
        // If animation is enabled, we can switch immediately
        // and load data in parallel
        if (animate) {
          switchTracker(trackerId);
          navigate(`/trackers/${trackerId}`);
          
          // Cache the data when it arrives
          loadPromise.then(data => {
            trackerCache.set(trackerId, data);
          }).catch(console.error);
        } else {
          // Wait for data before switching
          const data = await loadPromise;
          trackerCache.set(trackerId, data);
          await switchTracker(trackerId);
          navigate(`/trackers/${trackerId}`);
        }
      } else {
        // Data is cached, switch immediately
        await switchTracker(trackerId);
        navigate(`/trackers/${trackerId}`);
      }

      // Record access if enabled
      if (recordAccess) {
        trackerSwitchingApi.recordTrackerAccess(trackerId).catch(console.error);
      }

      // Update switch data
      const newSwitchData = await trackerSwitchingApi.getTrackerSwitchData(trackerId);
      setSwitchData(newSwitchData);

      // Log performance
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.log(`Tracker switch completed in ${duration.toFixed(2)}ms`);

      // Preload adjacent trackers
      if (preload && newSwitchData) {
        if (newSwitchData.previousTrackerId) {
          trackerSwitchingApi.preloadTrackerData(newSwitchData.previousTrackerId).catch(console.error);
        }
        if (newSwitchData.nextTrackerId) {
          trackerSwitchingApi.preloadTrackerData(newSwitchData.nextTrackerId).catch(console.error);
        }
      }
    } catch (error) {
      console.error('Failed to switch tracker:', error);
      throw error;
    } finally {
      setIsSwitching(false);
    }
  }, [activeTrackerId, isSwitching, switchTracker, navigate]);

  const switchToNext = useCallback(async () => {
    if (!switchData?.nextTrackerId) return;
    await performSwitch(switchData.nextTrackerId);
  }, [switchData, performSwitch]);

  const switchToPrevious = useCallback(async () => {
    if (!switchData?.previousTrackerId) return;
    await performSwitch(switchData.previousTrackerId);
  }, [switchData, performSwitch]);

  const switchToRecent = useCallback(async (index: number = 0) => {
    if (!switchData?.recentTrackers[index]) return;
    await performSwitch(switchData.recentTrackers[index].id);
  }, [switchData, performSwitch]);

  const switchToFavorite = useCallback(async (index: number = 0) => {
    if (!switchData?.favoriteTrackers[index]) return;
    await performSwitch(switchData.favoriteTrackers[index].id);
  }, [switchData, performSwitch]);

  const preloadTrackers = useCallback(async (trackerIds: number[]) => {
    const promises = trackerIds.map(id => 
      trackerSwitchingApi.preloadTrackerData(id).catch(console.error)
    );
    await Promise.all(promises);
  }, []);

  return {
    activeTrackerId,
    isSwitching,
    switchData,
    trackerSummaries,
    loadingSummaries,
    performSwitch,
    switchToNext,
    switchToPrevious,
    switchToRecent,
    switchToFavorite,
    preloadTrackers
  };
}