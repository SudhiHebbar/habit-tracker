import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useEditMode, useEditConflicts } from '../useEditMode';
import { Habit } from '../../types/habit.types';

// Mock timers
vi.useFakeTimers();

const mockHabitChanges: Partial<Habit> = {
  name: 'Updated Habit Name',
  color: '#ff0000',
  icon: '🆕'
};

describe('useEditMode', () => {
  beforeEach(() => {
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useEditMode());
      
      expect(result.current.state.isEditModeActive).toBe(false);
      expect(result.current.state.activeEditSessions.size).toBe(0);
      expect(result.current.state.pendingChanges.size).toBe(0);
      expect(result.current.state.isDirty).toBe(false);
    });
  });

  describe('entering and exiting edit mode', () => {
    it('should enter edit mode for a habit', () => {
      const { result } = renderHook(() => useEditMode());
      
      act(() => {
        result.current.enterEditMode('habit1');
      });
      
      expect(result.current.state.isEditModeActive).toBe(true);
      expect(result.current.state.activeEditSessions.has('habit1')).toBe(true);
      expect(result.current.isHabitBeingEdited('habit1')).toBe(true);
      
      const session = result.current.getEditSession('habit1');
      expect(session).toBeDefined();
      expect(session?.habitId).toBe('habit1');
      expect(typeof session?.startTime).toBe('number');
      expect(typeof session?.lastModified).toBe('number');
    });

    it('should exit edit mode for a habit', () => {
      const { result } = renderHook(() => useEditMode());
      
      act(() => {
        result.current.enterEditMode('habit1');
        result.current.exitEditMode('habit1');
      });
      
      expect(result.current.state.isEditModeActive).toBe(false);
      expect(result.current.state.activeEditSessions.has('habit1')).toBe(false);
      expect(result.current.isHabitBeingEdited('habit1')).toBe(false);
    });

    it('should handle multiple habits in edit mode', () => {
      const { result } = renderHook(() => useEditMode());
      
      act(() => {
        result.current.enterEditMode('habit1');
        result.current.enterEditMode('habit2');
      });
      
      expect(result.current.state.isEditModeActive).toBe(true);
      expect(result.current.state.activeEditSessions.size).toBe(2);
      expect(result.current.isHabitBeingEdited('habit1')).toBe(true);
      expect(result.current.isHabitBeingEdited('habit2')).toBe(true);
      
      act(() => {
        result.current.exitEditMode('habit1');
      });
      
      expect(result.current.state.isEditModeActive).toBe(true);
      expect(result.current.state.activeEditSessions.size).toBe(1);
      expect(result.current.isHabitBeingEdited('habit1')).toBe(false);
      expect(result.current.isHabitBeingEdited('habit2')).toBe(true);
    });
  });

  describe('pending changes management', () => {
    it('should update pending changes', () => {
      const { result } = renderHook(() => useEditMode());
      
      act(() => {
        result.current.enterEditMode('habit1');
        result.current.updatePendingChanges('habit1', mockHabitChanges);
      });
      
      expect(result.current.state.isDirty).toBe(true);
      expect(result.current.getPendingChanges('habit1')).toEqual(mockHabitChanges);
      expect(result.current.hasUnsavedChanges()).toBe(true);
    });

    it('should merge pending changes', () => {
      const { result } = renderHook(() => useEditMode());
      
      act(() => {
        result.current.enterEditMode('habit1');
        result.current.updatePendingChanges('habit1', { name: 'First Update' });
        result.current.updatePendingChanges('habit1', { color: '#ff0000' });
      });
      
      const changes = result.current.getPendingChanges('habit1');
      expect(changes).toEqual({
        name: 'First Update',
        color: '#ff0000'
      });
    });

    it('should clear pending changes', () => {
      const { result } = renderHook(() => useEditMode());
      
      act(() => {
        result.current.enterEditMode('habit1');
        result.current.updatePendingChanges('habit1', mockHabitChanges);
        result.current.clearPendingChanges('habit1');
      });
      
      expect(result.current.getPendingChanges('habit1')).toBeUndefined();
      expect(result.current.state.isDirty).toBe(false);
      expect(result.current.hasUnsavedChanges()).toBe(false);
    });

    it('should handle pending changes for multiple habits', () => {
      const { result } = renderHook(() => useEditMode());
      
      act(() => {
        result.current.enterEditMode('habit1');
        result.current.enterEditMode('habit2');
        result.current.updatePendingChanges('habit1', { name: 'Habit 1' });
        result.current.updatePendingChanges('habit2', { name: 'Habit 2' });
      });
      
      expect(result.current.getPendingChanges('habit1')?.name).toBe('Habit 1');
      expect(result.current.getPendingChanges('habit2')?.name).toBe('Habit 2');
      expect(result.current.hasUnsavedChanges()).toBe(true);
      
      act(() => {
        result.current.clearPendingChanges('habit1');
      });
      
      expect(result.current.getPendingChanges('habit1')).toBeUndefined();
      expect(result.current.getPendingChanges('habit2')?.name).toBe('Habit 2');
      expect(result.current.hasUnsavedChanges()).toBe(true);
    });
  });

  describe('session timeout', () => {
    it('should auto-exit edit mode after timeout', () => {
      const { result } = renderHook(() => useEditMode());
      
      act(() => {
        result.current.enterEditMode('habit1');
      });
      
      expect(result.current.isHabitBeingEdited('habit1')).toBe(true);
      
      // Fast-forward time by 30 minutes
      act(() => {
        vi.advanceTimersByTime(30 * 60 * 1000);
      });
      
      expect(result.current.isHabitBeingEdited('habit1')).toBe(false);
    });

    it('should reset timeout when changes are made', () => {
      const { result } = renderHook(() => useEditMode());
      
      act(() => {
        result.current.enterEditMode('habit1');
      });
      
      // Fast-forward time by 25 minutes
      act(() => {
        vi.advanceTimersByTime(25 * 60 * 1000);
      });
      
      expect(result.current.isHabitBeingEdited('habit1')).toBe(true);
      
      // Make a change to reset timeout
      act(() => {
        result.current.updatePendingChanges('habit1', { name: 'Updated' });
      });
      
      // Fast-forward time by another 25 minutes (50 total, but timeout was reset)
      act(() => {
        vi.advanceTimersByTime(25 * 60 * 1000);
      });
      
      expect(result.current.isHabitBeingEdited('habit1')).toBe(true);
      
      // Fast-forward time by another 10 minutes (60 total, 35 since reset)
      act(() => {
        vi.advanceTimersByTime(10 * 60 * 1000);
      });
      
      expect(result.current.isHabitBeingEdited('habit1')).toBe(false);
    });

    it('should update last modified time when making changes', () => {
      const { result } = renderHook(() => useEditMode());
      
      act(() => {
        result.current.enterEditMode('habit1');
      });
      
      const initialSession = result.current.getEditSession('habit1');
      const initialLastModified = initialSession?.lastModified;
      
      // Wait a bit and make a change
      act(() => {
        vi.advanceTimersByTime(1000);
        result.current.updatePendingChanges('habit1', { name: 'Updated' });
      });
      
      const updatedSession = result.current.getEditSession('habit1');
      const updatedLastModified = updatedSession?.lastModified;
      
      expect(updatedLastModified).toBeGreaterThan(initialLastModified!);
    });
  });

  describe('utility functions', () => {
    it('should correctly identify habits being edited', () => {
      const { result } = renderHook(() => useEditMode());
      
      expect(result.current.isHabitBeingEdited('habit1')).toBe(false);
      
      act(() => {
        result.current.enterEditMode('habit1');
      });
      
      expect(result.current.isHabitBeingEdited('habit1')).toBe(true);
      expect(result.current.isHabitBeingEdited('habit2')).toBe(false);
    });

    it('should return undefined for non-existent pending changes', () => {
      const { result } = renderHook(() => useEditMode());
      
      expect(result.current.getPendingChanges('nonexistent')).toBeUndefined();
    });

    it('should return undefined for non-existent edit session', () => {
      const { result } = renderHook(() => useEditMode());
      
      expect(result.current.getEditSession('nonexistent')).toBeUndefined();
    });
  });
});

