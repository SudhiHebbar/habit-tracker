import React from 'react';
import { HabitCard } from '../../habit-management/components/HabitCard';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import type { Habit } from '../../habit-management/types/habit.types';
import type { TimeRange } from './Dashboard';
import styles from '../../../../styles/features/dashboard/HabitList.module.css';

interface HabitListProps {
  habits: Habit[];
  onHabitComplete: (habit: Habit) => void;
  loading?: boolean;
  timeRange: TimeRange;
}

export const HabitList: React.FC<HabitListProps> = ({
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
    return undefined;
  };

  return (
    <div className={styles.habitList}>
      {habits.map((habit, index) => {
        const completionDate = getCompletionDate();
        return (
          <div
            key={habit.id}
            className={styles.listItem}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <HabitCard
              habit={habit}
              onToggleComplete={onHabitComplete}
              showStats={false} // Simplified view for mobile
              className={styles.habitCard}
              {...(completionDate ? { completionDate } : {})}
            />
          </div>
        );
      })}
    </div>
  );
};

export default HabitList;
