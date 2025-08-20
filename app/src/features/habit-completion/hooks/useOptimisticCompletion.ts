import { useState, useCallback, useRef } from 'react';
import type { 
  HabitCompletion, 
  OptimisticUpdate, 
  ToggleCompletionRequest 
} from '../types/completion.types';
import { completionApi } from '../services/completionApi';
import { offlineQueue } from '../services/offlineQueue';

interface UseOptimisticCompletionOptions {
  onSuccess?: (completion: HabitCompletion) => void;
  onError?: ((error: Error) => void) | undefined;
  useOfflineQueue?: boolean;
}

export function useOptimisticCompletion(options: UseOptimisticCompletionOptions = {}) {
  const { onSuccess, onError, useOfflineQueue = true } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, OptimisticUpdate>>(new Map());
  const rollbackTimeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const clearRollbackTimeout = useCallback((key: string) => {
    const timeout = rollbackTimeouts.current.get(key);
    if (timeout) {
      clearTimeout(timeout);
      rollbackTimeouts.current.delete(key);
    }
  }, []);

  const toggleCompletion = useCallback(async (
    habitId: number,
    currentState: boolean,
    request?: ToggleCompletionRequest
  ) => {
    const date = request?.date || new Date().toISOString().split('T')[0];
    const key = `${habitId}_${date}`;
    
    // Clear any existing rollback timeout for this completion
    clearRollbackTimeout(key);

    // Create optimistic update
    const optimisticUpdate: OptimisticUpdate = {
      habitId,
      date,
      previousState: currentState,
      newState: !currentState,
      timestamp: Date.now()
    };

    // Apply optimistic update
    setOptimisticUpdates(prev => {
      const updated = new Map(prev);
      updated.set(key, optimisticUpdate);
      return updated;
    });

    setIsLoading(true);

    try {
      // Check if we're offline
      if (!navigator.onLine && useOfflineQueue) {
        // Queue for later
        offlineQueue.enqueue({
          type: 'toggle',
          habitId,
          data: request
        });
        
        // Keep optimistic update
        setIsLoading(false);
        return;
      }

      // Make API call
      const result = await completionApi.toggleCompletionOptimistic(
        habitId,
        request,
        undefined,
        () => {
          // Rollback on error
          setOptimisticUpdates(prev => {
            const updated = new Map(prev);
            updated.delete(key);
            return updated;
          });
        }
      );

      // Success - remove optimistic update after a short delay
      const timeout = setTimeout(() => {
        setOptimisticUpdates(prev => {
          const updated = new Map(prev);
          updated.delete(key);
          return updated;
        });
      }, 500);
      
      rollbackTimeouts.current.set(key, timeout);

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (error) {
      // Rollback optimistic update
      setOptimisticUpdates(prev => {
        const updated = new Map(prev);
        updated.delete(key);
        return updated;
      });

      if (onError) {
        onError(error as Error);
      }

      // If offline, queue for later
      if (!navigator.onLine && useOfflineQueue) {
        offlineQueue.enqueue({
          type: 'toggle',
          habitId,
          data: request
        });
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError, useOfflineQueue, clearRollbackTimeout]);

  const getOptimisticState = useCallback((habitId: number, date: string, currentState: boolean) => {
    const key = `${habitId}_${date}`;
    const optimisticUpdate = optimisticUpdates.get(key);
    
    if (optimisticUpdate) {
      return optimisticUpdate.newState;
    }
    
    return currentState;
  }, [optimisticUpdates]);

  const hasOptimisticUpdate = useCallback((habitId: number, date: string) => {
    const key = `${habitId}_${date}`;
    return optimisticUpdates.has(key);
  }, [optimisticUpdates]);

  const clearOptimisticUpdates = useCallback(() => {
    // Clear all timeouts
    rollbackTimeouts.current.forEach(timeout => clearTimeout(timeout));
    rollbackTimeouts.current.clear();
    
    // Clear all optimistic updates
    setOptimisticUpdates(new Map());
  }, []);

  return {
    toggleCompletion,
    getOptimisticState,
    hasOptimisticUpdate,
    clearOptimisticUpdates,
    isLoading,
    optimisticUpdates: Array.from(optimisticUpdates.values())
  };
}