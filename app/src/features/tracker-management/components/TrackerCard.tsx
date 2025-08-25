import React from 'react';
import type { Tracker } from '../types/tracker.types';
import styles from '../../../styles/features/tracker-management/TrackerCard.module.css';

interface TrackerCardProps {
  tracker: Tracker;
  onEdit: (tracker: Tracker) => void;
  onDelete: (tracker: Tracker) => void;
  onSelect: (tracker: Tracker) => void;
  isSelected?: boolean;
}

export const TrackerCard: React.FC<TrackerCardProps> = ({
  tracker,
  onEdit,
  onDelete,
  onSelect,
  isSelected = false,
}) => {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(tracker);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(tracker);
  };

  return (
    <div
      className={`${styles.trackerCard} ${isSelected ? styles.selected : ''}`}
      onClick={() => onSelect(tracker)}
      role='button'
      tabIndex={0}
      onKeyPress={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect(tracker);
        }
      }}
    >
      <div className={styles.cardHeader}>
        <h3 className={styles.trackerName}>{tracker.name}</h3>
        {tracker.isShared && <span className={styles.sharedBadge}>Shared</span>}
      </div>

      {tracker.description && <p className={styles.trackerDescription}>{tracker.description}</p>}

      <div className={styles.cardStats}>
        <span className={styles.habitCount}>
          {tracker.habitCount} {tracker.habitCount === 1 ? 'habit' : 'habits'}
        </span>
        <span className={styles.createdDate}>
          Created {new Date(tracker.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className={styles.cardActions}>
        <button
          className={styles.editButton}
          onClick={handleEdit}
          aria-label={`Edit ${tracker.name}`}
        >
          Edit
        </button>
        <button
          className={styles.deleteButton}
          onClick={handleDelete}
          aria-label={`Delete ${tracker.name}`}
        >
          Delete
        </button>
      </div>
    </div>
  );
};
