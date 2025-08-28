import React, { useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useAnimation as useAnimationHook } from '../hooks/useAnimation';
import type { MicroInteractionConfig } from '../types/animation.types';
import clsx from 'clsx';
import styles from './MicroInteraction.module.css';

interface MicroInteractionProps {
  children: React.ReactNode;
  config?: MicroInteractionConfig;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}

export const MicroInteraction: React.FC<MicroInteractionProps> = ({
  children,
  config = {
    hover: true,
    press: true,
    focus: true,
    ripple: false,
    haptic: false,
    sound: false,
  },
  className,
  as: Component = 'div',
}) => {
  const { shouldAnimate } = useAnimationHook();
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  const handlePointerDown = (e: React.PointerEvent) => {
    if (config.haptic && 'vibrate' in navigator) {
      navigator.vibrate(5);
    }

    if (config.ripple && shouldAnimate()) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();
        setRipples(prev => [...prev, { id, x, y }]);
        
        setTimeout(() => {
          setRipples(prev => prev.filter(ripple => ripple.id !== id));
        }, 600);
      }
    }
  };

  const interactionVariants = {
    initial: {
      scale: 1,
    },
    hover: shouldAnimate() && config.hover
      ? {
          scale: 1.02,
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 17,
          },
        }
      : {},
    pressed: shouldAnimate() && config.press
      ? {
          scale: 0.98,
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 17,
          },
        }
      : {},
    focus: shouldAnimate() && config.focus
      ? {
          scale: 1.01,
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 17,
          },
        }
      : {},
  };

  const MotionComponent = motion[Component as keyof typeof motion] as typeof motion.div;

  return (
    <MotionComponent
      ref={containerRef}
      className={clsx(styles.container, className)}
      variants={interactionVariants}
      initial="initial"
      whileHover="hover"
      whileTap="pressed"
      whileFocus="focus"
      animate={controls}
      onPointerDown={handlePointerDown}
    >
      {children}
      {config.ripple && (
        <div className={styles.rippleContainer}>
          {ripples.map(ripple => (
            <motion.span
              key={ripple.id}
              className={styles.ripple}
              initial={{ scale: 0, opacity: 0.5 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{
                left: ripple.x,
                top: ripple.y,
              }}
            />
          ))}
        </div>
      )}
    </MotionComponent>
  );
};

interface RippleEffectProps {
  color?: string;
  duration?: number;
  className?: string;
}

export const RippleEffect: React.FC<RippleEffectProps> = ({
  color = 'rgba(0, 0, 0, 0.1)',
  duration = 600,
  className,
}) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();
      
      setRipples(prev => [...prev, { id, x, y }]);
      
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== id));
      }, duration);
    }
  };

  return (
    <div
      ref={containerRef}
      className={clsx(styles.rippleWrapper, className)}
      onClick={handleClick}
    >
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className={styles.rippleEffect}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: duration / 1000, ease: 'easeOut' }}
          style={{
            left: ripple.x,
            top: ripple.y,
            backgroundColor: color,
          }}
        />
      ))}
    </div>
  );
};

interface HoverScaleProps {
  children: React.ReactNode;
  scale?: number;
  duration?: number;
  className?: string;
}

export const HoverScale: React.FC<HoverScaleProps> = ({
  children,
  scale = 1.05,
  duration = 200,
  className,
}) => {
  const { shouldAnimate } = useAnimationHook();

  if (!shouldAnimate()) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={clsx(styles.hoverScale, className)}
      whileHover={{ scale }}
      transition={{ duration: duration / 1000, type: 'spring', stiffness: 300 }}
    >
      {children}
    </motion.div>
  );
};

interface PressAnimationProps {
  children: React.ReactNode;
  scale?: number;
  duration?: number;
  haptic?: boolean;
  className?: string;
}

export const PressAnimation: React.FC<PressAnimationProps> = ({
  children,
  scale = 0.95,
  duration = 150,
  haptic = true,
  className,
}) => {
  const { shouldAnimate } = useAnimationHook();

  const handleTap = () => {
    if (haptic && 'vibrate' in navigator) {
      navigator.vibrate(5);
    }
  };

  if (!shouldAnimate()) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={clsx(styles.pressAnimation, className)}
      whileTap={{ scale }}
      onTap={handleTap}
      transition={{ duration: duration / 1000, type: 'spring', stiffness: 400 }}
    >
      {children}
    </motion.div>
  );
};