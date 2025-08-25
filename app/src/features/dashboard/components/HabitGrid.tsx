import React from 'react';
import { Grid } from '../../../shared/components/Layout/Grid';
import { HabitCard } from '../../habit-management/components/HabitCard';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import type { Habit } from '../../habit-management/types/habit.types';
import type { TimeRange } from './Dashboard';
import styles from '../../../../styles/features/dashboard/HabitGrid.module.css';

interface HabitGridProps {
  habits: Habit[];
  onHabitComplete: (habit: Habit) => void;
  loading?: boolean;
  timeRange: TimeRange;
}

export const HabitGrid: React.FC<HabitGridProps> = ({
  habits,
  onHabitComplete,
  loading = false,
  timeRange,
}) => {
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner />
      </div>
    );
  }

  const getCompletionDate = () => {
    if (timeRange === 'daily') {
      return new Date().toISOString().split('T')[0];
    }
    // For weekly view, return current week's data
    return undefined;
  };

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

export default HabitGrid;
