/**
 * useBreakpoint Hook
 * 
 * React hook for responsive breakpoint detection and management
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Breakpoint, ViewportSize } from '../types/responsive.types';
import { 
  breakpointManager, 
  MEDIA_QUERIES,
  getCurrentBreakpoint,
  getViewportSize,
  isAtLeast,
  isAtMost,
  isBetween,
  matchesQuery,
  subscribeToQuery,
  getResponsiveValue
} from '../services/breakpointManager';

/**
 * Hook return type
 */
interface UseBreakpointReturn {
  current: Breakpoint;
  viewport: ViewportSize | null;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
  isAtLeast: (breakpoint: Breakpoint) => boolean;
  isAtMost: (breakpoint: Breakpoint) => boolean;
  isBetween: (min: Breakpoint, max: Breakpoint) => boolean;
  matches: (query: keyof typeof MEDIA_QUERIES) => boolean;
  getValue: <T>(values: {
    mobile?: T;
    tablet?: T;
    desktop?: T;
    wide?: T;
    default?: T;
  }) => T | undefined;
}

/**
 * Hook for responsive breakpoint management
 */
export function useBreakpoint(): UseBreakpointReturn {
  const [current, setCurrent] = useState<Breakpoint>(getCurrentBreakpoint());
  const [viewport, setViewport] = useState<ViewportSize | null>(getViewportSize());

  // Update state when breakpoint changes
  useEffect(() => {
    const updateBreakpoint = () => {
      setCurrent(getCurrentBreakpoint());
      setViewport(getViewportSize());
    };

    // Subscribe to all breakpoint queries
    const unsubscribers: (() => void)[] = [];
    
    ['mobile', 'tablet', 'desktop', 'wide'].forEach((breakpoint) => {
      const unsubscribe = subscribeToQuery(
        breakpoint as keyof typeof MEDIA_QUERIES,
        updateBreakpoint
      );
      unsubscribers.push(unsubscribe);
    });

    // Also listen for orientation changes
    const orientationUnsubscribe = subscribeToQuery('portrait', updateBreakpoint);
    unsubscribers.push(orientationUnsubscribe);

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  // Memoized boolean checks
  const isMobile = useMemo(() => current === 'mobile', [current]);
  const isTablet = useMemo(() => current === 'tablet', [current]);
  const isDesktop = useMemo(() => current === 'desktop', [current]);
  const isWide = useMemo(() => current === 'wide', [current]);

  // Callback functions
  const isAtLeastBreakpoint = useCallback((breakpoint: Breakpoint) => {
    return isAtLeast(breakpoint);
  }, []);

  const isAtMostBreakpoint = useCallback((breakpoint: Breakpoint) => {
    return isAtMost(breakpoint);
  }, []);

  const isBetweenBreakpoints = useCallback((min: Breakpoint, max: Breakpoint) => {
    return isBetween(min, max);
  }, []);

  const matchesMediaQuery = useCallback((query: keyof typeof MEDIA_QUERIES) => {
    return matchesQuery(query);
  }, []);

  const getValue = useCallback(<T,>(values: {
    mobile?: T;
    tablet?: T;
    desktop?: T;
    wide?: T;
    default?: T;
  }) => {
    return getResponsiveValue(values);
  }, []);

  return {
    current,
    viewport,
    isMobile,
    isTablet,
    isDesktop,
    isWide,
    isAtLeast: isAtLeastBreakpoint,
    isAtMost: isAtMostBreakpoint,
    isBetween: isBetweenBreakpoints,
    matches: matchesMediaQuery,
    getValue,
  };
}

/**
 * Hook for conditional rendering based on breakpoints
 */
export function useResponsiveVisibility(
  showOn?: Breakpoint[],
  hideOn?: Breakpoint[]
): boolean {
  const { current } = useBreakpoint();
  
  return useMemo(() => {
    if (hideOn?.includes(current)) return false;
    if (showOn && !showOn.includes(current)) return false;
    return true;
  }, [current, showOn, hideOn]);
}

/**
 * Hook for responsive values
 */
export function useResponsiveValue<T>(values: {
  mobile?: T;
  tablet?: T;
  desktop?: T;
  wide?: T;
  default?: T;
}): T | undefined {
  const { getValue } = useBreakpoint();
  return useMemo(() => getValue(values), [getValue, values]);
}

/**
 * Hook for media query matching
 */
export function useMediaQuery(query: keyof typeof MEDIA_QUERIES | string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if it's a predefined query or custom
    const mediaQuery = query in MEDIA_QUERIES 
      ? MEDIA_QUERIES[query as keyof typeof MEDIA_QUERIES]
      : query;

    const mediaQueryList = window.matchMedia(mediaQuery);
    setMatches(mediaQueryList.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    mediaQueryList.addEventListener('change', handleChange);
    return () => mediaQueryList.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}

/**
 * Hook for responsive class names
 */
export function useResponsiveClassName(
  classNames: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
    wide?: string;
    default?: string;
  }
): string {
  const value = useResponsiveValue(classNames);
  return value ?? '';
}

/**
 * Hook for responsive styles
 */
export function useResponsiveStyle(
  styles: {
    mobile?: React.CSSProperties;
    tablet?: React.CSSProperties;
    desktop?: React.CSSProperties;
    wide?: React.CSSProperties;
    default?: React.CSSProperties;
  }
): React.CSSProperties {
  const value = useResponsiveValue(styles);
  return value ?? {};
}