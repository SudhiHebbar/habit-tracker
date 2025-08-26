import React, { useRef, useEffect } from 'react';
import { Heading } from '../../../shared/components/Typography/Heading';
import { Text } from '../../../shared/components/Typography/Text';
import styles from '../../../../styles/features/dashboard/ProgressOverview.module.css';

interface ProgressOverviewProps {
  completedToday: number;
  totalHabits: number;
  completionRate: number;
}

export const ProgressOverview: React.FC<ProgressOverviewProps> = ({
  completedToday,
  totalHabits,
  completionRate,
}) => {
  const progressRef = useRef<HTMLDivElement>(null);
  const prevCompletionRateRef = useRef(completionRate);

  // Add highlight effect when completion rate changes
  useEffect(() => {
    if (prevCompletionRateRef.current !== completionRate && progressRef.current) {
      const element = progressRef.current;

      // Remove existing animation class
      element.classList.remove(styles.progressHighlight);

      // Trigger reflow to ensure class removal is processed
      void element.offsetHeight;

      // Add highlight animation
      element.classList.add(styles.progressHighlight);

      // Remove animation class after animation completes
      const timeoutId = setTimeout(() => {
        element.classList.remove(styles.progressHighlight);
      }, 600);

      // Update previous value
      prevCompletionRateRef.current = completionRate;

      return () => clearTimeout(timeoutId);
    } else {
      prevCompletionRateRef.current = completionRate;
    }
  }, [completionRate]);
  const getProgressColor = () => {
    if (completionRate >= 80) return 'success';
    if (completionRate >= 50) return 'warning';
    return 'default';
  };

  const getMotivationalText = () => {
    if (completionRate === 100) return 'Perfect! All habits completed!';
    if (completionRate >= 80) return 'Excellent progress! Almost there!';
    if (completionRate >= 50) return 'Good job! Keep it up!';
    if (completionRate > 0) return "You're on your way!";
    return 'Start your day by completing a habit';
  };

  return (
    <div className={styles.progressOverview} ref={progressRef}>
      <div className={styles.header}>
        <Heading level={3} size='lg' weight='semibold'>
          Today's Progress
        </Heading>
        <Text size='sm' color='tertiary'>
          {completedToday} of {totalHabits} completed
        </Text>
      </div>

      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div
            className={`${styles.progressFill} ${styles[getProgressColor()]}`}
            style={{ width: `${completionRate}%` }}
            role='progressbar'
            aria-valuenow={completionRate}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            {completionRate >= 10 && <span className={styles.progressText}>{completionRate}%</span>}
          </div>
          {completionRate < 10 && (
            <span className={styles.progressTextOutside}>{completionRate}%</span>
          )}
        </div>
      </div>

      <Text size='sm' color='secondary' className={styles.motivational}>
        {getMotivationalText()}
      </Text>
    </div>
  );
};

export default ProgressOverview;
