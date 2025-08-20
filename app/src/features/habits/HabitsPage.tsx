// Habits Page Component
import React, { useState } from 'react';
import FadeText from '../../shared/components/FadeText';
import { useAppNavigation } from '../../shared/utils/navigation';
import { useTrackers } from '../tracker-management/hooks/useTrackers';
import { HabitList } from '../habit-management/components/HabitList';
import { CreateHabitModal } from '../habit-management/components/CreateHabitModal';
import { EditHabitModal } from '../habit-management/components/EditHabitModal';
import { useHabits, useCreateHabit, useUpdateHabit, useDeleteHabit } from '../habit-management/hooks';
import { completionApi } from '../habit-completion/services/completionApi';
import type { Habit, CreateHabitRequest, UpdateHabitRequest } from '../habit-management/types/habit.types';
import styles from './HabitsPage.module.css';

const HabitsPage = () => {
  const { routeParams } = useAppNavigation();
  const { trackers, isLoading: trackersLoading } = useTrackers();
  const [selectedTrackerId, setSelectedTrackerId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  
  // Use the first active tracker by default
  React.useEffect(() => {
    if (!selectedTrackerId && trackers.length > 0) {
      const firstTracker = trackers.find(t => t.isActive) || trackers[0];
      setSelectedTrackerId(firstTracker?.id || null);
    }
  }, [trackers, selectedTrackerId]);

  const { habits, loading: habitsLoading, error: habitsError, refetch } = useHabits(selectedTrackerId);
  const { createHabit, loading: createLoading } = useCreateHabit();
  const { updateHabit } = useUpdateHabit();
  const { deleteHabit } = useDeleteHabit();

  const handleCreateHabit = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateHabitSubmit = async (habitData: CreateHabitRequest) => {
    if (!selectedTrackerId) return;
    
    const newHabit: CreateHabitRequest = {
      ...habitData,
      displayOrder: habits.length
    };

    const created = await createHabit(selectedTrackerId, newHabit);
    if (created) {
      refetch();
    }
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
  };

  const handleEditHabitSubmit = async (habitId: number, data: UpdateHabitRequest) => {
    const updated = await updateHabit(habitId, data);
    if (updated) {
      refetch();
    }
  };

  const handleDeleteHabit = async (habit: Habit) => {
    if (confirm(`Are you sure you want to delete "${habit.name}"?`)) {
      const success = await deleteHabit(habit.id);
      if (success) {
        refetch();
      }
    }
  };

  const handleToggleComplete = async (habit: Habit) => {
    try {
      await completionApi.toggleCompletion(habit.id);
      // The optimistic updates in the completion components will handle UI updates
    } catch (error) {
      console.error('Failed to toggle completion for habit:', habit.name, error);
    }
  };

  if (routeParams.id) {
    return (
      <div className={styles.habitsPage}>
        <div className={styles.header}>
          <FadeText 
            text={`Habit Details: ${routeParams.id}`} 
            className={styles.title}
            delay={100}
            duration={600}
          />
          <p className={styles.subtitle}>
            View and manage this specific habit
          </p>
        </div>
        
        <div className={styles.content}>
          <div className={styles.placeholder}>
            <FadeText 
              text="Individual habit details coming soon..." 
              delay={400}
              duration={600}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.habitsPage}>
      <div className={styles.header}>
        <FadeText 
          text="Your Habits" 
          className={styles.title}
          delay={100}
          duration={600}
        />
        <p className={styles.subtitle}>
          Manage your daily habits and track progress
        </p>
      </div>
      
      <div className={styles.content}>
        {trackersLoading ? (
          <div className={styles.loading}>
            <FadeText text="Loading trackers..." delay={200} duration={400} />
          </div>
        ) : trackers.length === 0 ? (
          <div className={styles.noTrackers}>
            <FadeText 
              text="No trackers found. Create a tracker first to manage habits." 
              delay={200} 
              duration={600} 
            />
            <p className={styles.helpText}>
              <a href="/dashboard">Go to Dashboard</a> to create your first tracker.
            </p>
          </div>
        ) : (
          <div className={styles.habitsSection}>
            {/* Tracker Selector */}
            {trackers.length > 1 && (
              <div className={styles.trackerSelector}>
                <label htmlFor="tracker-select" className={styles.selectorLabel}>
                  Select Tracker:
                </label>
                <select
                  id="tracker-select"
                  value={selectedTrackerId || ''}
                  onChange={(e) => setSelectedTrackerId(Number(e.target.value))}
                  className={styles.trackerSelect}
                >
                  {trackers.map(tracker => (
                    <option key={tracker.id} value={tracker.id}>
                      {tracker.name} ({tracker.habitCount || 0} habits)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Current Tracker Info */}
            {selectedTrackerId && (
              <div className={styles.currentTracker}>
                <h3>
                  {trackers.find(t => t.id === selectedTrackerId)?.name || 'Unknown Tracker'}
                </h3>
              </div>
            )}

            {/* Habits List */}
            <HabitList
              habits={habits}
              loading={habitsLoading || createLoading}
              error={habitsError}
              onCreateHabit={handleCreateHabit}
              onEditHabit={handleEditHabit}
              onDeleteHabit={handleDeleteHabit}
              onToggleComplete={handleToggleComplete}
              showStats={true}
              className={styles.habitsList}
            />
          </div>
        )}
      </div>

      {/* Create Habit Modal */}
      <CreateHabitModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateHabitSubmit}
        isLoading={createLoading}
      />

      {/* Edit Habit Modal */}
      <EditHabitModal
        isOpen={!!editingHabit}
        habit={editingHabit}
        onClose={() => setEditingHabit(null)}
        onSubmit={handleEditHabitSubmit}
        isLoading={false}
      />
    </div>
  );
};

export default HabitsPage;