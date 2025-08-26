import React from 'react';
import { CompletionCheckbox } from '../../habit-completion/components/CompletionCheckbox';
import { useCompletion } from '../../habit-completion/hooks/useCompletion';
import { LazyHabitHistory } from '../../dashboard/components/LazyHabitHistory';
import type { Habit } from '../types/habit.types';
import styles from './HabitCard.module.css';

// Simple icon mapping for common habit icons
const HABIT_ICONS: Record<string, string> = {
  'heart': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
  'water': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2C20 10.48 17.33 6.55 12 2z"/></svg>',
  'dumbbell': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71 3.43 9.14 7 5.57 15.57 14.14 12 17.71 13.43 19.14 14.86 17.71 16.29 19.14 18.43 17 19.86 18.43 21.29 17l-1.43-1.43L22 13.43z"/></svg>',
  'running': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/></svg>',
  'meditation': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 12c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm-2-9c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z"/></svg>',
  'book': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/></svg>',
  'sun': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/></svg>',
  'star': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>',
  'coffee': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3z"/></svg>',
};

interface HabitCardProps {
  habit: Habit;
  onEdit?: (habit: Habit) => void;
  onDelete?: (habit: Habit) => void;
  onToggleComplete?: (habit: Habit) => void;
  isCompleted?: boolean;
  showStats?: boolean;
  showHistory?: boolean;
  completionDate?: string; // Date for which to track completion (YYYY-MM-DD)
  className?: string;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onEdit,
  onDelete,
  onToggleComplete,
  isCompleted = false,
  showStats = true,
  showHistory = false,
  completionDate,
  className = '',
}) => {
  const currentDate = completionDate || new Date().toISOString().split('T')[0];

  // Get real-time completion data
  const { stats, currentStreak, longestStreak, completionRate } = useCompletion({
    habitId: habit.id,
    date: currentDate,
    autoFetch: showStats,
  });

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(habit);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(habit);
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
      className={`${styles.habitCard} ${isCompleted ? styles.completed : ''} ${!habit.isActive ? styles.inactive : ''} ${className}`}
      style={{ '--habit-color': habit.color } as React.CSSProperties}
    >
      {/* Header with color bar and actions */}
      <div className={styles.header}>
        <div className={styles.colorBar} />
        <div className={styles.actions}>
          {onToggleComplete && (
            <CompletionCheckbox
              habitId={habit.id}
              habitName={habit.name}
              habitColor={habit.color}
              date={completionDate || new Date().toISOString().split('T')[0]}
              size='large'
              showStreak
              onToggle={() => {
                // Optional: Handle completion state change
              }}
              className={styles.completionCheckbox}
            />
          )}
          {onEdit && (
            <button
              className={`${styles.actionButton} ${styles.editButton}`}
              onClick={handleEditClick}
              title='Edit habit'
              aria-label='Edit habit'
            >
              <svg viewBox='0 0 20 20' fill='currentColor' className={styles.icon}>
                <path d='M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z' />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              className={`${styles.actionButton} ${styles.deleteButton}`}
              onClick={handleDeleteClick}
              title='Delete habit'
              aria-label='Delete habit'
            >
              <svg viewBox='0 0 20 20' fill='currentColor' className={styles.icon}>
                <path
                  fillRule='evenodd'
                  d='M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 2a1 1 0 000 2h6a1 1 0 100-2H7zm0 4a1 1 0 100 2h6a1 1 0 100-2H7z'
                  clipRule='evenodd'
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
              <div className={styles.habitIcon}>
                {(() => {
                  const iconSvg = HABIT_ICONS[habit.icon];
                  if (iconSvg) {
                    return (
                      <div 
                        dangerouslySetInnerHTML={{ __html: iconSvg }}
                        style={{ width: '24px', height: '24px', color: habit.color }}
                      />
                    );
                  }
                  return (
                    <div style={{
                      width: '24px',
                      height: '24px',
                      backgroundColor: habit.color,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: 'white'
                    }}>
                      {habit.icon.charAt(0).toUpperCase()}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
          <div className={styles.titleContent}>
            <h3 className={styles.habitName}>
              {habit.name}
              {!habit.isActive && <span className={styles.inactiveLabel}> (Inactive)</span>}
            </h3>
            {habit.description && <p className={styles.habitDescription}>{habit.description}</p>}
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
                  {stats ? stats.totalCompletions || 0 : habit.completionsThisWeek || 0}
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

        {/* Last completion */}
        {habit.lastCompletedDate && !showHistory && (
          <div className={styles.lastCompletion}>
            <span className={styles.lastCompletionLabel}>Last completed:</span>
            <span className={styles.lastCompletionDate}>{formatDate(habit.lastCompletedDate)}</span>
          </div>
        )}

        {/* Lazy-loaded completion history */}
        {showHistory && (
          <div className={styles.historySection}>
            <LazyHabitHistory
              habitId={habit.id}
              habitName={habit.name}
              days={30}
              className={styles.habitHistory}
            />
          </div>
        )}
      </div>

      {/* Footer with creation date */}
      <div className={styles.footer}>
        <span className={styles.createdDate}>Created {formatDate(habit.createdAt)}</span>
      </div>
    </div>
  );
};

export default HabitCard;
