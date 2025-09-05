import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { streakApi, streakQueryKeys } from '../services/streakApi';
import type { StreakAnalytics, StreakTrend, StreakLeaderboardEntry } from '../types/streak.types';

export function useStreakAnalytics(trackerId?: number) {
  const {
    data: analytics,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: trackerId ? streakQueryKeys.analytics(trackerId) : ['analytics', 'empty'],
    queryFn: () => (trackerId ? streakApi.getStreakAnalytics(trackerId) : Promise.resolve(null)),
    enabled: trackerId !== undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
  });

  // Computed analytics insights
  const insights = useMemo(() => {
    if (!analytics) return null;

    const {
      totalHabits,
      activeStreaks,
      averageCurrentStreak,
      averageLongestStreak,
      averageCompletionRate,
      totalCompletions,
      streaksAtRisk,
    } = analytics;

    return {
      // Basic metrics
      activeStreakPercentage: totalHabits > 0 ? (activeStreaks / totalHabits) * 100 : 0,
      completionRateGrade:
        averageCompletionRate >= 90
          ? 'A'
          : averageCompletionRate >= 80
            ? 'B'
            : averageCompletionRate >= 70
              ? 'C'
              : averageCompletionRate >= 60
                ? 'D'
                : 'F',

      // Risk assessment
      riskPercentage: totalHabits > 0 ? (streaksAtRisk.length / totalHabits) * 100 : 0,
      riskLevel:
        streaksAtRisk.length === 0
          ? 'low'
          : streaksAtRisk.length / totalHabits < 0.2
            ? 'low'
            : streaksAtRisk.length / totalHabits < 0.5
              ? 'medium'
              : 'high',

      // Performance indicators
      consistencyScore: Math.round(
        (averageCompletionRate + (activeStreaks / totalHabits) * 100) / 2
      ),
      improvementPotential: Math.max(0, averageLongestStreak - averageCurrentStreak),

      // Engagement metrics
      totalEngagement: totalCompletions,
      averageEngagement: totalHabits > 0 ? totalCompletions / totalHabits : 0,

      // Streak health
      streakHealth:
        averageCurrentStreak >= averageLongestStreak * 0.8
          ? 'excellent'
          : averageCurrentStreak >= averageLongestStreak * 0.6
            ? 'good'
            : averageCurrentStreak >= averageLongestStreak * 0.4
              ? 'fair'
              : 'needs-attention',
    };
  }, [analytics]);

  return {
    analytics,
    insights,
    isLoading,
    error,
    refetch,
    hasData: Boolean(analytics),
  };
}

export function useStreakTrends(trackerId?: number, days: number = 30) {
  const {
    data: trends,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: trackerId ? streakQueryKeys.trends(trackerId, days) : ['trends', 'empty'],
    queryFn: () => (trackerId ? streakApi.getStreakTrends(trackerId, days) : Promise.resolve([])),
    enabled: trackerId !== undefined,
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 20 * 60 * 1000, // 20 minutes
  });

  // Analyze trends
  const trendAnalysis = useMemo(() => {
    if (!trends || trends.length < 2) return null;

    const sortedTrends = [...trends].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const first = sortedTrends[0];
    const last = sortedTrends[sortedTrends.length - 1];

    const streakTrend = last.averageStreak - first.averageStreak;
    const activityTrend = last.completionsCount - first.completionsCount;
    const activeStreakTrend = last.activeStreakCount - first.activeStreakCount;

    // Calculate moving averages
    const movingAverage = (data: number[], window: number = 7) => {
      if (data.length < window) return data;
      return data.map((_, index) => {
        if (index < window - 1) return data[index];
        const sum = data.slice(index - window + 1, index + 1).reduce((a, b) => a + b, 0);
        return sum / window;
      });
    };

    const averageStreaks = sortedTrends.map(t => t.averageStreak);
    const smoothedAverages = movingAverage(averageStreaks);

    return {
      direction: {
        streak: streakTrend > 0.5 ? 'up' : streakTrend < -0.5 ? 'down' : 'stable',
        activity: activityTrend > 0 ? 'up' : activityTrend < 0 ? 'down' : 'stable',
        activeStreaks: activeStreakTrend > 0 ? 'up' : activeStreakTrend < 0 ? 'down' : 'stable',
      },
      changes: {
        streakChange: streakTrend,
        activityChange: activityTrend,
        activeStreakChange: activeStreakTrend,
      },
      momentum: {
        improving: streakTrend > 0 && activityTrend > 0,
        declining: streakTrend < 0 && activityTrend < 0,
        mixed: streakTrend > 0 !== activityTrend > 0,
      },
      smoothedData: smoothedAverages,
      volatility: calculateVolatility(averageStreaks),
    };
  }, [trends]);

  return {
    trends: trends || [],
    trendAnalysis,
    isLoading,
    error,
    refetch,
    hasData: Boolean(trends && trends.length > 0),
  };
}

