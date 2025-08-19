import React from 'react';
import styles from '../../../styles/shared/components/button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}) => {
  const buttonClass = [
    styles.button,
    styles[variant],
    size !== 'medium' && styles[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button 
      className={buttonClass} 
      disabled={disabled || loading} 
      {...props}
    >
      {loading ? (
        <>
          <span style={{ opacity: 0.7 }}>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;