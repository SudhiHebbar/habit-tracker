import React from 'react';
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek, isSameWeek } from 'date-fns';
import styles from '../../../../../styles/features/dashboard/calendar/WeekNavigator.module.css';

interface WeekNavigatorProps {
  currentWeek: Date;
  onWeekChange: (week: Date) => void;
  disabled?: boolean;
}

export const WeekNavigator: React.FC<WeekNavigatorProps> = ({
  currentWeek,
  onWeekChange,
  disabled = false,
}) => {
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 }); // Sunday = 0
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 0 });
  const today = new Date();

  const handlePreviousWeek = () => {
    const previousWeek = subWeeks(weekStart, 1);
    onWeekChange(previousWeek);
  };

  const handleNextWeek = () => {
    const nextWeek = addWeeks(weekStart, 1);
    onWeekChange(nextWeek);
  };

  const handleToday = () => {
    onWeekChange(today);
  };

  const isCurrentWeek = isSameWeek(weekStart, today, { weekStartsOn: 0 });
  const canGoNext = true; // Allow future navigation for viewing

  // Format week range display
  const formatWeekRange = () => {
    const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
    const sameYear = weekStart.getFullYear() === weekEnd.getFullYear();

    if (sameMonth && sameYear) {
      return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'd, yyyy')}`;
    } else if (sameYear) {
      return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
    } else {
      return `${format(weekStart, 'MMM d, yyyy')} - ${format(weekEnd, 'MMM d, yyyy')}`;
    }
  };

  return (
    <div className={styles.weekNavigator}>
      <div className={styles.navigationControls}>
        <button
          className={styles.navButton}
          onClick={handlePreviousWeek}
          disabled={disabled}
          title='Previous week'
          aria-label='Go to previous week'
        >
          <svg
            viewBox='0 0 20 20'
            fill='currentColor'
            className={styles.navIcon}
            aria-hidden='true'
          >
            <path
              fillRule='evenodd'
              d='M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z'
              clipRule='evenodd'
            />
          </svg>
        </button>

        <div className={styles.weekDisplay}>
          <div className={styles.weekRange} title={formatWeekRange()}>
            {formatWeekRange()}
          </div>
          {!isCurrentWeek && (
            <button
              className={styles.todayButton}
              onClick={handleToday}
              disabled={disabled}
              title='Go to current week'
            >
              Today
            </button>
          )}
        </div>

        <button
          className={styles.navButton}
          onClick={handleNextWeek}
          disabled={disabled || !canGoNext}
          title='Next week'
          aria-label='Go to next week'
        >
          <svg
            viewBox='0 0 20 20'
            fill='currentColor'
            className={styles.navIcon}
            aria-hidden='true'
          >
            <path
              fillRule='evenodd'
              d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
              clipRule='evenodd'
            />
          </svg>
        </button>
      </div>

      {/* Week overview info */}
      <div className={styles.weekInfo}>
        <span className={styles.weekLabel}>
          Week of {format(weekStart, 'MMM d, yyyy')}
          {isCurrentWeek && <span className={styles.currentWeekBadge}>Current</span>}
        </span>
      </div>
    </div>
  );
};

export default WeekNavigator;
