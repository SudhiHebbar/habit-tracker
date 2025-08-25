import { useEffect, useRef, useCallback } from 'react';

interface PreloadOptions {
  enabled?: boolean;
  delay?: number;
  onIdle?: boolean;
  onIntersection?: boolean;
  rootMargin?: string;
}

export function usePreloadData<T>(
  loadFunction: () => Promise<T>,
  dependencies: any[] = [],
  options: PreloadOptions = {}
): {
  preload: () => Promise<T | undefined>;
  isPreloading: boolean;
  preloadedData: T | null;
} {
  const {
    enabled = true,
    delay = 0,
    onIdle = true,
    onIntersection = false,
    rootMargin = '50px',
  } = options;

  const isPreloading = useRef(false);
  const preloadedData = useRef<T | null>(null);
  const abortController = useRef<AbortController | null>(null);

  const preload = useCallback(async (): Promise<T | undefined> => {
    if (!enabled || isPreloading.current || preloadedData.current) {
      return preloadedData.current || undefined;
    }

    isPreloading.current = true;
    abortController.current = new AbortController();

    try {
      const data = await loadFunction();
      if (!abortController.current.signal.aborted) {
        preloadedData.current = data;
        return data;
      }
    } catch (error) {
      if (!abortController.current.signal.aborted) {
        console.error('Preload failed:', error);
      }
    } finally {
      isPreloading.current = false;
    }

    return undefined;
  }, [enabled, loadFunction]);

  // Preload on idle
  useEffect(() => {
    if (!enabled || !onIdle) return;

    let timeoutId: number | null = null;
    let idleCallbackId: number | null = null;

    const schedulePreload = () => {
      if (delay > 0) {
        timeoutId = window.setTimeout(() => {
          if ('requestIdleCallback' in window) {
            idleCallbackId = requestIdleCallback(() => preload());
          } else {
            preload();
          }
        }, delay);
      } else if ('requestIdleCallback' in window) {
        idleCallbackId = requestIdleCallback(() => preload());
      } else {
        preload();
      }
    };

    schedulePreload();

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      if (idleCallbackId && 'cancelIdleCallback' in window) {
        cancelIdleCallback(idleCallbackId);
      }
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [...dependencies, enabled, onIdle, delay, preload]);

  // Preload on intersection
  useEffect(() => {
    if (!enabled || !onIntersection || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const target = document.createElement('div');
    target.style.position = 'absolute';
    target.style.top = '0';
    target.style.left = '0';
    target.style.width = '1px';
    target.style.height = '1px';
    target.style.pointerEvents = 'none';
    document.body.appendChild(target);

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          preload();
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
      if (document.body.contains(target)) {
        document.body.removeChild(target);
      }
    };
  }, [...dependencies, enabled, onIntersection, rootMargin, preload]);

  return {
    preload,
    isPreloading: isPreloading.current,
    preloadedData: preloadedData.current,
  };
}
