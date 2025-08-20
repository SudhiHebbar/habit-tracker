import React from 'react';
import styles from './CompletionIndicator.module.css';

interface CompletionIndicatorProps {
  isCompleted: boolean;
  isOptimistic?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  showLabel?: boolean;
  className?: string;
}

export const CompletionIndicator: React.FC<CompletionIndicatorProps> = ({
  isCompleted,
  isOptimistic = false,
  size = 'medium',
  color = '#10B981',
  showLabel = false,
  className
}) => {
  return (
    <div 
      className={`${styles.indicator} ${styles[size]} ${className || ''}`}
      data-completed={isCompleted}
      data-optimistic={isOptimistic}
      style={{
        '--indicator-color': color
      } as React.CSSProperties}
    >
      <div className={styles.dot}>
        {isCompleted && (
          <svg 
            className={styles.check} 
            viewBox="0 0 12 12" 
            fill="none" 
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M2 6l3 3 5-6" />
          </svg>
        )}
      </div>
      
      {showLabel && (
        <span className={styles.label}>
          {isCompleted ? 'Complete' : 'Incomplete'}
        </span>
      )}
    </div>
  );
};