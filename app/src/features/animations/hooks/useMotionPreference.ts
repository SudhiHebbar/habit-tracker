import { useEffect, useState } from 'react';
import type { MotionPreferences } from '../types/animation.types';

export const useMotionPreference = (): MotionPreferences => {
  const [preferences, setPreferences] = useState<MotionPreferences>(() => ({
    reducedMotion: false,
    prefersContrast: false,
    prefersTransparency: false,
  }));

  useEffect(() => {
    const checkPreferences = () => {
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const contrastQuery = window.matchMedia('(prefers-contrast: high)');
      const transparencyQuery = window.matchMedia('(prefers-reduced-transparency: reduce)');

      setPreferences({
        reducedMotion: reducedMotionQuery.matches,
        prefersContrast: contrastQuery.matches,
        prefersTransparency: transparencyQuery.matches,
      });
    };

    checkPreferences();

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    const transparencyQuery = window.matchMedia('(prefers-reduced-transparency: reduce)');

    const handleChange = () => checkPreferences();

    if (reducedMotionQuery.addEventListener) {
      reducedMotionQuery.addEventListener('change', handleChange);
      contrastQuery.addEventListener('change', handleChange);
      transparencyQuery.addEventListener('change', handleChange);

      return () => {
        reducedMotionQuery.removeEventListener('change', handleChange);
        contrastQuery.removeEventListener('change', handleChange);
        transparencyQuery.removeEventListener('change', handleChange);
      };
    } else {
      reducedMotionQuery.addListener(handleChange);
      contrastQuery.addListener(handleChange);
      transparencyQuery.addListener(handleChange);

      return () => {
        reducedMotionQuery.removeListener(handleChange);
        contrastQuery.removeListener(handleChange);
        transparencyQuery.removeListener(handleChange);
      };
    }
  }, []);

  return preferences;
};