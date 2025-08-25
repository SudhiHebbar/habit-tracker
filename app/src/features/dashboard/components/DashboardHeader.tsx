import React from 'react';
import { Heading } from '../../../shared/components/Typography/Heading';
import { Text } from '../../../shared/components/Typography/Text';
import { TrackerSelector } from '../../tracker-management/components/TrackerSelector';
import type { Tracker } from '../../tracker-management/types/tracker.types';
import styles from '../../../../styles/features/dashboard/DashboardHeader.module.css';

interface DashboardHeaderProps {
  trackers: Tracker[];
  currentTracker?: Tracker | null | undefined;
  onTrackerChange: (trackerId: number) => void;
  loading?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  trackers,
  currentTracker,
  onTrackerChange,
  loading = false,
}) => {
  return (
    <div className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.titleSection}>
          <Heading level={1} size='3xl' weight='bold'>
            Dashboard
          </Heading>
          {currentTracker && (
            <Text size='lg' color='secondary' className={styles.subtitle}>
              Track your daily progress and build lasting habits
            </Text>
          )}
        </div>

        <div className={styles.trackerSection}>
          {trackers.length > 0 && (
            <TrackerSelector
              trackers={trackers}
              selectedTracker={currentTracker || null}
              onSelect={tracker => onTrackerChange(tracker.id)}
              isLoading={loading}
            />
          )}
        </div>

        {/* User info placeholder for future implementation */}
        <div className={styles.userSection}>
          <div className={styles.userAvatar}>
            <span className={styles.userInitial}>U</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
