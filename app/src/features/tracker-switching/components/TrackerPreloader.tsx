import React, { useEffect } from 'react';
import { useTrackerPreloading } from '../hooks/useTrackerPreloading';
import type { TrackerSummary } from '../types/trackerSwitching.types';

interface TrackerPreloaderProps {
  trackers: TrackerSummary[];
  activeTrackerId: number | null;
  strategy?: 'recent' | 'favorite' | 'adjacent' | 'all';
  enabled?: boolean;
  maxConcurrent?: number;
}

export const TrackerPreloader: React.FC<TrackerPreloaderProps> = ({
  trackers,
  activeTrackerId,
  strategy = 'recent',
  enabled = true,
  maxConcurrent = 3,
}) => {
  const { preloadMultiple, getPreloadPriority } = useTrackerPreloading(trackers, activeTrackerId, {
    enabled,
    maxConcurrent,
    priorityStrategy: strategy,
  });

  // Preload on mount and when trackers change
  useEffect(() => {
    if (!enabled || trackers.length === 0) return;

    const trackerIds = getPreloadPriority();
    if (trackerIds.length > 0) {
      console.log(`Preloading ${trackerIds.length} trackers with ${strategy} strategy`);
      preloadMultiple(trackerIds);
    }
  }, [enabled, trackers, strategy, getPreloadPriority, preloadMultiple]);

  // This component doesn't render anything
  // It only handles background preloading
  return null;
};
