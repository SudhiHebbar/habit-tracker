/**
 * Device Detection Service
 *
 * Detects device type, capabilities, and features for
 * optimal responsive behavior and performance
 */

import {
  DeviceType,
  OperatingSystem,
  DeviceCapabilities,
  ScreenDensity,
} from '../types/responsive.types';

/**
 * Device detection utilities
 */
class DeviceDetector {
  private capabilities: DeviceCapabilities | null = null;
  private deviceType: DeviceType | null = null;
  private operatingSystem: OperatingSystem | null = null;
  private screenDensity: ScreenDensity | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.detectCapabilities();
      this.detectDeviceType();
      this.detectOperatingSystem();
      this.detectScreenDensity();
    }
  }

  /**
   * Detect device capabilities
   */
  private detectCapabilities(): void {
    if (typeof window === 'undefined') return;

    const hasTouch =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0;

    const mediaQueries = {
      hover: window.matchMedia('(hover: hover)'),
      anyHover: window.matchMedia('(any-hover: hover)'),
      pointer: window.matchMedia('(pointer: fine)'),
      coarsePointer: window.matchMedia('(pointer: coarse)'),
      anyPointer: window.matchMedia('(any-pointer: fine)'),
      anyCoarsePointer: window.matchMedia('(any-pointer: coarse)'),
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      darkMode: window.matchMedia('(prefers-color-scheme: dark)'),
      highContrast: window.matchMedia('(prefers-contrast: high)'),
    };

    this.capabilities = {
      touch: hasTouch,
      hover: mediaQueries.hover.matches,
      pointer: mediaQueries.pointer.matches
        ? 'fine'
        : mediaQueries.coarsePointer.matches
          ? 'coarse'
          : 'none',
      anyHover: mediaQueries.anyHover.matches,
      anyPointer: mediaQueries.anyPointer.matches
        ? 'fine'
        : mediaQueries.anyCoarsePointer.matches
          ? 'coarse'
          : 'none',
      orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
      reducedMotion: mediaQueries.reducedMotion.matches,
      prefersDarkMode: mediaQueries.darkMode.matches,
      prefersHighContrast: mediaQueries.highContrast.matches,
      standalone:
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as any).standalone === true,
      networkSpeed: this.detectNetworkSpeed(),
      devicePixelRatio: window.devicePixelRatio || 1,
    };
  }

  /**
   * Detect network speed
   */
  private detectNetworkSpeed(): 'slow' | 'fast' | 'offline' {
    if (!navigator.onLine) return 'offline';

    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    if (connection) {
      const effectiveType = connection.effectiveType;
      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        return 'slow';
      }
    }

    return 'fast';
  }

  /**
   * Detect device type based on capabilities and screen size
   */
  private detectDeviceType(): void {
    if (!this.capabilities) return;

    const width = window.innerWidth;
    const hasTouch = this.capabilities.touch;
    const hasHover = this.capabilities.hover;
    const hasFinePointer = this.capabilities.pointer === 'fine';

    // Hybrid devices (tablets with keyboards, touchscreen laptops)
    if (hasTouch && hasHover && hasFinePointer) {
      this.deviceType = 'hybrid';
    }
    // Mobile devices
    else if (hasTouch && !hasHover && width < 768) {
      this.deviceType = 'mobile';
    }
    // Tablets
    else if (hasTouch && width >= 768 && width < 1024) {
      this.deviceType = 'tablet';
    }
    // Desktop
    else {
      this.deviceType = 'desktop';
    }
  }

  /**
   * Detect operating system
   */
  private detectOperatingSystem(): void {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform?.toLowerCase() || '';

    if (
      /iphone|ipad|ipod/.test(userAgent) ||
      (platform === 'macintel' && navigator.maxTouchPoints > 1)
    ) {
      this.operatingSystem = 'ios';
    } else if (/android/.test(userAgent)) {
      this.operatingSystem = 'android';
    } else if (/win/.test(platform)) {
      this.operatingSystem = 'windows';
    } else if (/mac/.test(platform)) {
      this.operatingSystem = 'macos';
    } else if (/linux/.test(platform)) {
      this.operatingSystem = 'linux';
    } else {
      this.operatingSystem = 'unknown';
    }
  }

  /**
   * Detect screen density
   */
  private detectScreenDensity(): void {
    const dpr = window.devicePixelRatio || 1;

    if (dpr <= 0.75) {
      this.screenDensity = 'ldpi';
    } else if (dpr <= 1) {
      this.screenDensity = 'mdpi';
    } else if (dpr <= 1.5) {
      this.screenDensity = 'hdpi';
    } else if (dpr <= 2) {
      this.screenDensity = 'xhdpi';
    } else if (dpr <= 3) {
      this.screenDensity = 'xxhdpi';
    } else {
      this.screenDensity = 'xxxhdpi';
    }
  }

  /**
   * Get device capabilities
   */
  getCapabilities(): DeviceCapabilities | null {
    return this.capabilities;
  }

  /**
   * Get device type
   */
  getDeviceType(): DeviceType | null {
    return this.deviceType;
  }

  /**
   * Get operating system
   */
  getOperatingSystem(): OperatingSystem | null {
    return this.operatingSystem;
  }

  /**
   * Get screen density
   */
  getScreenDensity(): ScreenDensity | null {
    return this.screenDensity;
  }

  /**
   * Check if device has touch capability
   */
  hasTouch(): boolean {
    return this.capabilities?.touch ?? false;
  }

  /**
   * Check if device has hover capability
   */
  hasHover(): boolean {
    return this.capabilities?.hover ?? false;
  }

  /**
   * Check if device has fine pointer (mouse)
   */
  hasFinePointer(): boolean {
    return this.capabilities?.pointer === 'fine';
  }

  /**
   * Check if device is mobile
   */
  isMobile(): boolean {
    return this.deviceType === 'mobile';
  }

  /**
   * Check if device is tablet
   */
  isTablet(): boolean {
    return this.deviceType === 'tablet';
  }

  /**
   * Check if device is desktop
   */
  isDesktop(): boolean {
    return this.deviceType === 'desktop';
  }

  /**
   * Check if device is hybrid (has both touch and mouse)
   */
  isHybrid(): boolean {
    return this.deviceType === 'hybrid';
  }

  /**
   * Check if device is iOS
   */
  isIOS(): boolean {
    return this.operatingSystem === 'ios';
  }

  /**
   * Check if device is Android
   */
  isAndroid(): boolean {
    return this.operatingSystem === 'android';
  }

  /**
   * Check if device prefers reduced motion
   */
  prefersReducedMotion(): boolean {
    return this.capabilities?.reducedMotion ?? false;
  }

  /**
   * Check if device prefers dark mode
   */
  prefersDarkMode(): boolean {
    return this.capabilities?.prefersDarkMode ?? false;
  }

  /**
   * Check if app is installed as PWA
   */
  isStandalone(): boolean {
    return this.capabilities?.standalone ?? false;
  }

  /**
   * Get optimal image size based on screen density
   */
  getOptimalImageSize(baseSize: number): number {
    const dpr = this.capabilities?.devicePixelRatio ?? 1;
    return Math.round(baseSize * dpr);
  }

  /**
   * Check if device supports haptic feedback
   */
  supportsHaptics(): boolean {
    return 'vibrate' in navigator || 'mozVibrate' in navigator;
  }

  /**
   * Trigger haptic feedback (if supported)
   */
  triggerHaptic(pattern: number | number[] = 10): void {
    if (this.supportsHaptics()) {
      navigator.vibrate?.(pattern);
    }
  }

  /**
   * Get device info summary
   */
  getDeviceInfo(): {
    type: DeviceType | null;
    os: OperatingSystem | null;
    capabilities: DeviceCapabilities | null;
    screenDensity: ScreenDensity | null;
  } {
    return {
      type: this.deviceType,
      os: this.operatingSystem,
      capabilities: this.capabilities,
      screenDensity: this.screenDensity,
    };
  }

  /**
   * Update capabilities (e.g., on orientation change)
   */
  updateCapabilities(): void {
    this.detectCapabilities();
    this.detectDeviceType();
  }
}

