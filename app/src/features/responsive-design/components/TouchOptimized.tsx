/**
 * TouchOptimized Components
 * 
 * Collection of touch-optimized components for mobile interactions
 */

import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useTap, useSwipe, useTouchCapabilities } from '../hooks/useTouchCapabilities';
import { useHaptics } from '../hooks/useDeviceDetection';
import styles from './TouchOptimized.module.css';

/**
 * TouchTarget Component
 * Ensures minimum touch target size for accessibility
 */
export const TouchTarget: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  onLongPress?: () => void;
  minSize?: number;
  haptic?: boolean;
  disabled?: boolean;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}> = ({
  children,
  onClick,
  onLongPress,
  minSize = 44,
  haptic = true,
  disabled = false,
  className = '',
  as: Component = 'button',
}) => {
  const { trigger: triggerHaptic } = useHaptics();
  
  const handleClick = useCallback(() => {
    if (disabled) return;
    if (haptic) triggerHaptic();
    onClick?.();
  }, [onClick, haptic, disabled, triggerHaptic]);

  const { ref, bind } = useTap<HTMLElement>(
    handleClick,
    undefined,
    onLongPress
  );

  return (
    <Component
      ref={ref as any}
      className={`${styles.touchTarget} ${className}`}
      style={{
        minWidth: `${minSize}px`,
        minHeight: `${minSize}px`,
      }}
      disabled={disabled}
      {...bind()}
    >
      {children}
    </Component>
  );
};

/**
 * SwipeGesture Component
 * Detects and handles swipe gestures
 */
export const SwipeGesture: React.FC<{
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  haptic?: boolean;
  className?: string;
}> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  haptic = true,
  className = '',
}) => {
  const { trigger: triggerHaptic } = useHaptics();
  
  const handleSwipe = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (haptic) triggerHaptic();
    
    switch (direction) {
      case 'left':
        onSwipeLeft?.();
        break;
      case 'right':
        onSwipeRight?.();
        break;
      case 'up':
        onSwipeUp?.();
        break;
      case 'down':
        onSwipeDown?.();
        break;
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, haptic, triggerHaptic]);

  const { ref, bind } = useSwipe<HTMLDivElement>(
    handleSwipe,
    { swipeThreshold: threshold }
  );

  return (
    <div
      ref={ref}
      className={`${styles.swipeGesture} ${className}`}
      {...bind()}
    >
      {children}
    </div>
  );
};

/**
 * PullToRefresh Component
 * Implements pull-to-refresh functionality
 */
export const PullToRefresh: React.FC<{
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  className?: string;
}> = ({
  children,
  onRefresh,
  threshold = 80,
  className = '',
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { trigger: triggerHaptic } = useHaptics();

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!startY || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;
    
    if (distance > 0 && containerRef.current?.scrollTop === 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance, threshold * 1.5));
      
      if (distance >= threshold && pullDistance < threshold) {
        triggerHaptic();
      }
    }
  }, [startY, threshold, isRefreshing, pullDistance, triggerHaptic]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      triggerHaptic([20, 10, 20]);
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
    setStartY(0);
  }, [pullDistance, threshold, isRefreshing, onRefresh, triggerHaptic]);

  const pullProgress = Math.min(pullDistance / threshold, 1);

  return (
    <div
      ref={containerRef}
      className={`${styles.pullToRefresh} ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={styles.pullIndicator}
        style={{
          transform: `translateY(${pullDistance}px)`,
          opacity: pullProgress,
        }}
      >
        <div
          className={`${styles.spinner} ${isRefreshing ? styles.spinning : ''}`}
          style={{
            transform: `rotate(${pullProgress * 360}deg)`,
          }}
        />
      </div>
      
      <div
        className={styles.content}
        style={{
          transform: `translateY(${pullDistance}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * LongPress Component
 * Handles long press interactions
 */
export const LongPress: React.FC<{
  children: React.ReactNode;
  onLongPress: () => void;
  onPress?: () => void;
  delay?: number;
  haptic?: boolean;
  className?: string;
}> = ({
  children,
  onLongPress,
  onPress,
  delay = 500,
  haptic = true,
  className = '',
}) => {
  const { trigger: triggerHaptic } = useHaptics();
  const [isPressed, setIsPressed] = useState(false);
  
  const handleLongPress = useCallback(() => {
    if (haptic) triggerHaptic([10, 5, 20]);
    onLongPress();
    setIsPressed(false);
  }, [onLongPress, haptic, triggerHaptic]);

  const handlePress = useCallback(() => {
    if (haptic) triggerHaptic();
    onPress?.();
  }, [onPress, haptic, triggerHaptic]);

  const { ref, bind } = useTap<HTMLDivElement>(
    handlePress,
    undefined,
    handleLongPress
  );

  return (
    <div
      ref={ref}
      className={`
        ${styles.longPress}
        ${isPressed ? styles.pressed : ''}
        ${className}
      `}
      {...bind()}
    >
      {children}
    </div>
  );
};

/**
 * DoubleTap Component
 * Handles double tap interactions
 */
export const DoubleTap: React.FC<{
  children: React.ReactNode;
  onDoubleTap: () => void;
  onSingleTap?: () => void;
  delay?: number;
  haptic?: boolean;
  className?: string;
}> = ({
  children,
  onDoubleTap,
  onSingleTap,
  delay = 300,
  haptic = true,
  className = '',
}) => {
  const { trigger: triggerHaptic } = useHaptics();
  
  const handleDoubleTap = useCallback(() => {
    if (haptic) triggerHaptic([10, 5, 10]);
    onDoubleTap();
  }, [onDoubleTap, haptic, triggerHaptic]);

  const handleSingleTap = useCallback(() => {
    if (haptic) triggerHaptic();
    onSingleTap?.();
  }, [onSingleTap, haptic, triggerHaptic]);

  const { ref, bind } = useTap<HTMLDivElement>(
    handleSingleTap,
    handleDoubleTap
  );

  return (
    <div
      ref={ref}
      className={`${styles.doubleTap} ${className}`}
      {...bind()}
    >
      {children}
    </div>
  );
};

/**
 * Ripple Effect Component
 * Creates material design ripple effect on touch
 */
export const RippleEffect: React.FC<{
  children: React.ReactNode;
  color?: string;
  duration?: number;
  className?: string;
}> = ({
  children,
  color = 'rgba(255, 255, 255, 0.3)',
  duration = 600,
  className = '',
}) => {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples(prev => [...prev, { x, y, id }]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, duration);
  }, [duration]);

  return (
    <div
      ref={containerRef}
      className={`${styles.rippleContainer} ${className}`}
      onPointerDown={handlePointerDown}
    >
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className={styles.ripple}
          style={{
            left: ripple.x,
            top: ripple.y,
            backgroundColor: color,
            animationDuration: `${duration}ms`,
          }}
        />
      ))}
    </div>
  );
};