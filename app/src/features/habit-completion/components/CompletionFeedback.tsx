import React, { useState, useEffect } from 'react';
import styles from './CompletionFeedback.module.css';

interface CompletionFeedbackProps {
  type: 'success' | 'error' | 'offline';
  message: string;
  habitName?: string;
  streak?: number;
  autoHide?: boolean;
  autoHideDelay?: number;
  onHide?: () => void;
  className?: string;
}

export const CompletionFeedback: React.FC<CompletionFeedbackProps> = ({
  type,
  message,
  habitName,
  streak,
  autoHide = true,
  autoHideDelay = 3000,
  onHide,
  className
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Start animation
    const animationTimer = setTimeout(() => {
      setIsAnimating(false);
    }, 300);

    // Auto-hide if enabled
    let hideTimer: ReturnType<typeof setTimeout>;
    if (autoHide) {
      hideTimer = setTimeout(() => {
        handleHide();
      }, autoHideDelay);
    }

    return () => {
      clearTimeout(animationTimer);
      if (hideTimer) {
        clearTimeout(hideTimer);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleHide = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onHide) {
        onHide();
      }
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        );
      case 'error':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M15 9l-6 6" />
            <path d="M9 9l6 6" />
          </svg>
        );
      case 'offline':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 9l-7 7-4.5-4.5-5 5-3.5-3.5" />
            <path d="M17 14h6v6" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`${styles.feedback} ${styles[type]} ${className || ''}`}
      data-animating={isAnimating}
    >
      <div className={styles.content}>
        <div className={styles.icon}>
          {getIcon()}
        </div>
        
        <div className={styles.text}>
          <div className={styles.message}>{message}</div>
          {habitName && (
            <div className={styles.habitName}>{habitName}</div>
          )}
        </div>
        
        {streak && streak > 0 && (
          <div className={styles.streak}>
            <span className={styles.streakIcon}>🔥</span>
            <span className={styles.streakCount}>{streak}</span>
          </div>
        )}
      </div>
      
      {type === 'success' && (
        <div className={styles.particles}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={styles.particle} />
          ))}
        </div>
      )}
      
      <button 
        className={styles.closeButton} 
        onClick={handleHide}
        aria-label="Close notification"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18" />
          <path d="M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};