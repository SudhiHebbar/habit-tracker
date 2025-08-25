import React, { useMemo } from 'react';
import VirtualScrollList from '../../../shared/components/VirtualScroll/VirtualScrollList';
import { HabitCard } from '../../habit-management/components/HabitCard';
import { Grid } from '../../../shared/components/Layout/Grid';
import type { Habit } from '../../habit-management/types/habit.types';
import type { TimeRange } from './Dashboard';
import styles from '../../../../styles/features/dashboard/VirtualizedHabitGrid.module.css';

interface VirtualizedHabitGridProps {
  habits: Habit[];
  onHabitComplete: (habit: Habit) => void;
  loading?: boolean;
  timeRange: TimeRange;
  containerHeight?: number;
  itemsPerRow?: number;
  itemHeight?: number;
}

const ITEM_HEIGHT = 280; // Height of habit card + margins
const CONTAINER_HEIGHT = 600; // Default container height
const ITEMS_PER_ROW = 3; // Default items per row for desktop
const VIRTUAL_THRESHOLD = 50; // Only virtualize if more than 50 habits

export const VirtualizedHabitGrid: React.FC<VirtualizedHabitGridProps> = ({
  habits,
  onHabitComplete,
  loading = false,
  timeRange,
  containerHeight = CONTAINER_HEIGHT,
  itemsPerRow = ITEMS_PER_ROW,
  itemHeight = ITEM_HEIGHT,
}) => {
  const getCompletionDate = () => {
    if (timeRange === 'daily') {
      return new Date().toISOString().split('T')[0];
    }
    return undefined;
  };

  // Group habits into rows for virtual scrolling
  const habitRows = useMemo(() => {
    const rows: Habit[][] = [];
    for (let i = 0; i < habits.length; i += itemsPerRow) {
      rows.push(habits.slice(i, i + itemsPerRow));
    }
    return rows;
  }, [habits, itemsPerRow]);

  // Render a row of habit cards
  const renderHabitRow = (row: Habit[], rowIndex: number) => {
    const completionDate = getCompletionDate();

    return (
      <div key={rowIndex} className={styles.habitRow}>
        <Grid columns='auto' gap='medium' responsive>
          {row.map(habit => (
            <div key={habit.id} className={styles.gridItem}>
              <HabitCard
                habit={habit}
                onToggleComplete={onHabitComplete}
                showStats
                className={styles.habitCard}
                {...(completionDate ? { completionDate } : {})}
              />
            </div>
          ))}
        </Grid>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSkeleton}>
          <div className={styles.skeletonGrid}>
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className={styles.skeletonCard} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (habits.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No habits to display</p>
      </div>
    );
  }

  // Use virtual scrolling only for large lists
  if (habits.length > VIRTUAL_THRESHOLD) {
    return (
      <div className={styles.virtualizedGrid}>
        <VirtualScrollList
          items={habitRows}
          itemHeight={itemHeight}
          containerHeight={containerHeight}
          renderItem={(row, index) => renderHabitRow(row, index)}
          overscan={2}
          className={styles.virtualContainer}
        />
      </div>
    );
  }

  // For smaller lists, render normally without virtualization
  return (
    <div className={styles.habitGrid}>
      <Grid columns='auto' gap='medium' responsive>
        {habits.map(habit => {
          const completionDate = getCompletionDate();
          return (
            <div key={habit.id} className={styles.gridItem}>
              <HabitCard
                habit={habit}
                onToggleComplete={onHabitComplete}
                showStats
                className={styles.habitCard}
                {...(completionDate ? { completionDate } : {})}
              />
            </div>
          );
        })}
      </Grid>
    </div>
  );
};

export default VirtualizedHabitGrid;
