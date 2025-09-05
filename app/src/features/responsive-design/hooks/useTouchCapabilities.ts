/**
 * useTouchCapabilities Hook
 *
 * React hook for managing touch interactions and gestures
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GestureConfig } from '../types/responsive.types';
import { useDeviceDetection } from './useDeviceDetection';

/**
 * Touch state
 */
interface TouchState {
  isPressed: boolean;
  isSwiping: boolean;
  isPinching: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
  velocity: number;
  direction: 'up' | 'down' | 'left' | 'right' | null;
}

/**
 * Swipe event
 */
interface SwipeEvent {
  direction: 'up' | 'down' | 'left' | 'right';
  distance: number;
  velocity: number;
}

/**
 * Pinch event
 */
interface PinchEvent {
  scale: number;
  center: { x: number; y: number };
}

/**
 * Hook options
 */
interface UseTouchCapabilitiesOptions {
  onSwipe?: (event: SwipeEvent) => void;
  onPinch?: (event: PinchEvent) => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  config?: Partial<GestureConfig>;
}

/**
 * Default gesture configuration
 */
const DEFAULT_CONFIG: GestureConfig = {
  swipeThreshold: 50,
  swipeVelocity: 0.3,
  tapDelay: 200,
  longPressDelay: 500,
  doubleTapDelay: 300,
  pinchThreshold: 0.1,
};

/**
 * Hook for touch capabilities
 */
export function useTouchCapabilities<T extends HTMLElement = HTMLDivElement>(
  options: UseTouchCapabilitiesOptions = {}
): {
  ref: React.RefObject<T>;
  touchState: TouchState;
  bind: () => React.TouchEventHandler<T> & React.MouseEventHandler<T>;
} {
  const { hasTouch } = useDeviceDetection();
  const config = { ...DEFAULT_CONFIG, ...options.config };

  const [touchState, setTouchState] = useState<TouchState>({
    isPressed: false,
    isSwiping: false,
    isPinching: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
    velocity: 0,
    direction: null,
  });

  const ref = useRef<T>(null);
  const startTimeRef = useRef<number>(0);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const longPressTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const lastTapTimeRef = useRef<number>(0);
  const initialDistanceRef = useRef<number>(0);

  // Handle touch/mouse start
  const handleStart = useCallback(
    (clientX: number, clientY: number) => {
      startTimeRef.current = Date.now();

      setTouchState({
        isPressed: true,
        isSwiping: false,
        isPinching: false,
        startX: clientX,
        startY: clientY,
        currentX: clientX,
        currentY: clientY,
        deltaX: 0,
        deltaY: 0,
        velocity: 0,
        direction: null,
      });

      // Long press detection
      longPressTimeoutRef.current = setTimeout(() => {
        options.onLongPress?.();
      }, config.longPressDelay);
    },
    [options, config.longPressDelay]
  );

  // Handle touch/mouse move
  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!touchState.isPressed) return;

      const deltaX = clientX - touchState.startX;
      const deltaY = clientY - touchState.startY;
      const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
      const timeDelta = Date.now() - startTimeRef.current;
      const velocity = distance / timeDelta;

      // Determine direction
      let direction: 'up' | 'down' | 'left' | 'right' | null = null;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }

      // Cancel long press if moving
      if (distance > 10) {
        clearTimeout(longPressTimeoutRef.current);
      }

      setTouchState(prev => ({
        ...prev,
        isSwiping: distance > config.swipeThreshold,
        currentX: clientX,
        currentY: clientY,
        deltaX,
        deltaY,
        velocity,
        direction,
      }));
    },
    [touchState.isPressed, touchState.startX, touchState.startY, config.swipeThreshold]
  );

  // Handle touch/mouse end
  const handleEnd = useCallback(() => {
    if (!touchState.isPressed) return;

    const timeDelta = Date.now() - startTimeRef.current;
    const distance = Math.sqrt(touchState.deltaX ** 2 + touchState.deltaY ** 2);

    // Clear long press timeout
    clearTimeout(longPressTimeoutRef.current);

    // Swipe detection
    if (
      touchState.isSwiping &&
      touchState.direction &&
      touchState.velocity > config.swipeVelocity
    ) {
      options.onSwipe?.({
        direction: touchState.direction,
        distance,
        velocity: touchState.velocity,
      });
    }
    // Tap detection
    else if (distance < 10 && timeDelta < config.tapDelay) {
      const now = Date.now();
      const timeSinceLastTap = now - lastTapTimeRef.current;

      // Double tap detection
      if (timeSinceLastTap < config.doubleTapDelay) {
        clearTimeout(tapTimeoutRef.current);
        options.onDoubleTap?.();
        lastTapTimeRef.current = 0;
      } else {
        // Single tap (with delay to check for double tap)
        tapTimeoutRef.current = setTimeout(() => {
          options.onTap?.();
        }, config.doubleTapDelay);
        lastTapTimeRef.current = now;
      }
    }

    setTouchState(prev => ({
      ...prev,
      isPressed: false,
      isSwiping: false,
      isPinching: false,
    }));
  }, [touchState, options, config]);

  // Handle pinch gesture
  const handlePinch = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length !== 2) return;

      const touch1 = e.touches[0];
      const touch2 = e.touches[1];

      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      if (!touchState.isPinching) {
        initialDistanceRef.current = distance;
        setTouchState(prev => ({ ...prev, isPinching: true }));
      } else {
        const scale = distance / initialDistanceRef.current;
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;

        if (Math.abs(scale - 1) > config.pinchThreshold) {
          options.onPinch?.({
            scale,
            center: { x: centerX, y: centerY },
          });
        }
      }
    },
    [touchState.isPinching, options, config.pinchThreshold]
  );

  // Touch event handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<T>) => {
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);

      if (e.touches.length === 2) {
        handlePinch(e.nativeEvent);
      }
    },
    [handleStart, handlePinch]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<T>) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      } else if (e.touches.length === 2) {
        handlePinch(e.nativeEvent);
      }
    },
    [handleMove, handlePinch]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<T>) => {
      handleEnd();
    },
    [handleEnd]
  );

  // Mouse event handlers (fallback for non-touch devices)
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<T>) => {
      if (hasTouch) return; // Ignore mouse events on touch devices
      handleStart(e.clientX, e.clientY);
    },
    [hasTouch, handleStart]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<T>) => {
      if (hasTouch) return;
      handleMove(e.clientX, e.clientY);
    },
    [hasTouch, handleMove]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<T>) => {
      if (hasTouch) return;
      handleEnd();
    },
    [hasTouch, handleEnd]
  );

  // Bind function to attach all handlers
  const bind = useCallback(
    () => ({
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp,
    }),
    [
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,
    ]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(tapTimeoutRef.current);
      clearTimeout(longPressTimeoutRef.current);
    };
  }, []);

  return {
    ref,
    touchState,
    bind,
  };
}

