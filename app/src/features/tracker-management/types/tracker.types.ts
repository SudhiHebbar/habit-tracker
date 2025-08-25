export interface Tracker {
  id: number;
  name: string;
  description?: string;
  userId?: string;
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  displayOrder: number;
  habitCount: number;
}

export interface CreateTrackerDto {
  name: string;
  description?: string;
  isShared?: boolean;
  displayOrder?: number;
}

export interface UpdateTrackerDto {
  name: string;
  description?: string;
  isShared: boolean;
  displayOrder: number;
}

export interface TrackerOrderDto {
  trackerId: number;
  displayOrder: number;
}

export interface TrackerError {
  message: string;
}

export interface TrackerState {
  trackers: Tracker[];
  selectedTracker: Tracker | null;
  isLoading: boolean;
  error: string | null;
}
