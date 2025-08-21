import type { 
  Habit, 
  CreateHabitRequest, 
  UpdateHabitRequest,
  EditHabitRequest,
  HabitEditResponse,
  DeactivateHabitRequest,
  HabitOrderUpdate,
  HabitValidationResponse,
  HabitStatsByFrequency,
  HabitError 
} from '../types/habit.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5281/api';

class HabitApiService {
  private baseUrl = `${API_BASE_URL}/habits`;

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.title || errorMessage;
      } catch {
        // If JSON parsing fails, use the default error message
      }
      
      const error: HabitError = {
        type: this.getErrorType(response.status),
        message: errorMessage,
      };
      
      throw new Error(error.message);
    }
    
    if (response.status === 204) {
      return {} as T;
    }
    
    return response.json();
  }

  private getErrorType(status: number): HabitError['type'] {
    switch (status) {
      case 400:
        return 'validation';
      case 401:
      case 403:
        return 'permission';
      case 404:
        return 'not_found';
      case 429:
        return 'limit_exceeded';
      default:
        return 'network';
    }
  }

  // Get all habits for a specific tracker
  async getHabitsByTracker(trackerId: number): Promise<Habit[]> {
    const response = await fetch(`${this.baseUrl}/tracker/${trackerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    return this.handleResponse<Habit[]>(response);
  }

  // Get habits with completion data for a tracker
  async getHabitsWithCompletions(trackerId: number): Promise<Habit[]> {
    const response = await fetch(`${this.baseUrl}/tracker/${trackerId}/with-completions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    return this.handleResponse<Habit[]>(response);
  }

  // Get a specific habit by ID
  async getHabit(id: number): Promise<Habit> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    return this.handleResponse<Habit>(response);
  }

  // Create a new habit in a tracker
  async createHabit(trackerId: number, data: CreateHabitRequest): Promise<Habit> {
    const response = await fetch(`${this.baseUrl}/tracker/${trackerId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    
    return this.handleResponse<Habit>(response);
  }

  // Update an existing habit
  async updateHabit(id: number, data: UpdateHabitRequest): Promise<Habit> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    
    return this.handleResponse<Habit>(response);
  }

  // Edit an existing habit with partial updates
  async editHabit(id: number, data: EditHabitRequest): Promise<HabitEditResponse> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    
    return this.handleResponse<HabitEditResponse>(response);
  }

  // Deactivate a habit while preserving history
  async deactivateHabit(id: number, reason?: string): Promise<void> {
    const data: DeactivateHabitRequest = {
      reason: reason || '',
      preserveCompletions: true
    };

    const response = await fetch(`${this.baseUrl}/${id}/deactivate`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    
    await this.handleResponse<void>(response);
  }

  // Reactivate a deactivated habit
  async reactivateHabit(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}/reactivate`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    await this.handleResponse<void>(response);
  }

  // Get edit history for a habit
  async getHabitEditHistory(id: number): Promise<Record<string, any>> {
    const response = await fetch(`${this.baseUrl}/${id}/edit-history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    return this.handleResponse<Record<string, any>>(response);
  }

  // Delete a habit (soft delete)
  async deleteHabit(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    await this.handleResponse<void>(response);
  }

  // Restore a soft-deleted habit
  async restoreHabit(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}/restore`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    await this.handleResponse<void>(response);
  }

  // Update display order for habits in a tracker
  async updateHabitOrder(trackerId: number, habitOrders: HabitOrderUpdate[]): Promise<void> {
    const response = await fetch(`${this.baseUrl}/tracker/${trackerId}/order`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(habitOrders),
      credentials: 'include',
    });
    
    await this.handleResponse<void>(response);
  }

  // Get habit statistics by frequency for a tracker
  async getHabitStatsByFrequency(trackerId: number): Promise<HabitStatsByFrequency> {
    const response = await fetch(`${this.baseUrl}/tracker/${trackerId}/stats/frequency`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    return this.handleResponse<HabitStatsByFrequency>(response);
  }

  // Validate if a habit name is unique in a tracker
  async validateHabitName(
    trackerId: number, 
    name: string, 
    excludeHabitId?: number
  ): Promise<HabitValidationResponse> {
    const url = new URL(`${this.baseUrl}/tracker/${trackerId}/validate-name`);
    url.searchParams.append('name', name);
    if (excludeHabitId !== undefined) {
      url.searchParams.append('excludeHabitId', excludeHabitId.toString());
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    return this.handleResponse<HabitValidationResponse>(response);
  }

  // Bulk operations for better performance
  async createMultipleHabits(trackerId: number, habits: CreateHabitRequest[]): Promise<Habit[]> {
    // For now, create habits one by one - can be optimized later with a bulk API endpoint
    const createdHabits: Habit[] = [];
    
    for (const habitData of habits) {
      try {
        const habit = await this.createHabit(trackerId, habitData);
        createdHabits.push(habit);
      } catch (error) {
        console.error(`Failed to create habit "${habitData.name}":`, error);
        // Continue with other habits even if one fails
      }
    }
    
    return createdHabits;
  }

  async updateMultipleHabits(updates: Array<{ id: number; data: UpdateHabitRequest }>): Promise<Habit[]> {
    // For now, update habits one by one - can be optimized later with a bulk API endpoint
    const updatedHabits: Habit[] = [];
    
    for (const { id, data } of updates) {
      try {
        const habit = await this.updateHabit(id, data);
        updatedHabits.push(habit);
      } catch (error) {
        console.error(`Failed to update habit ${id}:`, error);
        // Continue with other habits even if one fails
      }
    }
    
    return updatedHabits;
  }

  async deleteMultipleHabits(ids: number[]): Promise<void> {
    // For now, delete habits one by one - can be optimized later with a bulk API endpoint
    for (const id of ids) {
      try {
        await this.deleteHabit(id);
      } catch (error) {
        console.error(`Failed to delete habit ${id}:`, error);
        // Continue with other habits even if one fails
      }
    }
  }
}

export const habitApi = new HabitApiService();