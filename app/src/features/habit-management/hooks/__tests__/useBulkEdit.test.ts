import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useBulkEdit } from '../useBulkEdit';
import { habitApi } from '../../services/habitApi';
import { Habit } from '../../types/habit.types';

// Mock the habitApi
vi.mock('../../services/habitApi', () => ({
  habitApi: {
    updateHabit: vi.fn(),
    deactivateHabit: vi.fn(),
    reactivateHabit: vi.fn()
  }
}));

const mockHabits: Habit[] = [
  {
    id: '1',
    name: 'Morning Exercise',
    description: 'Daily workout routine',
    icon: '🏃',
    color: '#3b82f6',
    targetFrequency: 'daily',
    targetCount: 1,
    isActive: true,
    displayOrder: 1,
    trackerId: 'tracker1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    streakCount: 5,
    completionRate: 80
  },
  {
    id: '2',
    name: 'Read Books',
    description: 'Reading habit',
    icon: '📚',
    color: '#10b981',
    targetFrequency: 'daily',
    targetCount: 1,
    isActive: true,
    displayOrder: 2,
    trackerId: 'tracker1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    streakCount: 3,
    completionRate: 75
  }
];

describe('useBulkEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useBulkEdit());
      
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.progress).toBe(null);
    });
  });

  describe('bulkEditHabits', () => {
    it('should successfully edit multiple habits', async () => {
      const mockUpdateHabit = vi.mocked(habitApi.updateHabit);
      mockUpdateHabit.mockResolvedValue({});
      
      const { result } = renderHook(() => useBulkEdit());
      
      const updates = { name: 'Updated Name', color: '#ff0000' };
      
      let bulkResult;
      await act(async () => {
        bulkResult = await result.current.bulkEditHabits(mockHabits, updates);
      });
      
      expect(bulkResult).toEqual({
        success: true,
        results: [
          { habitId: '1', success: true },
          { habitId: '2', success: true }
        ]
      });
      
      expect(mockUpdateHabit).toHaveBeenCalledTimes(2);
      expect(mockUpdateHabit).toHaveBeenCalledWith('1', updates);
      expect(mockUpdateHabit).toHaveBeenCalledWith('2', updates);
    });

    it('should handle partial failures', async () => {
      const mockUpdateHabit = vi.mocked(habitApi.updateHabit);
      mockUpdateHabit
        .mockResolvedValueOnce({}) // First call succeeds
        .mockRejectedValueOnce(new Error('Update failed')); // Second call fails
      
      const { result } = renderHook(() => useBulkEdit());
      
      const updates = { name: 'Updated Name' };
      
      let bulkResult;
      await act(async () => {
        bulkResult = await result.current.bulkEditHabits(mockHabits, updates);
      });
      
      expect(bulkResult).toEqual({
        success: false,
        results: [
          { habitId: '1', success: true },
          { habitId: '2', success: false, error: 'Update failed' }
        ]
      });
      
      expect(result.current.error).toBe('1 out of 2 habits failed to update');
    });

    it('should update progress during bulk edit', async () => {
      const mockUpdateHabit = vi.mocked(habitApi.updateHabit);
      mockUpdateHabit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 50)));
      
      const { result } = renderHook(() => useBulkEdit());
      
      const onProgress = vi.fn();
      const updates = { name: 'Updated Name' };
      
      const promise = act(async () => {
        return result.current.bulkEditHabits(mockHabits, updates, onProgress);
      });
      
      // Check initial progress
      expect(result.current.progress).toEqual({
        total: 2,
        completed: 0,
        failed: 0
      });
      
      await promise;
      
      // Check final progress
      expect(result.current.progress).toEqual({
        total: 2,
        completed: 2,
        failed: 0
      });
      
      expect(onProgress).toHaveBeenCalledTimes(2);
    });

    it('should set loading state correctly', async () => {
      const mockUpdateHabit = vi.mocked(habitApi.updateHabit);
      mockUpdateHabit.mockResolvedValue({});
      
      const { result } = renderHook(() => useBulkEdit());
      
      const promise = act(async () => {
        return result.current.bulkEditHabits(mockHabits, {});
      });
      
      expect(result.current.isLoading).toBe(true);
      
      await promise;
      
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('bulkDeactivateHabits', () => {
    it('should successfully deactivate multiple habits', async () => {
      const mockDeactivateHabit = vi.mocked(habitApi.deactivateHabit);
      mockDeactivateHabit.mockResolvedValue({});
      
      const { result } = renderHook(() => useBulkEdit());
      
      const habitIds = ['1', '2'];
      const reason = 'Taking a break';
      
      let bulkResult;
      await act(async () => {
        bulkResult = await result.current.bulkDeactivateHabits(habitIds, reason);
      });
      
      expect(bulkResult).toEqual({
        success: true,
        results: [
          { habitId: '1', success: true },
          { habitId: '2', success: true }
        ]
      });
      
      expect(mockDeactivateHabit).toHaveBeenCalledTimes(2);
      expect(mockDeactivateHabit).toHaveBeenCalledWith('1', { reason });
      expect(mockDeactivateHabit).toHaveBeenCalledWith('2', { reason });
    });

    it('should handle deactivation failures', async () => {
      const mockDeactivateHabit = vi.mocked(habitApi.deactivateHabit);
      mockDeactivateHabit
        .mockResolvedValueOnce({})
        .mockRejectedValueOnce(new Error('Deactivation failed'));
      
      const { result } = renderHook(() => useBulkEdit());
      
      let bulkResult;
      await act(async () => {
        bulkResult = await result.current.bulkDeactivateHabits(['1', '2']);
      });
      
      expect(bulkResult).toEqual({
        success: false,
        results: [
          { habitId: '1', success: true },
          { habitId: '2', success: false, error: 'Deactivation failed' }
        ]
      });
      
      expect(result.current.error).toBe('1 out of 2 habits failed to deactivate');
    });
  });

  describe('bulkActivateHabits', () => {
    it('should successfully activate multiple habits', async () => {
      const mockReactivateHabit = vi.mocked(habitApi.reactivateHabit);
      mockReactivateHabit.mockResolvedValue({});
      
      const { result } = renderHook(() => useBulkEdit());
      
      const habitIds = ['1', '2'];
      
      let bulkResult;
      await act(async () => {
        bulkResult = await result.current.bulkActivateHabits(habitIds);
      });
      
      expect(bulkResult).toEqual({
        success: true,
        results: [
          { habitId: '1', success: true },
          { habitId: '2', success: true }
        ]
      });
      
      expect(mockReactivateHabit).toHaveBeenCalledTimes(2);
      expect(mockReactivateHabit).toHaveBeenCalledWith('1');
      expect(mockReactivateHabit).toHaveBeenCalledWith('2');
    });
  });

  describe('utility functions', () => {
    it('should clear error', () => {
      const { result } = renderHook(() => useBulkEdit());
      
      // Set error manually for testing
      act(() => {
        result.current.bulkEditHabits([], {}).catch(() => {});
      });
      
      act(() => {
        result.current.clearError();
      });
      
      expect(result.current.error).toBe(null);
    });

    it('should reset state', () => {
      const { result } = renderHook(() => useBulkEdit());
      
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.progress).toBe(null);
    });
  });

  describe('error handling', () => {
    it('should handle unknown errors', async () => {
      const mockUpdateHabit = vi.mocked(habitApi.updateHabit);
      mockUpdateHabit.mockRejectedValue('Unknown error');
      
      const { result } = renderHook(() => useBulkEdit());
      
      let bulkResult;
      await act(async () => {
        bulkResult = await result.current.bulkEditHabits(mockHabits, {});
      });
      
      expect(bulkResult.results[0].error).toBe('Unknown error');
      expect(bulkResult.results[1].error).toBe('Unknown error');
    });

    it('should handle empty habit lists', async () => {
      const { result } = renderHook(() => useBulkEdit());
      
      let bulkResult;
      await act(async () => {
        bulkResult = await result.current.bulkEditHabits([], {});
      });
      
      expect(bulkResult).toEqual({
        success: true,
        results: []
      });
      
      expect(result.current.progress).toEqual({
        total: 0,
        completed: 0,
        failed: 0
      });
    });
  });
});