/**
 * useViewportSize Hook
 *
 * React hook for tracking viewport dimensions and orientation
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ViewportSize } from '../types/responsive.types';
import { getViewportSize } from '../services/breakpointManager';
import { throttle } from '../services/performanceOptimizer';

/**
 * Hook options
 */
interface UseViewportSizeOptions {
  throttleDelay?: number;
  includeScrollbar?: boolean;
}

/**
 * Hook return type
 */
interface UseViewportSizeReturn extends ViewportSize {
  isPortrait: boolean;
  isLandscape: boolean;
  aspectRatio: number;
  isSmallScreen: boolean;
  isMediumScreen: boolean;
  isLargeScreen: boolean;
}

/**
 * Hook for viewport size tracking
 */
export function useViewportSize(options: UseViewportSizeOptions = {}): UseViewportSizeReturn {
  const { throttleDelay = 100, includeScrollbar = false } = options;

  const [viewport, setViewport] = useState<ViewportSize | null>(getViewportSize());

  useEffect(() => {
    const updateViewport = () => {
      const currentViewport = getViewportSize();
      if (currentViewport) {
        if (includeScrollbar) {
          // Include scrollbar in measurements
          currentViewport.width = document.documentElement.clientWidth;
          currentViewport.height = document.documentElement.clientHeight;
        }
        setViewport(currentViewport);
      }
    };

    // Throttled resize handler
    const throttledUpdate = throttle(updateViewport, throttleDelay);

    // Initial update
    updateViewport();

    // Add event listeners
    window.addEventListener('resize', throttledUpdate);
    window.addEventListener('orientationchange', updateViewport);

    return () => {
      window.removeEventListener('resize', throttledUpdate);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, [throttleDelay, includeScrollbar]);

  // Calculate derived values
  const derivedValues = useMemo(() => {
    if (!viewport) {
      return {
        isPortrait: false,
        isLandscape: true,
        aspectRatio: 1,
        isSmallScreen: false,
        isMediumScreen: true,
        isLargeScreen: false,
      };
    }

    const aspectRatio = viewport.width / viewport.height;

    return {
      isPortrait: viewport.orientation === 'portrait',
      isLandscape: viewport.orientation === 'landscape',
      aspectRatio,
      isSmallScreen: viewport.width < 640,
      isMediumScreen: viewport.width >= 640 && viewport.width < 1280,
      isLargeScreen: viewport.width >= 1280,
    };
  }, [viewport]);

  if (!viewport) {
    // Return default values if viewport is not available
    return {
      width: 0,
      height: 0,
      breakpoint: 'desktop',
      orientation: 'landscape',
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isWide: false,
      ...derivedValues,
    };
  }

  return {
    ...viewport,
    ...derivedValues,
  };
}

/**
 * Hook for element dimensions
 */
export function useElementSize<T extends HTMLElement = HTMLDivElement>(): {
  ref: React.RefObject<T>;
  width: number;
  height: number;
  top: number;
  left: number;
} {
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
  });

  const ref = React.useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const { top, left } = entry.target.getBoundingClientRect();
        setDimensions({ width, height, top, left });
      }
    });

    resizeObserver.observe(element);

    // Initial measurement
    const rect = element.getBoundingClientRect();
    setDimensions({
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left,
    });

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return {
    ref,
    ...dimensions,
  };
}

/**
 * Hook for window scroll position
 */
export function useScrollPosition(options: { throttleDelay?: number } = {}): {
  x: number;
  y: number;
  isScrolling: boolean;
  scrollDirection: 'up' | 'down' | null;
} {
  const { throttleDelay = 100 } = options;

  const [scrollPosition, setScrollPosition] = useState({
    x: 0,
    y: 0,
    isScrolling: false,
    scrollDirection: null as 'up' | 'down' | null,
  });

  useEffect(() => {
    let scrollTimeout: ReturnType<typeof setTimeout>;
    let lastScrollY = window.scrollY;

    const updateScrollPosition = () => {
      const currentScrollY = window.scrollY;
      const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';

      setScrollPosition({
        x: window.scrollX,
        y: currentScrollY,
        isScrolling: true,
        scrollDirection,
      });

      lastScrollY = currentScrollY;

      // Reset scrolling state after delay
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setScrollPosition(prev => ({ ...prev, isScrolling: false }));
      }, 150);
    };

    const throttledUpdate = throttle(updateScrollPosition, throttleDelay);

    window.addEventListener('scroll', throttledUpdate, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledUpdate);
      clearTimeout(scrollTimeout);
    };
  }, [throttleDelay]);

  return scrollPosition;
}

/**
 * Hook for safe area insets (for devices with notches)
 */
export function useSafeAreaInsets(): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} {
  const [insets, setInsets] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    const updateInsets = () => {
      const computedStyle = getComputedStyle(document.documentElement);

      setInsets({
        top: parseInt(computedStyle.getPropertyValue('--sat') || '0', 10),
        right: parseInt(computedStyle.getPropertyValue('--sar') || '0', 10),
        bottom: parseInt(computedStyle.getPropertyValue('--sab') || '0', 10),
        left: parseInt(computedStyle.getPropertyValue('--sal') || '0', 10),
      });
    };

    // Check for CSS environment variables (safe-area-inset-*)
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --sat: env(safe-area-inset-top, 0px);
        --sar: env(safe-area-inset-right, 0px);
        --sab: env(safe-area-inset-bottom, 0px);
        --sal: env(safe-area-inset-left, 0px);
      }
    `;
    document.head.appendChild(style);

    updateInsets();

    // Update on orientation change
    window.addEventListener('orientationchange', updateInsets);

    return () => {
      window.removeEventListener('orientationchange', updateInsets);
      document.head.removeChild(style);
    };
  }, []);

  return insets;
}

/**
 * Hook for intersection observer
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = {}
): {
  ref: React.RefObject<T>;
  isIntersecting: boolean;
  intersectionRatio: number;
} {
  const [intersection, setIntersection] = useState({
    isIntersecting: false,
    intersectionRatio: 0,
  });

  const ref = React.useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        setIntersection({
          isIntersecting: entry.isIntersecting,
          intersectionRatio: entry.intersectionRatio,
        });
      },
      {
        threshold: 0,
        rootMargin: '0px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options.threshold, options.root, options.rootMargin]);

  return {
    ref,
    ...intersection,
  };
}
