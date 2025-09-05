import { api } from '@shared/services/api';
import type {
  StreakResponse,
  StreakAnalytics,
  StreakTrend,
  StreakLeaderboardEntry,
  MilestoneAchievement,
  MilestoneCheckResult,
  StreakStatistics,
} from '../types/streak.types';

export const streakApi = {
  // Get streak details for a specific habit
  async getStreakByHabitId(habitId: number): Promise<StreakResponse> {
    const response = await api.get<StreakResponse>(`/streaks/habit/${habitId}`);
    return response.data;
  },

  // Get all streaks for a tracker
  async getStreaksByTracker(trackerId: number): Promise<StreakResponse[]> {
    const response = await api.get<StreakResponse[]>(`/streaks/tracker/${trackerId}`);
    return response.data;
  },

  // Get streaks at risk
  async getStreaksAtRisk(trackerId: number, warningDays = 1): Promise<StreakResponse[]> {
    const response = await api.get<StreakResponse[]>(
      `/streaks/tracker/${trackerId}/at-risk?warningDays=${warningDays}`
    );
    return response.data;
  },

  // Get comprehensive streak analytics
  async getStreakAnalytics(trackerId: number): Promise<StreakAnalytics> {
    const response = await api.get<StreakAnalytics>(`/streaks/analytics/${trackerId}`);
    return response.data;
  },

  // Get streak trends
  async getStreakTrends(trackerId: number, days = 30): Promise<StreakTrend[]> {
    const response = await api.get<StreakTrend[]>(`/streaks/trends/${trackerId}?days=${days}`);
    return response.data;
  },

  // Get streak leaderboard
  async getStreakLeaderboard(
    trackerId: number,
    count = 10,
    byCurrentStreak = true
  ): Promise<StreakLeaderboardEntry[]> {
    const response = await api.get<StreakLeaderboardEntry[]>(
      `/streaks/leaderboard/${trackerId}?count=${count}&byCurrentStreak=${byCurrentStreak}`
    );
    return response.data;
  },

  // Get streak statistics
  async getStreakStatistics(trackerId: number): Promise<Record<string, number>> {
    const response = await api.get<Record<string, number>>(`/streaks/statistics/${trackerId}`);
    return response.data;
  },

  // Check milestone achievements
  async checkMilestones(habitId: number, currentStreak: number): Promise<MilestoneCheckResult> {
    const response = await api.post<MilestoneCheckResult>(
      `/streaks/milestones/check/${habitId}?currentStreak=${currentStreak}`
    );
    return response.data;
  },

  // Get achieved milestones for a habit
  async getAchievedMilestones(habitId: number): Promise<MilestoneAchievement[]> {
    const response = await api.get<MilestoneAchievement[]>(`/streaks/milestones/${habitId}`);
    return response.data;
  },

  // Get recent milestones for a tracker
  async getRecentMilestones(trackerId: number, days = 7): Promise<MilestoneAchievement[]> {
    const response = await api.get<MilestoneAchievement[]>(
      `/streaks/milestones/recent/${trackerId}?days=${days}`
    );
    return response.data;
  },

  // Recalculate streak for a habit
  async recalculateStreak(habitId: number): Promise<StreakResponse> {
    const response = await api.post<StreakResponse>(`/streaks/recalculate/${habitId}`);
    return response.data;
  },

  // Recalculate all streaks for a tracker
  async recalculateAllStreaks(trackerId: number): Promise<StreakResponse[]> {
    const response = await api.post<StreakResponse[]>(`/streaks/recalculate/tracker/${trackerId}`);
    return response.data;
  },

  // Validate streak consistency
  async validateStreakConsistency(
    habitId: number
  ): Promise<{ habitId: number; isConsistent: boolean }> {
    const response = await api.get<{ habitId: number; isConsistent: boolean }>(
      `/streaks/validate/${habitId}`
    );
    return response.data;
  },

  // Get top performers
  async getTopPerformers(trackerId: number, count = 5): Promise<StreakResponse[]> {
    const response = await api.get<StreakResponse[]>(
      `/streaks/top-performers/${trackerId}?count=${count}`
    );
    return response.data;
  },

  // Get overall progress
  async getOverallProgress(trackerId: number): Promise<{ trackerId: number; progress: number }> {
    const response = await api.get<{ trackerId: number; progress: number }>(
      `/streaks/progress/${trackerId}`
    );
    return response.data;
  },
};

// Cache keys for React Query
export const streakQueryKeys = {
  all: ['streaks'] as const,
  byHabit: (habitId: number) => [...streakQueryKeys.all, 'habit', habitId] as const,
  byTracker: (trackerId: number) => [...streakQueryKeys.all, 'tracker', trackerId] as const,
  atRisk: (trackerId: number, warningDays: number) =>
    [...streakQueryKeys.byTracker(trackerId), 'at-risk', warningDays] as const,
  analytics: (trackerId: number) => [...streakQueryKeys.byTracker(trackerId), 'analytics'] as const,
  trends: (trackerId: number, days: number) =>
    [...streakQueryKeys.byTracker(trackerId), 'trends', days] as const,
  leaderboard: (trackerId: number, count: number, byCurrentStreak: boolean) =>
    [...streakQueryKeys.byTracker(trackerId), 'leaderboard', count, byCurrentStreak] as const,
  statistics: (trackerId: number) =>
    [...streakQueryKeys.byTracker(trackerId), 'statistics'] as const,
  milestones: (habitId: number) => [...streakQueryKeys.byHabit(habitId), 'milestones'] as const,
  recentMilestones: (trackerId: number, days: number) =>
    [...streakQueryKeys.byTracker(trackerId), 'recent-milestones', days] as const,
  topPerformers: (trackerId: number, count: number) =>
    [...streakQueryKeys.byTracker(trackerId), 'top-performers', count] as const,
  progress: (trackerId: number) => [...streakQueryKeys.byTracker(trackerId), 'progress'] as const,
};
