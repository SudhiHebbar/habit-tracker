import { useCallback, useEffect, useRef, useState } from 'react';
import type { GestureConfig } from '../types/animation.types';

interface GestureState {
  isDragging: boolean;
  isSwipingLeft: boolean;
  isSwipingRight: boolean;
  isSwipingUp: boolean;
  isSwipingDown: boolean;
  deltaX: number;
  deltaY: number;
  velocity: number;
}

interface UseGestureOptions extends GestureConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onLongPress?: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDrag?: (deltaX: number, deltaY: number) => void;
}

export const useGesture = (options: UseGestureOptions = {}) => {
  const {
    swipeThreshold = 50,
    swipeVelocity = 0.5,
    tapDuration = 300,
    longPressDuration = 500,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onLongPress,
    onDragStart,
    onDragEnd,
    onDrag,
  } = options;

  const [gestureState, setGestureState] = useState<GestureState>({
    isDragging: false,
    isSwipingLeft: false,
    isSwipingRight: false,
    isSwipingUp: false,
    isSwipingDown: false,
    deltaX: 0,
    deltaY: 0,
    velocity: 0,
  });

  const startX = useRef(0);
  const startY = useRef(0);
  const startTime = useRef(0);
  const longPressTimer = useRef<ReturnType<typeof setTimeout>>();
  const elementRef = useRef<HTMLElement | null>(null);

  const handleStart = useCallback((e: TouchEvent | MouseEvent) => {
    const point = 'touches' in e ? e.touches[0] : e;
    startX.current = point.clientX;
    startY.current = point.clientY;
    startTime.current = Date.now();

    setGestureState(prev => ({
      ...prev,
      isDragging: true,
      deltaX: 0,
      deltaY: 0,
    }));

    if (onDragStart) {
      onDragStart();
    }

    longPressTimer.current = setTimeout(() => {
      if (onLongPress) {
        onLongPress();
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }
    }, longPressDuration);
  }, [longPressDuration, onDragStart, onLongPress]);

  const handleMove = useCallback((e: TouchEvent | MouseEvent) => {
    if (!gestureState.isDragging) return;

    const point = 'touches' in e ? e.touches[0] : e;
    const deltaX = point.clientX - startX.current;
    const deltaY = point.clientY - startY.current;

    setGestureState(prev => ({
      ...prev,
      deltaX,
      deltaY,
      isSwipingLeft: deltaX < -swipeThreshold,
      isSwipingRight: deltaX > swipeThreshold,
      isSwipingUp: deltaY < -swipeThreshold,
      isSwipingDown: deltaY > swipeThreshold,
    }));

    if (onDrag) {
      onDrag(deltaX, deltaY);
    }

    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    }
  }, [gestureState.isDragging, swipeThreshold, onDrag]);

  const handleEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    if (!gestureState.isDragging) return;

    const endTime = Date.now();
    const duration = endTime - startTime.current;
    const velocity = Math.sqrt(
      Math.pow(gestureState.deltaX, 2) + Math.pow(gestureState.deltaY, 2)
    ) / duration;

    const absX = Math.abs(gestureState.deltaX);
    const absY = Math.abs(gestureState.deltaY);

    if (duration < tapDuration && absX < 5 && absY < 5) {
      if (onTap) {
        onTap();
      }
    } else if (velocity > swipeVelocity) {
      if (absX > absY) {
        if (gestureState.deltaX < -swipeThreshold && onSwipeLeft) {
          onSwipeLeft();
        } else if (gestureState.deltaX > swipeThreshold && onSwipeRight) {
          onSwipeRight();
        }
      } else {
        if (gestureState.deltaY < -swipeThreshold && onSwipeUp) {
          onSwipeUp();
        } else if (gestureState.deltaY > swipeThreshold && onSwipeDown) {
          onSwipeDown();
        }
      }
    }

    setGestureState({
      isDragging: false,
      isSwipingLeft: false,
      isSwipingRight: false,
      isSwipingUp: false,
      isSwipingDown: false,
      deltaX: 0,
      deltaY: 0,
      velocity: 0,
    });

    if (onDragEnd) {
      onDragEnd();
    }
  }, [
    gestureState,
    tapDuration,
    swipeThreshold,
    swipeVelocity,
    onTap,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onDragEnd,
  ]);

  const bind = useCallback((element: HTMLElement | null) => {
    if (elementRef.current) {
      elementRef.current.removeEventListener('touchstart', handleStart as EventListener);
      elementRef.current.removeEventListener('touchmove', handleMove as EventListener);
      elementRef.current.removeEventListener('touchend', handleEnd as EventListener);
      elementRef.current.removeEventListener('mousedown', handleStart as EventListener);
      elementRef.current.removeEventListener('mousemove', handleMove as EventListener);
      elementRef.current.removeEventListener('mouseup', handleEnd as EventListener);
    }

    if (element) {
      element.addEventListener('touchstart', handleStart as EventListener, { passive: true });
      element.addEventListener('touchmove', handleMove as EventListener, { passive: true });
      element.addEventListener('touchend', handleEnd as EventListener, { passive: true });
      element.addEventListener('mousedown', handleStart as EventListener);
      element.addEventListener('mousemove', handleMove as EventListener);
      element.addEventListener('mouseup', handleEnd as EventListener);
    }

    elementRef.current = element;
  }, [handleStart, handleMove, handleEnd]);

  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
      if (elementRef.current) {
        bind(null);
      }
    };
  }, [bind]);

  return {
    bind,
    gestureState,
    reset: () => setGestureState({
      isDragging: false,
      isSwipingLeft: false,
      isSwipingRight: false,
      isSwipingUp: false,
      isSwipingDown: false,
      deltaX: 0,
      deltaY: 0,
      velocity: 0,
    }),
  };
};