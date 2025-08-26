import React, { useRef, useEffect } from 'react';
import { Text } from '../../../shared/components/Typography/Text';
import type { TimeRange } from './Dashboard';
import styles from '../../../../styles/features/dashboard/QuickStats.module.css';

interface QuickStatsProps {
  totalHabits: number;
  completedToday: number;
  activeStreaks: number;
  timeRange: TimeRange;
}

export const QuickStats: React.FC<QuickStatsProps> = React.memo(
  ({ totalHabits, completedToday, activeStreaks, timeRange }) => {
    const completedStatRef = useRef<HTMLDivElement>(null);
    const streaksStatRef = useRef<HTMLDivElement>(null);
    const prevCompletedTodayRef = useRef(completedToday);
    const prevActiveStreaksRef = useRef(activeStreaks);

    // Animate completed today when it changes
    useEffect(() => {
      if (prevCompletedTodayRef.current !== completedToday && completedStatRef.current) {
        const element = completedStatRef.current;
        element.classList.remove(styles.statHighlight);
        void element.offsetHeight; // Trigger reflow
        element.classList.add(styles.statHighlight);

        const timeoutId = setTimeout(() => {
          element.classList.remove(styles.statHighlight);
        }, 600);

        prevCompletedTodayRef.current = completedToday;
        return () => clearTimeout(timeoutId);
      } else {
        prevCompletedTodayRef.current = completedToday;
      }
    }, [completedToday]);

    // Animate active streaks when it changes
    useEffect(() => {
      if (prevActiveStreaksRef.current !== activeStreaks && streaksStatRef.current) {
        const element = streaksStatRef.current;
        element.classList.remove(styles.statHighlight);
        void element.offsetHeight; // Trigger reflow
        element.classList.add(styles.statHighlight);

        const timeoutId = setTimeout(() => {
          element.classList.remove(styles.statHighlight);
        }, 600);

        prevActiveStreaksRef.current = activeStreaks;
        return () => clearTimeout(timeoutId);
      } else {
        prevActiveStreaksRef.current = activeStreaks;
      }
    }, [activeStreaks]);
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
        {stats.map((stat, _index) => {
          // Assign refs for animated stats
          const getRef = () => {
            if (stat.label.includes('Completed')) return completedStatRef;
            if (stat.label.includes('Active Streaks')) return streaksStatRef;
            return undefined;
          };

          return (
            <div
              key={stat.label}
              ref={getRef()}
              className={`${styles.statCard} ${styles[stat.color]}`}
            >
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
          );
        })}
      </div>
    );
  }
);

export default QuickStats;
