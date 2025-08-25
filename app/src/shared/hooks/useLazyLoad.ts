import { useState, useEffect, useCallback, useRef } from 'react';

interface UseLazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

export function useLazyLoad<T extends HTMLElement = HTMLDivElement>(
  options: UseLazyLoadOptions = {}
) {
  const { threshold = 0.1, rootMargin = '50px', enabled = true } = options;
  const [isInView, setIsInView] = useState(false);
  const [hasBeenInView, setHasBeenInView] = useState(false);
  const elementRef = useRef<T>(null);

  const resetInView = useCallback(() => {
    setIsInView(false);
    setHasBeenInView(false);
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting;
        setIsInView(inView);
        
        if (inView && !hasBeenInView) {
          setHasBeenInView(true);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, enabled, hasBeenInView]);

  return {
    elementRef,
    isInView,
    hasBeenInView,
    resetInView,
  };
}

interface UseLazyDataOptions<T> {
  fetchData: () => Promise<T>;
  dependencies?: unknown[];
  enabled?: boolean;
  threshold?: number;
  rootMargin?: string;
}

export function useLazyData<T, E extends HTMLElement = HTMLDivElement>({
  fetchData,
  dependencies = [],
  enabled = true,
  threshold = 0.1,
  rootMargin = '50px',
}: UseLazyDataOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const hasFetched = useRef(false);

  const { elementRef, hasBeenInView } = useLazyLoad<E>({
    threshold,
    rootMargin,
    enabled,
  });

  const fetchDataCallback = useCallback(async () => {
    if (!enabled || hasFetched.current) return;
    
    setLoading(true);
    setError(null);
    hasFetched.current = true;

    try {
      const result = await fetchData();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
    } finally {
      setLoading(false);
    }
  }, [fetchData, enabled, ...dependencies]);

  useEffect(() => {
    if (hasBeenInView && enabled && !hasFetched.current) {
      fetchDataCallback();
    }
  }, [hasBeenInView, enabled, fetchDataCallback]);

  const refetch = useCallback(async () => {
    hasFetched.current = false;
    await fetchDataCallback();
  }, [fetchDataCallback]);

  return {
    elementRef,
    data,
    loading,
    error,
    refetch,
    hasBeenInView,
  };
}

export default useLazyLoad;