import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { StreakCalculator } from '../services/streakCalculator';
import type { StreakBadgeProps } from '../types/streak.types';
import styles from './StreakBadge.module.css';

export const StreakBadge: React.FC<StreakBadgeProps> = ({
  streak,
  size = 'medium',
  variant = 'current',
  animated = true
}) => {
  // Determine which streak value to display
  const displayStreak = useMemo(() => {
    switch (variant) {
      case 'longest':
        return streak.longestStreak;
      case 'both':
        return { current: streak.currentStreak, longest: streak.longestStreak };
      case 'current':
      default:
        return streak.currentStreak;
    }
  }, [streak, variant]);

  // Get visual styling
  const streakColor = useMemo(() => {
    const streakValue = variant === 'longest' ? streak.longestStreak : streak.currentStreak;
    return StreakCalculator.getStreakColor(streakValue);
  }, [streak, variant]);

  const streakEmoji = useMemo(() => {
    const streakValue = variant === 'longest' ? streak.longestStreak : streak.currentStreak;
    return StreakCalculator.getStreakEmoji(streakValue);
  }, [streak, variant]);

  const category = useMemo(() => {
    const streakValue = variant === 'longest' ? streak.longestStreak : streak.currentStreak;
    return StreakCalculator.getStreakCategory(streakValue);
  }, [streak, variant]);

  // Animation variants
  const badgeVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30
      }
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.95
    }
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Render single streak badge
  const renderStreakBadge = (value: number, label?: string, isSecondary?: boolean) => (
    <div 
      className={`${styles.streakValue} ${isSecondary ? styles.secondary : ''}`}
      style={{ '--streak-color': streakColor } as React.CSSProperties}
    >
      <span className={styles.emoji}>{streakEmoji}</span>
      <span className={styles.number}>{value}</span>
      <span className={styles.unit}>
        {value === 1 ? 'day' : 'days'}
      </span>
      {label && <span className={styles.label}>{label}</span>}
    </div>
  );

  const badgeContent = () => {
    if (variant === 'both' && typeof displayStreak === 'object') {
      return (
        <div className={styles.bothValues}>
          {renderStreakBadge(displayStreak.current, 'current')}
          {displayStreak.longest > displayStreak.current && (
            <div className={styles.divider}>|</div>
          )}
          {displayStreak.longest > displayStreak.current && 
            renderStreakBadge(displayStreak.longest, 'best', true)
          }
        </div>
      );
    }

    return renderStreakBadge(displayStreak as number);
  };

  const shouldPulse = useMemo(() => {
    const streakValue = variant === 'longest' ? streak.longestStreak : streak.currentStreak;
    return animated && streakValue > 0 && StreakCalculator.isMilestone && streakValue >= 7;
  }, [streak, variant, animated]);

  return (
    <motion.div
      className={`${styles.streakBadge} ${styles[size]} ${styles[variant]}`}
      variants={animated ? badgeVariants : undefined}
      initial={animated ? "initial" : undefined}
      animate={animated ? (shouldPulse ? "pulse" : "animate") : undefined}
      whileHover={animated ? "hover" : undefined}
      whileTap={animated ? "tap" : undefined}
      style={{ '--streak-color': streakColor } as React.CSSProperties}
    >
      {badgeContent()}
      
      {/* Category indicator */}
      <div className={styles.categoryIndicator}>
        <span className={styles.categoryText}>{category}</span>
      </div>

      {/* Risk indicator */}
      {streak.isAtRisk && variant !== 'longest' && (
        <motion.div
          className={styles.riskIndicator}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          ⚠️
        </motion.div>
      )}

      {/* Milestone indicator */}
      {streak.achievedMilestones.length > 0 && (
        <div className={styles.milestoneIndicator}>
          <span className={styles.milestoneCount}>
            {streak.achievedMilestones.length}
          </span>
          <span className={styles.milestoneIcon}>🏆</span>
        </div>
      )}
    </motion.div>
  );
};