/**
 * useDeviceDetection Hook
 *
 * React hook for device detection and capability management
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DeviceType,
  OperatingSystem,
  DeviceCapabilities,
  ScreenDensity,
} from '../types/responsive.types';
import {
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
  getDeviceInfo,
} from '../services/deviceDetection';

/**
 * Hook return type
 */
interface UseDeviceDetectionReturn {
  deviceType: DeviceType | null;
  operatingSystem: OperatingSystem | null;
  capabilities: DeviceCapabilities | null;
  screenDensity: ScreenDensity | null;
  hasTouch: boolean;
  hasHover: boolean;
  hasFinePointer: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isHybrid: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  prefersReducedMotion: boolean;
  prefersDarkMode: boolean;
  isStandalone: boolean;
  supportsHaptics: boolean;
  getOptimalImageSize: (baseSize: number) => number;
  triggerHaptic: (pattern?: number | number[]) => void;
}

/**
 * Hook for device detection
 */
export function useDeviceDetection(): UseDeviceDetectionReturn {
  const [deviceInfo, setDeviceInfo] = useState(getDeviceInfo());

  useEffect(() => {
    const handleOrientationChange = () => {
      deviceDetector.updateCapabilities();
      setDeviceInfo(getDeviceInfo());
    };

    const handleOnlineStatusChange = () => {
      deviceDetector.updateCapabilities();
      setDeviceInfo(getDeviceInfo());
    };

    // Listen for orientation changes
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    // Listen for online/offline status
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    // Listen for color scheme changes
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleColorSchemeChange = () => {
      deviceDetector.updateCapabilities();
      setDeviceInfo(getDeviceInfo());
    };
    darkModeQuery.addEventListener('change', handleColorSchemeChange);

    // Listen for reduced motion preference changes
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionPrefChange = () => {
      deviceDetector.updateCapabilities();
      setDeviceInfo(getDeviceInfo());
    };
    reducedMotionQuery.addEventListener('change', handleMotionPrefChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
      darkModeQuery.removeEventListener('change', handleColorSchemeChange);
      reducedMotionQuery.removeEventListener('change', handleMotionPrefChange);
    };
  }, []);

  // Memoized values
  const memoizedValues = useMemo(
    () => ({
      hasTouch: hasTouch(),
      hasHover: hasHover(),
      hasFinePointer: hasFinePointer(),
      isMobile: isMobile(),
      isTablet: isTablet(),
      isDesktop: isDesktop(),
      isHybrid: isHybrid(),
      isIOS: isIOS(),
      isAndroid: isAndroid(),
      prefersReducedMotion: prefersReducedMotion(),
      prefersDarkMode: prefersDarkMode(),
      isStandalone: isStandalone(),
      supportsHaptics: supportsHaptics(),
    }),
    [deviceInfo]
  );

  // Callbacks
  const getOptimalImageSizeCallback = useCallback((baseSize: number) => {
    return getOptimalImageSize(baseSize);
  }, []);

  const triggerHapticCallback = useCallback((pattern?: number | number[]) => {
    triggerHaptic(pattern);
  }, []);

  return {
    deviceType: deviceInfo.type,
    operatingSystem: deviceInfo.os,
    capabilities: deviceInfo.capabilities,
    screenDensity: deviceInfo.screenDensity,
    ...memoizedValues,
    getOptimalImageSize: getOptimalImageSizeCallback,
    triggerHaptic: triggerHapticCallback,
  };
}

/**
 * Hook for touch detection
 */
export function useTouchDetection(): {
  hasTouch: boolean;
  isTouchDevice: boolean;
  isHybridDevice: boolean;
} {
  const { hasTouch: touch, isHybrid } = useDeviceDetection();

  return useMemo(
    () => ({
      hasTouch: touch,
      isTouchDevice: touch && !isHybrid,
      isHybridDevice: isHybrid,
    }),
    [touch, isHybrid]
  );
}

/**
 * Hook for platform-specific logic
 */
export function usePlatform(): {
  isIOS: boolean;
  isAndroid: boolean;
  isMobileWeb: boolean;
  isDesktopWeb: boolean;
  isInstalled: boolean;
} {
  const { isIOS: ios, isAndroid: android, isMobile: mobile, isStandalone } = useDeviceDetection();

  return useMemo(
    () => ({
      isIOS: ios,
      isAndroid: android,
      isMobileWeb: mobile && !isStandalone,
      isDesktopWeb: !mobile,
      isInstalled: isStandalone,
    }),
    [ios, android, mobile, isStandalone]
  );
}

/**
 * Hook for accessibility preferences
 */
export function useAccessibilityPreferences(): {
  prefersReducedMotion: boolean;
  prefersDarkMode: boolean;
  prefersHighContrast: boolean;
} {
  const {
    prefersReducedMotion: reducedMotion,
    prefersDarkMode: darkMode,
    capabilities,
  } = useDeviceDetection();

  return useMemo(
    () => ({
      prefersReducedMotion: reducedMotion,
      prefersDarkMode: darkMode,
      prefersHighContrast: capabilities?.prefersHighContrast ?? false,
    }),
    [reducedMotion, darkMode, capabilities]
  );
}

/**
 * Hook for network status
 */
export function useNetworkStatus(): {
  isOnline: boolean;
  isOffline: boolean;
  isSlow: boolean;
  isFast: boolean;
} {
  const { capabilities } = useDeviceDetection();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return useMemo(
    () => ({
      isOnline,
      isOffline: !isOnline,
      isSlow: capabilities?.networkSpeed === 'slow',
      isFast: capabilities?.networkSpeed === 'fast',
    }),
    [isOnline, capabilities]
  );
}

/**
 * Hook for haptic feedback
 */
export function useHaptics(): {
  supported: boolean;
  trigger: (pattern?: number | number[]) => void;
  success: () => void;
  warning: () => void;
  error: () => void;
  light: () => void;
  medium: () => void;
  heavy: () => void;
} {
  const { supportsHaptics: supported, triggerHaptic: trigger } = useDeviceDetection();

  const hapticPatterns = useMemo(
    () => ({
      success: () => trigger([10, 30, 10]),
      warning: () => trigger([20, 10, 20]),
      error: () => trigger([30, 10, 30, 10, 30]),
      light: () => trigger(10),
      medium: () => trigger(20),
      heavy: () => trigger(30),
    }),
    [trigger]
  );

  return {
    supported,
    trigger,
    ...hapticPatterns,
  };
}
