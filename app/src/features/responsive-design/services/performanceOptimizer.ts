/**
 * Performance Optimizer Service
 * 
 * Optimizes performance for different device types and capabilities
 * with adaptive strategies based on device constraints
 */

import { DeviceType, PerformanceConfig } from '../types/responsive.types';
import { deviceDetector } from './deviceDetection';

/**
 * Performance metrics
 */
interface PerformanceMetrics {
  fps: number;
  memory: number;
  loadTime: number;
  renderTime: number;
  networkLatency: number;
}

/**
 * Performance optimizer class
 */
class PerformanceOptimizer {
  private config: PerformanceConfig;
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: Map<string, PerformanceObserver> = new Map();
  private rafId: number | null = null;
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private fpsHistory: number[] = [];

  constructor() {
    this.config = this.getDefaultConfig();
    this.initializeObservers();
    this.startFPSMonitoring();
  }

  /**
   * Get default configuration based on device type
   */
  private getDefaultConfig(): PerformanceConfig {
    const deviceType = deviceDetector.getDeviceType();
    const capabilities = deviceDetector.getCapabilities();

    // Mobile-specific optimizations
    if (deviceType === 'mobile') {
      return {
        enableLazyLoading: true,
        enableVirtualization: true,
        throttleResize: 200,
        debounceScroll: 150,
        reducedMotionFallback: capabilities?.reducedMotion ?? false,
        lowPowerMode: capabilities?.networkSpeed === 'slow',
      };
    }

    // Tablet optimizations
    if (deviceType === 'tablet') {
      return {
        enableLazyLoading: true,
        enableVirtualization: true,
        throttleResize: 150,
        debounceScroll: 100,
        reducedMotionFallback: capabilities?.reducedMotion ?? false,
        lowPowerMode: false,
      };
    }

    // Desktop/hybrid default
    return {
      enableLazyLoading: false,
      enableVirtualization: false,
      throttleResize: 100,
      debounceScroll: 50,
      reducedMotionFallback: capabilities?.reducedMotion ?? false,
      lowPowerMode: false,
    };
  }

