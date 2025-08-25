import React from 'react';
import type { ViewMode } from './Dashboard';
import styles from '../../../../styles/features/dashboard/ViewToggle.module.css';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  disabled?: boolean;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({
  viewMode,
  onViewModeChange,
  disabled = false,
}) => {
  return (
    <div className={styles.viewToggle}>
      <button
        className={`${styles.toggleButton} ${viewMode === 'grid' ? styles.active : ''}`}
        onClick={() => onViewModeChange('grid')}
        disabled={disabled}
        aria-pressed={viewMode === 'grid'}
        title='Grid view'
      >
        <svg viewBox='0 0 20 20' fill='currentColor' className={styles.icon} aria-hidden='true'>
          <path d='M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z' />
        </svg>
        <span className={styles.label}>Grid</span>
      </button>

      <button
        className={`${styles.toggleButton} ${viewMode === 'list' ? styles.active : ''}`}
        onClick={() => onViewModeChange('list')}
        disabled={disabled}
        aria-pressed={viewMode === 'list'}
        title='List view'
      >
        <svg viewBox='0 0 20 20' fill='currentColor' className={styles.icon} aria-hidden='true'>
          <path
            fillRule='evenodd'
            d='M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z'
            clipRule='evenodd'
          />
        </svg>
        <span className={styles.label}>List</span>
      </button>
    </div>
  );
};

export default ViewToggle;
