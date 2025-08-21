import { useState, useCallback } from 'react';
import { Habit, UpdateHabitDto } from '../types/habit.types';
import { habitApi } from '../services/habitApi';

interface BulkEditState {
  isLoading: boolean;
  error: string | null;
  progress: {
    total: number;
    completed: number;
    failed: number;
    current?: string;
  } | null;
}

interface BulkEditResult {
  success: boolean;
  results: Array<{
    habitId: string;
    success: boolean;
    error?: string;
  }>;
}

export const useBulkEdit = () => {
  const [state, setState] = useState<BulkEditState>({
    isLoading: false,
    error: null,
    progress: null
  });

  const updateProgress = useCallback((
    completed: number, 
    total: number, 
    failed: number, 
    current?: string
  ) => {
    setState(prev => ({
      ...prev,
      progress: { completed, total, failed, current }
    }));
  }, []);

  const bulkEditHabits = useCallback(async (
    habits: Habit[],
    updates: Partial<UpdateHabitDto>,
    onProgress?: (completed: number, total: number, current: string) => void
  ): Promise<BulkEditResult> => {
    setState({
      isLoading: true,
      error: null,
      progress: { total: habits.length, completed: 0, failed: 0 }
    });

    const results: BulkEditResult['results'] = [];
    let completed = 0;
    let failed = 0;

    try {
      for (const habit of habits) {
        try {
          updateProgress(completed, habits.length, failed, habit.name);
          onProgress?.(completed, habits.length, habit.name);

          await habitApi.updateHabit(habit.id, updates);
          
          results.push({
            habitId: habit.id,
            success: true
          });
          completed++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          results.push({
            habitId: habit.id,
            success: false,
            error: errorMessage
          });
          failed++;
        }
        
        updateProgress(completed, habits.length, failed);
      }

      setState({
        isLoading: false,
        error: failed > 0 ? `${failed} out of ${habits.length} habits failed to update` : null,
        progress: { total: habits.length, completed, failed }
      });

      return {
        success: failed === 0,
        results
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState({
        isLoading: false,
        error: errorMessage,
        progress: null
      });

      return {
        success: false,
        results
      };
    }
  }, [updateProgress]);

  const bulkDeactivateHabits = useCallback(async (
    habitIds: string[],
    reason?: string,
    onProgress?: (completed: number, total: number, current: string) => void
  ): Promise<BulkEditResult> => {
    setState({
      isLoading: true,
      error: null,
      progress: { total: habitIds.length, completed: 0, failed: 0 }
    });

    const results: BulkEditResult['results'] = [];
    let completed = 0;
    let failed = 0;

    try {
      for (const habitId of habitIds) {
        try {
          updateProgress(completed, habitIds.length, failed, `Habit ${habitId}`);
          onProgress?.(completed, habitIds.length, `Habit ${habitId}`);

          await habitApi.deactivateHabit(habitId, { reason });
          
          results.push({
            habitId,
            success: true
          });
          completed++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          results.push({
            habitId,
            success: false,
            error: errorMessage
          });
          failed++;
        }
        
        updateProgress(completed, habitIds.length, failed);
      }

      setState({
        isLoading: false,
        error: failed > 0 ? `${failed} out of ${habitIds.length} habits failed to deactivate` : null,
        progress: { total: habitIds.length, completed, failed }
      });

      return {
        success: failed === 0,
        results
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState({
        isLoading: false,
        error: errorMessage,
        progress: null
      });

      return {
        success: false,
        results
      };
    }
  }, [updateProgress]);

  const bulkActivateHabits = useCallback(async (
    habitIds: string[],
    onProgress?: (completed: number, total: number, current: string) => void
  ): Promise<BulkEditResult> => {
    setState({
      isLoading: true,
      error: null,
      progress: { total: habitIds.length, completed: 0, failed: 0 }
    });

    const results: BulkEditResult['results'] = [];
    let completed = 0;
    let failed = 0;

    try {
      for (const habitId of habitIds) {
        try {
          updateProgress(completed, habitIds.length, failed, `Habit ${habitId}`);
          onProgress?.(completed, habitIds.length, `Habit ${habitId}`);

          await habitApi.reactivateHabit(habitId);
          
          results.push({
            habitId,
            success: true
          });
          completed++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          results.push({
            habitId,
            success: false,
            error: errorMessage
          });
          failed++;
        }
        
        updateProgress(completed, habitIds.length, failed);
      }

      setState({
        isLoading: false,
        error: failed > 0 ? `${failed} out of ${habitIds.length} habits failed to activate` : null,
        progress: { total: habitIds.length, completed, failed }
      });

      return {
        success: failed === 0,
        results
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState({
        isLoading: false,
        error: errorMessage,
        progress: null
      });

      return {
        success: false,
        results
      };
    }
  }, [updateProgress]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      progress: null
    });
  }, []);

  return {
    ...state,
    bulkEditHabits,
    bulkDeactivateHabits,
    bulkActivateHabits,
    clearError,
    reset
  };
};