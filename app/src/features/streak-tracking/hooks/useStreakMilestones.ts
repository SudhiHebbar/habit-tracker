import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { streakApi, streakQueryKeys } from '../services/streakApi';
import { MilestoneDetector } from '../services/milestoneDetector';
import type { MilestoneAchievement, MilestoneCheckResult } from '../types/streak.types';
import { useEventBus } from '@shared/hooks/useEventBus';
import { useToast } from '@shared/hooks/useToast';

export function useStreakMilestones(habitId?: number) {
  const queryClient = useQueryClient();
  const { emit } = useEventBus();
  const { showToast } = useToast();

  // Get achieved milestones for a habit
  const {
    data: milestones,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: habitId ? streakQueryKeys.milestones(habitId) : ['milestones', 'empty'],
    queryFn: () => habitId ? streakApi.getAchievedMilestones(habitId) : Promise.resolve([]),
    enabled: habitId !== undefined,
    staleTime: 10 * 60 * 1000, // 10 minutes (milestones don't change often)
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });

  // Check for new milestones
  const checkMilestones = useMutation({
    mutationFn: ({ targetHabitId, currentStreak }: { targetHabitId: number; currentStreak: number }) =>
      streakApi.checkMilestones(targetHabitId, currentStreak),
    onSuccess: (result: MilestoneCheckResult, { targetHabitId }) => {
      // Update milestones cache if there are new achievements
      if (result.hasNewMilestone && result.milestones.length > 0) {
        const existingMilestones = queryClient.getQueryData<MilestoneAchievement[]>(
          streakQueryKeys.milestones(targetHabitId)
        ) || [];
        
        const updatedMilestones = [...existingMilestones, ...result.milestones];
        queryClient.setQueryData(
          streakQueryKeys.milestones(targetHabitId),
          updatedMilestones
        );

        // Emit events for each new milestone
        result.milestones.forEach(milestone => {
          emit('milestone:achieved', milestone);
          
          // Show celebration toast
          showToast({
            type: 'success',
            message: milestone.message,
            duration: 5000,
            action: {
              label: 'Celebrate!',
              onClick: () => emit('celebration:trigger', {
                type: milestone.celebrationType,
                milestone: milestone.milestoneValue
              })
            }
          });
        });
      }
    },
    onError: (error) => {
      console.error('Failed to check milestones:', error);
    }
  });

  // Auto-check milestones when streak data changes
  const autoCheckMilestones = useCallback((targetHabitId: number, currentStreak: number, previousStreak?: number) => {
    if (previousStreak === undefined || currentStreak > previousStreak) {
      checkMilestones.mutate({ targetHabitId, currentStreak });
    }
  }, [checkMilestones]);

  // Get milestone progress information
  const getMilestoneProgress = useCallback((currentStreak: number) => {
    return MilestoneDetector.calculateMilestoneProgress(currentStreak);
  }, []);

  // Get upcoming milestones
  const getUpcomingMilestones = useCallback((currentStreak: number, limit = 3) => {
    return MilestoneDetector.getUpcomingMilestones(currentStreak, limit);
  }, []);

  // Check if a streak value is a milestone
  const isMilestone = useCallback((streak: number) => {
    return MilestoneDetector.isMilestone(streak);
  }, []);

  // Get milestone configuration
  const getMilestoneConfig = useCallback((milestone: number) => {
    return MilestoneDetector.getMilestoneConfig(milestone);
  }, []);

  // Get milestone reward information
  const getMilestoneReward = useCallback((milestone: number) => {
    return MilestoneDetector.getMilestoneReward(milestone);
  }, []);

  return {
    // Data
    milestones: milestones || [],
    isLoading,
    error,
    
    // Actions
    refetch,
    checkMilestones: checkMilestones.mutate,
    autoCheckMilestones,
    
    // Utilities
    getMilestoneProgress,
    getUpcomingMilestones,
    isMilestone,
    getMilestoneConfig,
    getMilestoneReward,
    
    // State
    isCheckingMilestones: checkMilestones.isPending,
    checkMilestonesError: checkMilestones.error,
  };
}

