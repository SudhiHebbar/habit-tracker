// Example integration of habit deletion components
// This shows how to integrate the DeleteHabitDialog and UndoDeleteToast

import React, { useState } from 'react';
import { DeleteHabitDialog, UndoDeleteToast } from './';
import type { Habit } from '../types/habit.types';

interface HabitDeletionExampleProps {
  habit: Habit | null;
  onRefreshHabits: () => void;
}

export const HabitDeletionExample: React.FC<HabitDeletionExampleProps> = ({
  habit,
  onRefreshHabits
}) => {
  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Undo toast state
  const [deletedHabit, setDeletedHabit] = useState<Habit | null>(null);
  const [showUndoToast, setShowUndoToast] = useState(false);

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleHabitDeleted = (habitId: number) => {
    // Close the delete dialog
    setIsDeleteDialogOpen(false);
    
    // Show the undo toast
    if (habit) {
      setDeletedHabit(habit);
      setShowUndoToast(true);
    }
    
    // Refresh the habits list
    onRefreshHabits();
  };

  const handleUndoComplete = (restoredHabit: Habit) => {
    console.log('Habit restored:', restoredHabit);
    setShowUndoToast(false);
    setDeletedHabit(null);
    
    // Refresh the habits list to show the restored habit
    onRefreshHabits();
  };

  const handleUndoTimeout = () => {
    console.log('Undo period expired for habit:', deletedHabit?.name);
    setShowUndoToast(false);
    setDeletedHabit(null);
  };

  const handleUndoToastClose = () => {
    setShowUndoToast(false);
    setDeletedHabit(null);
  };

  return (
    <>
      {/* Example delete button */}
      {habit && (
        <button 
          onClick={handleDeleteClick}
          style={{
            background: '#dc2626',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Delete {habit.name}
        </button>
      )}

      {/* Delete confirmation dialog */}
      <DeleteHabitDialog
        isOpen={isDeleteDialogOpen}
        habit={habit}
        onClose={handleDeleteDialogClose}
        onDeleted={handleHabitDeleted}
      />

      {/* Undo delete toast */}
      <UndoDeleteToast
        habit={deletedHabit}
        isVisible={showUndoToast}
        onUndoComplete={handleUndoComplete}
        onTimeout={handleUndoTimeout}
        onClose={handleUndoToastClose}
        timeoutDuration={5} // 5 seconds
      />
    </>
  );
};

export default HabitDeletionExample;

/*
Usage example:

import { HabitDeletionExample } from '@features/habit-management/components';

function MyComponent() {
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  const handleRefreshHabits = () => {
    // Reload your habits data here
    console.log('Refreshing habits...');
  };

  return (
    <div>
      <HabitDeletionExample
        habit={selectedHabit}
        onRefreshHabits={handleRefreshHabits}
      />
    </div>
  );
}
*/