import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '../../../test/test-utils';
import { useOptimisticCompletion } from './useOptimisticCompletion';
import { completionApi } from '../services/completionApi';
import { offlineQueue } from '../services/offlineQueue';
import type { HabitCompletion } from '../types/completion.types';

// Mock the services
vi.mock('../services/completionApi');
vi.mock('../services/offlineQueue');

const mockCompletionApi = completionApi as any;
const mockOfflineQueue = offlineQueue as any;

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

describe('useOptimisticCompletion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    navigator.onLine = true;

    // Setup default mocks
    mockCompletionApi.toggleCompletionOptimistic = vi.fn();
    mockOfflineQueue.enqueue = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useOptimisticCompletion());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.optimisticUpdates).toEqual([]);
  });

  it('should create optimistic update immediately on toggle', async () => {
    const { result } = renderHook(() => useOptimisticCompletion());

    const mockResult: HabitCompletion = {
      id: 1,
      habitId: 1,
      completionDate: new Date().toISOString().split('T')[0] as any,
      isCompleted: true,
      currentStreak: 3,
      longestStreak: 5,
    };

    mockCompletionApi.toggleCompletionOptimistic.mockResolvedValue(mockResult);

    act(() => {
      result.current.toggleCompletion(1, false);
    });

    // Should immediately show optimistic state
    expect(
      result.current.getOptimisticState(1, new Date().toISOString().split('T')[0], false)
    ).toBe(true);
    expect(result.current.hasOptimisticUpdate(1, new Date().toISOString().split('T')[0])).toBe(
      true
    );
    expect(result.current.isLoading).toBe(true);
  });

  it('should call API and clean up optimistic update on success', async () => {
    const mockOnSuccess = vi.fn();
    const { result } = renderHook(() => useOptimisticCompletion({ onSuccess: mockOnSuccess }));

    const mockResult: HabitCompletion = {
      id: 1,
      habitId: 1,
      completionDate: new Date().toISOString().split('T')[0] as any,
      isCompleted: true,
      currentStreak: 3,
      longestStreak: 5,
    };

    mockCompletionApi.toggleCompletionOptimistic.mockResolvedValue(mockResult);

    await act(async () => {
      await result.current.toggleCompletion(1, false);
    });

    expect(mockCompletionApi.toggleCompletionOptimistic).toHaveBeenCalledWith(
      1,
      undefined,
      undefined,
      expect.any(Function)
    );
    expect(mockOnSuccess).toHaveBeenCalledWith(mockResult);
    expect(result.current.isLoading).toBe(false);

    // Should clean up optimistic update after timeout
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.hasOptimisticUpdate(1, new Date().toISOString().split('T')[0])).toBe(
      false
    );
  });

  it('should rollback optimistic update on API error', async () => {
    const mockOnError = vi.fn();
    const { result } = renderHook(() => useOptimisticCompletion({ onError: mockOnError }));

    const error = new Error('API Error');
    mockCompletionApi.toggleCompletionOptimistic.mockRejectedValue(error);

    await act(async () => {
      try {
        await result.current.toggleCompletion(1, false);
      } catch (e) {
        // Expected
      }
    });

    // Should rollback optimistic update
    expect(
      result.current.getOptimisticState(1, new Date().toISOString().split('T')[0], false)
    ).toBe(false);
    expect(result.current.hasOptimisticUpdate(1, new Date().toISOString().split('T')[0])).toBe(
      false
    );
    expect(mockOnError).toHaveBeenCalledWith(error);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle offline state by queuing operations', async () => {
    const { result } = renderHook(() => useOptimisticCompletion());

    // Set offline
    navigator.onLine = false;

    await act(async () => {
      result.current.toggleCompletion(1, false, { date: '2024-01-15' });
    });

    // Should queue for offline processing
    expect(mockOfflineQueue.enqueue).toHaveBeenCalledWith({
      type: 'toggle',
      habitId: 1,
      data: { date: '2024-01-15' },
    });

    // Should not call API
    expect(mockCompletionApi.toggleCompletionOptimistic).not.toHaveBeenCalled();

    // Should keep optimistic update
    expect(result.current.getOptimisticState(1, '2024-01-15', false)).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('should queue for offline on API error when offline', async () => {
    const { result } = renderHook(() => useOptimisticCompletion());

    const error = new Error('Network Error');
    mockCompletionApi.toggleCompletionOptimistic.mockRejectedValue(error);

    // Start online, then go offline during error handling
    navigator.onLine = true;

    let togglePromise: Promise<any>;
    act(() => {
      togglePromise = result.current.toggleCompletion(1, false, { date: '2024-01-15' });
    });

    // Simulate going offline during the API call
    navigator.onLine = false;

    await act(async () => {
      try {
        await togglePromise;
      } catch (e) {
        // Expected
      }
    });

    // Should queue for offline processing
    expect(mockOfflineQueue.enqueue).toHaveBeenCalledWith({
      type: 'toggle',
      habitId: 1,
      data: { date: '2024-01-15' },
    });
  });

  it('should handle multiple optimistic updates for different habits/dates', async () => {
    const { result } = renderHook(() => useOptimisticCompletion());

    const mockResult1: HabitCompletion = {
      id: 1,
      habitId: 1,
      completionDate: '2024-01-15' as any,
      isCompleted: true,
      currentStreak: 1,
      longestStreak: 1,
    };

    const mockResult2: HabitCompletion = {
      id: 2,
      habitId: 2,
      completionDate: '2024-01-15' as any,
      isCompleted: true,
      currentStreak: 2,
      longestStreak: 3,
    };

    mockCompletionApi.toggleCompletionOptimistic
      .mockResolvedValueOnce(mockResult1)
      .mockResolvedValueOnce(mockResult2);

    act(() => {
      result.current.toggleCompletion(1, false, { date: '2024-01-15' });
      result.current.toggleCompletion(2, false, { date: '2024-01-15' });
    });

    // Both should have optimistic updates
    expect(result.current.hasOptimisticUpdate(1, '2024-01-15')).toBe(true);
    expect(result.current.hasOptimisticUpdate(2, '2024-01-15')).toBe(true);
    expect(result.current.optimisticUpdates).toHaveLength(2);

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // Should handle both successfully
    expect(mockCompletionApi.toggleCompletionOptimistic).toHaveBeenCalledTimes(2);
  });

  it('should handle same habit on different dates', async () => {
    const { result } = renderHook(() => useOptimisticCompletion());

    act(() => {
      result.current.toggleCompletion(1, false, { date: '2024-01-15' });
      result.current.toggleCompletion(1, true, { date: '2024-01-16' });
    });

    // Should track both separately
    expect(result.current.getOptimisticState(1, '2024-01-15', false)).toBe(true);
    expect(result.current.getOptimisticState(1, '2024-01-16', true)).toBe(false);
    expect(result.current.optimisticUpdates).toHaveLength(2);
  });

  it('should clear existing rollback timeout when toggling same key', async () => {
    const { result } = renderHook(() => useOptimisticCompletion());

    const mockResult: HabitCompletion = {
      id: 1,
      habitId: 1,
      completionDate: '2024-01-15' as any,
      isCompleted: true,
      currentStreak: 1,
      longestStreak: 1,
    };

    mockCompletionApi.toggleCompletionOptimistic.mockResolvedValue(mockResult);

    // First toggle
    await act(async () => {
      await result.current.toggleCompletion(1, false, { date: '2024-01-15' });
    });

    // Second toggle before cleanup
    await act(async () => {
      await result.current.toggleCompletion(1, true, { date: '2024-01-15' });
    });

    expect(result.current.hasOptimisticUpdate(1, '2024-01-15')).toBe(true);
    expect(mockCompletionApi.toggleCompletionOptimistic).toHaveBeenCalledTimes(2);
  });

  it('should clear all optimistic updates and timeouts', async () => {
    const { result } = renderHook(() => useOptimisticCompletion());

    mockCompletionApi.toggleCompletionOptimistic.mockResolvedValue({} as HabitCompletion);

    // Create multiple optimistic updates
    act(() => {
      result.current.toggleCompletion(1, false, { date: '2024-01-15' });
      result.current.toggleCompletion(2, false, { date: '2024-01-15' });
    });

    expect(result.current.optimisticUpdates).toHaveLength(2);

    act(() => {
      result.current.clearOptimisticUpdates();
    });

    expect(result.current.optimisticUpdates).toHaveLength(0);
    expect(result.current.hasOptimisticUpdate(1, '2024-01-15')).toBe(false);
    expect(result.current.hasOptimisticUpdate(2, '2024-01-15')).toBe(false);
  });

  it('should use provided date in request', async () => {
    const { result } = renderHook(() => useOptimisticCompletion());

    const mockResult: HabitCompletion = {
      id: 1,
      habitId: 1,
      completionDate: '2024-01-10' as any,
      isCompleted: true,
      currentStreak: 1,
      longestStreak: 1,
    };

    mockCompletionApi.toggleCompletionOptimistic.mockResolvedValue(mockResult);

    const customRequest = { date: '2024-01-10', notes: 'Custom note' };

    await act(async () => {
      await result.current.toggleCompletion(1, false, customRequest);
    });

    expect(mockCompletionApi.toggleCompletionOptimistic).toHaveBeenCalledWith(
      1,
      customRequest,
      undefined,
      expect.any(Function)
    );
  });

  it('should use current date when no request provided', async () => {
    const { result } = renderHook(() => useOptimisticCompletion());

    const mockResult: HabitCompletion = {
      id: 1,
      habitId: 1,
      completionDate: new Date().toISOString().split('T')[0] as any,
      isCompleted: true,
      currentStreak: 1,
      longestStreak: 1,
    };

    mockCompletionApi.toggleCompletionOptimistic.mockResolvedValue(mockResult);

    await act(async () => {
      await result.current.toggleCompletion(1, false);
    });

    const today = new Date().toISOString().split('T')[0];
    expect(result.current.hasOptimisticUpdate(1, today)).toBe(false); // Should be cleaned up after success
  });

  it('should not use offline queue when disabled', async () => {
    const { result } = renderHook(() => useOptimisticCompletion({ useOfflineQueue: false }));

    navigator.onLine = false;

    const error = new Error('Network Error');
    mockCompletionApi.toggleCompletionOptimistic.mockRejectedValue(error);

    await act(async () => {
      try {
        await result.current.toggleCompletion(1, false);
      } catch (e) {
        // Expected
      }
    });

    // Should not queue
    expect(mockOfflineQueue.enqueue).not.toHaveBeenCalled();

    // Should still rollback
    expect(result.current.hasOptimisticUpdate(1, new Date().toISOString().split('T')[0])).toBe(
      false
    );
  });

  it('should handle API rollback callback correctly', async () => {
    const { result } = renderHook(() => useOptimisticCompletion());

    let rollbackCallback: (() => void) | undefined;

    mockCompletionApi.toggleCompletionOptimistic.mockImplementation(
      (habitId, request, signal, onRollback) => {
        rollbackCallback = onRollback;
        return Promise.resolve({} as HabitCompletion);
      }
    );

    await act(async () => {
      await result.current.toggleCompletion(1, false);
    });

    // Should have optimistic update initially
    expect(result.current.hasOptimisticUpdate(1, new Date().toISOString().split('T')[0])).toBe(
      true
    );

    // Call rollback from API
    act(() => {
      rollbackCallback?.();
    });

    // Should rollback optimistic update
    expect(result.current.hasOptimisticUpdate(1, new Date().toISOString().split('T')[0])).toBe(
      false
    );
  });

  it('should return correct optimistic state for different combinations', () => {
    const { result } = renderHook(() => useOptimisticCompletion());

    const date = '2024-01-15';

    // No optimistic update - should return current state
    expect(result.current.getOptimisticState(1, date, true)).toBe(true);
    expect(result.current.getOptimisticState(1, date, false)).toBe(false);

    // With optimistic update
    act(() => {
      result.current.toggleCompletion(1, false, { date });
    });

    expect(result.current.getOptimisticState(1, date, false)).toBe(true);
    expect(result.current.getOptimisticState(1, date, true)).toBe(true); // Still shows optimistic true
  });
});
