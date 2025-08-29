// Streak tracking types matching the backend DTOs

export interface StreakResponse {
  id: number;
  habitId: number;
  habitName: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletionDate: string | null;
  totalCompletions: number;
  completionRate: number;
  updatedAt: string;
  isAtRisk: boolean;
  daysSinceLastCompletion: number | null;
  achievedMilestones: number[];
  nextMilestone: number | null;
}

export interface StreakAnalytics {
  trackerId: number;
  totalHabits: number;
  activeStreaks: number;
  averageCurrentStreak: number;
  averageLongestStreak: number;
  averageCompletionRate: number;
  totalCompletions: number;
  trends: StreakTrend[];
  topStreaks: StreakLeaderboardEntry[];
  streaksAtRisk: StreakResponse[];
  milestoneAchievements: Record<string, number>;
}

export interface StreakTrend {
  date: string;
  activeStreakCount: number;
  averageStreak: number;
  completionsCount: number;
}

export interface StreakLeaderboardEntry {
  habitId: number;
  habitName: string;
  currentStreak: number;
  longestStreak: number;
  rank: number;
  color: string;
  icon?: string;
}

export interface MilestoneAchievement {
  habitId: number;
  habitName: string;
  milestoneValue: number;
  achievedAt: string;
  celebrationType: CelebrationType;
  message: string;
  isNew: boolean;
  badgeType: BadgeType;
}

export interface MilestoneCheckResult {
  hasNewMilestone: boolean;
  milestones: MilestoneAchievement[];
  currentStreak: number;
  nextMilestone: number;
}

export type CelebrationType = 'confetti' | 'sparkle' | 'pulse' | 'bounce' | 'glow';
export type BadgeType = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'legendary';

export interface StreakDisplayOptions {
  showCurrentOnly?: boolean;
  showLongest?: boolean;
  showProgress?: boolean;
  showMilestones?: boolean;
  showRiskWarning?: boolean;
  compact?: boolean;
  animated?: boolean;
}

export interface StreakCalculationOptions {
  frequency: 'Daily' | 'Weekly' | 'Custom';
  targetCount: number;
  warningDays?: number;
}

export interface StreakRisk {
  habitId: number;
  isAtRisk: boolean;
  daysSinceLastCompletion: number;
  riskLevel: 'low' | 'medium' | 'high';
  message: string;
}

export interface StreakHistory {
  habitId: number;
  date: string;
  streakValue: number;
  wasCompleted: boolean;
  milestoneReached?: number;
}

export interface StreakStatistics {
  averageCurrentStreak: number;
  averageLongestStreak: number;
  averageCompletionRate: number;
  totalActiveStreaks: number;
  overallProgress: number;
}

// Animation-related types
export interface StreakAnimationConfig {
  duration: number;
  delay: number;
  easing: string;
  celebrationType?: CelebrationType;
}

export interface StreakMilestoneConfig {
  value: number;
  message: string;
  celebrationType: CelebrationType;
  badgeType: BadgeType;
  isSpecial?: boolean;
}

// Component props types
export interface StreakCounterProps {
  streak: StreakResponse;
  options?: StreakDisplayOptions;
  onMilestoneClick?: (milestone: number) => void;
}

export interface StreakBadgeProps {
  streak: StreakResponse;
  size?: 'small' | 'medium' | 'large';
  variant?: 'current' | 'longest' | 'both';
  animated?: boolean;
}

export interface StreakCelebrationProps {
  milestone: MilestoneAchievement;
  onComplete?: () => void;
  autoTrigger?: boolean;
}

export interface StreakRiskWarningProps {
  streak: StreakResponse;
  onAction?: (action: 'complete' | 'remind' | 'dismiss') => void;
  compact?: boolean;
}

export interface StreakHistoryProps {
  habitId: number;
  days?: number;
  showMilestones?: boolean;
  interactive?: boolean;
}