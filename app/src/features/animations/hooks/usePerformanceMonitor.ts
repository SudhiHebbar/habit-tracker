import { useCallback, useEffect, useRef, useState } from 'react';
import type { PerformanceMetrics } from '../types/animation.types';

export const usePerformanceMonitor = (enabled = true) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameDrops: 0,
    renderTime: 0,
    animationTime: 0,
  });

  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const frameDropsRef = useRef<number>(0);
  const fpsHistoryRef = useRef<number[]>([]);

  const measureFPS = useCallback(() => {
    const currentTime = performance.now();
    const delta = currentTime - lastTimeRef.current;

    if (delta > 0) {
      const currentFPS = Math.round(1000 / delta);

      fpsHistoryRef.current.push(currentFPS);
      if (fpsHistoryRef.current.length > 60) {
        fpsHistoryRef.current.shift();
      }

      const avgFPS = Math.round(
        fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length
      );

      if (currentFPS < 55) {
        frameDropsRef.current++;
      }

      setMetrics(prev => ({
        ...prev,
        fps: avgFPS,
        frameDrops: frameDropsRef.current,
      }));
    }

    lastTimeRef.current = currentTime;

    if (enabled) {
      frameRef.current = requestAnimationFrame(measureFPS);
    }
  }, [enabled]);

  const measureAnimationPerformance = useCallback(
    (animationName: string, callback: () => void) => {
      if (!enabled) {
        callback();
        return;
      }

      const startTime = performance.now();

      callback();

      const endTime = performance.now();
      const duration = endTime - startTime;

      setMetrics(prev => ({
        ...prev,
        animationTime: duration,
      }));

      if (duration > 16.67) {
        console.warn(`Animation "${animationName}" took ${duration}ms (target: 16.67ms for 60fps)`);
      }
    },
    [enabled]
  );

  const resetMetrics = useCallback(() => {
    frameDropsRef.current = 0;
    fpsHistoryRef.current = [];
    setMetrics({
      fps: 60,
      frameDrops: 0,
      renderTime: 0,
      animationTime: 0,
    });
  }, []);

  useEffect(() => {
    if (enabled) {
      frameRef.current = requestAnimationFrame(measureFPS);
    }

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [enabled, measureFPS]);

  return {
    metrics,
    measureAnimationPerformance,
    resetMetrics,
    isPerformant: metrics.fps >= 55 && metrics.frameDrops < 5,
  };
};
