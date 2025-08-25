import React from 'react';
import { Heading } from '../../../shared/components/Typography/Heading';
import { Text } from '../../../shared/components/Typography/Text';
import Button from '../../../shared/components/Button';
import styles from '../../../../styles/features/dashboard/EmptyDashboard.module.css';

interface EmptyDashboardProps {
  hasTrackers: boolean;
  onCreateTracker: () => void;
  onCreateHabit: () => void;
}

export const EmptyDashboard: React.FC<EmptyDashboardProps> = ({
  hasTrackers,
  onCreateTracker,
  onCreateHabit,
}) => {
  return (
    <div className={styles.emptyDashboard}>
      <div className={styles.illustration}>
        <svg
          viewBox='0 0 240 240'
          fill='none'
          className={styles.illustrationSvg}
          aria-hidden='true'
        >
          <circle cx='120' cy='120' r='80' fill='var(--color-primary-light)' opacity='0.1' />
          <path
            d='M80 120 L100 140 L160 80'
            stroke='var(--color-primary)'
            strokeWidth='8'
            strokeLinecap='round'
            strokeLinejoin='round'
            opacity='0.3'
          />
          <circle cx='60' cy='60' r='8' fill='var(--color-secondary)' opacity='0.2' />
          <circle cx='180' cy='70' r='6' fill='var(--color-success)' opacity='0.2' />
          <circle cx='170' cy='180' r='10' fill='var(--color-warning)' opacity='0.2' />
          <circle cx='70' cy='170' r='5' fill='var(--color-primary)' opacity='0.2' />
        </svg>
      </div>

      <div className={styles.content}>
        {hasTrackers ? (
          <>
            <Heading level={2} size='2xl' weight='bold' align='center'>
              Start Building Your First Habit
            </Heading>
            <Text size='lg' color='secondary' align='center' className={styles.description}>
              You have a tracker ready! Now add your first habit to begin your journey towards
              better daily routines.
            </Text>
            <div className={styles.actions}>
              <Button variant='primary' onClick={onCreateHabit}>
                <svg viewBox='0 0 20 20' fill='currentColor' className={styles.buttonIcon}>
                  <path
                    fillRule='evenodd'
                    d='M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z'
                    clipRule='evenodd'
                  />
                </svg>
                Create Your First Habit
              </Button>
            </div>
          </>
        ) : (
          <>
            <Heading level={2} size='2xl' weight='bold' align='center'>
              Welcome to Habit Tracker
            </Heading>
            <Text size='lg' color='secondary' align='center' className={styles.description}>
              Begin your journey to building better habits. Create your first tracker to organize
              and monitor your daily routines.
            </Text>
            <div className={styles.actions}>
              <Button variant='primary' onClick={onCreateTracker}>
                <svg viewBox='0 0 20 20' fill='currentColor' className={styles.buttonIcon}>
                  <path
                    fillRule='evenodd'
                    d='M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z'
                    clipRule='evenodd'
                  />
                </svg>
                Create Your First Tracker
              </Button>
            </div>
          </>
        )}

        <div className={styles.tips}>
          <Heading level={3} size='lg' weight='semibold' align='center'>
            Tips for Success
          </Heading>
          <ul className={styles.tipsList}>
            <li className={styles.tip}>
              <span className={styles.tipIcon}>💡</span>
              <Text size='sm' color='secondary'>
                Start small with 2-3 habits to build consistency
              </Text>
            </li>
            <li className={styles.tip}>
              <span className={styles.tipIcon}>🎯</span>
              <Text size='sm' color='secondary'>
                Set specific, achievable goals for each habit
              </Text>
            </li>
            <li className={styles.tip}>
              <span className={styles.tipIcon}>📊</span>
              <Text size='sm' color='secondary'>
                Track daily to build momentum and see progress
              </Text>
            </li>
            <li className={styles.tip}>
              <span className={styles.tipIcon}>🔥</span>
              <Text size='sm' color='secondary'>
                Maintain streaks to stay motivated
              </Text>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmptyDashboard;
