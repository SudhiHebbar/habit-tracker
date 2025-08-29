/**
 * useResponsiveLayout Hook
 * 
 * React hook for managing responsive layouts and configurations
 */

import { useMemo } from 'react';
import { 
  ResponsiveLayout, 
  NavigationLayout,
  GridConfig,
  FlexConfig,
  StackConfig,
  ContainerConfig
} from '../types/responsive.types';
import { useBreakpoint } from './useBreakpoint';
import { useDeviceDetection } from './useDeviceDetection';

/**
 * Default layout configurations
 */
const DEFAULT_LAYOUTS: Record<string, ResponsiveLayout> = {
  mobile: {
    columns: 1,
    gutter: 16,
    margin: 16,
    containerPadding: 16,
    maxWidth: 768,
  },
  tablet: {
    columns: 2,
    gutter: 20,
    margin: 24,
    containerPadding: 24,
    maxWidth: 1024,
  },
  desktop: {
    columns: 3,
    gutter: 24,
    margin: 32,
    containerPadding: 32,
    maxWidth: 1280,
  },
  wide: {
    columns: 4,
    gutter: 32,
    margin: 40,
    containerPadding: 40,
    maxWidth: 1440,
  },
};

/**
 * Default navigation layouts
 */
const DEFAULT_NAV_LAYOUTS: Record<string, NavigationLayout> = {
  mobile: 'bottom',
  tablet: 'hamburger',
  desktop: 'sidebar',
  wide: 'sidebar',
};

/**
 * Hook options
 */
interface UseResponsiveLayoutOptions {
  customLayouts?: Partial<typeof DEFAULT_LAYOUTS>;
  customNavLayouts?: Partial<typeof DEFAULT_NAV_LAYOUTS>;
}

/**
 * Hook return type
 */
interface UseResponsiveLayoutReturn {
  layout: ResponsiveLayout;
  navigationLayout: NavigationLayout;
  getGridConfig: (override?: Partial<GridConfig>) => GridConfig;
  getFlexConfig: (override?: Partial<FlexConfig>) => FlexConfig;
  getStackConfig: (override?: Partial<StackConfig>) => StackConfig;
  getContainerConfig: (override?: Partial<ContainerConfig>) => ContainerConfig;
}

/**
 * Hook for responsive layout management
 */
export function useResponsiveLayout(
  options: UseResponsiveLayoutOptions = {}
): UseResponsiveLayoutReturn {
  const { current } = useBreakpoint();
  const { hasTouch } = useDeviceDetection();

  // Merge custom layouts with defaults
  const layouts = useMemo(() => ({
    ...DEFAULT_LAYOUTS,
    ...options.customLayouts,
  }), [options.customLayouts]);

  const navLayouts = useMemo(() => ({
    ...DEFAULT_NAV_LAYOUTS,
    ...options.customNavLayouts,
  }), [options.customNavLayouts]);

  // Get current layout configuration
  const layout = useMemo(() => layouts[current], [layouts, current]);
  const navigationLayout = useMemo(() => navLayouts[current], [navLayouts, current]);

  // Grid configuration factory
  const getGridConfig = useMemo(() => (override?: Partial<GridConfig>): GridConfig => {
    const baseConfig: GridConfig = {
      columns: layout.columns,
      gap: layout.gutter,
      alignItems: 'stretch',
      justifyItems: 'stretch',
    };

    // Add responsive adjustments
    if (current === 'mobile') {
      baseConfig.columns = 1;
      baseConfig.gap = 12;
    } else if (current === 'tablet') {
      baseConfig.columns = override?.columns ?? 2;
    }

    return { ...baseConfig, ...override };
  }, [layout, current]);

  // Flex configuration factory
  const getFlexConfig = useMemo(() => (override?: Partial<FlexConfig>): FlexConfig => {
    const baseConfig: FlexConfig = {
      direction: current === 'mobile' ? 'column' : 'row',
      wrap: 'wrap',
      justifyContent: 'start',
      alignItems: 'center',
      gap: layout.gutter,
    };

    return { ...baseConfig, ...override };
  }, [layout, current]);

  // Stack configuration factory
  const getStackConfig = useMemo(() => (override?: Partial<StackConfig>): StackConfig => {
    const baseConfig: StackConfig = {
      direction: 'vertical',
      spacing: layout.gutter,
      divider: false,
      align: 'stretch',
      wrap: false,
    };

    // Mobile adjustments
    if (current === 'mobile') {
      baseConfig.spacing = 12;
    }

    return { ...baseConfig, ...override };
  }, [layout, current]);

  // Container configuration factory
  const getContainerConfig = useMemo(() => (override?: Partial<ContainerConfig>): ContainerConfig => {
    const baseConfig: ContainerConfig = {
      maxWidth: layout.maxWidth,
      padding: layout.containerPadding,
      center: true,
    };

    return { ...baseConfig, ...override };
  }, [layout]);

  return {
    layout,
    navigationLayout,
    getGridConfig,
    getFlexConfig,
    getStackConfig,
    getContainerConfig,
  };
}