  /**
   * Initialize performance observers
   */
  private initializeObservers(): void {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    // Paint timing observer
    try {
      const paintObserver = new PerformanceObserver((entries) => {
        for (const entry of entries.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.renderTime = entry.startTime;
          }
        }
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.set('paint', paintObserver);
    } catch (e) {
      console.warn('Paint observer not supported');
    }

    // Resource timing observer
    try {
      const resourceObserver = new PerformanceObserver((entries) => {
        const resources = entries.getEntries();
        if (resources.length > 0) {
          const avgDuration = resources.reduce((sum, r) => sum + r.duration, 0) / resources.length;
          this.metrics.networkLatency = avgDuration;
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', resourceObserver);
    } catch (e) {
      console.warn('Resource observer not supported');
    }
  }

  /**
   * Start FPS monitoring
   */
  private startFPSMonitoring(): void {
    if (typeof window === 'undefined') return;

    const measureFPS = (timestamp: number) => {
      if (this.lastFrameTime > 0) {
        const delta = timestamp - this.lastFrameTime;
        const fps = 1000 / delta;
        
        this.fpsHistory.push(fps);
        if (this.fpsHistory.length > 60) {
          this.fpsHistory.shift();
        }
        
        this.frameCount++;
        if (this.frameCount % 60 === 0) {
          this.metrics.fps = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
          this.checkPerformance();
        }
      }
      
      this.lastFrameTime = timestamp;
      this.rafId = requestAnimationFrame(measureFPS);
    };

    this.rafId = requestAnimationFrame(measureFPS);
  }

  /**
   * Check performance and adjust settings
   */
  private checkPerformance(): void {
    const fps = this.metrics.fps ?? 60;
    
    // If FPS drops below 30, enable low power mode
    if (fps < 30 && !this.config.lowPowerMode) {
      this.enableLowPowerMode();
    }
    
    // If FPS is consistently good, disable low power mode
    if (fps > 50 && this.config.lowPowerMode) {
      this.disableLowPowerMode();
    }
  }

  /**
   * Enable low power mode
   */
  private enableLowPowerMode(): void {
    this.config.lowPowerMode = true;
    this.config.reducedMotionFallback = true;
    this.config.enableVirtualization = true;
    this.config.throttleResize = 300;
    this.config.debounceScroll = 200;
    
    // Dispatch event for components to react
    window.dispatchEvent(new CustomEvent('performancemode', { 
      detail: { lowPower: true } 
    }));
  }

  /**
   * Disable low power mode
   */
  private disableLowPowerMode(): void {
    const deviceType = deviceDetector.getDeviceType();
    this.config = this.getDefaultConfig();
    
    // Dispatch event for components to react
    window.dispatchEvent(new CustomEvent('performancemode', { 
      detail: { lowPower: false } 
    }));
  }

  /**
   * Get current configuration
   */
  getConfig(): PerformanceConfig {
    return { ...this.config };
  }

  /**
   * Get performance metrics
   */
  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  /**
   * Check if lazy loading should be enabled
   */
  shouldLazyLoad(): boolean {
    return this.config.enableLazyLoading;
  }

  /**
   * Check if virtualization should be enabled
   */
  shouldVirtualize(): boolean {
    return this.config.enableVirtualization;
  }

  /**
   * Get throttle delay for resize events
   */
  getResizeThrottle(): number {
    return this.config.throttleResize;
  }

  /**
   * Get debounce delay for scroll events
   */
  getScrollDebounce(): number {
    return this.config.debounceScroll;
  }

  /**
   * Check if reduced motion is preferred
   */
  prefersReducedMotion(): boolean {
    return this.config.reducedMotionFallback;
  }

  /**
   * Check if in low power mode
   */
  isLowPowerMode(): boolean {
    return this.config.lowPowerMode;
  }

  /**
   * Throttle function execution
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    delay?: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let lastExecTime = 0;
    const throttleDelay = delay ?? this.config.throttleResize;

    return (...args: Parameters<T>) => {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > throttleDelay) {
        func(...args);
        lastExecTime = currentTime;
      } else {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func(...args);
          lastExecTime = Date.now();
        }, throttleDelay - (currentTime - lastExecTime));
      }
    };
  }

  /**
   * Debounce function execution
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    delay?: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const debounceDelay = delay ?? this.config.debounceScroll;

    return (...args: Parameters<T>) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), debounceDelay);
    };
  }

  /**
   * Request idle callback with fallback
   */
  requestIdleCallback(
    callback: () => void,
    options?: { timeout?: number }
  ): number {
    if ('requestIdleCallback' in window) {
      return (window as any).requestIdleCallback(callback, options);
    }
    
    // Fallback to setTimeout
    return window.setTimeout(callback, options?.timeout ?? 1);
  }

  /**
   * Cancel idle callback
   */
  cancelIdleCallback(id: number): void {
    if ('cancelIdleCallback' in window) {
      (window as any).cancelIdleCallback(id);
    } else {
      clearTimeout(id);
    }
  }

  /**
   * Optimize image loading
   */
  getOptimizedImageSrc(
    src: string,
    width: number,
    format?: 'webp' | 'avif' | 'auto'
  ): string {
    const dpr = window.devicePixelRatio || 1;
    const optimalWidth = Math.round(width * dpr);
    
    // This would integrate with an image optimization service
    // For now, return the original source
    return src;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }
    
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Export singleton instance
export const performanceOptimizer = new PerformanceOptimizer();

// Export utility functions
export const getPerformanceConfig = () => performanceOptimizer.getConfig();
export const getPerformanceMetrics = () => performanceOptimizer.getMetrics();
export const shouldLazyLoad = () => performanceOptimizer.shouldLazyLoad();
export const shouldVirtualize = () => performanceOptimizer.shouldVirtualize();
export const getResizeThrottle = () => performanceOptimizer.getResizeThrottle();
export const getScrollDebounce = () => performanceOptimizer.getScrollDebounce();
export const isLowPowerMode = () => performanceOptimizer.isLowPowerMode();
export const throttle = <T extends (...args: any[]) => any>(func: T, delay?: number) => 
  performanceOptimizer.throttle(func, delay);
export const debounce = <T extends (...args: any[]) => any>(func: T, delay?: number) => 
  performanceOptimizer.debounce(func, delay);
export const requestIdleCallback = (callback: () => void, options?: { timeout?: number }) => 
  performanceOptimizer.requestIdleCallback(callback, options);
export const cancelIdleCallback = (id: number) => 
  performanceOptimizer.cancelIdleCallback(id);
export const getOptimizedImageSrc = (src: string, width: number, format?: 'webp' | 'avif' | 'auto') => 
  performanceOptimizer.getOptimizedImageSrc(src, width, format);