/**
 * Responsive Design Type Definitions
 *
 * Comprehensive type definitions for responsive design system
 * including breakpoints, devices, layouts, and responsive behavior
 */

/**
 * Breakpoint values in pixels
 */
export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;

/**
 * Breakpoint names
 */
export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Device types based on capabilities
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'hybrid';

/**
 * Operating system detection
 */
export type OperatingSystem = 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';

/**
 * Device capabilities
 */
export interface DeviceCapabilities {
  touch: boolean;
  hover: boolean;
  pointer: 'coarse' | 'fine' | 'none';
  anyHover: boolean;
  anyPointer: 'coarse' | 'fine' | 'none';
  orientation: 'portrait' | 'landscape';
  reducedMotion: boolean;
  prefersDarkMode: boolean;
  prefersHighContrast: boolean;
  standalone: boolean; // PWA installed
  networkSpeed: 'slow' | 'fast' | 'offline';
  devicePixelRatio: number;
}

/**
 * Viewport dimensions
 */
export interface ViewportSize {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  orientation: 'portrait' | 'landscape';
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
}

/**
 * Layout configuration for different breakpoints
 */
export interface ResponsiveLayout {
  columns: number;
  gutter: number;
  margin: number;
  maxWidth?: number;
  containerPadding: number;
}

/**
 * Touch target specifications
 */
export interface TouchTarget {
  minWidth: number;
  minHeight: number;
  padding: number;
  margin: number;
}

/**
 * Responsive image configuration
 */
export interface ResponsiveImage {
  src: string;
  srcSet?: string;
  sizes?: string;
  alt: string;
  loading?: 'lazy' | 'eager';
  aspectRatio?: number;
}

/**
 * Navigation layout types
 */
export type NavigationLayout = 'top' | 'bottom' | 'sidebar' | 'hamburger' | 'hybrid';

/**
 * Grid configuration
 */
export interface GridConfig {
  columns: number | 'auto-fit' | 'auto-fill';
  rows?: number | 'auto';
  gap: number | { row: number; column: number };
  minChildWidth?: number;
  maxChildWidth?: number;
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyItems?: 'start' | 'center' | 'end' | 'stretch';
}

/**
 * Flex configuration
 */
export interface FlexConfig {
  direction: 'row' | 'column';
  wrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  alignItems?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  gap?: number;
}

/**
 * Stack configuration (vertical or horizontal stacking)
 */
export interface StackConfig {
  direction: 'vertical' | 'horizontal';
  spacing: number;
  divider?: boolean;
  align?: 'start' | 'center' | 'end' | 'stretch';
  wrap?: boolean;
}

/**
 * Container configuration
 */
export interface ContainerConfig {
  maxWidth?: number | 'full';
  padding?: number | { x: number; y: number };
  center?: boolean;
}

/**
 * Responsive value type (different values for different breakpoints)
 */
export type ResponsiveValue<T> =
  | T
  | {
      mobile?: T;
      tablet?: T;
      desktop?: T;
      wide?: T;
    };

/**
 * Typography scale for responsive design
 */
export interface TypographyScale {
  fontSize: ResponsiveValue<string>;
  lineHeight: ResponsiveValue<number>;
  letterSpacing?: ResponsiveValue<string>;
  fontWeight?: ResponsiveValue<number>;
}

/**
 * Spacing scale for responsive design
 */
export interface SpacingScale {
  xs: ResponsiveValue<number>;
  sm: ResponsiveValue<number>;
  md: ResponsiveValue<number>;
  lg: ResponsiveValue<number>;
  xl: ResponsiveValue<number>;
  xxl: ResponsiveValue<number>;
}

/**
 * Gesture configuration
 */
export interface GestureConfig {
  swipeThreshold: number;
  swipeVelocity: number;
  tapDelay: number;
  longPressDelay: number;
  doubleTapDelay: number;
  pinchThreshold: number;
}

/**
 * Performance optimization settings
 */
export interface PerformanceConfig {
  enableLazyLoading: boolean;
  enableVirtualization: boolean;
  throttleResize: number;
  debounceScroll: number;
  reducedMotionFallback: boolean;
  lowPowerMode: boolean;
}

/**
 * Responsive component props
 */
export interface ResponsiveComponentProps {
  hideOn?: Breakpoint[];
  showOn?: Breakpoint[];
  className?: ResponsiveValue<string>;
  style?: ResponsiveValue<React.CSSProperties>;
}

/**
 * Layout modes
 */
export type LayoutMode = 'mobile' | 'tablet' | 'desktop';

/**
 * Screen density categories
 */
export type ScreenDensity = 'ldpi' | 'mdpi' | 'hdpi' | 'xhdpi' | 'xxhdpi' | 'xxxhdpi';

/**
 * Responsive configuration context
 */
export interface ResponsiveConfig {
  breakpoints: typeof BREAKPOINTS;
  layouts: Record<Breakpoint, ResponsiveLayout>;
  touchTargets: Record<DeviceType, TouchTarget>;
  navigationLayouts: Record<Breakpoint, NavigationLayout>;
  typographyScales: Record<string, TypographyScale>;
  spacingScales: SpacingScale;
  gestureConfig: GestureConfig;
  performanceConfig: PerformanceConfig;
}
