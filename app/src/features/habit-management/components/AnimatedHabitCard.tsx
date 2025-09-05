import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AnimatedCheckbox,
  CompletionCelebration,
  MicroInteraction,
  HoverScale,
} from '@features/animations';
import { SwipeHandler } from '@shared/components/interactions/SwipeHandler';
import { useAnimation } from '@features/animations/hooks/useAnimation';
import { LazyHabitHistory } from '../../dashboard/components/LazyHabitHistory';
import { IconLibrary } from '../../visual-customization/services/iconLibrary';
import type { Habit } from '../types/habit.types';
import styles from './HabitCard.module.css';

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
        ease: 'easeOut',
      },
    },
    hover: shouldAnimate()
      ? {
          scale: 1.02,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          transition: {
            duration: 0.2,
          },
        }
      : {},
    tap: shouldAnimate()
      ? {
          scale: 0.98,
        }
      : {},
  };

  const card = (
    <motion.div
      className={`${styles.habitCard} ${localCompleted ? styles.completed : ''} ${!habit.isActive ? styles.inactive : ''} ${className}`}
      style={{ '--habit-color': habit.color } as React.CSSProperties}
      variants={cardVariants}
      initial='initial'
      animate='animate'
      whileHover='hover'
      whileTap='tap'
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
            size='large'
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
              as='button'
              className={`${styles.actionButton} ${styles.editButton}`}
            >
              <button onClick={() => onEdit(habit)} title='Edit habit' aria-label='Edit habit'>
                <svg viewBox='0 0 20 20' fill='currentColor' className={styles.icon}>
                  <path d='M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z' />
                </svg>
              </button>
            </MicroInteraction>
          )}

          {onDelete && (
            <MicroInteraction
              config={{ hover: true, press: true, ripple: true }}
              as='button'
              className={`${styles.actionButton} ${styles.deleteButton}`}
            >
              <button
                onClick={() => onDelete(habit)}
                title='Delete habit'
                aria-label='Delete habit'
              >
                <svg viewBox='0 0 20 20' fill='currentColor' className={styles.icon}>
                  <path
                    fillRule='evenodd'
                    d='M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 2a1 1 0 000 2h6a1 1 0 100-2H7zm0 4a1 1 0 100 2h6a1 1 0 100-2H7z'
                    clipRule='evenodd'
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
                {(() => {
                  const iconSvg = IconLibrary.getIconSvgById(habit.icon);

                  if (iconSvg) {
                    return (
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          color: habit.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        dangerouslySetInnerHTML={{ __html: iconSvg }}
                      />
                    );
                  }

                  // Fallback - colored circle without text
                  return (
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: habit.color,
                        borderRadius: '50%',
                      }}
                    />
                  );
                })()}
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
        type='confetti'
        intensity='normal'
        colors={[habit.color, '#10b981', '#3b82f6']}
        message='Habit completed!'
        milestone={
          habit.currentStreak && habit.currentStreak % 7 === 0 ? habit.currentStreak : undefined
        }
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
