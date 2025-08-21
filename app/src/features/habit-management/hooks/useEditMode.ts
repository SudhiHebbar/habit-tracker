import { useState, useCallback, useContext, createContext, useRef, useEffect } from 'react';
import { Habit } from '../types/habit.types';

interface EditSession {
  habitId: string;
  startTime: number;
  lastModified: number;
  userId?: string; // For future concurrent editing detection
}

interface EditModeState {
  isEditModeActive: boolean;
  activeEditSessions: Map<string, EditSession>;
  pendingChanges: Map<string, Partial<Habit>>;
  isDirty: boolean;
}

interface EditModeContextType {
  state: EditModeState;
  enterEditMode: (habitId: string) => void;
  exitEditMode: (habitId: string) => void;
  updatePendingChanges: (habitId: string, changes: Partial<Habit>) => void;
  clearPendingChanges: (habitId: string) => void;
  isHabitBeingEdited: (habitId: string) => boolean;
  getPendingChanges: (habitId: string) => Partial<Habit> | undefined;
  hasUnsavedChanges: () => boolean;
  getEditSession: (habitId: string) => EditSession | undefined;
}

const EditModeContext = createContext<EditModeContextType | null>(null);

export const useEditMode = () => {
  const context = useContext(EditModeContext);
  if (!context) {
    // Return a standalone implementation if not within provider
    return useStandaloneEditMode();
  }
  return context;
};

// Standalone hook implementation for use without provider
const useStandaloneEditMode = () => {
  const [state, setState] = useState<EditModeState>({
    isEditModeActive: false,
    activeEditSessions: new Map(),
    pendingChanges: new Map(),
    isDirty: false
  });

  const sessionTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Auto-cleanup edit sessions after 30 minutes of inactivity
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  const enterEditMode = useCallback((habitId: string) => {
    setState(prev => {
      const newSessions = new Map(prev.activeEditSessions);
      const now = Date.now();
      
      newSessions.set(habitId, {
        habitId,
        startTime: now,
        lastModified: now
      });

      // Clear any existing timeout
      const existingTimeout = sessionTimeoutRef.current.get(habitId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Set new timeout
      const timeout = setTimeout(() => {
        exitEditMode(habitId);
      }, SESSION_TIMEOUT);
      sessionTimeoutRef.current.set(habitId, timeout);

      return {
        ...prev,
        isEditModeActive: true,
        activeEditSessions: newSessions
      };
    });
  }, []);

  const exitEditMode = useCallback((habitId: string) => {
    setState(prev => {
      const newSessions = new Map(prev.activeEditSessions);
      const newChanges = new Map(prev.pendingChanges);
      
      newSessions.delete(habitId);
      newChanges.delete(habitId);

      // Clear timeout
      const timeout = sessionTimeoutRef.current.get(habitId);
      if (timeout) {
        clearTimeout(timeout);
        sessionTimeoutRef.current.delete(habitId);
      }

      return {
        ...prev,
        isEditModeActive: newSessions.size > 0,
        activeEditSessions: newSessions,
        pendingChanges: newChanges,
        isDirty: newChanges.size > 0
      };
    });
  }, []);

  const updatePendingChanges = useCallback((habitId: string, changes: Partial<Habit>) => {
    setState(prev => {
      const newChanges = new Map(prev.pendingChanges);
      const newSessions = new Map(prev.activeEditSessions);
      
      // Merge with existing pending changes
      const existingChanges = newChanges.get(habitId) || {};
      newChanges.set(habitId, { ...existingChanges, ...changes });

      // Update session last modified time
      const session = newSessions.get(habitId);
      if (session) {
        newSessions.set(habitId, {
          ...session,
          lastModified: Date.now()
        });

        // Reset timeout
        const existingTimeout = sessionTimeoutRef.current.get(habitId);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }
        
        const timeout = setTimeout(() => {
          exitEditMode(habitId);
        }, SESSION_TIMEOUT);
        sessionTimeoutRef.current.set(habitId, timeout);
      }

      return {
        ...prev,
        activeEditSessions: newSessions,
        pendingChanges: newChanges,
        isDirty: true
      };
    });
  }, [exitEditMode]);

  const clearPendingChanges = useCallback((habitId: string) => {
    setState(prev => {
      const newChanges = new Map(prev.pendingChanges);
      newChanges.delete(habitId);

      return {
        ...prev,
        pendingChanges: newChanges,
        isDirty: newChanges.size > 0
      };
    });
  }, []);

  const isHabitBeingEdited = useCallback((habitId: string) => {
    return state.activeEditSessions.has(habitId);
  }, [state.activeEditSessions]);

  const getPendingChanges = useCallback((habitId: string) => {
    return state.pendingChanges.get(habitId);
  }, [state.pendingChanges]);

  const hasUnsavedChanges = useCallback(() => {
    return state.isDirty;
  }, [state.isDirty]);

  const getEditSession = useCallback((habitId: string) => {
    return state.activeEditSessions.get(habitId);
  }, [state.activeEditSessions]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      sessionTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
      sessionTimeoutRef.current.clear();
    };
  }, []);

  return {
    state,
    enterEditMode,
    exitEditMode,
    updatePendingChanges,
    clearPendingChanges,
    isHabitBeingEdited,
    getPendingChanges,
    hasUnsavedChanges,
    getEditSession
  };
};

// Provider component for sharing edit mode state across components
export const EditModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const editMode = useStandaloneEditMode();

  return (
    <EditModeContext.Provider value={editMode}>
      {children}
    </EditModeContext.Provider>
  );
};

// Hook for conflict detection and resolution
export const useEditConflicts = () => {
  const { state, exitEditMode } = useEditMode();
  const [conflicts, setConflicts] = useState<Map<string, EditSession[]>>(new Map());

  const detectConflict = useCallback((habitId: string, otherSession: EditSession) => {
    const currentSession = state.activeEditSessions.get(habitId);
    
    if (currentSession && otherSession.userId && currentSession.startTime < otherSession.startTime) {
      setConflicts(prev => {
        const newConflicts = new Map(prev);
        const existingConflicts = newConflicts.get(habitId) || [];
        newConflicts.set(habitId, [...existingConflicts, otherSession]);
        return newConflicts;
      });
      return true;
    }
    
    return false;
  }, [state.activeEditSessions]);

  const resolveConflict = useCallback((habitId: string, resolution: 'keepLocal' | 'takeRemote' | 'merge') => {
    setConflicts(prev => {
      const newConflicts = new Map(prev);
      
      switch (resolution) {
        case 'keepLocal':
          // Keep current changes, ignore remote
          newConflicts.delete(habitId);
          break;
        case 'takeRemote':
          // Discard local changes, exit edit mode
          exitEditMode(habitId);
          newConflicts.delete(habitId);
          break;
        case 'merge':
          // Implement merge logic (placeholder)
          newConflicts.delete(habitId);
          break;
      }
      
      return newConflicts;
    });
  }, [exitEditMode]);

  const getConflicts = useCallback((habitId: string) => {
    return conflicts.get(habitId) || [];
  }, [conflicts]);

  const hasConflicts = useCallback((habitId?: string) => {
    if (habitId) {
      return conflicts.has(habitId);
    }
    return conflicts.size > 0;
  }, [conflicts]);

  return {
    detectConflict,
    resolveConflict,
    getConflicts,
    hasConflicts
  };
};