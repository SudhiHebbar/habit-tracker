import React from 'react';
import { Heading } from '../../../shared/components/Typography/Heading';
import { Text } from '../../../shared/components/Typography/Text';
import type { TimeRange } from './Dashboard';
import styles from '../../../../styles/features/dashboard/TodayHeader.module.css';

interface TodayHeaderProps {
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

export const TodayHeader: React.FC<TodayHeaderProps> = ({ timeRange, onTimeRangeChange }) => {
  const today = new Date();
  const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
  const date = today.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const getMotivationalMessage = () => {
    const hour = today.getHours();
    if (hour < 12) return 'Good morning! Start your day with purpose';
    if (hour < 17) return 'Good afternoon! Keep the momentum going';
    return 'Good evening! Finish strong today';
  };

  return (
    <div className={styles.todayHeader}>
      <div className={styles.dateSection}>
        <div className={styles.dateInfo}>
          <Heading level={2} size='2xl' weight='bold' className={styles.dayOfWeek}>
            {dayOfWeek}
          </Heading>
          <Text size='lg' color='secondary' className={styles.fullDate}>
            {date}
          </Text>
        </div>
        <Text size='md' color='tertiary' className={styles.motivational}>
          {getMotivationalMessage()}
        </Text>
      </div>

      <div className={styles.timeRangeToggle}>
        <button
          className={`${styles.rangeButton} ${timeRange === 'daily' ? styles.active : ''}`}
          onClick={() => onTimeRangeChange('daily')}
          aria-pressed={timeRange === 'daily'}
        >
          Today
        </button>
        <button
          className={`${styles.rangeButton} ${timeRange === 'weekly' ? styles.active : ''}`}
          onClick={() => onTimeRangeChange('weekly')}
          aria-pressed={timeRange === 'weekly'}
        >
          This Week
        </button>
      </div>
    </div>
  );
};

export default TodayHeader;
