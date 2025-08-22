import React, { useState, useMemo } from 'react';
import type { Habit, HabitFilter, HabitSortOption } from '../types/habit.types';
import HabitCard from './HabitCard';
import HabitCalendarCard from './HabitCalendarCard';
import { BulkEditModal } from './BulkEditModal';
import styles from './HabitList.module.css';

interface HabitListProps {
  habits: Habit[];
  loading?: boolean;
  error?: string | null;
  onCreateHabit?: () => void;
  onEditHabit?: (habit: Habit) => void;
  onDeleteHabit?: (habit: Habit) => void;
  onToggleComplete?: (habit: Habit) => void;
  onBulkEdit?: (habits: Habit[], updates: any) => Promise<void>;
  showStats?: boolean;
  viewMode?: 'grid' | 'list' | 'calendar';
  className?: string;
}

export const HabitList: React.FC<HabitListProps> = ({
  habits,
  loading = false,
  error = null,
  onCreateHabit,
  onEditHabit,
  onDeleteHabit,
  onToggleComplete,
  onBulkEdit,
  showStats = true,
  viewMode = 'grid',
  className = ''
}) => {
  const [filter, setFilter] = useState<HabitFilter>({});
  const [sortOption, setSortOption] = useState<HabitSortOption>({
    field: 'displayOrder',
    direction: 'asc'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showInactiveHabits, setShowInactiveHabits] = useState(false);
  
  // Bulk selection state - DISABLED (feature temporarily removed)
  const bulkSelectMode = false;
  const selectedHabits = new Set<string>();
  const showBulkEditModal = false;

  // Filter and sort habits
  const filteredAndSortedHabits = useMemo(() => {
    let filtered = habits.filter(habit => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!habit.name.toLowerCase().includes(query) && 
            !habit.description?.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Frequency filter
      if (filter.frequency && habit.targetFrequency !== filter.frequency) {
        return false;
      }

      // Color filter
      if (filter.color && habit.color !== filter.color) {
        return false;
      }

      // Active filter - Show inactive habits based on toggle
      if (!showInactiveHabits && !habit.isActive) {
        return false;
      }
      
      // Additional active filter from filter state
      if (filter.isActive !== undefined && habit.isActive !== filter.isActive) {
        return false;
      }

      // Icon filter
      if (filter.hasIcon !== undefined) {
        const hasIcon = Boolean(habit.icon);
        if (hasIcon !== filter.hasIcon) {
          return false;
        }
      }

      return true;
    });

    // Sort habits
    filtered.sort((a, b) => {
      let aValue: string | number | Date, bValue: string | number | Date;

      switch (sortOption.field) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
          break;
        case 'frequency':
          aValue = a.targetFrequency;
          bValue = b.targetFrequency;
          break;
        case 'targetCount':
          aValue = a.targetCount;
          bValue = b.targetCount;
          break;
        case 'displayOrder':
        default:
          aValue = a.displayOrder;
          bValue = b.displayOrder;
          break;
      }

      if (aValue < bValue) return sortOption.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOption.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [habits, filter, sortOption, searchQuery]);

  const handleSortChange = (field: HabitSortOption['field']) => {
    setSortOption(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilterChange = (newFilter: Partial<HabitFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  };

  const clearFilters = () => {
    setFilter({});
    setSearchQuery('');
    setShowInactiveHabits(false);
  };

  // Bulk selection handlers - DISABLED (feature temporarily removed)
  const toggleBulkSelectMode = () => {};
  const toggleHabitSelection = (habitId: string) => {};
  const selectAllHabits = () => {};
  const clearSelection = () => {};

  // Bulk edit handler - DISABLED (feature temporarily removed)
  const handleBulkEdit = async (updates: any) => {};

  const selectedHabitObjects = filteredAndSortedHabits.filter(h => selectedHabits.has(h.id.toString()));
  const hasActiveFilters = Object.keys(filter).length > 0 || searchQuery.length > 0;

  if (loading) {
    return (
      <div className={`${styles.habitList} ${className}`}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>Loading habits...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.habitList} ${className}`}>
        <div className={styles.error}>
          <h3>Error loading habits</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.habitList} ${className}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h2 className={styles.title}>Habits</h2>
          <span className={styles.count}>
            {filteredAndSortedHabits.length} of {habits.length}
          </span>
        </div>
        
        <div className={styles.headerActions}>
              {/* View Mode Toggle */}
              <div className={styles.viewToggle}>
                <button
                  className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
                  onClick={() => {/* Set view mode to grid */}}
                  title="Grid view"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className={styles.viewIcon}>
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM9 4a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V4zM9 10a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  className={`${styles.viewButton} ${viewMode === 'calendar' ? styles.active : ''}`}
                  onClick={() => {/* Set view mode to calendar */}}
                  title="Calendar view with weekly completion tracking"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className={styles.viewIcon}>
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 8h12v8H4V8z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {onCreateHabit && (
                <button
                  className={styles.createButton}
                  onClick={onCreateHabit}
                  aria-label="Create new habit"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className={styles.icon}>
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Habit
                </button>
              )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className={styles.controls}>
        <div className={styles.searchSection}>
          <div className={styles.searchBox}>
            <svg viewBox="0 0 20 20" fill="currentColor" className={styles.searchIcon}>
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              placeholder="Search habits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        <div className={styles.filterSection}>
          <select
            value={filter.frequency || ''}
            onChange={(e) => handleFilterChange({ frequency: e.target.value as any || undefined })}
            className={styles.filterSelect}
          >
            <option value="">All Frequencies</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Custom">Custom</option>
          </select>

          <select
            value={sortOption.field}
            onChange={(e) => handleSortChange(e.target.value as HabitSortOption['field'])}
            className={styles.sortSelect}
          >
            <option value="displayOrder">Order</option>
            <option value="name">Name</option>
            <option value="createdAt">Created</option>
            <option value="updatedAt">Updated</option>
            <option value="frequency">Frequency</option>
            <option value="targetCount">Target</option>
          </select>

          <label className={styles.checkboxLabel} title="Show habits that have been deactivated">
            <input
              type="checkbox"
              checked={showInactiveHabits}
              onChange={(e) => setShowInactiveHabits(e.target.checked)}
              className={styles.checkbox}
            />
            <span>Show Inactive</span>
          </label>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className={styles.clearFilters}
              title="Clear all filters"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {filteredAndSortedHabits.length === 0 ? (
        <div className={styles.emptyState}>
          {habits.length === 0 ? (
            <div className={styles.noHabits}>
              <div className={styles.emptyIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                  <line x1="9" y1="9" x2="9.01" y2="9"/>
                  <line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
              </div>
              <h3>No habits yet</h3>
              <p>Create your first habit to start building positive routines.</p>
              {onCreateHabit && (
                <button onClick={onCreateHabit} className={styles.createFirstButton}>
                  Create Your First Habit
                </button>
              )}
            </div>
          ) : (
            <div className={styles.noResults}>
              <div className={styles.emptyIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
              <h3>No habits found</h3>
              <p>Try adjusting your search or filters.</p>
              <button onClick={clearFilters} className={styles.clearFiltersButton}>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className={`${styles.habitGrid} ${styles[viewMode]} ${bulkSelectMode ? styles.selectMode : ''}`}>
          {filteredAndSortedHabits.map((habit) => (
            <div key={habit.id} className={styles.habitCardContainer}>
              {viewMode === 'calendar' ? (
                <HabitCalendarCard
                  habit={habit}
                  {...(onEditHabit && { onEdit: onEditHabit })}
                  {...(onDeleteHabit && { onDelete: onDeleteHabit })}
                  showStats={showStats}
                  className={styles.habitCardItem}
                />
              ) : (
                <HabitCard
                  habit={habit}
                  {...(onEditHabit && { onEdit: onEditHabit })}
                  {...(onDeleteHabit && { onDelete: onDeleteHabit })}
                  {...(onToggleComplete && { onToggleComplete: onToggleComplete })}
                  showStats={showStats}
                  className={styles.habitCardItem}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HabitList;