import { useCallback, useMemo } from 'react';
import type { AnimationConfig, AnimationTiming } from '../types/animation.types';
import { ANIMATION_DURATIONS } from '../types/animation.types';
import { useMotionPreference } from './useMotionPreference';

export const useAnimation = (config?: AnimationConfig) => {
  const { reducedMotion } = useMotionPreference();

  const animationConfig = useMemo(() => {
    if (reducedMotion || config?.disabled) {
      return {
        ...config,
        duration: 0,
        delay: 0,
      };
    }

    return config || {};
  }, [config, reducedMotion]);

  const getDuration = useCallback(
    (timing: AnimationTiming): number => {
      if (reducedMotion) return 0;
      return ANIMATION_DURATIONS[timing];
    },
    [reducedMotion]
  );

  const getTransition = useCallback(
    (
      property: string | string[] = 'all',
      timing: AnimationTiming = 'normal',
      easing: string = 'ease-in-out'
    ): string => {
      if (reducedMotion) return 'none';

      const duration = getDuration(timing);
      const properties = Array.isArray(property) ? property : [property];

      return properties.map(prop => `${prop} ${duration}ms ${easing}`).join(', ');
    },
    [getDuration, reducedMotion]
  );

  const shouldAnimate = useCallback((): boolean => {
    return !reducedMotion && !config?.disabled;
  }, [reducedMotion, config?.disabled]);

  return {
    config: animationConfig,
    getDuration,
    getTransition,
    shouldAnimate,
    reducedMotion,
  };
};
