import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { TrackerSummary } from '../types/trackerSwitching.types';
import styles from '@styles/features/tracker-switching/TrackerDropdown.module.css';

interface TrackerDropdownProps {
  trackers: TrackerSummary[];
  activeTrackerId: number | null;
  recentTrackers?: TrackerSummary[];
  favoriteTrackers?: TrackerSummary[];
  onSelect: (trackerId: number) => void;
  isLoading?: boolean;
}

export const TrackerDropdown: React.FC<TrackerDropdownProps> = ({
  trackers,
  activeTrackerId,
  recentTrackers = [],
  favoriteTrackers = [],
  onSelect,
  isLoading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const activeTracker = trackers.find(t => t.id === activeTrackerId);

  // Filter trackers based on search query
  const filteredTrackers = useMemo(() => {
    if (!searchQuery) return trackers;
    
    const query = searchQuery.toLowerCase();
    return trackers.filter(tracker => 
      tracker.name.toLowerCase().includes(query) ||
      tracker.description?.toLowerCase().includes(query)
    );
  }, [trackers, searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (trackerId: number) => {
    onSelect(trackerId);
    setIsOpen(false);
    setSearchQuery('');
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredTrackers.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredTrackers.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredTrackers.length) {
          handleSelect(filteredTrackers[highlightedIndex].id);
        }
        break;
      
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
        setHighlightedIndex(-1);
        break;
    }
  };

  const renderTrackerItem = (tracker: TrackerSummary, index: number) => {
    const isActive = tracker.id === activeTrackerId;
    const isHighlighted = index === highlightedIndex;
    
    return (
      <div
        key={tracker.id}
        className={`${styles.trackerItem} ${isActive ? styles.active : ''} ${isHighlighted ? styles.highlighted : ''}`}
        onClick={() => handleSelect(tracker.id)}
        onMouseEnter={() => setHighlightedIndex(index)}
        role="option"
        aria-selected={isActive}
      >
        <div className={styles.trackerInfo}>
          <div className={styles.trackerName}>
            {tracker.name}
            {isActive && <span className={styles.activeIndicator}>●</span>}
          </div>
          {tracker.description && (
            <div className={styles.trackerDescription}>{tracker.description}</div>
          )}
        </div>
        <div className={styles.trackerStats}>
          <span className={styles.habitCount}>{tracker.habitCount} habits</span>
          {tracker.currentStreak > 0 && (
            <span className={styles.streak}>🔥 {tracker.currentStreak}</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.trackerDropdown} ref={dropdownRef}>
      <button
        className={styles.dropdownTrigger}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={styles.currentTracker}>
          {isLoading ? 'Loading...' : (activeTracker?.name || 'Select a tracker')}
        </span>
        <span className={styles.dropdownIcon}>
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu} role="listbox">
          <div className={styles.searchContainer}>
            <input
              ref={searchInputRef}
              type="text"
              className={styles.searchInput}
              placeholder="Search trackers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Search trackers"
            />
          </div>

          {searchQuery === '' && (
            <>
              {recentTrackers.length > 0 && (
                <div className={styles.section}>
                  <div className={styles.sectionTitle}>Recent</div>
                  {recentTrackers.map((tracker, index) => 
                    renderTrackerItem(tracker, index)
                  )}
                </div>
              )}

              {favoriteTrackers.length > 0 && (
                <div className={styles.section}>
                  <div className={styles.sectionTitle}>Favorites</div>
                  {favoriteTrackers.map((tracker, index) => 
                    renderTrackerItem(tracker, recentTrackers.length + index)
                  )}
                </div>
              )}

              <div className={styles.divider} />
            </>
          )}

          <div className={styles.trackerList}>
            {filteredTrackers.length === 0 ? (
              <div className={styles.noResults}>No trackers found</div>
            ) : (
              filteredTrackers.map((tracker, index) => 
                renderTrackerItem(tracker, index)
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};