/**
 * Hook for swipe gestures
 */
export function useSwipe<T extends HTMLElement = HTMLDivElement>(
  onSwipe: (direction: 'up' | 'down' | 'left' | 'right') => void,
  options?: Partial<GestureConfig>
): {
  ref: React.RefObject<T>;
  bind: () => React.TouchEventHandler<T> & React.MouseEventHandler<T>;
} {
  const { ref, bind } = useTouchCapabilities<T>({
    onSwipe: event => onSwipe(event.direction),
    config: options,
  });

  return { ref, bind };
}

/**
 * Hook for tap gestures
 */
export function useTap<T extends HTMLElement = HTMLDivElement>(
  onTap: () => void,
  onDoubleTap?: () => void,
  onLongPress?: () => void
): {
  ref: React.RefObject<T>;
  bind: () => React.TouchEventHandler<T> & React.MouseEventHandler<T>;
} {
  const { ref, bind } = useTouchCapabilities<T>({
    onTap,
    onDoubleTap,
    onLongPress,
  });

  return { ref, bind };
}

/**
 * Hook for pinch gestures
 */
export function usePinch<T extends HTMLElement = HTMLDivElement>(
  onPinch: (scale: number) => void
): {
  ref: React.RefObject<T>;
  bind: () => React.TouchEventHandler<T>;
} {
  const { ref, bind } = useTouchCapabilities<T>({
    onPinch: event => onPinch(event.scale),
  });

  return { ref, bind };
}
