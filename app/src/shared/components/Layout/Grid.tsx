import React from 'react';
import styles from '../../../../styles/shared/layouts/Grid.module.css';

interface GridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 'auto';
  gap?: 'small' | 'medium' | 'large';
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyItems?: 'start' | 'center' | 'end' | 'stretch';
  responsive?: boolean;
  className?: string;
}

export const Grid: React.FC<GridProps> = ({
  children,
  columns = 'auto',
  gap = 'medium',
  alignItems = 'stretch',
  justifyItems = 'stretch',
  responsive = true,
  className = '',
}) => {
  const gridClass = `
    ${styles.grid} 
    ${styles[`columns-${columns}`]}
    ${styles[`gap-${gap}`]}
    ${styles[`align-${alignItems}`]}
    ${styles[`justify-${justifyItems}`]}
    ${responsive ? styles.responsive : ''}
    ${className}
  `.trim();

  return <div className={gridClass}>{children}</div>;
};

export default Grid;
