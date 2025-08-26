import React, { useState, useRef, useEffect } from 'react';
import type { Tracker } from '../types/tracker.types';
import styles from '../../../styles/features/tracker-management/TrackerSelector.module.css';

interface TrackerSelectorProps {
  trackers: Tracker[];
  selectedTracker: Tracker | null;
  onSelect: (tracker: Tracker) => void;
  onCreate?: () => void;
  placeholder?: string;
  isLoading?: boolean;
}

export const TrackerSelector: React.FC<TrackerSelectorProps> = ({
  trackers,
  selectedTracker,
  onSelect,
  onCreate,
  placeholder = 'Select a tracker',
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (tracker: Tracker) => {
    onSelect(tracker);
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!isLoading) {
      setIsOpen(!isOpen);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={styles.trackerSelector} ref={dropdownRef}>
      <button
        className={`${styles.selectorButton} ${isOpen ? styles.open : ''}`}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        aria-haspopup='listbox'
        aria-expanded={isOpen}
      >
        <span className={styles.selectedValue}>
          {isLoading ? 'Loading...' : selectedTracker?.name || placeholder}
        </span>
        <span className={`${styles.arrow} ${isOpen ? styles.arrowUp : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className={styles.dropdown} role='listbox'>
          {trackers.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No trackers available</p>
              {onCreate && (
                <button
                  className={styles.createButton}
                  onClick={() => {
                    setIsOpen(false);
                    onCreate();
                  }}
                >
                  Create New Tracker
                </button>
              )}
            </div>
          ) : (
            <>
              {trackers.map(tracker => (
                <button
                  key={tracker.id}
                  className={`${styles.dropdownItem} ${
                    selectedTracker?.id === tracker.id ? styles.selected : ''
                  }`}
                  onClick={() => handleSelect(tracker)}
                  role='option'
                  aria-selected={selectedTracker?.id === tracker.id}
                >
                  <span className={styles.trackerName}>{tracker.name}</span>
                  {tracker.habitCount > 0 && (
                    <span className={styles.habitCount}>{tracker.habitCount} habits</span>
                  )}
                </button>
              ))}
              {onCreate && (
                <button
                  className={`${styles.dropdownItem} ${styles.createNew}`}
                  onClick={() => {
                    setIsOpen(false);
                    onCreate();
                  }}
                >
                  + Create New Tracker
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
