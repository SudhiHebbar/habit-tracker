import React, { useState, useEffect, useMemo } from 'react';
import { Container } from '../../../shared/components/Layout/Container';
import { DashboardHeader } from './DashboardHeader';
import { TodayHeader } from './TodayHeader';
import { ProgressOverview } from './ProgressOverview';
import { QuickStats } from './QuickStats';
import { HabitList } from './HabitList';
import { VirtualizedHabitGrid } from './VirtualizedHabitGrid';
import { ViewToggle } from './ViewToggle';
import { EmptyDashboard } from './EmptyDashboard';
import { FilterSortControls } from './FilterSortControls';
import { CreateTrackerModal } from '../../tracker-management/components/CreateTrackerModal';
import { useTrackers } from '../../tracker-management/hooks/useTrackers';
import { useHabits } from '../../habit-management/hooks/useHabits';
import { useDashboardPreferences } from '../../../shared/hooks/useLocalStorage';
import { trackerApi } from '../../tracker-management/services/trackerApi';
import type { Habit } from '../../habit-management/types/habit.types';
import type { CreateTrackerDto } from '../../tracker-management/types/tracker.types';
import styles from '../../../../styles/features/dashboard/Dashboard.module.css';

export type ViewMode = 'grid' | 'list';
export type TimeRange = 'daily' | 'weekly';

interface DashboardProps {
  initialTrackerId?: number | undefined;
}

