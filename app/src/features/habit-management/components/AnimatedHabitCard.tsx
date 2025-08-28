import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatedCheckbox, CompletionCelebration, MicroInteraction, HoverScale } from '@features/animations';
import { SwipeHandler } from '@shared/components/interactions/SwipeHandler';
import { useAnimation } from '@features/animations/hooks/useAnimation';
import { LazyHabitHistory } from '../../dashboard/components/LazyHabitHistory';
import type { Habit } from '../types/habit.types';
import styles from './HabitCard.module.css';

const HABIT_ICONS: Record<string, string> = {
  'heart': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
  'water': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2C20 10.48 17.33 6.55 12 2z"/></svg>',
  'dumbbell': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71 3.43 9.14 7 5.57 15.57 14.14 12 17.71 13.43 19.14 14.86 17.71 16.29 19.14 18.43 17 19.86 18.43 21.29 17l-1.43-1.43L22 13.43z"/></svg>',
  'running': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/></svg>',
  'book': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/></svg>',
};

interface AnimatedHabitCardProps {
  habit: Habit;
  onEdit?: (habit: Habit) => void;
  onDelete?: (habit: Habit) => void;
  onToggleComplete?: (habit: Habit) => void;
  isCompleted?: boolean;
  showStats?: boolean;
  showHistory?: boolean;
  completionDate?: string;
  className?: string;
  enableSwipeActions?: boolean;
  enableCelebration?: boolean;
}

export const AnimatedHabitCard: React.FC<AnimatedHabitCardProps> = ({
  habit,
  onEdit,
  onDelete,
  onToggleComplete,
  isCompleted = false,
  showStats = true,
  showHistory = false,
  completionDate,
  className = '',
  enableSwipeActions = true,
  enableCelebration = true,
}) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [localCompleted, setLocalCompleted] = useState(isCompleted);
  const { shouldAnimate } = useAnimation();

  const handleToggleComplete = () => {
    const newCompleted = !localCompleted;
    setLocalCompleted(newCompleted);
    
    if (newCompleted && enableCelebration) {
      setShowCelebration(true);
    }
    
    onToggleComplete?.(habit);
  };

  const handleSwipeLeft = () => {
    if (onDelete) {
      onDelete(habit);
    }
  };

  const handleSwipeRight = () => {
    handleToggleComplete();
  };

  const cardVariants = {
    initial: {
      scale: 0.95,
      opacity: 0,
      y: 20,
    },
    animate: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    hover: shouldAnimate() ? {
      scale: 1.02,
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
      transition: {
        duration: 0.2,
      },
    } : {},
    tap: shouldAnimate() ? {
      scale: 0.98,
    } : {},
  };

  const card = (
    <motion.div
      className={`${styles.habitCard} ${localCompleted ? styles.completed : ''} ${!habit.isActive ? styles.inactive : ''} ${className}`}
      style={{ '--habit-color': habit.color } as React.CSSProperties}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      layout
    >
      <div className={styles.header}>
        <motion.div 
          className={styles.colorBar}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        />
        <div className={styles.actions}>
          <AnimatedCheckbox
            checked={localCompleted}
            onChange={handleToggleComplete}
            color={habit.color}
            size="large"
            celebrateOnComplete={enableCelebration}
            onAnimationComplete={() => {
              if (enableCelebration) {
                setShowCelebration(true);
              }
            }}
          />
          
          {onEdit && (
            <MicroInteraction
              config={{ hover: true, press: true, ripple: true }}
              as="button"
              className={`${styles.actionButton} ${styles.editButton}`}
            >
              <button
                onClick={() => onEdit(habit)}
                title="Edit habit"
                aria-label="Edit habit"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className={styles.icon}>
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </MicroInteraction>
          )}
          
          {onDelete && (
            <MicroInteraction
              config={{ hover: true, press: true, ripple: true }}
              as="button"
              className={`${styles.actionButton} ${styles.deleteButton}`}
            >
              <button
                onClick={() => onDelete(habit)}
                title="Delete habit"
                aria-label="Delete habit"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className={styles.icon}>
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 2a1 1 0 000 2h6a1 1 0 100-2H7zm0 4a1 1 0 100 2h6a1 1 0 100-2H7z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </MicroInteraction>
          )}
        </div>
      </div>

      <motion.div 
        className={styles.content}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className={styles.titleSection}>
          {habit.icon && (
            <HoverScale scale={1.1} className={styles.iconContainer}>
              <div className={styles.habitIcon}>
                <div 
                  dangerouslySetInnerHTML={{ __html: HABIT_ICONS[habit.icon] || '' }}
                  style={{ width: '24px', height: '24px', color: habit.color }}
                />
              </div>
            </HoverScale>
          )}
          <h3 className={styles.habitName}>{habit.name}</h3>
        </div>

        {habit.description && (
          <motion.p 
            className={styles.description}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {habit.description}
          </motion.p>
        )}

        {showStats && (
          <motion.div 
            className={styles.stats}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Frequency:</span>
              <span className={styles.statValue}>
                {habit.frequency} ({habit.targetCount}x)
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Created:</span>
              <span className={styles.statValue}>
                {new Date(habit.createdDate).toLocaleDateString()}
              </span>
            </div>
          </motion.div>
        )}

        {showHistory && <LazyHabitHistory habitId={habit.id} />}
      </motion.div>

      <CompletionCelebration
        active={showCelebration}
        type="confetti"
        intensity="normal"
        colors={[habit.color, '#10b981', '#3b82f6']}
        message="Habit completed!"
        milestone={habit.currentStreak && habit.currentStreak % 7 === 0 ? habit.currentStreak : undefined}
        onComplete={() => setShowCelebration(false)}
      />
    </motion.div>
  );

  if (enableSwipeActions) {
    return (
      <SwipeHandler
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        enableHaptic
        showIndicator={false}
      >
        {card}
      </SwipeHandler>
    );
  }

  return card;
};