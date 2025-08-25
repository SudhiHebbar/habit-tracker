export interface TrackerSummary {
  id: number;
  name: string;
  description?: string;
  habitCount: number;
  displayOrder: number;
  isShared: boolean;
  lastAccessedAt: string;
  todayCompletionsCount: number;
  currentStreak: number;
}

export interface TrackerWithStats {
  id: number;
  name: string;
  description?: string;
  userId?: string;
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  displayOrder: number;
  lastAccessedAt: string;
  habits: any[];
  totalHabits: number;
  activeHabits: number;
  completedToday: number;
  todayCompletionRate: number;
  currentStreak: number;
  longestStreak: number;
  recentCompletions: Record<string, number>;
}

export interface TrackerSwitchData {
  currentTrackerId: number;
  previousTrackerId?: number;
  nextTrackerId?: number;
  recentTrackers: TrackerSummary[];
  favoriteTrackers: TrackerSummary[];
  switchedAt: string;
}

export interface TrackerSwitchOptions {
  preload?: boolean;
  animate?: boolean;
  recordAccess?: boolean;
}

export interface TrackerCacheEntry {
  data: TrackerWithStats;
  timestamp: number;
  expiresAt: number;
}

export interface TrackerAccessRecord {
  trackerId: number;
  accessedAt: string;
}
