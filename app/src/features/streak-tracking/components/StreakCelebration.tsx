import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompletionCelebration } from '@features/animations/hooks/useCompletionCelebration';
import { MilestoneDetector } from '../services/milestoneDetector';
import type { StreakCelebrationProps } from '../types/streak.types';
import styles from './StreakCelebration.module.css';

export const StreakCelebration: React.FC<StreakCelebrationProps> = ({
  milestone,
  onComplete,
  autoTrigger = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [celebrationTriggered, setCelebrationTriggered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { triggerCelebration } = useCompletionCelebration();

  // Get milestone reward information
  const reward = MilestoneDetector.getMilestoneReward(milestone.milestoneValue);
  const config = MilestoneDetector.getMilestoneConfig(milestone.milestoneValue);

  // Auto-trigger celebration
  useEffect(() => {
    if (autoTrigger && milestone.isNew && !celebrationTriggered) {
      setIsVisible(true);
      setCelebrationTriggered(true);

      // Trigger the actual celebration animation
      setTimeout(() => {
        if (containerRef.current) {
          triggerCelebration({
            type: milestone.celebrationType,
            element: containerRef.current,
            intensity: milestone.milestoneValue >= 100 ? 'high' : 'medium',
            duration: milestone.milestoneValue >= 365 ? 3000 : 2000,
          });
        }
      }, 500);
    }
  }, [autoTrigger, milestone, celebrationTriggered, triggerCelebration]);

  // Auto-close after celebration
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(
        () => {
          setIsVisible(false);
          onComplete?.();
        },
        milestone.milestoneValue >= 100 ? 8000 : 6000
      );

      return () => clearTimeout(timer);
    }
  }, [isVisible, milestone.milestoneValue, onComplete]);

  // Manual trigger
  const handleManualTrigger = () => {
    if (containerRef.current) {
      triggerCelebration({
        type: milestone.celebrationType,
        element: containerRef.current,
        intensity: 'high',
        duration: 2000,
      });
    }
  };

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.5 },
    },
  };

  const modalVariants = {
    hidden: {
      scale: 0.8,
      opacity: 0,
      y: 50,
    },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25,
        delay: 0.1,
      },
    },
    exit: {
      scale: 0.9,
      opacity: 0,
      y: -50,
      transition: { duration: 0.3 },
    },
  };

  const badgeVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25,
        delay: 0.5,
      },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.8,
        staggerChildren: 0.1,
      },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 1.2,
        type: 'spring',
        stiffness: 300,
      },
    },
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={styles.celebrationOverlay}
        variants={overlayVariants}
        initial='hidden'
        animate='visible'
        exit='exit'
        onClick={() => setIsVisible(false)}
      >
        <motion.div
          ref={containerRef}
          className={`${styles.celebrationModal} ${styles[milestone.badgeType]}`}
          variants={modalVariants}
          onClick={e => e.stopPropagation()}
          style={{ '--celebration-color': reward.color } as React.CSSProperties}
        >
          {/* Animated background effects */}
          <div className={styles.backgroundEffects}>
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className={styles.sparkle}
                initial={{
                  opacity: 0,
                  scale: 0,
                  x: Math.random() * 400 - 200,
                  y: Math.random() * 400 - 200,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 2,
                  delay: Math.random() * 2,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 3,
                }}
              />
            ))}
          </div>

          {/* Main content */}
          <div className={styles.celebrationContent}>
            {/* Badge/Icon */}
            <motion.div className={styles.celebrationBadge} variants={badgeVariants}>
              <div className={styles.badgeIcon}>{reward.icon}</div>
              <div className={styles.badgeNumber}>{milestone.milestoneValue}</div>
              <div className={styles.badgeLabel}>
                {milestone.milestoneValue === 1 ? 'DAY' : 'DAYS'}
              </div>
            </motion.div>

            {/* Text content */}
            <motion.div className={styles.celebrationText} variants={textVariants}>
              <motion.h2 className={styles.celebrationTitle} variants={textVariants}>
                {reward.title}
              </motion.h2>
              <motion.p className={styles.celebrationSubtitle} variants={textVariants}>
                {reward.description}
              </motion.p>
              <motion.p className={styles.celebrationMessage} variants={textVariants}>
                {milestone.message}
              </motion.p>
              <motion.p className={styles.habitName} variants={textVariants}>
                {milestone.habitName}
              </motion.p>
            </motion.div>

            {/* Action buttons */}
            <motion.div className={styles.celebrationActions} variants={buttonVariants}>
              <button className={styles.celebrateButton} onClick={handleManualTrigger}>
                🎉 Celebrate Again!
              </button>
              <button className={styles.continueButton} onClick={() => setIsVisible(false)}>
                Continue
              </button>
            </motion.div>
          </div>

          {/* Achievement badge type indicator */}
          <div className={`${styles.badgeTypeIndicator} ${styles[milestone.badgeType]}`}>
            {milestone.badgeType.toUpperCase()}
          </div>

          {/* Special milestone indicator */}
          {config.isSpecial && (
            <motion.div
              className={styles.specialIndicator}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5, type: 'spring' }}
            >
              ✨ SPECIAL MILESTONE ✨
            </motion.div>
          )}

          {/* Progress indicator for next milestone */}
          <div className={styles.nextMilestone}>
            <span>Next milestone: </span>
            <strong>{MilestoneDetector.getNextMilestone(milestone.milestoneValue)} days</strong>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
