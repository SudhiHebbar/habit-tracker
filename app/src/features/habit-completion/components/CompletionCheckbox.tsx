import React, { useCallback, useState } from 'react';
import { useCompletion } from '../hooks/useCompletion';
import styles from './CompletionCheckbox.module.css';

interface CompletionCheckboxProps {
  habitId: number;
  habitName: string;
  habitColor: string;
  date?: string;
  size?: 'small' | 'medium' | 'large';
  showStreak?: boolean;
  onToggle?: (isCompleted: boolean) => void;
  className?: string;
}

export const CompletionCheckbox: React.FC<CompletionCheckboxProps> = ({
  habitId,
  habitName,
  habitColor,
  date,
  size = 'medium',
  showStreak = false,
  onToggle,
  className,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const { isCompleted, isOptimistic, isToggling, currentStreak, toggleCompletion } = useCompletion({
    habitId,
    date: date || new Date().toISOString().split('T')[0],
    onToggleSuccess: completion => {
      if (onToggle) {
        onToggle(completion.isCompleted);
      }

      // Trigger success animation
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    },
  });

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (isToggling) return;

      try {
        await toggleCompletion();
      } catch (error) {
        console.error('Failed to toggle completion:', error);
      }
    },
    [isToggling, toggleCompletion]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick(e as any);
      }
    },
    [handleClick]
  );

  return (
    <div
      className={`${styles.container} ${styles[size]} ${className || ''}`}
      data-completed={isCompleted}
      data-optimistic={isOptimistic}
      data-animating={isAnimating}
    >
      <button
        className={styles.checkbox}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={isToggling}
        aria-label={`Mark ${habitName} as ${isCompleted ? 'incomplete' : 'complete'}`}
        aria-checked={isCompleted}
        role='checkbox'
        style={
          {
            '--habit-color': habitColor,
          } as React.CSSProperties
        }
      >
        <div className={styles.checkboxInner}>
          {isCompleted && (
            <svg
              className={styles.checkmark}
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='3'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <polyline points='20 6 9 17 4 12' />
            </svg>
          )}
        </div>

        {isToggling && <div className={styles.loadingSpinner} />}

        {isAnimating && isCompleted && <div className={styles.successRipple} />}
      </button>

      {showStreak && currentStreak > 0 && (
        <div className={styles.streakBadge}>
          <span className={styles.streakIcon}>🔥</span>
          <span className={styles.streakCount}>{currentStreak}</span>
        </div>
      )}
    </div>
  );
};
