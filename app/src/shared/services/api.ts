// API Service Foundation
// Centralized HTTP client with error handling and type safety
import { createCorsRequestOptions } from '../utils/cors';

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = '', defaultHeaders: Record<string, string> = {}) {
    this.baseURL = baseURL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    };
  }

  private async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = createCorsRequestOptions({
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      ...options,
    });

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await this.parseErrorResponse(response);
        throw new Error(errorData.message || `HTTP Error: ${response.status}`);
      }

      const data = await response.json();

      return {
        data,
        status: response.status,
        message: response.statusText,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  private async parseErrorResponse(response: Response): Promise<ApiError> {
    try {
      const errorData = await response.json();
      return {
        message: errorData.message || 'An error occurred',
        status: response.status,
        code: errorData.code,
      };
    } catch {
      return {
        message: `HTTP Error: ${response.status}`,
        status: response.status,
      };
    }
  }

  // HTTP Methods
  async get<T = unknown>(
    endpoint: string,
    params?: Record<string, string | number | undefined>
  ): Promise<ApiResponse<T>> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
      url = `${endpoint}?${searchParams.toString()}`;
    }
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T = unknown>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    const requestOptions: RequestInit = {
      method: 'POST',
    };

    if (data) {
      requestOptions.body = JSON.stringify(data);
    }

    return this.request<T>(endpoint, requestOptions);
  }

  async put<T = unknown>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    const requestOptions: RequestInit = {
      method: 'PUT',
    };

    if (data) {
      requestOptions.body = JSON.stringify(data);
    }

    return this.request<T>(endpoint, requestOptions);
  }

  async patch<T = unknown>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    const requestOptions: RequestInit = {
      method: 'PATCH',
    };

    if (data) {
      requestOptions.body = JSON.stringify(data);
    }

    return this.request<T>(endpoint, requestOptions);
  }

  async delete<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Authentication helpers
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  clearAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
  }

  // Update base URL if needed
  setBaseURL(baseURL: string): void {
    this.baseURL = baseURL;
  }
}

// Create and export default instance
export const apiClient = new ApiClient();

// Export type-safe API methods
export const api = {
  get: <T = unknown>(endpoint: string, params?: Record<string, string | number | undefined>) =>
    apiClient.get<T>(endpoint, params),

  post: <T = unknown>(endpoint: string, data?: unknown) => apiClient.post<T>(endpoint, data),

  put: <T = unknown>(endpoint: string, data?: unknown) => apiClient.put<T>(endpoint, data),

  patch: <T = unknown>(endpoint: string, data?: unknown) => apiClient.patch<T>(endpoint, data),

  delete: <T = unknown>(endpoint: string) => apiClient.delete<T>(endpoint),
};
