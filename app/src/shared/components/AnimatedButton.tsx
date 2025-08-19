// React Bits inspired AnimatedButton Component
import React, { useState } from 'react';
import Button from './Button';
import styles from './AnimatedButton.module.css';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  animationType?: 'pulse' | 'bounce' | 'shake';
  children: React.ReactNode;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  animationType = 'pulse',
  className = '',
  onClick,
  children,
  ...props
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsAnimating(true);
    
    // Reset animation after it completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);

    if (onClick) {
      onClick(e);
    }
  };

  const buttonClass = [
    className,
    isAnimating && styles[animationType],
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Button
      variant={variant}
      size={size}
      className={buttonClass}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  );
};

export default AnimatedButton;