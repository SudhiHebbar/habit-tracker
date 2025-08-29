import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStreakWarning } from '../hooks/useStreakWarnings';
import type { StreakRiskWarningProps } from '../types/streak.types';
import styles from './StreakRiskWarning.module.css';

export const StreakRiskWarning: React.FC<StreakRiskWarningProps> = ({
  streak,
  onAction,
  compact = false
}) => {
  const { 
    riskAssessment, 
    shouldShowWarning, 
    warningColor, 
    warningIcon 
  } = useStreakWarning(streak);

  // Don't render if no warning needed
  if (!shouldShowWarning || !riskAssessment) {
    return null;
  }

  const urgencyClass = useMemo(() => {
    switch (riskAssessment.riskLevel) {
      case 'high': return styles.critical;
      case 'medium': return styles.warning;
      case 'low': return styles.info;
      default: return styles.info;
    }
  }, [riskAssessment.riskLevel]);

  const timeMessage = useMemo(() => {
    const days = riskAssessment.daysSinceLastCompletion;
    if (days === 0) return 'Complete today to maintain your streak!';
    if (days === 1) return 'It\'s been 1 day since completion';
    return `It's been ${days} days since completion`;
  }, [riskAssessment.daysSinceLastCompletion]);

  const actionButtons = [
    {
      label: 'Complete Now',
      action: 'complete' as const,
      primary: true,
      className: styles.completeButton
    },
    {
      label: 'Remind Me',
      action: 'remind' as const,
      primary: false,
      className: styles.remindButton
    },
    {
      label: 'Dismiss',
      action: 'dismiss' as const,
      primary: false,
      className: styles.dismissButton
    }
  ];

  // Animation variants
  const warningVariants = {
    hidden: { 
      opacity: 0, 
      y: 20, 
      scale: 0.95 
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.02, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      className={`${styles.riskWarning} ${urgencyClass} ${compact ? styles.compact : ''}`}
      variants={warningVariants}
      initial="hidden"
      animate={riskAssessment.riskLevel === 'high' ? 'pulse' : 'visible'}
      exit="exit"
      style={{ '--warning-color': warningColor } as React.CSSProperties}
    >
      <div className={styles.warningHeader}>
        <span className={styles.warningIcon} aria-label="Warning">
          {warningIcon}
        </span>
        <div className={styles.warningContent}>
          <h4 className={styles.warningTitle}>
            {riskAssessment.riskLevel === 'high' && 'Streak in Danger!'}
            {riskAssessment.riskLevel === 'medium' && 'Streak at Risk'}
            {riskAssessment.riskLevel === 'low' && 'Gentle Reminder'}
          </h4>
          <p className={styles.warningMessage}>
            {riskAssessment.message}
          </p>
          {!compact && (
            <p className={styles.timeMessage}>
              {timeMessage}
            </p>
          )}
        </div>
      </div>

      {!compact && (
        <div className={styles.streakInfo}>
          <div className={styles.streakValue}>
            <span className={styles.streakNumber}>{streak.currentStreak}</span>
            <span className={styles.streakLabel}>day streak</span>
          </div>
          {streak.longestStreak > streak.currentStreak && (
            <div className={styles.bestStreak}>
              Best: {streak.longestStreak} days
            </div>
          )}
        </div>
      )}

      {onAction && (
        <div className={styles.actions}>
          {actionButtons.map(button => (
            <motion.button
              key={button.action}
              className={`${styles.actionButton} ${button.className}`}
              onClick={() => onAction(button.action)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              data-primary={button.primary}
            >
              {button.label}
            </motion.button>
          ))}
        </div>
      )}

      {/* Progress indicator for critical warnings */}
      {riskAssessment.riskLevel === 'high' && (
        <div className={styles.urgencyIndicator}>
          <div className={styles.urgencyBar}>
            <motion.div 
              className={styles.urgencyFill}
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
          </div>
          <span className={styles.urgencyText}>
            Act now to save your streak!
          </span>
        </div>
      )}
    </motion.div>
  );
};