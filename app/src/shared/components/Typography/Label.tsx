import React from 'react';
import styles from '../../../../styles/shared/typography/Label.module.css';

interface LabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  size?: 'xs' | 'sm' | 'md';
  weight?: 'normal' | 'medium' | 'semibold';
  color?: 'primary' | 'secondary' | 'tertiary';
  required?: boolean;
  className?: string;
}

export const Label: React.FC<LabelProps> = ({
  children,
  htmlFor,
  size = 'sm',
  weight = 'medium',
  color = 'primary',
  required = false,
  className = '',
}) => {
  const labelClass = `
    ${styles.label}
    ${styles[`size-${size}`]}
    ${styles[`weight-${weight}`]}
    ${styles[`color-${color}`]}
    ${className}
  `.trim();

  return (
    <label htmlFor={htmlFor} className={labelClass}>
      {children}
      {required && (
        <span className={styles.required} aria-label='required'>
          *
        </span>
      )}
    </label>
  );
};

export default Label;
