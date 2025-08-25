import React from 'react';
import styles from '../../../../styles/shared/layouts/Container.module.css';

interface ContainerProps {
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'full';
  className?: string;
  noPadding?: boolean;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'large',
  className = '',
  noPadding = false,
}) => {
  const containerClass = `
    ${styles.container} 
    ${styles[size]} 
    ${noPadding ? styles.noPadding : ''} 
    ${className}
  `.trim();

  return <div className={containerClass}>{children}</div>;
};

export default Container;
