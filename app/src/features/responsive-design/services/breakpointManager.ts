/**
 * Breakpoint Manager Service
 * 
 * Manages responsive breakpoints and provides utilities for
 * detecting and responding to breakpoint changes
 */

import { BREAKPOINTS, Breakpoint, ViewportSize } from '../types/responsive.types';

/**
 * Media query strings for each breakpoint
 */
export const MEDIA_QUERIES = {
  mobile: `(max-width: ${BREAKPOINTS.tablet - 1}px)`,
  tablet: `(min-width: ${BREAKPOINTS.tablet}px) and (max-width: ${BREAKPOINTS.desktop - 1}px)`,
  desktop: `(min-width: ${BREAKPOINTS.desktop}px) and (max-width: ${BREAKPOINTS.wide - 1}px)`,
  wide: `(min-width: ${BREAKPOINTS.wide}px)`,
  
  // Utility queries
  mobileAndTablet: `(max-width: ${BREAKPOINTS.desktop - 1}px)`,
  tabletAndUp: `(min-width: ${BREAKPOINTS.tablet}px)`,
  desktopAndUp: `(min-width: ${BREAKPOINTS.desktop}px)`,
  
  // Orientation queries
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',
  
  // Feature queries
  touch: '(hover: none) and (pointer: coarse)',
  hover: '(hover: hover) and (pointer: fine)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
  darkMode: '(prefers-color-scheme: dark)',
  highContrast: '(prefers-contrast: high)',
} as const;

/**
 * Breakpoint manager class
 */
