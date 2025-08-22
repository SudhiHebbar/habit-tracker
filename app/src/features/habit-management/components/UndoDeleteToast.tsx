import React, { useState, useEffect, useCallback } from 'react';
import { useDeleteHabit } from '../hooks/useDeleteHabit';
import type { Habit } from '../types/habit.types';
import styles from './UndoDeleteToast.module.css';

interface UndoDeleteToastProps {
  habit: Habit | null;
  isVisible: boolean;
  onUndoComplete: (habit: Habit) => void;
  onTimeout: () => void;
  onClose: () => void;
  timeoutDuration?: number; // in seconds
}

export const UndoDeleteToast: React.FC<UndoDeleteToastProps> = ({
  habit,
  isVisible,
  onUndoComplete,
  onTimeout,
  onClose,
  timeoutDuration = 5
}) => {
  const [timeLeft, setTimeLeft] = useState(timeoutDuration);
  const [isUndoing, setIsUndoing] = useState(false);

  const { undoDelete, loading, error } = useDeleteHabit();

  // Reset timer when habit changes or toast becomes visible
  useEffect(() => {
    if (isVisible && habit) {
      setTimeLeft(timeoutDuration);
      setIsUndoing(false);
    }
  }, [isVisible, habit, timeoutDuration]);

  // Countdown timer
  useEffect(() => {
    if (!isVisible || isUndoing || timeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, isUndoing, timeLeft, onTimeout]);

  const handleUndo = useCallback(async () => {
    if (!habit || isUndoing) return;

    setIsUndoing(true);

    try {
      const response = await undoDelete(habit.id);
      if (response) {
        onUndoComplete(habit);
      }
    } catch (err) {
      console.error('Failed to undo deletion:', err);
      // Continue showing the toast so user can try again
      setIsUndoing(false);
    }
  }, [habit, isUndoing, undoDelete, onUndoComplete]);

  const handleClose = useCallback(() => {
    if (!isUndoing) {
      onClose();
    }
  }, [isUndoing, onClose]);

  const progressPercentage = (timeLeft / timeoutDuration) * 100;

  if (!isVisible || !habit) {
    return null;
  }

  return (
    <div className={`${styles.toast} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.content}>
        <div className={styles.habitInfo}>
          <div 
            className={styles.habitColor} 
            style={{ backgroundColor: habit.color }}
          />
          <div className={styles.textContent}>
            <div className={styles.message}>
              <strong>{habit.name}</strong> was deleted
            </div>
            {error && (
              <div className={styles.errorText}>
                Failed to undo: {error}
              </div>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.undoButton}
            onClick={handleUndo}
            disabled={isUndoing || loading}
          >
            {isUndoing || loading ? (
              <>
                <div className={styles.undoSpinner} />
                Undoing...
              </>
            ) : (
              'Undo'
            )}
          </button>

          <div className={styles.timer}>
            {!isUndoing && timeLeft > 0 && (
              <span className={styles.timeText}>{timeLeft}s</span>
            )}
          </div>

          <button
            className={styles.closeButton}
            onClick={handleClose}
            disabled={isUndoing}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className={styles.progressBar}>
        <div 
          className={styles.progress}
          style={{ 
            width: `${progressPercentage}%`,
            transition: isUndoing ? 'none' : 'width 1s linear'
          }}
        />
      </div>
    </div>
  );
};

export default UndoDeleteToast;