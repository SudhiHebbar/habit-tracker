import React, { useState, useCallback } from 'react';
import { format, isFuture, isToday } from 'date-fns';
import { CompletionCheckbox } from '../../../habit-completion/components/CompletionCheckbox';
import { IconLibrary } from '../../../visual-customization/services/iconLibrary';
import type { CompletionItem } from '../../../habit-completion/types/completion.types';
import styles from '../../../../../styles/features/dashboard/calendar/CalendarDayCell.module.css';

interface HabitWithCompletion extends CompletionItem {
  id: number; // Add id for CompletionCheckbox
}

interface CalendarDayCellProps {
  date: Date;
  habits: HabitWithCompletion[];
  onToggle: (habitId: number, date: string) => void;
  loading?: boolean;
  className?: string;
}

export const CalendarDayCell: React.FC<CalendarDayCellProps> = ({
  date,
  habits,
  onToggle,
  loading = false,
  className = '',
}) => {
  const [optimisticUpdates, setOptimisticUpdates] = useState<Record<number, boolean>>({});

  const isCurrentDay = isToday(date);
  const isFutureDate = isFuture(date);
  const isWeekend = date.getDay() === 0 || date.getDay() === 6; // Sunday or Saturday
  const dateString = format(date, 'yyyy-MM-dd');

  // Handle optimistic updates
  const handleToggle = useCallback(
    (habitId: number) => {
      if (isFutureDate) return; // Prevent future date editing

      // Apply optimistic update immediately
      setOptimisticUpdates(prev => ({
        ...prev,
        [habitId]: !prev[habitId],
      }));

      // Call the parent handler
      onToggle(habitId, dateString);

      // Clear optimistic update after a delay (API should have responded by then)
      setTimeout(() => {
        setOptimisticUpdates(prev => {
          const updated = { ...prev };
          delete updated[habitId];
          return updated;
        });
      }, 2000);
    },
    [isFutureDate, onToggle, dateString]
  );

  // Calculate completion stats
  const completedCount = habits.filter(habit => {
    const habitId = habit.habitId;
    const hasOptimisticUpdate = habitId in optimisticUpdates;
    return hasOptimisticUpdate ? optimisticUpdates[habitId] : habit.isCompleted;
  }).length;

  const totalHabits = habits.length;
  const completionRate = totalHabits > 0 ? (completedCount / totalHabits) * 100 : 0;

  const getCellClasses = () => {
    const classes = [styles.dayCell];

    if (className) classes.push(className);
    if (isCurrentDay) classes.push(styles.today);
    if (isFutureDate) classes.push(styles.future);
    if (isWeekend) classes.push(styles.weekend);
    if (loading) classes.push(styles.loading);

    // Completion-based styling
    if (totalHabits > 0) {
      if (completionRate === 100) classes.push(styles.fullyCompleted);
      else if (completionRate > 0) classes.push(styles.partiallyCompleted);
      else classes.push(styles.notCompleted);
    }

    return classes.join(' ');
  };

  return (
    <div
      className={getCellClasses()}
      role='gridcell'
      aria-label={`${format(date, 'EEEE, MMMM d, yyyy')} - ${completedCount} of ${totalHabits} habits completed`}
    >
      {/* Date header */}
      <div className={styles.dateHeader}>
        <div className={styles.dateNumber}>{format(date, 'd')}</div>
        <div className={styles.dayName}>{format(date, 'EEE')}</div>
        {isCurrentDay && <div className={styles.todayIndicator} aria-label='Today' />}
      </div>

      {/* Progress indicator */}
      {totalHabits > 0 && (
        <div className={styles.progressSection}>
          <div
            className={styles.progressBar}
            role='progressbar'
            aria-valuenow={completionRate}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${Math.round(completionRate)}% completed`}
          >
            <div className={styles.progressFill} style={{ width: `${completionRate}%` }} />
          </div>
          <div className={styles.completionCount}>
            {completedCount}/{totalHabits}
          </div>
        </div>
      )}

      {/* Habits list */}
      <div className={styles.habitsContainer}>
        {habits.length === 0 ? (
          <div className={styles.noHabits}>No habits</div>
        ) : (
          <div className={styles.habitsList}>
            {habits.map(habit => {
              const habitId = habit.habitId;
              const hasOptimisticUpdate = habitId in optimisticUpdates;
              const isCompleted = hasOptimisticUpdate
                ? optimisticUpdates[habitId]
                : habit.isCompleted;

              return (
                <div
                  key={habitId}
                  className={`${styles.habitItem} ${isCompleted ? styles.completed : ''}`}
                >
                  {/* Habit icon and name */}
                  <div className={styles.habitInfo}>
                    {habit.habitIcon && (
                      <div className={styles.habitIcon} style={{ color: habit.habitColor }}>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: IconLibrary.getIconSvgById(habit.habitIcon) || '',
                          }}
                        />
                      </div>
                    )}
                    <div className={styles.habitName} title={habit.habitName}>
                      {habit.habitName}
                    </div>
                  </div>

                  {/* Completion checkbox */}
                  <div className={styles.checkboxContainer}>
                    <CompletionCheckbox
                      habitId={habitId}
                      habitName={habit.habitName}
                      habitColor={habit.habitColor}
                      date={dateString}
                      size='small'
                      disabled={isFutureDate}
                      checked={isCompleted}
                      onChange={() => handleToggle(habitId)}
                      showStreak={false}
                      className={styles.habitCheckbox}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Future date overlay */}
      {isFutureDate && (
        <div className={styles.futureOverlay} aria-hidden='true'>
          <div className={styles.futureLabel}>Future</div>
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className={styles.loadingOverlay} aria-hidden='true'>
          <div className={styles.loadingSpinner} />
        </div>
      )}
    </div>
  );
};

export default CalendarDayCell;
