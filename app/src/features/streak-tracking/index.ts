// Types
export type * from './types/streak.types';

// Services
export { streakApi, streakQueryKeys } from './services/streakApi';
export { StreakCalculator } from './services/streakCalculator';
export { MilestoneDetector } from './services/milestoneDetector';

// Import services for local use
import { StreakCalculator } from './services/streakCalculator';
import { MilestoneDetector } from './services/milestoneDetector';

// Hooks
export {
  useStreakCalculation,
  useTrackerStreaks,
  useStreaksAtRisk,
} from './hooks/useStreakCalculation';

export {
  useStreakMilestones,
  useRecentMilestones,
  useMilestoneCelebration,
  useMilestoneInsights,
} from './hooks/useStreakMilestones';

export {
  useStreakAnalytics,
  useStreakTrends,
  useStreakLeaderboard,
  useStreakStatistics,
  useTopPerformers,
  useOverallProgress,
} from './hooks/useStreakAnalytics';

export {
  useStreakWarnings,
  useStreakWarning,
  useWarningPreferences,
} from './hooks/useStreakWarnings';

// Re-export commonly used utilities
export const StreakTrackingUtils = {
  isMilestone: (streak: number) => MilestoneDetector.isMilestone(streak),
  getNextMilestone: (streak: number) => MilestoneDetector.getNextMilestone(streak),
  formatStreak: (streak: number, showUnit?: boolean) =>
    StreakCalculator.formatStreakDisplay(streak, showUnit),
  getStreakColor: (streak: number) => StreakCalculator.getStreakColor(streak),
  getStreakEmoji: (streak: number) => StreakCalculator.getStreakEmoji(streak),
  getMotivationalMessage: (streak: number) => StreakCalculator.getMotivationalMessage(streak),
  getStreakCategory: (streak: number) => StreakCalculator.getStreakCategory(streak),
  calculateMilestoneProgress: (streak: number) =>
    MilestoneDetector.calculateMilestoneProgress(streak),
};
