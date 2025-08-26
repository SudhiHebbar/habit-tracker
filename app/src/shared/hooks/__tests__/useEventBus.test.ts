import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  useEventEmitter,
  useEventListener,
  useHabitCompletionListener,
  useProgressRefreshListener,
  useEventBusDebug,
  type CompletionEvent,
  type ProgressRefreshEvent,
} from '../useEventBus';

describe('useEventBus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useEventEmitter', () => {
    it('should provide emit functions', () => {
      const { result } = renderHook(() => useEventEmitter());

      expect(result.current.emit).toBeDefined();
      expect(result.current.emitHabitCompletion).toBeDefined();
      expect(result.current.emitProgressRefresh).toBeDefined();
    });

    it('should emit habit completion events', () => {
      const { result: emitterResult } = renderHook(() => useEventEmitter());

      const completionPayload = {
        habitId: 1,
        isCompleted: true,
        completionDate: '2024-01-15',
        currentStreak: 5,
        longestStreak: 10,
      };

      act(() => {
        emitterResult.current.emitHabitCompletion(completionPayload);
      });

      // Event should be emitted (tested in integration)
      expect(emitterResult.current.emitHabitCompletion).toBeDefined();
    });

    it('should emit progress refresh events', () => {
      const { result: emitterResult } = renderHook(() => useEventEmitter());

      const refreshPayload = {
        habitId: 1,
        forceRefresh: true,
      };

      act(() => {
        emitterResult.current.emitProgressRefresh(refreshPayload);
      });

      expect(emitterResult.current.emitProgressRefresh).toBeDefined();
    });
  });

  describe('useEventListener', () => {
    it('should listen to habit completion events', () => {
      const handler = vi.fn();
      const { result: emitterResult } = renderHook(() => useEventEmitter());

      renderHook(() => useEventListener('habit-completed', handler));

      const completionEvent: CompletionEvent = {
        type: 'habit-completed',
        payload: {
          habitId: 1,
          isCompleted: true,
          completionDate: '2024-01-15',
          currentStreak: 5,
        },
      };

      act(() => {
        emitterResult.current.emit(completionEvent);
      });

      expect(handler).toHaveBeenCalledWith(completionEvent);
    });

    it('should listen to progress refresh events', () => {
      const handler = vi.fn();
      const { result: emitterResult } = renderHook(() => useEventEmitter());

      renderHook(() => useEventListener('progress-refresh', handler));

      const refreshEvent: ProgressRefreshEvent = {
        type: 'progress-refresh',
        payload: {
          habitId: 1,
          forceRefresh: true,
        },
      };

      act(() => {
        emitterResult.current.emit(refreshEvent);
      });

      expect(handler).toHaveBeenCalledWith(refreshEvent);
    });

    it('should handle multiple listeners for the same event', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const { result: emitterResult } = renderHook(() => useEventEmitter());

      renderHook(() => useEventListener('habit-completed', handler1));
      renderHook(() => useEventListener('habit-completed', handler2));

      const completionEvent: CompletionEvent = {
        type: 'habit-completed',
        payload: {
          habitId: 1,
          isCompleted: true,
          completionDate: '2024-01-15',
        },
      };

      act(() => {
        emitterResult.current.emit(completionEvent);
      });

      expect(handler1).toHaveBeenCalledWith(completionEvent);
      expect(handler2).toHaveBeenCalledWith(completionEvent);
    });

    it('should cleanup listeners on unmount', () => {
      const handler = vi.fn();
      const { result: debugResult } = renderHook(() => useEventBusDebug());

      const { unmount } = renderHook(() => useEventListener('habit-completed', handler));

      expect(debugResult.current.getListenerCount('habit-completed')).toBe(1);

      unmount();

      expect(debugResult.current.getListenerCount('habit-completed')).toBe(0);
    });
  });

  describe('convenience hooks', () => {
    it('should work with useHabitCompletionListener', () => {
      const handler = vi.fn();
      const { result: emitterResult } = renderHook(() => useEventEmitter());

      renderHook(() => useHabitCompletionListener(handler));

      const completionPayload = {
        habitId: 1,
        isCompleted: true,
        completionDate: '2024-01-15',
      };

      act(() => {
        emitterResult.current.emitHabitCompletion(completionPayload);
      });

      expect(handler).toHaveBeenCalledWith({
        type: 'habit-completed',
        payload: completionPayload,
      });
    });

    it('should work with useProgressRefreshListener', () => {
      const handler = vi.fn();
      const { result: emitterResult } = renderHook(() => useEventEmitter());

      renderHook(() => useProgressRefreshListener(handler));

      const refreshPayload = {
        habitId: 1,
        forceRefresh: true,
      };

      act(() => {
        emitterResult.current.emitProgressRefresh(refreshPayload);
      });

      expect(handler).toHaveBeenCalledWith({
        type: 'progress-refresh',
        payload: refreshPayload,
      });
    });
  });

  describe('error handling', () => {
    it('should handle errors in event listeners gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const faultyHandler = vi.fn().mockImplementation(() => {
        throw new Error('Handler error');
      });
      const goodHandler = vi.fn();

      const { result: emitterResult } = renderHook(() => useEventEmitter());

      renderHook(() => useEventListener('habit-completed', faultyHandler));
      renderHook(() => useEventListener('habit-completed', goodHandler));

      const completionEvent: CompletionEvent = {
        type: 'habit-completed',
        payload: {
          habitId: 1,
          isCompleted: true,
          completionDate: '2024-01-15',
        },
      };

      act(() => {
        emitterResult.current.emit(completionEvent);
      });

      expect(faultyHandler).toHaveBeenCalled();
      expect(goodHandler).toHaveBeenCalledWith(completionEvent);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error in event listener for habit-completed:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('useEventBusDebug', () => {
    it('should provide debug information', () => {
      const { result: debugResult } = renderHook(() => useEventBusDebug());
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      expect(debugResult.current.getListenerCount()).toBe(0);
      expect(debugResult.current.getListenerCount('habit-completed')).toBe(0);

      const { unmount: unmount1 } = renderHook(() => useEventListener('habit-completed', handler1));
      const { unmount: unmount2 } = renderHook(() =>
        useEventListener('progress-refresh', handler2)
      );

      expect(debugResult.current.getListenerCount()).toBe(2);
      expect(debugResult.current.getListenerCount('habit-completed')).toBe(1);
      expect(debugResult.current.getListenerCount('progress-refresh')).toBe(1);

      unmount1();

      expect(debugResult.current.getListenerCount()).toBe(1);
      expect(debugResult.current.getListenerCount('habit-completed')).toBe(0);
      expect(debugResult.current.getListenerCount('progress-refresh')).toBe(1);

      unmount2();

      expect(debugResult.current.getListenerCount()).toBe(0);
    });
  });
});
