import React, { useCallback, useState } from 'react';
import { useCompletion } from '../hooks/useCompletion';
import styles from './CompletionButton.module.css';

interface CompletionButtonProps {
  habitId: number;
  habitName: string;
  habitColor: string;
  habitIcon?: string;
  date?: string;
  variant?: 'default' | 'card' | 'inline';
  showStats?: boolean;
  onToggle?: (isCompleted: boolean) => void;
  className?: string;
}

export const CompletionButton: React.FC<CompletionButtonProps> = ({
  habitId,
  habitName,
  habitColor,
  habitIcon,
  date,
  variant = 'default',
  showStats = false,
  onToggle,
  className
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  const {
    isCompleted,
    isOptimistic,
    isToggling,
    currentStreak,
    completionRate,
    toggleCompletion
  } = useCompletion({
    habitId,
    date: date || new Date().toISOString().split('T')[0],
    onToggleSuccess: (completion) => {
      if (onToggle) {
        onToggle(completion.isCompleted);
      }
      
      // Trigger success animation
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    }
  });

  const handleClick = useCallback(async () => {
    if (isToggling) return;
    
    try {
      await toggleCompletion();
    } catch (error) {
      console.error('Failed to toggle completion:', error);
    }
  }, [isToggling, toggleCompletion]);

  return (
    <button
      className={`${styles.button} ${styles[variant]} ${className || ''}`}
      onClick={handleClick}
      disabled={isToggling}
      data-completed={isCompleted}
      data-optimistic={isOptimistic}
      data-animating={isAnimating}
      style={{
        '--habit-color': habitColor
      } as React.CSSProperties}
      aria-label={`Mark ${habitName} as ${isCompleted ? 'incomplete' : 'complete'}`}
    >
      <div className={styles.content}>
        {habitIcon && (
          <span className={styles.icon}>{habitIcon}</span>
        )}
        
        <span className={styles.name}>{habitName}</span>
        
        {showStats && (
          <div className={styles.stats}>
            {currentStreak > 0 && (
              <span className={styles.streak}>
                🔥 {currentStreak}
              </span>
            )}
            {completionRate > 0 && (
              <span className={styles.rate}>
                {Math.round(completionRate)}%
              </span>
            )}
          </div>
        )}
        
        <div className={styles.checkIndicator}>
          {isCompleted ? (
            <svg 
              className={styles.checkmark} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : (
            <div className={styles.circle} />
          )}
        </div>
      </div>
      
      {isToggling && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner} />
        </div>
      )}
      
      {isAnimating && (
        <div className={styles.successFlash} />
      )}
    </button>
  );
};