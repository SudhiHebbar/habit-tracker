import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimation } from '../hooks/useAnimation';
import { SPRING_CONFIGS } from '../types/animation.types';
import clsx from 'clsx';
import styles from './AnimatedCheckbox.module.css';

interface AnimatedCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  celebrateOnComplete?: boolean;
  className?: string;
  hapticFeedback?: boolean;
  onAnimationComplete?: () => void;
}

export const AnimatedCheckbox: React.FC<AnimatedCheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'medium',
  color = '#10b981',
  celebrateOnComplete = true,
  className,
  hapticFeedback = true,
  onAnimationComplete,
}) => {
  const { shouldAnimate } = useAnimation();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleChange = () => {
    if (disabled) return;

    setIsAnimating(true);
    onChange(!checked);

    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }

    setTimeout(() => {
      setIsAnimating(false);
      if (!checked && celebrateOnComplete && onAnimationComplete) {
        onAnimationComplete();
      }
    }, 400);
  };

  const checkboxVariants = {
    unchecked: {
      scale: 1,
      rotate: 0,
    },
    checked: {
      scale: [1, 1.2, 1],
      rotate: [0, -10, 0],
      transition: shouldAnimate()
        ? {
            scale: {
              times: [0, 0.5, 1],
              duration: 0.4,
              ease: 'easeInOut',
            },
            rotate: {
              times: [0, 0.5, 1],
              duration: 0.4,
              ease: 'easeInOut',
            },
          }
        : { duration: 0 },
    },
  };

  const checkmarkVariants = {
    hidden: {
      pathLength: 0,
      opacity: 0,
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: shouldAnimate()
        ? {
            pathLength: {
              type: 'spring',
              ...SPRING_CONFIGS.default,
              duration: 0.4,
            },
            opacity: {
              duration: 0.1,
            },
          }
        : { duration: 0 },
    },
  };

  const pulseVariants = {
    initial: { scale: 0, opacity: 1 },
    animate: {
      scale: 2,
      opacity: 0,
      transition: shouldAnimate()
        ? {
            duration: 0.6,
            ease: 'easeOut' as const,
          }
        : { duration: 0 },
    },
  };

  const sizes = {
    small: { box: 16, stroke: 2 },
    medium: { box: 24, stroke: 3 },
    large: { box: 32, stroke: 4 },
  };

  const currentSize = sizes[size];

  return (
    <label
      className={clsx(styles.container, styles[size], { [styles.disabled]: disabled }, className)}
    >
      <div className={styles.checkboxWrapper}>
        <motion.div
          className={styles.checkbox}
          initial={false}
          animate={checked ? 'checked' : 'unchecked'}
          variants={checkboxVariants}
          whileHover={!disabled ? { scale: 1.05 } : {}}
          whileTap={!disabled ? { scale: 0.95 } : {}}
          onClick={handleChange}
          style={{
            width: currentSize.box,
            height: currentSize.box,
          }}
        >
          <svg
            width={currentSize.box}
            height={currentSize.box}
            viewBox={`0 0 ${currentSize.box} ${currentSize.box}`}
            className={styles.checkboxSvg}
          >
            <rect
              x={currentSize.stroke / 2}
              y={currentSize.stroke / 2}
              width={currentSize.box - currentSize.stroke}
              height={currentSize.box - currentSize.stroke}
              rx={4}
              fill={checked ? color : 'transparent'}
              stroke={checked ? color : '#6b7280'}
              strokeWidth={currentSize.stroke}
              className={styles.checkboxBorder}
            />

            <AnimatePresence>
              {checked && (
                <motion.path
                  d={`M ${currentSize.box * 0.25} ${currentSize.box * 0.5} L ${currentSize.box * 0.45} ${currentSize.box * 0.7} L ${currentSize.box * 0.75} ${currentSize.box * 0.3}`}
                  fill='none'
                  stroke='white'
                  strokeWidth={currentSize.stroke}
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  initial='hidden'
                  animate='visible'
                  exit='hidden'
                  variants={checkmarkVariants}
                />
              )}
            </AnimatePresence>
          </svg>

          <AnimatePresence>
            {isAnimating && checked && celebrateOnComplete && (
              <motion.div
                className={styles.pulse}
                initial='initial'
                animate='animate'
                exit='initial'
                variants={pulseVariants}
                style={{
                  backgroundColor: color,
                  width: currentSize.box,
                  height: currentSize.box,
                }}
              />
            )}
          </AnimatePresence>
        </motion.div>

        <input
          type='checkbox'
          checked={checked}
          onChange={() => onChange(!checked)}
          disabled={disabled}
          className={styles.hiddenInput}
          aria-label={label}
        />
      </div>

      {label && (
        <span
          className={clsx(
            styles.label,
            styles[`label${size.charAt(0).toUpperCase() + size.slice(1)}`]
          )}
        >
          {label}
        </span>
      )}
    </label>
  );
};