export function useStreakLeaderboard(
  trackerId?: number,
  count: number = 10,
  byCurrentStreak: boolean = true
) {
  const {
    data: leaderboard,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: trackerId
      ? streakQueryKeys.leaderboard(trackerId, count, byCurrentStreak)
      : ['leaderboard', 'empty'],
    queryFn: () =>
      trackerId
        ? streakApi.getStreakLeaderboard(trackerId, count, byCurrentStreak)
        : Promise.resolve([]),
    enabled: trackerId !== undefined,
    staleTime: 3 * 60 * 1000, // 3 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Leaderboard insights
  const insights = useMemo(() => {
    if (!leaderboard || leaderboard.length === 0) return null;

    const topStreak = leaderboard[0];
    const averageStreak =
      leaderboard.reduce(
        (sum, entry) => sum + (byCurrentStreak ? entry.currentStreak : entry.longestStreak),
        0
      ) / leaderboard.length;

    const streakDistribution = leaderboard.reduce(
      (dist, entry) => {
        const streak = byCurrentStreak ? entry.currentStreak : entry.longestStreak;
        const range = getStreakRange(streak);
        dist[range] = (dist[range] || 0) + 1;
        return dist;
      },
      {} as Record<string, number>
    );

    return {
      champion: topStreak,
      averageStreak,
      streakDistribution,
      competitiveness:
        averageStreak / Math.max(1, topStreak.currentStreak || topStreak.longestStreak),
      hasCloseCompetition:
        leaderboard.length > 1 &&
        (byCurrentStreak ? leaderboard[1].currentStreak : leaderboard[1].longestStreak) /
          (byCurrentStreak ? topStreak.currentStreak : topStreak.longestStreak) >
          0.8,
    };
  }, [leaderboard, byCurrentStreak]);

  return {
    leaderboard: leaderboard || [],
    insights,
    isLoading,
    error,
    refetch,
    hasData: Boolean(leaderboard && leaderboard.length > 0),
  };
}

export function useStreakStatistics(trackerId?: number) {
  return useQuery({
    queryKey: trackerId ? streakQueryKeys.statistics(trackerId) : ['statistics', 'empty'],
    queryFn: () => (trackerId ? streakApi.getStreakStatistics(trackerId) : Promise.resolve({})),
    enabled: trackerId !== undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
  });
}

export function useTopPerformers(trackerId?: number, count: number = 5) {
  const {
    data: topPerformers,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: trackerId
      ? streakQueryKeys.topPerformers(trackerId, count)
      : ['top-performers', 'empty'],
    queryFn: () => (trackerId ? streakApi.getTopPerformers(trackerId, count) : Promise.resolve([])),
    enabled: trackerId !== undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
  });

  const performerInsights = useMemo(() => {
    if (!topPerformers || topPerformers.length === 0) return null;

    const totalStreaks = topPerformers.reduce((sum, p) => sum + p.currentStreak, 0);
    const averageTopStreak = totalStreaks / topPerformers.length;
    const highestStreak = Math.max(...topPerformers.map(p => p.currentStreak));
    const consistencyScore =
      topPerformers.reduce((sum, p) => sum + p.completionRate, 0) / topPerformers.length;

    return {
      averageTopStreak,
      highestStreak,
      consistencyScore,
      dominantPerformer: topPerformers[0],
      hasConsistentTopTier:
        topPerformers.length > 2 &&
        topPerformers.slice(0, 3).every(p => p.currentStreak > averageTopStreak * 0.8),
    };
  }, [topPerformers]);

  return {
    topPerformers: topPerformers || [],
    insights: performerInsights,
    isLoading,
    error,
    refetch,
    hasData: Boolean(topPerformers && topPerformers.length > 0),
  };
}

export function useOverallProgress(trackerId?: number) {
  return useQuery({
    queryKey: trackerId ? streakQueryKeys.progress(trackerId) : ['progress', 'empty'],
    queryFn: () =>
      trackerId ? streakApi.getOverallProgress(trackerId) : Promise.resolve({ progress: 0 }),
    enabled: trackerId !== undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Helper functions
function calculateVolatility(data: number[]): number {
  if (data.length < 2) return 0;

  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const squaredDifferences = data.map(val => Math.pow(val - mean, 2));
  const variance = squaredDifferences.reduce((sum, val) => sum + val, 0) / data.length;

  return Math.sqrt(variance);
}

function getStreakRange(streak: number): string {
  if (streak === 0) return '0';
  if (streak <= 7) return '1-7';
  if (streak <= 30) return '8-30';
  if (streak <= 100) return '31-100';
  if (streak <= 365) return '101-365';
  return '365+';
}
