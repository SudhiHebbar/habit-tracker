import React, { useState, useCallback } from 'react';
import { startOfWeek } from 'date-fns';
import { WeekNavigator } from './WeekNavigator';
import { CalendarGrid } from './CalendarGrid';
import { useWeeklyCompletions } from '../../hooks/useWeeklyCompletions';
import { useHabitCompletionListener } from '../../../../shared/hooks/useEventBus';
import { completionApi } from '../../../habit-completion/services/completionApi';
import type { Habit } from '../../../habit-management/types/habit.types';
import styles from '../../../../../styles/features/dashboard/calendar/CalendarView.module.css';

interface CalendarViewProps {
  trackerId: number | null;
  habits: Habit[];
  onHabitComplete?: (habit: Habit) => void;
  className?: string;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  trackerId,
  habits,
  onHabitComplete,
  className = '',
}) => {
  // Current week state - start with current week
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // Fetch weekly completion data
  const { weeklyData, loading, error, refetch, isRefetching } = useWeeklyCompletions({
    trackerId,
    weekStart: currentWeek,
    enabled: !!trackerId,
  });

  // Handle week navigation
  const handleWeekChange = useCallback((newWeek: Date) => {
    setCurrentWeek(startOfWeek(newWeek, { weekStartsOn: 0 }));
  }, []);

  // Handle habit completion toggle
  const handleHabitToggle = useCallback(
    async (habitId: number, date: string) => {
      try {
        await completionApi.completeHabit(habitId, {
          date,
          isCompleted: true, // Toggle will be handled by backend
        });

        // Find the habit and trigger completion callback
        const habit = habits.find(h => h.id === habitId);
        if (habit && onHabitComplete) {
          onHabitComplete(habit);
        }

        // Refetch data to ensure consistency
        await refetch();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to toggle habit completion:', error);
        // TODO: Show error toast/notification
      }
    },
    [habits, onHabitComplete, refetch]
  );

  // Listen for habit completion events from other parts of the app
  useHabitCompletionListener(
    useCallback(() => {
      // Refetch calendar data when any habit is completed elsewhere
      refetch();
    }, [refetch])
  );

  // Handle retry on error
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <div className={`${styles.calendarView} ${className}`}>
      {/* Week Navigation */}
      <div className={styles.navigationSection}>
        <WeekNavigator
          currentWeek={currentWeek}
          onWeekChange={handleWeekChange}
          disabled={loading || isRefetching}
        />
      </div>

      {/* Calendar Content */}
      <div className={styles.calendarContent}>
        {error && !weeklyData ? (
          <div className={styles.errorState}>
            <div className={styles.errorContent}>
              <div className={styles.errorIcon}>
                <svg viewBox='0 0 20 20' fill='currentColor'>
                  <path
                    fillRule='evenodd'
                    d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <div className={styles.errorMessage}>
                <h3>Failed to load calendar</h3>
                <p>{error}</p>
                <button
                  className={styles.retryButton}
                  onClick={handleRetry}
                  disabled={isRefetching}
                >
                  {isRefetching ? 'Retrying...' : 'Try Again'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <CalendarGrid
            weeklyData={weeklyData}
            onHabitToggle={handleHabitToggle}
            loading={loading}
            error={error}
            currentWeek={currentWeek}
          />
        )}
      </div>

      {/* Loading indicator for refetch */}
      {isRefetching && weeklyData && (
        <div className={styles.refetchIndicator}>
          <div className={styles.refetchSpinner} />
          <span>Updating...</span>
        </div>
      )}

      {/* No tracker selected state */}
      {!trackerId && (
        <div className={styles.noTrackerState}>
          <div className={styles.noTrackerIcon}>
            <svg viewBox='0 0 20 20' fill='currentColor'>
              <path
                fillRule='evenodd'
                d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <div className={styles.noTrackerMessage}>
            <h3>No tracker selected</h3>
            <p>Select a tracker to view your habit calendar.</p>
          </div>
        </div>
      )}

      {/* Accessibility helper */}
      <div className={styles.srOnly}>
        Calendar view showing weekly habit completions. Use arrow keys to navigate between days and
        habits. Press Enter or Space to toggle habit completions.
        {loading && 'Loading calendar data...'}
        {error && `Error: ${error}`}
      </div>
    </div>
  );
};

export default CalendarView;
