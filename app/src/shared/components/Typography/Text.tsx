import React from 'react';
import styles from '../../../../styles/shared/typography/Text.module.css';

interface TextProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'error' | 'inherit';
  align?: 'left' | 'center' | 'right' | 'justify';
  as?: 'p' | 'span' | 'div';
  lineHeight?: 'tight' | 'normal' | 'relaxed';
  className?: string;
}

export const Text: React.FC<TextProps> = ({
  children,
  size = 'md',
  weight = 'normal',
  color = 'primary',
  align = 'left',
  as = 'p',
  lineHeight = 'normal',
  className = '',
}) => {
  const Tag = as;

  const textClass = `
    ${styles.text}
    ${styles[`size-${size}`]}
    ${styles[`weight-${weight}`]}
    ${styles[`color-${color}`]}
    ${styles[`align-${align}`]}
    ${styles[`lineHeight-${lineHeight}`]}
    ${className}
  `.trim();

  return <Tag className={textClass}>{children}</Tag>;
};

export default Text;
