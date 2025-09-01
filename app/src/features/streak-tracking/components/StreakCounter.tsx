import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StreakCalculator } from '../services/streakCalculator';
import { MilestoneDetector } from '../services/milestoneDetector';
import type { StreakCounterProps } from '../types/streak.types';
import styles from './StreakCounter.module.css';

export const StreakCounter: React.FC<StreakCounterProps> = ({
  streak,
  options = {},
  onMilestoneClick,
}) => {
  const {
    showCurrentOnly = false,
    showLongest = true,
    showProgress = true,
    showMilestones = true,
    compact = false,
    animated = true,
  } = options;

  // Calculate milestone progress
  const milestoneProgress = useMemo(() => {
    return MilestoneDetector.calculateMilestoneProgress(streak.currentStreak);
  }, [streak.currentStreak]);

  // Get visual indicators
  const streakColor = useMemo(
    () => StreakCalculator.getStreakColor(streak.currentStreak),
    [streak.currentStreak]
  );

  const streakEmoji = useMemo(
    () => StreakCalculator.getStreakEmoji(streak.currentStreak),
    [streak.currentStreak]
  );

  const motivationalMessage = useMemo(
    () => StreakCalculator.getMotivationalMessage(streak.currentStreak),
    [streak.currentStreak]
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
    exit: { opacity: 0, scale: 0.9 },
  };

  const numberVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25,
      },
    },
    exit: { scale: 1.2, opacity: 0 },
  };

  const progressVariants = {
    initial: { width: 0 },
    animate: {
      width: `${milestoneProgress.progressPercentage}%`,
      transition: {
        duration: 1,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <motion.div
      className={`${styles.streakCounter} ${compact ? styles.compact : ''}`}
      variants={animated ? containerVariants : undefined}
      initial={animated ? 'hidden' : undefined}
      animate={animated ? 'visible' : undefined}
      exit={animated ? 'exit' : undefined}
      style={{ '--streak-color': streakColor } as React.CSSProperties}
    >
      {/* Main streak display */}
      <div className={styles.mainDisplay}>
        <div className={styles.streakValue}>
          <span className={styles.emoji}>{streakEmoji}</span>
          <AnimatePresence mode='wait'>
            <motion.span
              key={streak.currentStreak}
              className={styles.number}
              variants={animated ? numberVariants : undefined}
              initial={animated ? 'initial' : undefined}
              animate={animated ? 'animate' : undefined}
              exit={animated ? 'exit' : undefined}
            >
              {streak.currentStreak}
            </motion.span>
          </AnimatePresence>
          <span className={styles.unit}>{streak.currentStreak === 1 ? 'day' : 'days'}</span>
        </div>

        {!compact && (
          <div className={styles.streakInfo}>
            <p className={styles.habitName}>{streak.habitName}</p>
            <p className={styles.motivationalMessage}>{motivationalMessage}</p>
          </div>
        )}
      </div>

      {/* Secondary info */}
      {!showCurrentOnly && (
        <div className={styles.secondaryInfo}>
          {showLongest && streak.longestStreak > streak.currentStreak && (
            <div className={styles.longestStreak}>
              <span className={styles.label}>Best:</span>
              <span className={styles.value}>
                {StreakCalculator.formatStreakDisplay(streak.longestStreak, false)}
              </span>
            </div>
          )}

          {showProgress && milestoneProgress.nextMilestone > 0 && (
            <div className={styles.progressContainer}>
              <div className={styles.progressHeader}>
                <span className={styles.progressLabel}>
                  Next milestone: {milestoneProgress.nextMilestone} days
                </span>
                <span className={styles.remainingDays}>
                  {milestoneProgress.remainingDays} to go
                </span>
              </div>
              <div className={styles.progressBar}>
                <motion.div
                  className={styles.progressFill}
                  variants={animated ? progressVariants : undefined}
                  initial={animated ? 'initial' : undefined}
                  animate={animated ? 'animate' : undefined}
                  style={{
                    backgroundColor: streakColor,
                    width: animated ? undefined : `${milestoneProgress.progressPercentage}%`,
                  }}
                />
              </div>
              <div className={styles.progressText}>
                {Math.round(milestoneProgress.progressPercentage)}%
              </div>
            </div>
          )}
        </div>
      )}

      {/* Milestones */}
      {showMilestones && streak.achievedMilestones.length > 0 && (
        <div className={styles.milestones}>
          <div className={styles.milestonesLabel}>Milestones achieved:</div>
          <div className={styles.milestonesList}>
            {streak.achievedMilestones.slice(-3).map(milestone => (
              <motion.button
                key={milestone}
                className={styles.milestoneButton}
                onClick={() => onMilestoneClick?.(milestone)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {milestone}
              </motion.button>
            ))}
            {streak.achievedMilestones.length > 3 && (
              <span className={styles.moreMilestones}>
                +{streak.achievedMilestones.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Risk warning */}
      {streak.isAtRisk && (
        <motion.div
          className={styles.riskWarning}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          ⚠️ Your streak is at risk! Complete today to maintain it.
        </motion.div>
      )}
    </motion.div>
  );
};
