import type {
  Tracker,
  CreateTrackerDto,
  UpdateTrackerDto,
  TrackerOrderDto,
} from '../types/tracker.types';
import { api } from '../../../shared/services/api';

class TrackerApiService {
  async getAllTrackers(includeInactive = false): Promise<Tracker[]> {
    const params = includeInactive ? { includeInactive: 'true' } : undefined;
    const response = await api.get<Tracker[]>('/trackers', params);
    return response.data;
  }

  async getTracker(id: number): Promise<Tracker> {
    const response = await api.get<Tracker>(`/trackers/${id}`);
    return response.data;
  }

  async getSharedTrackers(): Promise<Tracker[]> {
    const response = await api.get<Tracker[]>('/trackers/shared');
    return response.data;
  }

  async createTracker(data: CreateTrackerDto): Promise<Tracker> {
    const response = await api.post<Tracker>('/trackers', data);
    return response.data;
  }

  async updateTracker(id: number, data: UpdateTrackerDto): Promise<Tracker> {
    const response = await api.put<Tracker>(`/trackers/${id}`, data);
    return response.data;
  }

  async deleteTracker(id: number): Promise<void> {
    await api.delete(`/trackers/${id}`);
  }

  async restoreTracker(id: number): Promise<void> {
    await api.post(`/trackers/${id}/restore`);
  }

  async reorderTrackers(trackerOrders: TrackerOrderDto[]): Promise<void> {
    await api.put('/trackers/reorder', trackerOrders);
  }
}

export const trackerApi = new TrackerApiService();