// Hook for recent milestones across a tracker
export function useRecentMilestones(trackerId?: number, days: number = 7) {
  return useQuery({
    queryKey: trackerId 
      ? streakQueryKeys.recentMilestones(trackerId, days) 
      : ['milestones', 'recent', 'empty'],
    queryFn: () => trackerId 
      ? streakApi.getRecentMilestones(trackerId, days) 
      : Promise.resolve([]),
    enabled: trackerId !== undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Hook for milestone celebrations
export function useMilestoneCelebration() {
  const { on, off, emit } = useEventBus();

  useEffect(() => {
    const handleMilestoneAchieved = (milestone: MilestoneAchievement) => {
      // Automatically trigger celebration for special milestones
      if (MilestoneDetector.isSpecialMilestone(milestone.milestoneValue)) {
        setTimeout(() => {
          emit('celebration:trigger', {
            type: milestone.celebrationType,
            milestone: milestone.milestoneValue,
            habitName: milestone.habitName,
            message: milestone.message,
            badgeType: milestone.badgeType
          });
        }, 500); // Small delay for better UX
      }
    };

    on('milestone:achieved', handleMilestoneAchieved);
    
    return () => {
      off('milestone:achieved', handleMilestoneAchieved);
    };
  }, [on, off, emit]);

  // Manually trigger a celebration
  const triggerCelebration = useCallback((milestone: MilestoneAchievement) => {
    emit('celebration:trigger', {
      type: milestone.celebrationType,
      milestone: milestone.milestoneValue,
      habitName: milestone.habitName,
      message: milestone.message,
      badgeType: milestone.badgeType
    });
  }, [emit]);

  // Trigger celebration by milestone value
  const triggerCelebrationByValue = useCallback((milestoneValue: number, habitName: string) => {
    const config = MilestoneDetector.getMilestoneConfig(milestoneValue);
    const reward = MilestoneDetector.getMilestoneReward(milestoneValue);
    
    emit('celebration:trigger', {
      type: config.celebrationType,
      milestone: milestoneValue,
      habitName,
      message: config.message,
      badgeType: config.badgeType,
      reward
    });
  }, [emit]);

  return {
    triggerCelebration,
    triggerCelebrationByValue,
  };
}

// Hook for milestone statistics and insights
export function useMilestoneInsights(milestones: MilestoneAchievement[]) {
  const getMilestonesByBadgeType = useCallback(() => {
    const byBadgeType: Record<string, MilestoneAchievement[]> = {};
    
    milestones.forEach(milestone => {
      if (!byBadgeType[milestone.badgeType]) {
        byBadgeType[milestone.badgeType] = [];
      }
      byBadgeType[milestone.badgeType].push(milestone);
    });
    
    return byBadgeType;
  }, [milestones]);

  const getRecentAchievements = useCallback((days: number = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return milestones.filter(milestone => 
      new Date(milestone.achievedAt) >= cutoffDate
    ).sort((a, b) => 
      new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime()
    );
  }, [milestones]);

  const getHighestMilestone = useCallback(() => {
    if (milestones.length === 0) return null;
    return milestones.reduce((highest, current) => 
      current.milestoneValue > highest.milestoneValue ? current : highest
    );
  }, [milestones]);

  const getTotalBadges = useCallback(() => {
    return milestones.length;
  }, [milestones]);

  const getSpecialMilestones = useCallback(() => {
    return milestones.filter(milestone => 
      MilestoneDetector.isSpecialMilestone(milestone.milestoneValue)
    );
  }, [milestones]);

  return {
    getMilestonesByBadgeType,
    getRecentAchievements,
    getHighestMilestone,
    getTotalBadges,
    getSpecialMilestones,
    milestoneCount: milestones.length,
    hasAnyMilestones: milestones.length > 0,
  };
}