import React, { useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useGesture } from '@features/animations/hooks/useGesture';
import { useAnimation as useAnimationHook } from '@features/animations/hooks/useAnimation';
import clsx from 'clsx';
import styles from './SwipeHandler.module.css';

interface SwipeHandlerProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onComplete?: () => void;
  threshold?: number;
  enableHaptic?: boolean;
  showIndicator?: boolean;
  className?: string;
}

export const SwipeHandler: React.FC<SwipeHandlerProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onComplete,
  threshold = 50,
  enableHaptic = true,
  showIndicator = true,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const { shouldAnimate } = useAnimationHook();

  const handleSwipe = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (enableHaptic && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }

    const animations: Record<string, any> = {
      left: { x: -300, opacity: 0 },
      right: { x: 300, opacity: 0 },
      up: { y: -300, opacity: 0 },
      down: { y: 300, opacity: 0 },
    };

    if (shouldAnimate()) {
      controls.start({
        ...animations[direction],
        transition: { duration: 0.3, ease: 'easeOut' },
      }).then(() => {
        if (onComplete) onComplete();
        controls.start({ x: 0, y: 0, opacity: 1 });
      });
    }
  };

  const { bind, gestureState } = useGesture({
    swipeThreshold: threshold,
    onSwipeLeft: () => {
      if (onSwipeLeft) {
        handleSwipe('left');
        onSwipeLeft();
      }
    },
    onSwipeRight: () => {
      if (onSwipeRight) {
        handleSwipe('right');
        onSwipeRight();
      }
    },
    onSwipeUp: () => {
      if (onSwipeUp) {
        handleSwipe('up');
        onSwipeUp();
      }
    },
    onSwipeDown: () => {
      if (onSwipeDown) {
        handleSwipe('down');
        onSwipeDown();
      }
    },
    onDrag: (deltaX, deltaY) => {
      if (shouldAnimate()) {
        controls.start({
          x: deltaX * 0.5,
          y: deltaY * 0.5,
          transition: { duration: 0 },
        });
      }
    },
    onDragEnd: () => {
      if (shouldAnimate()) {
        controls.start({
          x: 0,
          y: 0,
          transition: { type: 'spring', stiffness: 300, damping: 30 },
        });
      }
    },
  });

  React.useEffect(() => {
    bind(containerRef.current);
  }, [bind]);

  return (
    <div className={clsx(styles.container, className)}>
      <motion.div
        ref={containerRef}
        className={styles.swipeContent}
        animate={controls}
        style={{ touchAction: 'none' }}
      >
        {children}
      </motion.div>
      
      {showIndicator && gestureState.isDragging && (
        <div className={styles.indicator}>
          {gestureState.isSwipingLeft && <span className={styles.arrow}>←</span>}
          {gestureState.isSwipingRight && <span className={styles.arrow}>→</span>}
          {gestureState.isSwipingUp && <span className={styles.arrow}>↑</span>}
          {gestureState.isSwipingDown && <span className={styles.arrow}>↓</span>}
        </div>
      )}
    </div>
  );
};