describe('useEditConflicts', () => {
  it('should detect edit conflicts', () => {
    const { result: editModeResult } = renderHook(() => useEditMode());
    const { result: conflictsResult } = renderHook(() => useEditConflicts());
    
    // Start editing a habit
    act(() => {
      editModeResult.current.enterEditMode('habit1');
    });
    
    const currentSession = editModeResult.current.getEditSession('habit1')!;
    
    // Simulate another user's session that started later
    const otherSession = {
      habitId: 'habit1',
      startTime: currentSession.startTime + 1000,
      lastModified: Date.now(),
      userId: 'other-user'
    };
    
    let hasConflict;
    act(() => {
      hasConflict = conflictsResult.current.detectConflict('habit1', otherSession);
    });
    
    expect(hasConflict).toBe(true);
    expect(conflictsResult.current.hasConflicts('habit1')).toBe(true);
    expect(conflictsResult.current.getConflicts('habit1')).toHaveLength(1);
  });

  it('should resolve conflicts by keeping local changes', () => {
    const { result: editModeResult } = renderHook(() => useEditMode());
    const { result: conflictsResult } = renderHook(() => useEditConflicts());
    
    // Set up conflict
    act(() => {
      editModeResult.current.enterEditMode('habit1');
    });
    
    const otherSession = {
      habitId: 'habit1',
      startTime: Date.now() + 1000,
      lastModified: Date.now(),
      userId: 'other-user'
    };
    
    act(() => {
      conflictsResult.current.detectConflict('habit1', otherSession);
      conflictsResult.current.resolveConflict('habit1', 'keepLocal');
    });
    
    expect(conflictsResult.current.hasConflicts('habit1')).toBe(false);
    expect(editModeResult.current.isHabitBeingEdited('habit1')).toBe(true);
  });

  it('should resolve conflicts by taking remote changes', () => {
    const { result: editModeResult } = renderHook(() => useEditMode());
    const { result: conflictsResult } = renderHook(() => useEditConflicts());
    
    // Set up conflict
    act(() => {
      editModeResult.current.enterEditMode('habit1');
    });
    
    const otherSession = {
      habitId: 'habit1',
      startTime: Date.now() + 1000,
      lastModified: Date.now(),
      userId: 'other-user'
    };
    
    act(() => {
      conflictsResult.current.detectConflict('habit1', otherSession);
      conflictsResult.current.resolveConflict('habit1', 'takeRemote');
    });
    
    expect(conflictsResult.current.hasConflicts('habit1')).toBe(false);
    expect(editModeResult.current.isHabitBeingEdited('habit1')).toBe(false);
  });

  it('should check for conflicts across all habits', () => {
    const { result } = renderHook(() => useEditConflicts());
    
    // Simulate conflicts on multiple habits
    act(() => {
      result.current.detectConflict('habit1', {
        habitId: 'habit1',
        startTime: Date.now(),
        lastModified: Date.now(),
        userId: 'user1'
      });
      result.current.detectConflict('habit2', {
        habitId: 'habit2',
        startTime: Date.now(),
        lastModified: Date.now(),
        userId: 'user2'
      });
    });
    
    expect(result.current.hasConflicts()).toBe(true);
    expect(result.current.hasConflicts('habit1')).toBe(true);
    expect(result.current.hasConflicts('habit2')).toBe(true);
    expect(result.current.hasConflicts('habit3')).toBe(false);
  });
});