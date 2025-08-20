import React from 'react';
import type { Tracker } from '../types/tracker.types';
import { TrackerCard } from './TrackerCard';
import styles from '../../../styles/features/tracker-management/TrackerList.module.css';

interface TrackerListProps {
  trackers: Tracker[];
  selectedTracker?: Tracker | null;
  onEdit: (tracker: Tracker) => void;
  onDelete: (tracker: Tracker) => void;
  onSelect: (tracker: Tracker) => void;
  isLoading?: boolean;
  error?: string | null;
}

export const TrackerList: React.FC<TrackerListProps> = ({
  trackers,
  selectedTracker,
  onEdit,
  onDelete,
  onSelect,
  isLoading = false,
  error = null
}) => {
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>Loading trackers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>Error: {error}</p>
      </div>
    );
  }

  if (trackers.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <p className={styles.emptyMessage}>No trackers found. Create your first tracker to get started!</p>
      </div>
    );
  }

  return (
    <div className={styles.trackerGrid}>
      {trackers.map((tracker) => (
        <TrackerCard
          key={tracker.id}
          tracker={tracker}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelect={onSelect}
          isSelected={selectedTracker?.id === tracker.id}
        />
      ))}
    </div>
  );
};