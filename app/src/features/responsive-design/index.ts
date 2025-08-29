/**
 * Responsive Design Feature Exports
 * 
 * Main entry point for the responsive design system
 */

// Components
export { default as ResponsiveLayout } from './components/ResponsiveLayout';
export { default as MobileNavigation, HamburgerMenu } from './components/MobileNavigation';
export { default as TabletLayout } from './components/TabletLayout';
export { default as DesktopLayout, MultiColumnLayout } from './components/DesktopLayout';
export { default as FlexibleSidebar } from './components/FlexibleSidebar';
export { default as ResponsiveGrid, Container, Flex, Stack } from './components/ResponsiveGrid';
export { default as AdaptiveModal, ModalFooter, ModalActions } from './components/AdaptiveModal';
export { 
  TouchTarget, 
  SwipeGesture, 
  PullToRefresh, 
  LongPress, 
  DoubleTap, 
  RippleEffect 
} from './components/TouchOptimized';
export { default as PerformanceMonitor } from './components/PerformanceMonitor';
export { default as ResponsiveDemo } from './components/ResponsiveDemo';

// Hooks
export { 
  useBreakpoint, 
  useResponsiveVisibility, 
  useResponsiveValue,
  useMediaQuery,
  useResponsiveClassName,
  useResponsiveStyle
} from './hooks/useBreakpoint';
export { 
  useDeviceDetection,
  useTouchDetection,
  usePlatform,
  useAccessibilityPreferences,
  useNetworkStatus,
  useHaptics
} from './hooks/useDeviceDetection';
export { 
  useViewportSize,
  useElementSize,
  useScrollPosition,
  useSafeAreaInsets,
  useIntersectionObserver
} from './hooks/useViewportSize';
export { 
  useResponsiveLayout,
  useAdaptiveContent,
  useResponsiveSpacing,
  useResponsiveFontSize
} from './hooks/useResponsiveLayout';
export { 
  useTouchCapabilities,
  useSwipe,
  useTap,
  usePinch
} from './hooks/useTouchCapabilities';

// Services
export { 
  breakpointManager,
  MEDIA_QUERIES,
  getCurrentBreakpoint,
  getViewportSize,
  matchesQuery,
  isAtLeast,
  isAtMost,
  isBetween,
  subscribeToQuery,
  getResponsiveValue
} from './services/breakpointManager';
export { 
  deviceDetector,
  getDeviceCapabilities,
  getDeviceType,
  getOperatingSystem,
  getScreenDensity,
  hasTouch,
  hasHover,
  hasFinePointer,
  isMobile,
  isTablet,
  isDesktop,
  isHybrid,
  isIOS,
  isAndroid,
  prefersReducedMotion,
  prefersDarkMode,
  isStandalone,
  getOptimalImageSize,
  supportsHaptics,
  triggerHaptic,
  getDeviceInfo
} from './services/deviceDetection';
export { 
  performanceOptimizer,
  getPerformanceConfig,
  getPerformanceMetrics,
  shouldLazyLoad,
  shouldVirtualize,
  getResizeThrottle,
  getScrollDebounce,
  isLowPowerMode,
  throttle,
  debounce,
  requestIdleCallback,
  cancelIdleCallback,
  getOptimizedImageSrc
} from './services/performanceOptimizer';

// Types
export type {
  Breakpoint,
  DeviceType,
  OperatingSystem,
  DeviceCapabilities,
  ViewportSize,
  ResponsiveLayout,
  TouchTarget as TouchTargetType,
  ResponsiveImage,
  NavigationLayout,
  GridConfig,
  FlexConfig,
  StackConfig,
  ContainerConfig,
  ResponsiveValue,
  TypographyScale,
  SpacingScale,
  GestureConfig,
  PerformanceConfig,
  ResponsiveComponentProps,
  LayoutMode,
  ScreenDensity,
  ResponsiveConfig
} from './types/responsive.types';

// Constants
export { BREAKPOINTS } from './types/responsive.types';