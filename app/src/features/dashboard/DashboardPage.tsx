// Dashboard Page Component
import { useState } from 'react';
import FadeText from '../../shared/components/FadeText';
import Button from '../../shared/components/Button';
import { useAppNavigation } from '../../shared/utils/navigation';
import { TrackerList, CreateTrackerModal, EditTrackerModal } from '../tracker-management/components';
import { useTrackers, useCreateTracker, useUpdateTracker, useDeleteTracker } from '../tracker-management/hooks';
import type { Tracker, CreateTrackerDto, UpdateTrackerDto } from '../tracker-management/types/tracker.types';
import styles from './DashboardPage.module.css';

const DashboardPage = () => {
  const { goToHabits } = useAppNavigation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTracker, setSelectedTracker] = useState<Tracker | null>(null);
  
  const { trackers, isLoading, error, refetch } = useTrackers();
  const { createTracker, isCreating: createLoading } = useCreateTracker();
  const { updateTracker, isUpdating: updateLoading, error: updateError } = useUpdateTracker();
  const { deleteTracker } = useDeleteTracker();

  const handleCreateTracker = async (data: CreateTrackerDto) => {
    const created = await createTracker(data);
    if (created) {
      setShowCreateModal(false);
      refetch();
    }
  };

  const handleEditTracker = (tracker: Tracker) => {
    setSelectedTracker(tracker);
    setShowEditModal(true);
  };

  const handleUpdateTracker = async (id: number, data: UpdateTrackerDto) => {
    const updated = await updateTracker(id, data);
    if (updated) {
      setShowEditModal(false);
      setSelectedTracker(null);
      refetch();
    }
  };

  const handleDeleteTracker = async (tracker: Tracker) => {
    if (confirm(`Are you sure you want to delete "${tracker.name}"? This will also delete all associated habits.`)) {
      const success = await deleteTracker(tracker.id);
      if (success) {
        refetch();
      }
    }
  };

  return (
    <div className={styles.dashboardPage}>
      <div className={styles.header}>
        <FadeText 
          text="Dashboard" 
          className={styles.title}
          delay={100}
          duration={600}
        />
        <p className={styles.subtitle}>Manage your trackers and monitor your progress</p>
      </div>
      
      <div className={styles.content}>
        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <Button 
            variant="primary" 
            onClick={() => setShowCreateModal(true)}
            disabled={createLoading}
          >
            Create New Tracker
          </Button>
          <Button variant="secondary" onClick={goToHabits}>
            View All Habits
          </Button>
        </div>

        {/* Trackers Section */}
        <div className={styles.trackersSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Your Trackers</h2>
            {trackers.length > 0 && (
              <span className={styles.trackerCount}>
                {trackers.length} tracker{trackers.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className={styles.loading}>
              <FadeText text="Loading trackers..." delay={200} duration={400} />
            </div>
          ) : error ? (
            <div className={styles.error}>
              <p>Error loading trackers: {error}</p>
              <Button variant="secondary" onClick={refetch}>
                Try Again
              </Button>
            </div>
          ) : (
            <div className={styles.trackerList}>
              <TrackerList
                trackers={trackers}
                onEdit={handleEditTracker}
                onDelete={handleDeleteTracker}
                onSelect={() => {}} // Not needed for dashboard view
              />
            </div>
          )}
        </div>

        {/* Create Tracker Modal */}
        {showCreateModal && (
          <CreateTrackerModal
            isOpen={showCreateModal}
            onSubmit={handleCreateTracker}
            onClose={() => setShowCreateModal(false)}
            isCreating={createLoading}
          />
        )}

        {/* Edit Tracker Modal */}
        {showEditModal && selectedTracker && (
          <EditTrackerModal
            isOpen={showEditModal}
            tracker={selectedTracker}
            onSubmit={handleUpdateTracker}
            onClose={() => {
              setShowEditModal(false);
              setSelectedTracker(null);
            }}
            isUpdating={updateLoading}
            error={updateError}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;