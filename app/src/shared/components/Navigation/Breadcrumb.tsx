import React from 'react';
import { Text } from '../Typography/Text';
import styles from '../../../../styles/shared/navigation/Breadcrumb.module.css';

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = '/',
  className = '',
}) => {
  return (
    <nav aria-label='Breadcrumb' className={`${styles.breadcrumb} ${className}`}>
      <ol className={styles.breadcrumbList}>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className={styles.breadcrumbItem}>
            {item.href && !item.active ? (
              <a href={item.href} className={styles.breadcrumbLink}>
                <Text size='sm' color='secondary'>
                  {item.label}
                </Text>
              </a>
            ) : (
              <Text
                size='sm'
                color={item.active ? 'primary' : 'tertiary'}
                weight={item.active ? 'medium' : 'normal'}
              >
                {item.label}
              </Text>
            )}
            {index < items.length - 1 && (
              <span className={styles.separator} aria-hidden='true'>
                {separator}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