class BreakpointManager {
  private listeners: Map<string, Set<(matches: boolean) => void>> = new Map();
  private mediaQueryLists: Map<string, MediaQueryList> = new Map();
  private currentBreakpoint: Breakpoint = 'desktop';
  private viewportSize: ViewportSize | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeMediaQueries();
      this.updateViewportSize();
      window.addEventListener('resize', this.handleResize);
    }
  }

  /**
   * Initialize media query listeners
   */
  private initializeMediaQueries(): void {
    Object.entries(MEDIA_QUERIES).forEach(([key, query]) => {
      const mql = window.matchMedia(query);
      this.mediaQueryLists.set(key, mql);
      
      // Add change listener
      mql.addEventListener('change', (e) => {
        this.notifyListeners(key, e.matches);
      });
    });

    // Determine initial breakpoint
    this.updateCurrentBreakpoint();
  }

  /**
   * Update current breakpoint based on window width
   */
  private updateCurrentBreakpoint(): void {
    const width = window.innerWidth;
    
    if (width < BREAKPOINTS.tablet) {
      this.currentBreakpoint = 'mobile';
    } else if (width < BREAKPOINTS.desktop) {
      this.currentBreakpoint = 'tablet';
    } else if (width < BREAKPOINTS.wide) {
      this.currentBreakpoint = 'desktop';
    } else {
      this.currentBreakpoint = 'wide';
    }
  }

  /**
   * Handle window resize with throttling
   */
  private resizeTimeout: ReturnType<typeof setTimeout> | null = null;
  private handleResize = (): void => {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    
    this.resizeTimeout = setTimeout(() => {
      this.updateViewportSize();
      this.updateCurrentBreakpoint();
    }, 100); // Throttle to 100ms
  };

  /**
   * Update viewport size information
   */
  private updateViewportSize(): void {
    if (typeof window === 'undefined') return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.viewportSize = {
      width,
      height,
      breakpoint: this.currentBreakpoint,
      orientation: width > height ? 'landscape' : 'portrait',
      isMobile: width < BREAKPOINTS.tablet,
      isTablet: width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop,
      isDesktop: width >= BREAKPOINTS.desktop && width < BREAKPOINTS.wide,
      isWide: width >= BREAKPOINTS.wide,
    };
  }

  /**
   * Get current breakpoint
   */
  getCurrentBreakpoint(): Breakpoint {
    return this.currentBreakpoint;
  }

  /**
   * Get current viewport size
   */
  getViewportSize(): ViewportSize | null {
    return this.viewportSize;
  }

  /**
   * Check if current breakpoint matches query
   */
  matches(query: keyof typeof MEDIA_QUERIES): boolean {
    const mql = this.mediaQueryLists.get(query);
    return mql ? mql.matches : false;
  }

  /**
   * Check if current breakpoint is at least the specified size
   */
  isAtLeast(breakpoint: Breakpoint): boolean {
    const currentIndex = Object.keys(BREAKPOINTS).indexOf(this.currentBreakpoint);
    const targetIndex = Object.keys(BREAKPOINTS).indexOf(breakpoint);
    return currentIndex >= targetIndex;
  }

  /**
   * Check if current breakpoint is at most the specified size
   */
  isAtMost(breakpoint: Breakpoint): boolean {
    const currentIndex = Object.keys(BREAKPOINTS).indexOf(this.currentBreakpoint);
    const targetIndex = Object.keys(BREAKPOINTS).indexOf(breakpoint);
    return currentIndex <= targetIndex;
  }

  /**
   * Check if viewport is between two breakpoints
   */
  isBetween(min: Breakpoint, max: Breakpoint): boolean {
    const currentIndex = Object.keys(BREAKPOINTS).indexOf(this.currentBreakpoint);
    const minIndex = Object.keys(BREAKPOINTS).indexOf(min);
    const maxIndex = Object.keys(BREAKPOINTS).indexOf(max);
    return currentIndex >= minIndex && currentIndex <= maxIndex;
  }

  /**
   * Subscribe to media query changes
   */
  subscribe(query: keyof typeof MEDIA_QUERIES, callback: (matches: boolean) => void): () => void {
    if (!this.listeners.has(query)) {
      this.listeners.set(query, new Set());
    }
    
    const listeners = this.listeners.get(query)!;
    listeners.add(callback);
    
    // Call immediately with current state
    callback(this.matches(query));
    
    // Return unsubscribe function
    return () => {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.listeners.delete(query);
      }
    };
  }

  /**
   * Notify listeners of media query changes
   */
  private notifyListeners(query: string, matches: boolean): void {
    const listeners = this.listeners.get(query);
    if (listeners) {
      listeners.forEach(callback => callback(matches));
    }
  }

  /**
   * Get responsive value based on current breakpoint
   */
  getResponsiveValue<T>(values: {
    mobile?: T;
    tablet?: T;
    desktop?: T;
    wide?: T;
    default?: T;
  }): T | undefined {
    const breakpointValue = values[this.currentBreakpoint];
    if (breakpointValue !== undefined) return breakpointValue;
    
    // Fallback to smaller breakpoints
    const breakpointOrder: Breakpoint[] = ['wide', 'desktop', 'tablet', 'mobile'];
    const currentIndex = breakpointOrder.indexOf(this.currentBreakpoint);
    
    for (let i = currentIndex + 1; i < breakpointOrder.length; i++) {
      const fallbackValue = values[breakpointOrder[i] as Breakpoint];
      if (fallbackValue !== undefined) return fallbackValue;
    }
    
    return values.default;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.handleResize);
    }
    
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    
    this.listeners.clear();
    this.mediaQueryLists.clear();
  }
}

// Export singleton instance
export const breakpointManager = new BreakpointManager();

// Export utility functions
export const getCurrentBreakpoint = () => breakpointManager.getCurrentBreakpoint();
export const getViewportSize = () => breakpointManager.getViewportSize();
export const matchesQuery = (query: keyof typeof MEDIA_QUERIES) => breakpointManager.matches(query);
export const isAtLeast = (breakpoint: Breakpoint) => breakpointManager.isAtLeast(breakpoint);
export const isAtMost = (breakpoint: Breakpoint) => breakpointManager.isAtMost(breakpoint);
export const isBetween = (min: Breakpoint, max: Breakpoint) => breakpointManager.isBetween(min, max);
export const subscribeToQuery = (query: keyof typeof MEDIA_QUERIES, callback: (matches: boolean) => void) => 
  breakpointManager.subscribe(query, callback);
export const getResponsiveValue = <T>(values: Parameters<typeof breakpointManager.getResponsiveValue<T>>[0]) => 
  breakpointManager.getResponsiveValue(values);