// Export singleton instance
export const deviceDetector = new DeviceDetector();

// Export utility functions
export const getDeviceCapabilities = () => deviceDetector.getCapabilities();
export const getDeviceType = () => deviceDetector.getDeviceType();
export const getOperatingSystem = () => deviceDetector.getOperatingSystem();
export const getScreenDensity = () => deviceDetector.getScreenDensity();
export const hasTouch = () => deviceDetector.hasTouch();
export const hasHover = () => deviceDetector.hasHover();
export const hasFinePointer = () => deviceDetector.hasFinePointer();
export const isMobile = () => deviceDetector.isMobile();
export const isTablet = () => deviceDetector.isTablet();
export const isDesktop = () => deviceDetector.isDesktop();
export const isHybrid = () => deviceDetector.isHybrid();
export const isIOS = () => deviceDetector.isIOS();
export const isAndroid = () => deviceDetector.isAndroid();
export const prefersReducedMotion = () => deviceDetector.prefersReducedMotion();
export const prefersDarkMode = () => deviceDetector.prefersDarkMode();
export const isStandalone = () => deviceDetector.isStandalone();
export const getOptimalImageSize = (baseSize: number) =>
  deviceDetector.getOptimalImageSize(baseSize);
export const supportsHaptics = () => deviceDetector.supportsHaptics();
export const triggerHaptic = (pattern?: number | number[]) => deviceDetector.triggerHaptic(pattern);
export const getDeviceInfo = () => deviceDetector.getDeviceInfo();
