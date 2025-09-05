import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useAnimation } from '../hooks/useAnimation';
import type { TransitionConfig } from '../types/animation.types';
import clsx from 'clsx';
import styles from './PageTransition.module.css';

interface PageTransitionProps {
  children: React.ReactNode;
  type?: TransitionConfig['type'];
  direction?: TransitionConfig['direction'];
  duration?: number;
  distance?: number;
  className?: string;
  preserveHeight?: boolean;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  type = 'fade',
  direction = 'right',
  duration = 300,
  distance = 50,
  className,
  preserveHeight = false,
}) => {
  const location = useLocation();
  const { shouldAnimate } = useAnimation();

  const getTransitionVariants = () => {
    if (!shouldAnimate()) {
      return {
        initial: {},
        animate: {},
        exit: {},
      };
    }

    const baseTransition = {
      duration: duration / 1000,
      ease: [0.43, 0.13, 0.23, 0.96] as const,
    };

    switch (type) {
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: {
            opacity: 1,
            transition: baseTransition,
          },
          exit: {
            opacity: 0,
            transition: { ...baseTransition, duration: (duration / 1000) * 0.5 },
          },
        };

      case 'slide':
        const slideOffset = {
          up: { x: 0, y: distance },
          down: { x: 0, y: -distance },
          left: { x: distance, y: 0 },
          right: { x: -distance, y: 0 },
        };

        return {
          initial: {
            ...slideOffset[direction],
            opacity: 0,
          },
          animate: {
            x: 0,
            y: 0,
            opacity: 1,
            transition: baseTransition,
          },
          exit: {
            ...slideOffset[direction],
            opacity: 0,
            transition: { ...baseTransition, duration: (duration / 1000) * 0.5 },
          },
        };

      case 'scale':
        return {
          initial: {
            scale: 0.95,
            opacity: 0,
          },
          animate: {
            scale: 1,
            opacity: 1,
            transition: baseTransition,
          },
          exit: {
            scale: 1.05,
            opacity: 0,
            transition: { ...baseTransition, duration: (duration / 1000) * 0.5 },
          },
        };

      case 'rotate':
        const rotateAngle = direction === 'left' ? -10 : 10;
        return {
          initial: {
            rotate: rotateAngle,
            opacity: 0,
            scale: 0.95,
          },
          animate: {
            rotate: 0,
            opacity: 1,
            scale: 1,
            transition: baseTransition,
          },
          exit: {
            rotate: -rotateAngle,
            opacity: 0,
            scale: 0.95,
            transition: { ...baseTransition, duration: (duration / 1000) * 0.5 },
          },
        };

      case 'flip':
        return {
          initial: {
            rotateY: direction === 'left' ? -90 : 90,
            opacity: 0,
          },
          animate: {
            rotateY: 0,
            opacity: 1,
            transition: {
              ...baseTransition,
              type: 'spring',
              stiffness: 200,
              damping: 20,
            },
          },
          exit: {
            rotateY: direction === 'left' ? 90 : -90,
            opacity: 0,
            transition: { ...baseTransition, duration: (duration / 1000) * 0.5 },
          },
        };

      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1, transition: baseTransition },
          exit: { opacity: 0, transition: baseTransition },
        };
    }
  };

  const variants = getTransitionVariants();

  return (
    <AnimatePresence mode='wait' initial={false}>
      <motion.div
        key={location.pathname}
        initial='initial'
        animate='animate'
        exit='exit'
        variants={variants}
        className={clsx(styles.pageTransition, preserveHeight && styles.preserveHeight, className)}
        style={
          type === 'flip'
            ? {
                transformStyle: 'preserve-3d' as const,
                perspective: 1000,
              }
            : {}
        }
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

interface RouteTransitionProps {
  children: React.ReactNode;
}

export const RouteTransition: React.FC<RouteTransitionProps> = ({ children }) => {
  const location = useLocation();
  const { shouldAnimate } = useAnimation();

  if (!shouldAnimate()) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode='wait'>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
