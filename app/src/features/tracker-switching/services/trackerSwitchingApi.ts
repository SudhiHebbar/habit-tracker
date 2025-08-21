import { api } from '@shared/services/api';
import type { 
  TrackerSummary, 
  TrackerWithStats, 
  TrackerSwitchData 
} from '../types/trackerSwitching.types';

export const trackerSwitchingApi = {
  async getTrackerSummaries(): Promise<TrackerSummary[]> {
    const response = await api.get<TrackerSummary[]>('/trackers/summaries');
    return response.data;
  },

  async getTrackerWithStats(trackerId: number): Promise<TrackerWithStats> {
    const response = await api.get<TrackerWithStats>(`/trackers/${trackerId}/full`);
    return response.data;
  },

  async getTrackerSwitchData(trackerId: number): Promise<TrackerSwitchData> {
    const response = await api.get<TrackerSwitchData>(`/tracker-switching/${trackerId}/switch-data`);
    return response.data;
  },

  async recordTrackerAccess(trackerId: number): Promise<void> {
    await api.post(`/tracker-switching/${trackerId}/record-access`);
  },

  async getRecentTrackers(count: number = 5): Promise<TrackerSummary[]> {
    const response = await api.get<TrackerSummary[]>('/tracker-switching/recent', {
      count
    });
    return response.data;
  },

  async getFavoriteTrackers(count: number = 5): Promise<TrackerSummary[]> {
    const response = await api.get<TrackerSummary[]>('/tracker-switching/favorites', {
      count
    });
    return response.data;
  },

  async preloadTrackerData(trackerId: number): Promise<void> {
    await api.post(`/tracker-switching/${trackerId}/preload`);
  }
};