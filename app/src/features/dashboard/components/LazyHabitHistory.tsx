import React from 'react';
import { useLazyData } from '../../../shared/hooks/useLazyLoad';
// import { getHabitCompletions } from '../../habit-completion/services/completionApi';
import type { HabitCompletion } from '../../habit-completion/types/completion.types';
import styles from '../../../../styles/features/dashboard/LazyHabitHistory.module.css';

interface LazyHabitHistoryProps {
  habitId: number;
  habitName: string;
  days?: number;
  className?: string;
}

interface CompletionHistoryData {
  completions: HabitCompletion[];
  streak: number;
  totalCompletions: number;
  completionRate: number;
}

export const LazyHabitHistory: React.FC<LazyHabitHistoryProps> = ({
  habitId,
  habitName,
  days = 30,
  className = '',
}) => {
  const fetchHistoryData = async (): Promise<CompletionHistoryData> => {
    // Simulate API delay for demonstration
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Mock completion data for now - would use real API in production
    const completions: HabitCompletion[] = Array.from({ length: Math.floor(Math.random() * days) }, (_, i) => ({
      id: i + 1,
      habitId,
      completedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      value: 1,
    }));

    // Calculate stats
    const totalCompletions = completions.length;
    const completionRate = (totalCompletions / days) * 100;
    
    // Calculate current streak
    let streak = 0;
    const sortedCompletions = [...completions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const today = new Date().toISOString().split('T')[0];
    let currentDate = new Date(today);
    
    for (const completion of sortedCompletions) {
      const completionDate = completion.completedAt.split('T')[0];
      const expectedDate = currentDate.toISOString().split('T')[0];
      
      if (completionDate === expectedDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      completions,
      streak,
      totalCompletions,
      completionRate: Math.round(completionRate),
    };
  };

  const {
    elementRef,
    data,
    loading,
    error,
    hasBeenInView,
  } = useLazyData<CompletionHistoryData>({
    fetchData: fetchHistoryData,
    dependencies: [habitId, days],
    threshold: 0.2,
    rootMargin: '100px',
  });

  const renderLoadingSkeleton = () => (
    <div className={styles.skeleton}>
      <div className={styles.skeletonHeader}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonStats} />
      </div>
      <div className={styles.skeletonChart}>
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className={styles.skeletonBar} />
        ))}
      </div>
    </div>
  );

  const renderError = () => (
    <div className={styles.error}>
      <p className={styles.errorMessage}>
        Failed to load completion history for {habitName}
      </p>
      <button className={styles.retryButton} onClick={() => window.location.reload()}>
        Retry
      </button>
    </div>
  );

  const renderHistory = (historyData: CompletionHistoryData) => {
    const { completions, streak, totalCompletions, completionRate } = historyData;
    
    // Create calendar grid for last 30 days
    const calendarDays = [];
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      const isCompleted = completions.some(c => c.completedAt.split('T')[0] === dateString);
      
      calendarDays.push({
        date: dateString,
        isCompleted,
        dayOfWeek: date.getDay(),
        dayOfMonth: date.getDate(),
      });
    }

    return (
      <div className={styles.history}>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>
              {streak > 0 && <span className={styles.streakIcon}>🔥</span>}
              {streak}
            </span>
            <span className={styles.statLabel}>Current Streak</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{totalCompletions}</span>
            <span className={styles.statLabel}>Total Completed</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{completionRate}%</span>
            <span className={styles.statLabel}>Success Rate</span>
          </div>
        </div>
        
        <div className={styles.calendar}>
          <h4 className={styles.calendarTitle}>Last {days} Days</h4>
          <div className={styles.calendarGrid}>
            {calendarDays.map((day) => (
              <div
                key={day.date}
                className={`${styles.calendarDay} ${
                  day.isCompleted ? styles.completed : styles.missed
                }`}
                title={`${day.date} - ${day.isCompleted ? 'Completed' : 'Not completed'}`}
              >
                <span className={styles.dayNumber}>{day.dayOfMonth}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div ref={elementRef} className={`${styles.container} ${className}`}>
      {!hasBeenInView && (
        <div className={styles.placeholder}>
          <span className={styles.placeholderText}>
            History for {habitName} will load when visible
          </span>
        </div>
      )}
      
      {hasBeenInView && (
        <>
          {loading && renderLoadingSkeleton()}
          {error && renderError()}
          {data && renderHistory(data)}
        </>
      )}
    </div>
  );
};

export default LazyHabitHistory;