import React from 'react';
import { Text } from '../Typography/Text';
import styles from '../../../../styles/shared/navigation/TabNavigation.module.css';

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

interface TabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'pills';
  className?: string;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  size = 'md',
  variant = 'default',
  className = '',
}) => {
  return (
    <div className={`${styles.tabNavigation} ${styles[size]} ${styles[variant]} ${className}`}>
      <div className={styles.tabList} role='tablist'>
        {tabs.map(tab => (
          <button
            key={tab.id}
            role='tab'
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            disabled={tab.disabled}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => !tab.disabled && onTabChange(tab.id)}
          >
            {tab.icon && <span className={styles.tabIcon}>{tab.icon}</span>}
            <Text
              size={size === 'lg' ? 'md' : 'sm'}
              weight={activeTab === tab.id ? 'semibold' : 'normal'}
              color='inherit'
            >
              {tab.label}
            </Text>
            {tab.badge && <span className={styles.badge}>{tab.badge}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabNavigation;
