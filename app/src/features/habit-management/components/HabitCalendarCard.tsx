import React, { useState } from 'react';
import { CompletionCheckbox } from '../../habit-completion/components/CompletionCheckbox';
import { useCompletion } from '../../habit-completion/hooks/useCompletion';
import type { Habit } from '../types/habit.types';
import styles from './HabitCalendarCard.module.css';

interface HabitCalendarCardProps {
  habit: Habit;
  onEdit?: (habit: Habit) => void;
  onDelete?: (habit: Habit) => void;
  showStats?: boolean;
  className?: string;
}

export const HabitCalendarCard: React.FC<HabitCalendarCardProps> = ({
  habit,
  onEdit,
  onDelete,
  showStats = true,
  className = ''
}) => {
  // Generate last 7 days for quick completion tracking
  const generateWeekDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const weekDates = generateWeekDates();

  // Get real-time completion data for selected date
  const {
    stats,
    currentStreak,
    longestStreak,
    completionRate
  } = useCompletion({
    habitId: habit.id,
    date: selectedDate,
    autoFetch: showStats
  });

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(habit);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(habit);
  };

  const formatDateDisplay = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    if (dateString === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateString === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getFrequencyDisplay = (frequency: string, targetCount: number) => {
    if (frequency === 'Daily') return targetCount === 1 ? 'Daily' : `${targetCount}x Daily`;
    if (frequency === 'Weekly') return targetCount === 1 ? 'Weekly' : `${targetCount}x Weekly`;
    return `${targetCount}x ${frequency}`;
  };

  return (
    <div 
      className={`${styles.habitCalendarCard} ${className}`}
      style={{ '--habit-color': habit.color } as React.CSSProperties}
    >
      {/* Header with color bar and actions */}
      <div className={styles.header}>
        <div className={styles.colorBar} />
        <div className={styles.actions}>
          {onEdit && (
            <button
              className={`${styles.actionButton} ${styles.editButton}`}
              onClick={handleEditClick}
              title="Edit habit"
              aria-label="Edit habit"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className={styles.icon}>
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              className={`${styles.actionButton} ${styles.deleteButton}`}
              onClick={handleDeleteClick}
              title="Delete habit"
              aria-label="Delete habit"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className={styles.icon}>
                <path 
                  fillRule="evenodd" 
                  d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 2a1 1 0 000 2h6a1 1 0 100-2H7zm0 4a1 1 0 100 2h6a1 1 0 100-2H7z" 
                  clipRule="evenodd" 
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className={styles.content}>
        {/* Icon and title */}
        <div className={styles.titleSection}>
          {habit.icon && (
            <div className={styles.iconContainer}>
              <span className={styles.habitIcon}>{habit.icon}</span>
            </div>
          )}
          <div className={styles.titleContent}>
            <h3 className={styles.habitName}>{habit.name}</h3>
            {habit.description && (
              <p className={styles.habitDescription}>{habit.description}</p>
            )}
          </div>
        </div>

        {/* Frequency and target */}
        <div className={styles.frequencySection}>
          <span className={styles.frequency}>
            {getFrequencyDisplay(habit.targetFrequency, habit.targetCount)}
          </span>
        </div>

        {/* Week view with completion checkboxes */}
        <div className={styles.weekView}>
          <h4 className={styles.weekTitle}>This Week</h4>
          <div className={styles.weekDays}>
            {weekDates.map((date) => (
              <div 
                key={date} 
                className={`${styles.dayColumn} ${selectedDate === date ? styles.selected : ''}`}
                onClick={() => setSelectedDate(date)}
              >
                <div className={styles.dayLabel}>
                  {formatDateDisplay(date)}
                </div>
                <CompletionCheckbox
                  habitId={habit.id}
                  habitName={habit.name}
                  habitColor={habit.color}
                  date={date}
                  size="medium"
                  showStreak={false}
                  className={styles.dayCheckbox}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Statistics */}
        {showStats && (
          <div className={styles.stats}>
            <div className={styles.statGroup}>
              <div className={styles.stat}>
                <span className={styles.statValue}>
                  {currentStreak > 0 && <span className={styles.streakIcon}>🔥</span>}
                  {currentStreak}
                </span>
                <span className={styles.statLabel}>Current Streak</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>{longestStreak}</span>
                <span className={styles.statLabel}>Best Streak</span>
              </div>
            </div>
            
            <div className={styles.statGroup}>
              <div className={styles.stat}>
                <span className={styles.statValue}>
                  {stats?.totalCompletions || 0}
                </span>
                <span className={styles.statLabel}>Total Done</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>
                  {completionRate ? Math.round(completionRate) : 0}%
                </span>
                <span className={styles.statLabel}>Success Rate</span>
              </div>
            </div>
          </div>
        )}

        {/* Selected date info */}
        <div className={styles.selectedDateInfo}>
          <span className={styles.selectedDateLabel}>
            Viewing: {formatDateDisplay(selectedDate)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HabitCalendarCard;