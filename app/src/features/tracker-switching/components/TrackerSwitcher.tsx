import React, { useEffect, useState } from 'react';
import { useTrackerSwitching } from '../hooks/useTrackerSwitching';
import { useTrackerHistory } from '../hooks/useTrackerHistory';
import { useTrackerPreloading } from '../hooks/useTrackerPreloading';
import { TrackerDropdown } from './TrackerDropdown';
import { TrackerNavigation } from './TrackerNavigation';
import { TrackerQuickSwitch } from './TrackerQuickSwitch';
import styles from '@styles/features/tracker-switching/TrackerSwitcher.module.css';

interface TrackerSwitcherProps {
  showDropdown?: boolean;
  showNavigation?: boolean;
  showQuickSwitch?: boolean;
  onSwitch?: (trackerId: number) => void;
}

export const TrackerSwitcher: React.FC<TrackerSwitcherProps> = ({
  showDropdown = true,
  showNavigation = true,
  showQuickSwitch = false,
  onSwitch,
}) => {
  const {
    activeTrackerId,
    isSwitching,
    switchData,
    trackerSummaries,
    loadingSummaries,
    performSwitch,
    switchToNext,
    switchToPrevious,
  } = useTrackerSwitching();

  const { addToHistory, canGoBack, canGoForward, goBack, goForward } = useTrackerHistory();

  const [isTransitioning, setIsTransitioning] = useState(false);

  // Preload trackers
  useTrackerPreloading(trackerSummaries, activeTrackerId, {
    enabled: true,
    priorityStrategy: 'recent',
  });

  // Add to history when tracker changes
  useEffect(() => {
    if (activeTrackerId) {
      addToHistory(activeTrackerId);
    }
  }, [activeTrackerId, addToHistory]);

  const handleSwitch = async (trackerId: number) => {
    setIsTransitioning(true);

    try {
      await performSwitch(trackerId, {
        animate: true,
        preload: true,
        recordAccess: true,
      });

      if (onSwitch) {
        onSwitch(trackerId);
      }
    } finally {
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }
  };

  const handleHistoryBack = async () => {
    const previousTrackerId = goBack();
    if (previousTrackerId) {
      await handleSwitch(previousTrackerId);
    }
  };

  const handleHistoryForward = async () => {
    const nextTrackerId = goForward();
    if (nextTrackerId) {
      await handleSwitch(nextTrackerId);
    }
  };

  return (
    <div className={styles.trackerSwitcher}>
      {showNavigation && (
        <TrackerNavigation
          canGoBack={canGoBack()}
          canGoForward={canGoForward()}
          canGoPrevious={!!switchData?.previousTrackerId}
          canGoNext={!!switchData?.nextTrackerId}
          onBack={handleHistoryBack}
          onForward={handleHistoryForward}
          onPrevious={switchToPrevious}
          onNext={switchToNext}
          isLoading={isSwitching}
        />
      )}

      {showDropdown && (
        <div className={styles.dropdownContainer}>
          <TrackerDropdown
            trackers={trackerSummaries}
            activeTrackerId={activeTrackerId}
            recentTrackers={switchData?.recentTrackers || []}
            favoriteTrackers={switchData?.favoriteTrackers || []}
            onSelect={handleSwitch}
            isLoading={loadingSummaries || isSwitching}
          />
        </div>
      )}

      {showQuickSwitch && (
        <TrackerQuickSwitch
          trackers={trackerSummaries}
          activeTrackerId={activeTrackerId}
          onSwitch={handleSwitch}
        />
      )}

      {isTransitioning && <div className={styles.transitionOverlay} aria-hidden='true' />}
    </div>
  );
};
