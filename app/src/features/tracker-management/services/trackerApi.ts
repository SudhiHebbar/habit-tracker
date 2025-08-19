import type { 
  Tracker, 
  CreateTrackerDto, 
  UpdateTrackerDto, 
  TrackerOrderDto,
  TrackerError 
} from '../types/tracker.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5281/api';

class TrackerApiService {
  private baseUrl = `${API_BASE_URL}/trackers`;

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: TrackerError = await response.json().catch(() => ({
        message: `HTTP error! status: ${response.status}`
      }));
      throw new Error(error.message || `Request failed with status ${response.status}`);
    }
    
    if (response.status === 204) {
      return {} as T;
    }
    
    return response.json();
  }

  async getAllTrackers(includeInactive = false): Promise<Tracker[]> {
    const url = new URL(this.baseUrl);
    if (includeInactive) {
      url.searchParams.append('includeInactive', 'true');
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    return this.handleResponse<Tracker[]>(response);
  }

  async getTracker(id: number): Promise<Tracker> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    return this.handleResponse<Tracker>(response);
  }

  async getSharedTrackers(): Promise<Tracker[]> {
    const response = await fetch(`${this.baseUrl}/shared`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    return this.handleResponse<Tracker[]>(response);
  }

  async createTracker(data: CreateTrackerDto): Promise<Tracker> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    
    return this.handleResponse<Tracker>(response);
  }

  async updateTracker(id: number, data: UpdateTrackerDto): Promise<Tracker> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    
    return this.handleResponse<Tracker>(response);
  }

  async deleteTracker(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    await this.handleResponse<void>(response);
  }

  async restoreTracker(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}/restore`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    await this.handleResponse<void>(response);
  }

  async reorderTrackers(trackerOrders: TrackerOrderDto[]): Promise<void> {
    const response = await fetch(`${this.baseUrl}/reorder`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trackerOrders),
      credentials: 'include',
    });
    
    await this.handleResponse<void>(response);
  }
}

export const trackerApi = new TrackerApiService();