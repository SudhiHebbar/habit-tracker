import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '../../../test/test-utils';
import { useCompletion } from './useCompletion';
import { completionApi } from '../services/completionApi';
import { useOptimisticCompletion } from './useOptimisticCompletion';
import type { CompletionStatus, CompletionStats, HabitCompletion } from '../types/completion.types';

// Mock the services
vi.mock('../services/completionApi');
vi.mock('./useOptimisticCompletion');

const mockCompletionApi = completionApi as any;
const mockUseOptimisticCompletion = useOptimisticCompletion as any;

describe('useCompletion', () => {
  const mockOptimisticHook = {
    toggleCompletion: vi.fn(),
    getOptimisticState: vi.fn(),
    hasOptimisticUpdate: vi.fn(),
    isLoading: false,
  };

  const mockStatus: CompletionStatus = {
    habitId: 1,
    date: '2024-01-15',
    isCompleted: false,
    currentStreak: 2,
    longestStreak: 5,
    lastCompletedDate: '2024-01-14',
  };

  const mockStats: CompletionStats = {
    habitId: 1,
    totalCompletions: 10,
    completionRate: 75.5,
    currentStreak: 2,
    longestStreak: 5,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    mockUseOptimisticCompletion.mockReturnValue(mockOptimisticHook);
    mockCompletionApi.getCompletionStatus = vi.fn();
    mockCompletionApi.getCompletionStats = vi.fn();
    mockOptimisticHook.getOptimisticState.mockReturnValue(false);
    mockOptimisticHook.hasOptimisticUpdate.mockReturnValue(false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with loading states and fetch data', async () => {
    mockCompletionApi.getCompletionStatus.mockResolvedValue(mockStatus);
    mockCompletionApi.getCompletionStats.mockResolvedValue(mockStats);

    const { result } = renderHook(() => useCompletion({ habitId: 1 }));

    expect(result.current.isLoadingStatus).toBe(true);
    expect(result.current.isLoadingStats).toBe(true);
    expect(result.current.status).toBeNull();
    expect(result.current.stats).toBeNull();

    await waitFor(() => {
      expect(result.current.isLoadingStatus).toBe(false);
      expect(result.current.isLoadingStats).toBe(false);
    });

    expect(result.current.status).toEqual(mockStatus);
    expect(result.current.stats).toEqual(mockStats);
  });

  it('should not auto-fetch when autoFetch is false', () => {
    renderHook(() => useCompletion({ habitId: 1, autoFetch: false }));

    expect(mockCompletionApi.getCompletionStatus).not.toHaveBeenCalled();
    expect(mockCompletionApi.getCompletionStats).not.toHaveBeenCalled();
  });

  it('should handle fetch errors gracefully', async () => {
    const error = new Error('API Error');
    mockCompletionApi.getCompletionStatus.mockRejectedValue(error);
    mockCompletionApi.getCompletionStats.mockRejectedValue(error);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useCompletion({ habitId: 1 }));

    await waitFor(() => {
      expect(result.current.isLoadingStatus).toBe(false);
      expect(result.current.isLoadingStats).toBe(false);
    });

    expect(result.current.error).toEqual(error);
    expect(result.current.status).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch completion status:', error);

    consoleSpy.mockRestore();
  });

  it('should toggle completion and update local state optimistically', async () => {
    mockCompletionApi.getCompletionStatus.mockResolvedValue(mockStatus);
    mockCompletionApi.getCompletionStats.mockResolvedValue(mockStats);

    const completedResult: HabitCompletion = {
      id: 1,
      habitId: 1,
      completionDate: '2024-01-15' as any,
      isCompleted: true,
      currentStreak: 3,
      longestStreak: 5,
    };

    // Mock optimistic success callback
    mockUseOptimisticCompletion.mockImplementation(({ onSuccess }) => ({
      ...mockOptimisticHook,
      toggleCompletion: vi.fn().mockImplementation(async () => {
        if (onSuccess) {
          onSuccess(completedResult);
        }
      }),
    }));

    const { result } = renderHook(() => useCompletion({ habitId: 1 }));

    // Wait for initial fetch
    await waitFor(() => {
      expect(result.current.status).toEqual(mockStatus);
    });

    // Toggle completion
    await act(async () => {
      await result.current.toggleCompletion();
    });

    // Should update status optimistically
    await waitFor(() => {
      expect(result.current.status?.isCompleted).toBe(true);
      expect(result.current.status?.currentStreak).toBe(3);
    });
  });

  it('should refresh status and stats after successful toggle', async () => {
    mockCompletionApi.getCompletionStatus.mockResolvedValue(mockStatus);
    mockCompletionApi.getCompletionStats.mockResolvedValue(mockStats);

    const completedResult: HabitCompletion = {
      id: 1,
      habitId: 1,
      completionDate: '2024-01-15' as any,
      isCompleted: true,
      currentStreak: 3,
      longestStreak: 5,
    };

    mockUseOptimisticCompletion.mockImplementation(({ onSuccess }) => ({
      ...mockOptimisticHook,
      toggleCompletion: vi.fn().mockImplementation(async () => {
        if (onSuccess) {
          onSuccess(completedResult);
        }
      }),
    }));

    const { result } = renderHook(() => useCompletion({ habitId: 1 }));

    // Wait for initial fetch
    await waitFor(() => {
      expect(result.current.status).toEqual(mockStatus);
    });

    // Clear previous calls
    mockCompletionApi.getCompletionStatus.mockClear();
    mockCompletionApi.getCompletionStats.mockClear();

    // Toggle completion
    await act(async () => {
      await result.current.toggleCompletion();
    });

    // Fast-forward the refresh timeout
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should call refresh with force flag
    await waitFor(() => {
      expect(mockCompletionApi.getCompletionStatus).toHaveBeenCalledWith(
        1,
        expect.any(String),
        true
      );
      expect(mockCompletionApi.getCompletionStats).toHaveBeenCalledWith(1, true);
    });
  });

  it('should call onToggleSuccess callback', async () => {
    const mockOnToggleSuccess = vi.fn();
    mockCompletionApi.getCompletionStatus.mockResolvedValue(mockStatus);
    mockCompletionApi.getCompletionStats.mockResolvedValue(mockStats);

    const completedResult: HabitCompletion = {
      id: 1,
      habitId: 1,
      completionDate: '2024-01-15' as any,
      isCompleted: true,
      currentStreak: 3,
      longestStreak: 5,
    };

    mockUseOptimisticCompletion.mockImplementation(({ onSuccess }) => ({
      ...mockOptimisticHook,
      toggleCompletion: vi.fn().mockImplementation(async () => {
        if (onSuccess) {
          onSuccess(completedResult);
        }
      }),
    }));

    const { result } = renderHook(() =>
      useCompletion({
        habitId: 1,
        onToggleSuccess: mockOnToggleSuccess,
      })
    );

    await waitFor(() => {
      expect(result.current.status).toEqual(mockStatus);
    });

    await act(async () => {
      await result.current.toggleCompletion();
    });

    expect(mockOnToggleSuccess).toHaveBeenCalledWith(completedResult);
  });

  it('should call onToggleError callback on error', async () => {
    const mockOnToggleError = vi.fn();
    const error = new Error('Toggle failed');

    mockCompletionApi.getCompletionStatus.mockResolvedValue(mockStatus);
    mockCompletionApi.getCompletionStats.mockResolvedValue(mockStats);

    mockOptimisticHook.toggleCompletion.mockRejectedValue(error);

    const { result } = renderHook(() =>
      useCompletion({
        habitId: 1,
        onToggleError: mockOnToggleError,
      })
    );

    await waitFor(() => {
      expect(result.current.status).toEqual(mockStatus);
    });

    await act(async () => {
      try {
        await result.current.toggleCompletion();
      } catch (e) {
        // Expected
      }
    });

    expect(result.current.error).toEqual(error);
  });

  it('should return optimistic state when available', async () => {
    mockCompletionApi.getCompletionStatus.mockResolvedValue(mockStatus);
    mockCompletionApi.getCompletionStats.mockResolvedValue(mockStats);
    mockOptimisticHook.getOptimisticState.mockReturnValue(true);
    mockOptimisticHook.hasOptimisticUpdate.mockReturnValue(true);

    const { result } = renderHook(() => useCompletion({ habitId: 1 }));

    await waitFor(() => {
      expect(result.current.status).toEqual(mockStatus);
    });

    expect(result.current.isCompleted).toBe(true);
    expect(result.current.isOptimistic).toBe(true);
  });

  it('should return actual state when no optimistic update', async () => {
    const completedStatus = { ...mockStatus, isCompleted: true };
    mockCompletionApi.getCompletionStatus.mockResolvedValue(completedStatus);
    mockCompletionApi.getCompletionStats.mockResolvedValue(mockStats);
    mockOptimisticHook.getOptimisticState.mockReturnValue(true);
    mockOptimisticHook.hasOptimisticUpdate.mockReturnValue(false);

    const { result } = renderHook(() => useCompletion({ habitId: 1 }));

    await waitFor(() => {
      expect(result.current.status).toEqual(completedStatus);
    });

    expect(result.current.isCompleted).toBe(true);
    expect(result.current.isOptimistic).toBe(false);
  });

  it('should handle custom date parameter', async () => {
    const customDate = '2024-01-10';
    mockCompletionApi.getCompletionStatus.mockResolvedValue(mockStatus);
    mockCompletionApi.getCompletionStats.mockResolvedValue(mockStats);

    renderHook(() => useCompletion({ habitId: 1, date: customDate }));

    await waitFor(() => {
      expect(mockCompletionApi.getCompletionStatus).toHaveBeenCalledWith(1, customDate, false);
    });
  });

  it('should use current date when no date provided', async () => {
    mockCompletionApi.getCompletionStatus.mockResolvedValue(mockStatus);
    mockCompletionApi.getCompletionStats.mockResolvedValue(mockStats);

    const today = new Date().toISOString().split('T')[0];

    renderHook(() => useCompletion({ habitId: 1 }));

    await waitFor(() => {
      expect(mockCompletionApi.getCompletionStatus).toHaveBeenCalledWith(1, today, false);
    });
  });

  it('should expose loading states correctly', async () => {
    mockOptimisticHook.isLoading = true;
    mockCompletionApi.getCompletionStatus.mockImplementation(() => new Promise(() => {})); // Never resolves
    mockCompletionApi.getCompletionStats.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useCompletion({ habitId: 1 }));

    expect(result.current.isLoadingStatus).toBe(true);
    expect(result.current.isLoadingStats).toBe(true);
    expect(result.current.isToggling).toBe(true);
  });

  it('should expose computed values from status and stats', async () => {
    mockCompletionApi.getCompletionStatus.mockResolvedValue(mockStatus);
    mockCompletionApi.getCompletionStats.mockResolvedValue(mockStats);

    const { result } = renderHook(() => useCompletion({ habitId: 1 }));

    await waitFor(() => {
      expect(result.current.status).toEqual(mockStatus);
      expect(result.current.stats).toEqual(mockStats);
    });

    expect(result.current.currentStreak).toBe(mockStatus.currentStreak);
    expect(result.current.longestStreak).toBe(mockStatus.longestStreak);
    expect(result.current.completionRate).toBe(mockStats.completionRate);
  });

  it('should return default values when no status/stats available', () => {
    mockCompletionApi.getCompletionStatus.mockImplementation(() => new Promise(() => {}));
    mockCompletionApi.getCompletionStats.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useCompletion({ habitId: 1 }));

    expect(result.current.currentStreak).toBe(0);
    expect(result.current.longestStreak).toBe(0);
    expect(result.current.completionRate).toBe(0);
    expect(result.current.isCompleted).toBe(false);
  });

  it('should not toggle when no habitId or status', async () => {
    const { result } = renderHook(() => useCompletion({ habitId: 0 }));

    await act(async () => {
      await result.current.toggleCompletion();
    });

    expect(mockOptimisticHook.toggleCompletion).not.toHaveBeenCalled();
  });

  it('should refetch when habitId changes', async () => {
    mockCompletionApi.getCompletionStatus.mockResolvedValue(mockStatus);
    mockCompletionApi.getCompletionStats.mockResolvedValue(mockStats);

    const { rerender } = renderHook(({ habitId }) => useCompletion({ habitId }), {
      initialProps: { habitId: 1 },
    });

    await waitFor(() => {
      expect(mockCompletionApi.getCompletionStatus).toHaveBeenCalledWith(
        1,
        expect.any(String),
        false
      );
    });

    mockCompletionApi.getCompletionStatus.mockClear();
    mockCompletionApi.getCompletionStats.mockClear();

    rerender({ habitId: 2 });

    await waitFor(() => {
      expect(mockCompletionApi.getCompletionStatus).toHaveBeenCalledWith(
        2,
        expect.any(String),
        false
      );
      expect(mockCompletionApi.getCompletionStats).toHaveBeenCalledWith(2, false);
    });
  });

  it('should update lastCompletedDate when completing habit', async () => {
    mockCompletionApi.getCompletionStatus.mockResolvedValue(mockStatus);
    mockCompletionApi.getCompletionStats.mockResolvedValue(mockStats);

    const completedResult: HabitCompletion = {
      id: 1,
      habitId: 1,
      completionDate: '2024-01-15' as any,
      isCompleted: true,
      currentStreak: 3,
      longestStreak: 5,
    };

    mockUseOptimisticCompletion.mockImplementation(({ onSuccess }) => ({
      ...mockOptimisticHook,
      toggleCompletion: vi.fn().mockImplementation(async () => {
        if (onSuccess) {
          onSuccess(completedResult);
        }
      }),
    }));

    const { result } = renderHook(() => useCompletion({ habitId: 1 }));

    await waitFor(() => {
      expect(result.current.status).toEqual(mockStatus);
    });

    await act(async () => {
      await result.current.toggleCompletion();
    });

    await waitFor(() => {
      expect(result.current.status?.lastCompletedDate).toBe('2024-01-15');
    });
  });

  it('should keep existing lastCompletedDate when uncompleting habit', async () => {
    const completedStatus = { ...mockStatus, isCompleted: true };
    mockCompletionApi.getCompletionStatus.mockResolvedValue(completedStatus);
    mockCompletionApi.getCompletionStats.mockResolvedValue(mockStats);

    const uncompletedResult: HabitCompletion = {
      id: 1,
      habitId: 1,
      completionDate: '2024-01-15' as any,
      isCompleted: false,
      currentStreak: 0,
      longestStreak: 5,
    };

    mockUseOptimisticCompletion.mockImplementation(({ onSuccess }) => ({
      ...mockOptimisticHook,
      toggleCompletion: vi.fn().mockImplementation(async () => {
        if (onSuccess) {
          onSuccess(uncompletedResult);
        }
      }),
    }));

    const { result } = renderHook(() => useCompletion({ habitId: 1 }));

    await waitFor(() => {
      expect(result.current.status).toEqual(completedStatus);
    });

    await act(async () => {
      await result.current.toggleCompletion();
    });

    await waitFor(() => {
      expect(result.current.status?.isCompleted).toBe(false);
      expect(result.current.status?.lastCompletedDate).toBe(mockStatus.lastCompletedDate); // Should keep original
    });
  });
});
