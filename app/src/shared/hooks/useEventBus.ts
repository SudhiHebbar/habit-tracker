import { useEffect, useRef, useCallback } from 'react';

// Event type definitions
export interface CompletionEvent {
  type: 'habit-completed';
  payload: {
    habitId: number;
    isCompleted: boolean;
    completionDate: string;
    trackerId?: number;
    currentStreak?: number;
    longestStreak?: number;
  };
}

export interface ProgressRefreshEvent {
  type: 'progress-refresh';
  payload: {
    habitId?: number; // If specified, only refresh data for this habit
    forceRefresh?: boolean;
  };
}

export type EventBusEvent = CompletionEvent | ProgressRefreshEvent;

// Global event bus singleton
class EventBus {
  private listeners: Map<string, Set<(event: EventBusEvent) => void>> = new Map();

  subscribe(eventType: string, callback: (event: EventBusEvent) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    this.listeners.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    };
  }

  emit(event: EventBusEvent): void {
    const callbacks = this.listeners.get(event.type);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error(`Error in event listener for ${event.type}:`, error);
        }
      });
    }
  }

  // Debug helper
  getListenerCount(eventType?: string): number {
    if (eventType) {
      return this.listeners.get(eventType)?.size || 0;
    }
    return Array.from(this.listeners.values()).reduce((total, set) => total + set.size, 0);
  }
}

// Global instance
const eventBus = new EventBus();

// Hook for emitting events
export function useEventEmitter() {
  const emit = useCallback((event: EventBusEvent) => {
    eventBus.emit(event);
  }, []);

  // Convenience methods
  const emitHabitCompletion = useCallback(
    (payload: CompletionEvent['payload']) => {
      emit({
        type: 'habit-completed',
        payload,
      });
    },
    [emit]
  );

  const emitProgressRefresh = useCallback(
    (payload: ProgressRefreshEvent['payload'] = {}) => {
      emit({
        type: 'progress-refresh',
        payload,
      });
    },
    [emit]
  );

  return {
    emit,
    emitHabitCompletion,
    emitProgressRefresh,
  };
}

// Hook for listening to events
export function useEventListener<T extends EventBusEvent>(
  eventType: T['type'],
  handler: (event: T) => void,
  deps: unknown[] = []
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const wrappedHandler = (event: EventBusEvent) => {
      handlerRef.current(event as T);
    };

    const unsubscribe = eventBus.subscribe(eventType, wrappedHandler);
    return unsubscribe;
  }, [eventType, ...deps]);
}

// Convenience hooks for specific event types
export function useHabitCompletionListener(
  handler: (event: CompletionEvent) => void,
  deps: unknown[] = []
) {
  useEventListener('habit-completed', handler, deps);
}

export function useProgressRefreshListener(
  handler: (event: ProgressRefreshEvent) => void,
  deps: unknown[] = []
) {
  useEventListener('progress-refresh', handler, deps);
}

// Hook for debugging
export function useEventBusDebug() {
  return {
    getListenerCount: eventBus.getListenerCount.bind(eventBus),
    eventBus, // Expose for advanced debugging
  };
}