/**
 * Hook for adaptive content
 */
export function useAdaptiveContent(): {
  itemsPerRow: number;
  showSidebar: boolean;
  showMobileMenu: boolean;
  useCompactView: boolean;
  useTwoColumn: boolean;
  useThreeColumn: boolean;
} {
  const { current } = useBreakpoint();
  
  return useMemo(() => {
    switch (current) {
      case 'mobile':
        return {
          itemsPerRow: 1,
          showSidebar: false,
          showMobileMenu: true,
          useCompactView: true,
          useTwoColumn: false,
          useThreeColumn: false,
        };
      case 'tablet':
        return {
          itemsPerRow: 2,
          showSidebar: false,
          showMobileMenu: true,
          useCompactView: false,
          useTwoColumn: true,
          useThreeColumn: false,
        };
      case 'desktop':
        return {
          itemsPerRow: 3,
          showSidebar: true,
          showMobileMenu: false,
          useCompactView: false,
          useTwoColumn: false,
          useThreeColumn: true,
        };
      case 'wide':
        return {
          itemsPerRow: 4,
          showSidebar: true,
          showMobileMenu: false,
          useCompactView: false,
          useTwoColumn: false,
          useThreeColumn: false,
        };
      default:
        return {
          itemsPerRow: 3,
          showSidebar: true,
          showMobileMenu: false,
          useCompactView: false,
          useTwoColumn: false,
          useThreeColumn: true,
        };
    }
  }, [current]);
}

/**
 * Hook for responsive spacing
 */
export function useResponsiveSpacing(): {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
} {
  const { current } = useBreakpoint();
  
  return useMemo(() => {
    const baseSpacing = {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    };

    // Reduce spacing on mobile
    if (current === 'mobile') {
      return {
        xs: 2,
        sm: 4,
        md: 8,
        lg: 16,
        xl: 24,
        xxl: 32,
      };
    }

    // Slightly reduce on tablet
    if (current === 'tablet') {
      return {
        xs: 4,
        sm: 6,
        md: 12,
        lg: 20,
        xl: 28,
        xxl: 40,
      };
    }

    return baseSpacing;
  }, [current]);
}

/**
 * Hook for responsive font sizes
 */
export function useResponsiveFontSize(): {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  xxl: string;
  xxxl: string;
} {
  const { current } = useBreakpoint();
  
  return useMemo(() => {
    const baseSizes = {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      xxl: '1.5rem',
      xxxl: '2rem',
    };

    // Adjust for mobile
    if (current === 'mobile') {
      return {
        xs: '0.75rem',
        sm: '0.8125rem',
        base: '0.9375rem',
        lg: '1.0625rem',
        xl: '1.1875rem',
        xxl: '1.375rem',
        xxxl: '1.75rem',
      };
    }

    return baseSizes;
  }, [current]);
}