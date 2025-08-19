// React Bits FadeText Component
// This is a simplified version - React Bits components would be added via jsrepo
import React, { useState, useEffect } from 'react';
import styles from './FadeText.module.css';

interface FadeTextProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
  delay?: number;
  duration?: number;
}

const FadeText: React.FC<FadeTextProps> = ({
  text,
  delay = 0,
  duration = 500,
  className = '',
  style,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`${styles.fadeText} ${isVisible ? styles.visible : ''} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        ...style,
      }}
      {...props}
    >
      {text}
    </div>
  );
};

export default FadeText;