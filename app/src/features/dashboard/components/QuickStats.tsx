import React from 'react';
import { Text } from '../../../shared/components/Typography/Text';
import type { TimeRange } from './Dashboard';
import styles from '../../../../styles/features/dashboard/QuickStats.module.css';

interface QuickStatsProps {
  totalHabits: number;
  completedToday: number;
  activeStreaks: number;
  timeRange: TimeRange;
}

export const QuickStats: React.FC<QuickStatsProps> = ({
  totalHabits,
  completedToday,
  activeStreaks,
  timeRange,
}) => {
  const stats = [
    {
      label: 'Total Habits',
      value: totalHabits,
      icon: '📋',
      color: 'primary',
    },
    {
      label: timeRange === 'daily' ? 'Completed Today' : 'Completed This Week',
      value: completedToday,
      icon: '✅',
      color: 'success',
    },
    {
      label: 'Active Streaks',
      value: activeStreaks,
      icon: '🔥',
      color: 'warning',
    },
  ];

  return (
    <div className={styles.quickStats}>
      {stats.map(stat => (
        <div key={stat.label} className={`${styles.statCard} ${styles[stat.color]}`}>
          <div className={styles.statIcon}>{stat.icon}</div>
          <div className={styles.statContent}>
            <Text size='2xl' weight='bold' className={styles.statValue}>
              {stat.value}
            </Text>
            <Text size='sm' color='secondary' className={styles.statLabel}>
              {stat.label}
            </Text>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickStats;
