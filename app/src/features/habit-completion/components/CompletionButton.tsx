import React, { useCallback, useState } from 'react';
import { useCompletion } from '../hooks/useCompletion';
import styles from './CompletionButton.module.css';

// Simple icon mapping for common habit icons
const HABIT_ICONS: Record<string, string> = {
  'heart': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
  'water-drop': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2C20 10.48 17.33 6.55 12 2z"/></svg>',
  'dumbbell': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/></svg>',
  'book': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/></svg>',
  'sun': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/></svg>',
  'moon': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.75 4.09L15.22 6.03l2.53 1.94L17.75 4.09zM21.25 11L23 7.5l-1.75-3.5-.85.65L21 7.5l-.6 2.85.85.65zM22 13h-1l-1-1V9.5h1l1 1v2.5zM6 6c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm8.31 8.31L12 12l2.31-2.31 1.38 1.38L13.38 13.38l2.31 2.31-1.38 1.38z"/></svg>',
};

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
  className,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const { isCompleted, isOptimistic, isToggling, currentStreak, completionRate, toggleCompletion } =
    useCompletion({
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
      style={
        {
          '--habit-color': habitColor,
        } as React.CSSProperties
      }
      aria-label={`Mark ${habitName} as ${isCompleted ? 'incomplete' : 'complete'}`}
    >
      <div className={styles.content}>
        {habitIcon && (
          <div className={styles.icon}>
            {(() => {
              const iconSvg = HABIT_ICONS[habitIcon];
              if (iconSvg) {
                return (
                  <div 
                    dangerouslySetInnerHTML={{ __html: iconSvg }}
                    style={{ width: '16px', height: '16px', color: habitColor }}
                  />
                );
              }
              return (
                <div style={{
                  width: '16px',
                  height: '16px',
                  backgroundColor: habitColor,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '8px',
                  fontWeight: 'bold',
                  color: 'white'
                }}>
                  {habitIcon.charAt(0).toUpperCase()}
                </div>
              );
            })()}
          </div>
        )}

        <span className={styles.name}>{habitName}</span>

        {showStats && (
          <div className={styles.stats}>
            {currentStreak > 0 && <span className={styles.streak}>🔥 {currentStreak}</span>}
            {completionRate > 0 && (
              <span className={styles.rate}>{Math.round(completionRate)}%</span>
            )}
          </div>
        )}

        <div className={styles.checkIndicator}>
          {isCompleted ? (
            <svg
              className={styles.checkmark}
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
            >
              <path d='M20 6L9 17l-5-5' />
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

      {isAnimating && <div className={styles.successFlash} />}
    </button>
  );
};
