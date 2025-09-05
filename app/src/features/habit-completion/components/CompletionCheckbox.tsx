import React, { useCallback, useState } from 'react';
import { useCompletion } from '../hooks/useCompletion';
import { CompletionCelebration } from '../../animations/components/CompletionCelebration';
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
  disabled?: boolean;
  checked?: boolean;
  onChange?: () => void;
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
  disabled = false,
  checked,
  onChange,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

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

      // Trigger celebration effects for completion (not uncomplete)
      if (completion.isCompleted) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000); // Show celebration for 3 seconds
      }
    },
  });

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled || isToggling) return;

      // Use external onChange handler if provided (for calendar view)
      if (onChange) {
        onChange();
        return;
      }

      try {
        await toggleCompletion();
      } catch (error) {
        console.error('Failed to toggle completion:', error);
      }
    },
    [disabled, isToggling, onChange, toggleCompletion]
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
      data-completed={checked ?? isCompleted}
      data-optimistic={isOptimistic}
      data-animating={isAnimating}
    >
      <button
        className={styles.checkbox}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled || isToggling}
        aria-label={`Mark ${habitName} as ${(checked ?? isCompleted) ? 'incomplete' : 'complete'}`}
        aria-checked={checked ?? isCompleted}
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

      {/* Celebration Effects */}
      {showCelebration && (
        <CompletionCelebration
          type='confetti'
          color={habitColor}
          onComplete={() => setShowCelebration(false)}
          duration={2500}
        />
      )}
    </div>
  );
};