export const Dashboard: React.FC<DashboardProps> = ({ initialTrackerId }) => {
  // Persistent preferences
  const [preferences, setPreferences] = useDashboardPreferences();

  // State management
  const [selectedTrackerId, setSelectedTrackerId] = useState<number | null>(
    initialTrackerId || null
  );
  const [viewMode, setViewMode] = useState<ViewMode>(preferences.viewMode);
  const [timeRange, setTimeRange] = useState<TimeRange>(preferences.timeRange);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'frequency' | 'completion'>('name');
  const [filterFrequency, setFilterFrequency] = useState<string>('');

  // Tracker creation modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Data fetching
  const { trackers, isLoading: trackersLoading, refetch: refetchTrackers } = useTrackers();
  const { habits, loading: habitsLoading, refetch: refetchHabits } = useHabits(selectedTrackerId);

  // Set initial tracker
  useEffect(() => {
    if (!selectedTrackerId && trackers.length > 0) {
      const activeTracker = trackers.find(t => t.isActive) || trackers[0];
      setSelectedTrackerId(activeTracker?.id || null);
    }
  }, [trackers, selectedTrackerId]);

  // Get current tracker
  const currentTracker = useMemo(() => {
    return trackers.find(t => t.id === selectedTrackerId);
  }, [trackers, selectedTrackerId]);

  // Filter and sort habits
  const filteredHabits = useMemo(() => {
    const filtered = habits.filter(habit => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !habit.name.toLowerCase().includes(query) &&
          !habit.description?.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // Frequency filter
      if (filterFrequency && habit.targetFrequency !== filterFrequency) {
        return false;
      }

      // Only show active habits on dashboard
      return habit.isActive;
    });

    // Sort habits
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'frequency':
          return a.targetFrequency.localeCompare(b.targetFrequency);
        case 'completion':
          // Sort by completion rate (would need real data)
          return (b.completionsThisWeek || 0) - (a.completionsThisWeek || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [habits, searchQuery, filterFrequency, sortBy]);

  // Calculate statistics
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const completedToday = filteredHabits.filter(h => h.lastCompletedDate === today).length;
    const totalHabits = filteredHabits.length;
    const completionRate = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;

    return {
      totalHabits,
      completedToday,
      completionRate: Math.round(completionRate),
      activeStreaks: filteredHabits.filter(h => (h.currentStreak || 0) > 0).length,
    };
  }, [filteredHabits]);

  // Handle tracker switching
  const handleTrackerChange = (trackerId: number) => {
    setSelectedTrackerId(trackerId);
    // Reset filters when switching trackers
    setSearchQuery('');
    setFilterFrequency('');
  };

  // Handle view mode changes with persistence
  const handleViewModeChange = (newViewMode: ViewMode) => {
    setViewMode(newViewMode);
    setPreferences(prev => ({ ...prev, viewMode: newViewMode }));
  };

  // Handle time range changes with persistence
  const handleTimeRangeChange = (newTimeRange: TimeRange) => {
    setTimeRange(newTimeRange);
    setPreferences(prev => ({ ...prev, timeRange: newTimeRange }));
  };

  // Handle habit completion
  const handleHabitComplete = async (_habit: Habit) => {
    // This would trigger the completion API
    await refetchHabits();
  };

  // Handle tracker creation
  const handleCreateTracker = () => {
    setIsCreateModalOpen(true);
    setCreateError(null);
  };

  const handleCreateTrackerSubmit = async (data: CreateTrackerDto) => {
    setIsCreating(true);
    setCreateError(null);

    try {
      const newTracker = await trackerApi.createTracker(data);
      await refetchTrackers();
      setSelectedTrackerId(newTracker.id);
      setIsCreateModalOpen(false);
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Failed to create tracker');
      throw error; // Re-throw to prevent modal from closing
    } finally {
      setIsCreating(false);
    }
  };

  const handleCloseCreateModal = () => {
    if (!isCreating) {
      setIsCreateModalOpen(false);
      setCreateError(null);
    }
  };

  // Check if dashboard is empty
  const isDashboardEmpty = !trackersLoading && (!currentTracker || filteredHabits.length === 0);

  // Responsive view mode - force list on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && viewMode === 'grid') {
        setViewMode('list');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  return (
    <div className={styles.dashboard}>
      {/* Dashboard Header */}
      <DashboardHeader
        trackers={trackers}
        currentTracker={currentTracker}
        onTrackerChange={handleTrackerChange}
        onCreateTracker={handleCreateTracker}
        loading={trackersLoading}
      />

      {/* Main Content */}
      <Container>
        <div className={styles.content}>
          {/* Today's Date and Quick Actions */}
          <div className={styles.topSection}>
            <TodayHeader timeRange={timeRange} onTimeRangeChange={handleTimeRangeChange} />
            <ViewToggle
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              disabled={window.innerWidth < 768}
            />
          </div>

          {/* Progress Overview and Stats */}
          {!isDashboardEmpty && (
            <div className={styles.statsSection}>
              <ProgressOverview
                completedToday={stats.completedToday}
                totalHabits={stats.totalHabits}
                completionRate={stats.completionRate}
              />
              <QuickStats
                totalHabits={stats.totalHabits}
                completedToday={stats.completedToday}
                activeStreaks={stats.activeStreaks}
                timeRange={timeRange}
              />
            </div>
          )}

          {/* Filter and Sort Controls */}
          {!isDashboardEmpty && (
            <FilterSortControls
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              filterFrequency={filterFrequency}
              onFilterChange={setFilterFrequency}
              totalCount={habits.length}
              filteredCount={filteredHabits.length}
            />
          )}

          {/* Habits Display */}
          <div className={styles.habitsSection}>
            {isDashboardEmpty ? (
              <EmptyDashboard
                hasTrackers={trackers.length > 0}
                onCreateTracker={handleCreateTracker}
                onCreateHabit={() => {
                  /* Handle create habit */
                }}
              />
            ) : viewMode === 'grid' ? (
              <VirtualizedHabitGrid
                habits={filteredHabits}
                onHabitComplete={handleHabitComplete}
                loading={habitsLoading}
                timeRange={timeRange}
                containerHeight={600}
              />
            ) : (
              <HabitList
                habits={filteredHabits}
                onHabitComplete={handleHabitComplete}
                loading={habitsLoading}
                timeRange={timeRange}
              />
            )}
          </div>
        </div>
      </Container>

      {/* Create Tracker Modal */}
      <CreateTrackerModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSubmit={handleCreateTrackerSubmit}
        isCreating={isCreating}
        error={createError}
      />
    </div>
  );
};

export default Dashboard;
