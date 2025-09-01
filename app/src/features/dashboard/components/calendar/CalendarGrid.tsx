import React, { useMemo } from 'react';
import { startOfWeek, addDays, format } from 'date-fns';
import { CalendarDayCell } from './CalendarDayCell';
import { SkeletonCalendarCell } from '../../../animations/components/SkeletonLoader';
import type {
  WeeklyCompletions,
  CompletionItem,
} from '../../../habit-completion/types/completion.types';
import styles from '../../../../../styles/features/dashboard/calendar/CalendarGrid.module.css';

interface HabitWithCompletion {
  id: number;
  habitId: number;
  habitName: string;
  habitColor: string;
  habitIcon?: string;
  isCompleted: boolean;
}

interface CalendarGridProps {
  weeklyData: WeeklyCompletions | null;
  onHabitToggle: (habitId: number, date: string) => void;
  loading: boolean;
  error?: string | null;
  currentWeek: Date;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  weeklyData,
  onHabitToggle,
  loading,
  error,
  currentWeek,
}) => {
  // Generate week days (Sunday to Saturday)
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  }, [currentWeek]);

  // Get unique habits from weekly data
  const allHabits = useMemo(() => {
    if (!weeklyData?.completionsByDate) return [];

    const habitMap = new Map<number, { name: string; color: string; icon?: string }>();

    Object.values(weeklyData.completionsByDate).forEach(dayCompletions => {
      dayCompletions.forEach(completion => {
        if (!habitMap.has(completion.habitId)) {
          habitMap.set(completion.habitId, {
            name: completion.habitName,
            color: completion.habitColor,
            icon: completion.habitIcon,
          });
        }
      });
    });

    return Array.from(habitMap.entries()).map(([habitId, habit]) => ({
      id: habitId,
      habitId,
      habitName: habit.name,
      habitColor: habit.color,
      habitIcon: habit.icon,
      isCompleted: false, // Will be set per day
    }));
  }, [weeklyData]);

  // Get habits with completion status for a specific date
  const getHabitsForDate = (date: Date): HabitWithCompletion[] => {
    if (!weeklyData?.completionsByDate) return [];

    const dateKey = format(date, 'yyyy-MM-dd');
    const dayCompletions = weeklyData.completionsByDate[dateKey] || [];
    const completionMap = new Map(dayCompletions.map(c => [c.habitId, c.isCompleted]));

    return allHabits.map(habit => ({
      id: habit.habitId, // Add the missing id field
      habitId: habit.habitId,
      habitName: habit.name,
      habitColor: habit.color,
      habitIcon: habit.icon,
      isCompleted: completionMap.get(habit.habitId) || false,
    }));
  };

  // Calculate weekly stats
  const weeklyStats = useMemo(() => {
    if (!weeklyData || allHabits.length === 0) {
      return { totalPossible: 0, completed: 0, completionRate: 0 };
    }

    const totalPossible = allHabits.length * 7; // 7 days
    const completed = Object.values(weeklyData.completionsByDate).reduce(
      (sum, dayCompletions) => sum + dayCompletions.filter(c => c.isCompleted).length,
      0
    );

    return {
      totalPossible,
      completed,
      completionRate: totalPossible > 0 ? (completed / totalPossible) * 100 : 0,
    };
  }, [weeklyData, allHabits]);

  if (error) {
    return (
      <div className={styles.errorState}>
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
          <h3>Failed to load calendar data</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.calendarGrid}>
      {/* Week stats header */}
      {!loading && weeklyData && (
        <div className={styles.weekStats}>
          <div className={styles.statsItem}>
            <span className={styles.statsValue}>{weeklyStats.completed}</span>
            <span className={styles.statsLabel}>Completed</span>
          </div>
          <div className={styles.statsItem}>
            <span className={styles.statsValue}>{weeklyStats.totalPossible}</span>
            <span className={styles.statsLabel}>Total</span>
          </div>
          <div className={styles.statsItem}>
            <span className={styles.statsValue}>{Math.round(weeklyStats.completionRate)}%</span>
            <span className={styles.statsLabel}>Success Rate</span>
          </div>
        </div>
      )}

      {/* Calendar grid header */}
      <div className={styles.gridHeader}>
        {weekDays.map(day => (
          <div key={day.toISOString()} className={styles.dayHeader}>
            <div className={styles.dayHeaderContent}>
              <span className={styles.dayName}>{format(day, 'EEEE')}</span>
              <span className={styles.dayDate}>{format(day, 'MMM d')}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Calendar grid body */}
      <div
        className={styles.gridBody}
        role='grid'
        aria-label='Weekly habit calendar'
        aria-rowcount={2} // Header + content
        aria-colcount={7}
      >
        <div className={styles.gridRow} role='row' aria-rowindex={2}>
          {weekDays.map(day => (
            <div key={day.toISOString()} className={styles.gridCell}>
              {loading ? (
                <SkeletonCalendarCell />
              ) : (
                <CalendarDayCell
                  date={day}
                  habits={getHabitsForDate(day)}
                  onToggle={onHabitToggle}
                  loading={false}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {!loading && (!weeklyData || allHabits.length === 0) && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg viewBox='0 0 20 20' fill='currentColor'>
              <path
                fillRule='evenodd'
                d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <div className={styles.emptyMessage}>
            <h3>No habits for this week</h3>
            <p>Create some habits to start tracking your progress!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarGrid;
