import React from 'react';
import type { Habit } from '../types/habit.types';
import styles from './HabitCard.module.css';

interface HabitCardProps {
  habit: Habit;
  onEdit?: (habit: Habit) => void;
  onDelete?: (habit: Habit) => void;
  onToggleComplete?: (habit: Habit) => void;
  isCompleted?: boolean;
  showStats?: boolean;
  className?: string;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onEdit,
  onDelete,
  onToggleComplete,
  isCompleted = false,
  showStats = true,
  className = ''
}) => {
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(habit);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(habit);
  };

  const handleCompleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComplete?.(habit);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const getFrequencyDisplay = (frequency: string, targetCount: number) => {
    if (frequency === 'Daily') return targetCount === 1 ? 'Daily' : `${targetCount}x Daily`;
    if (frequency === 'Weekly') return targetCount === 1 ? 'Weekly' : `${targetCount}x Weekly`;
    return `${targetCount}x ${frequency}`;
  };

  return (
    <div 
      className={`${styles.habitCard} ${isCompleted ? styles.completed : ''} ${className}`}
      style={{ '--habit-color': habit.color } as React.CSSProperties}
    >
      {/* Header with color bar and actions */}
      <div className={styles.header}>
        <div className={styles.colorBar} />
        <div className={styles.actions}>
          {onToggleComplete && (
            <button
              className={`${styles.actionButton} ${styles.completeButton} ${isCompleted ? styles.active : ''}`}
              onClick={handleCompleteClick}
              title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
              aria-label={isCompleted ? 'Mark habit as incomplete' : 'Mark habit as complete'}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className={styles.icon}>
                <path 
                  fillRule="evenodd" 
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                  clipRule="evenodd" 
                />
              </svg>
            </button>
          )}
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

        {/* Statistics */}
        {showStats && (
          <div className={styles.stats}>
            <div className={styles.statGroup}>
              <div className={styles.stat}>
                <span className={styles.statValue}>{habit.currentStreak || 0}</span>
                <span className={styles.statLabel}>Current Streak</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>{habit.longestStreak || 0}</span>
                <span className={styles.statLabel}>Best Streak</span>
              </div>
            </div>
            
            <div className={styles.statGroup}>
              <div className={styles.stat}>
                <span className={styles.statValue}>{habit.completionsThisWeek}</span>
                <span className={styles.statLabel}>This Week</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>{habit.completionsThisMonth}</span>
                <span className={styles.statLabel}>This Month</span>
              </div>
            </div>
          </div>
        )}

        {/* Last completion */}
        {habit.lastCompletedDate && (
          <div className={styles.lastCompletion}>
            <span className={styles.lastCompletionLabel}>Last completed:</span>
            <span className={styles.lastCompletionDate}>
              {formatDate(habit.lastCompletedDate)}
            </span>
          </div>
        )}
      </div>

      {/* Footer with creation date */}
      <div className={styles.footer}>
        <span className={styles.createdDate}>
          Created {formatDate(habit.createdAt)}
        </span>
      </div>
    </div>
  );
};

export default HabitCard;