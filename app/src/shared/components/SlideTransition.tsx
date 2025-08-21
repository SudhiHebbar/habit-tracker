import React, { useEffect, useState } from 'react';
import styles from '@styles/shared/transitions.module.css';

interface SlideTransitionProps {
  children: React.ReactNode;
  show: boolean;
  direction?: 'left' | 'right' | 'up' | 'down';
  duration?: number;
  className?: string;
}

export const SlideTransition: React.FC<SlideTransitionProps> = ({
  children,
  show,
  direction = 'left',
  duration = 300,
  className = ''
}) => {
  const [shouldRender, setShouldRender] = useState(show);
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!shouldRender) return null;

  const directionClass = styles[`slide${direction.charAt(0).toUpperCase()}${direction.slice(1)}`];

  return (
    <div
      className={`${styles.slideTransition} ${directionClass} ${isVisible ? styles.visible : ''} ${className}`}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
};