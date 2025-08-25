import React, { useState, useEffect } from 'react';
import { useDeleteHabit } from '../hooks/useDeleteHabit';
import type { Habit } from '../types/habit.types';
import styles from './DeletedHabitsView.module.css';

interface DeletedHabitsViewProps {
  trackerId: number;
  onHabitRestored?: (habit: Habit) => void;
}

interface DeletedHabitItemProps {
  habit: Habit;
  onRestore: (habit: Habit) => void;
  onPermanentDelete: (habitId: number) => void;
  isLoading: boolean;
}

const DeletedHabitItem: React.FC<DeletedHabitItemProps> = ({
  habit,
  onRestore,
  onPermanentDelete,
  isLoading,
}) => {
  const [isRestoring, setIsRestoring] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      await onRestore(habit);
    } finally {
      setIsRestoring(false);
    }
  };

  const handlePermanentDelete = () => {
    setShowDeleteConfirm(false);
    onPermanentDelete(habit.id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate days since deletion
  const daysSinceDeletion = habit.updatedAt
    ? Math.floor((Date.now() - new Date(habit.updatedAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className={styles.deletedHabitItem}>
      <div className={styles.habitInfo}>
        <div className={styles.habitColor} style={{ backgroundColor: habit.color }} />
        <div className={styles.habitDetails}>
          <h3 className={styles.habitName}>{habit.name}</h3>
          <div className={styles.habitMeta}>
            {habit.description && <p className={styles.habitDescription}>{habit.description}</p>}
            <div className={styles.metaRow}>
              <span className={styles.frequency}>{habit.targetFrequency}</span>
              <span className={styles.separator}>•</span>
              <span className={styles.createdDate}>Created {formatDate(habit.createdAt)}</span>
              <span className={styles.separator}>•</span>
              <span className={styles.deletedInfo}>
                Deleted {daysSinceDeletion === 0 ? 'today' : `${daysSinceDeletion} days ago`}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.restoreButton}
          onClick={handleRestore}
          disabled={isLoading || isRestoring}
        >
          {isRestoring ? (
            <>
              <div className={styles.spinner} />
              Restoring...
            </>
          ) : (
            'Restore'
          )}
        </button>

        <div className={styles.dangerZone}>
          {!showDeleteConfirm ? (
            <button
              className={styles.permanentDeleteButton}
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isLoading}
            >
              Delete Forever
            </button>
          ) : (
            <div className={styles.confirmDelete}>
              <span className={styles.confirmText}>Delete forever?</span>
              <button
                className={styles.confirmButton}
                onClick={handlePermanentDelete}
                disabled={isLoading}
              >
                Yes
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isLoading}
              >
                No
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const DeletedHabitsView: React.FC<DeletedHabitsViewProps> = ({
  trackerId,
  onHabitRestored,
}) => {
  const [deletedHabits, setDeletedHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    getDeletedHabits,
    restoreHabitWithConfirmation,
    loading: deleteLoading,
  } = useDeleteHabit();

  // Load deleted habits on component mount and when trackerId changes
  useEffect(() => {
    loadDeletedHabits();
  }, [trackerId]);

  const loadDeletedHabits = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const habits = await getDeletedHabits(trackerId);
      if (habits) {
        // Sort by deletion date (most recent first)
        const sortedHabits = habits.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        setDeletedHabits(sortedHabits);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deleted habits');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (habit: Habit) => {
    try {
      const response = await restoreHabitWithConfirmation(habit.id, {
        confirmed: true,
        restoreToActiveState: true,
        restoreReason: 'Restored from deleted habits view',
      });

      if (response) {
        // Remove from deleted habits list
        setDeletedHabits(prev => prev.filter(h => h.id !== habit.id));

        // Notify parent component
        if (onHabitRestored) {
          onHabitRestored(habit);
        }
      }
    } catch (err) {
      console.error('Failed to restore habit:', err);
      setError('Failed to restore habit. Please try again.');
    }
  };

  const handlePermanentDelete = async (habitId: number) => {
    // For now, just remove from the list
    // In a full implementation, this would call a permanent delete API
    setDeletedHabits(prev => prev.filter(h => h.id !== habitId));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredHabits = deletedHabits.filter(
    habit =>
      habit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (habit.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading deleted habits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h2 className={styles.title}>Deleted Habits</h2>
          <p className={styles.subtitle}>
            Manage your deleted habits. You can restore them or delete them permanently.
          </p>
        </div>

        <button
          className={styles.refreshButton}
          onClick={loadDeletedHabits}
          disabled={isLoading || deleteLoading}
        >
          <span className={styles.refreshIcon}>↻</span>
          Refresh
        </button>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <span className={styles.errorIcon}>⚠️</span>
          {error}
        </div>
      )}

      {deletedHabits.length > 0 && (
        <div className={styles.searchSection}>
          <input
            type='text'
            placeholder='Search deleted habits...'
            value={searchQuery}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
        </div>
      )}

      {deletedHabits.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🗑️</div>
          <h3>No deleted habits</h3>
          <p>When you delete habits, they'll appear here so you can restore them if needed.</p>
        </div>
      ) : filteredHabits.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🔍</div>
          <h3>No matching habits</h3>
          <p>Try adjusting your search query.</p>
        </div>
      ) : (
        <div className={styles.habitsList}>
          {filteredHabits.map(habit => (
            <DeletedHabitItem
              key={habit.id}
              habit={habit}
              onRestore={handleRestore}
              onPermanentDelete={handlePermanentDelete}
              isLoading={deleteLoading}
            />
          ))}
        </div>
      )}

      {deletedHabits.length > 0 && (
        <div className={styles.footer}>
          <div className={styles.footerInfo}>
            <span className={styles.infoIcon}>ℹ️</span>
            <span>
              Deleted habits preserve all your completion history. Permanently deleted habits cannot
              be recovered.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeletedHabitsView;
