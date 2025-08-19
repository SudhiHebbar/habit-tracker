import React from 'react';
import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color,
  className = '',
}) => {
  const spinnerClass = [styles.spinner, styles[size], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={spinnerClass} role="presentation" aria-hidden="true">
      <div 
        className={styles.circle} 
        style={color ? { borderTopColor: color } : undefined}
      />
    </div>
  );
};

export default LoadingSpinner;