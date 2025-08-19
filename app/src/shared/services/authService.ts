// Authentication Service - User authentication and authorization
import { api, apiClient } from './api';
import type {
  BaseApiResponse,
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserPreferences,
} from '../types/api';

/**
 * Authentication token management
 */
const TOKEN_KEY = 'habit_tracker_token';
const REFRESH_TOKEN_KEY = 'habit_tracker_refresh_token';
const USER_KEY = 'habit_tracker_user';

export const tokenManager = {
  // Get stored token
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Get stored refresh token
  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  // Store tokens
  setTokens: (token: string, refreshToken: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    apiClient.setAuthToken(token);
  },

  // Clear stored tokens
  clearTokens: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    apiClient.clearAuthToken();
  },

  // Store user data
  setUser: (user: User): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Get stored user data
  getUser: (): User | null => {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = tokenManager.getToken();
    const user = tokenManager.getUser();
    return !!(token && user);
  },
};

/**
 * Authentication service methods
 */
export const authService = {
  // User login
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    const authData = response.data;
    
    if (authData.status === 'success' && authData.data) {
      tokenManager.setTokens(authData.data.token, authData.data.refreshToken);
      tokenManager.setUser(authData.data.user);
    }
    
    return authData;
  },

  // User registration
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    const authData = response.data;
    
    if (authData.status === 'success' && authData.data) {
      tokenManager.setTokens(authData.data.token, authData.data.refreshToken);
      tokenManager.setUser(authData.data.user);
    }
    
    return authData;
  },

  // User logout
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } finally {
      tokenManager.clearTokens();
    }
  },

  // Refresh authentication token
  refreshToken: async (): Promise<AuthResponse> => {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    });
    
    const authData = response.data;
    
    if (authData.status === 'success' && authData.data) {
      tokenManager.setTokens(authData.data.token, authData.data.refreshToken);
      tokenManager.setUser(authData.data.user);
    }
    
    return authData;
  },

  // Get current user profile
  getCurrentUser: async (): Promise<BaseApiResponse<User>> => {
    const response = await api.get<BaseApiResponse<User>>('/auth/me');
    const userData = response.data;
    
    if (userData.status === 'success' && userData.data) {
      tokenManager.setUser(userData.data);
    }
    
    return userData;
  },

  // Update user profile
  updateProfile: async (updates: Partial<User>): Promise<BaseApiResponse<User>> => {
    const response = await api.put<BaseApiResponse<User>>('/auth/me', updates);
    const userData = response.data;
    
    if (userData.status === 'success' && userData.data) {
      tokenManager.setUser(userData.data);
    }
    
    return userData;
  },

  // Update user preferences
  updatePreferences: async (preferences: Partial<UserPreferences>): Promise<BaseApiResponse<User>> => {
    const response = await api.put<BaseApiResponse<User>>('/auth/preferences', preferences);
    const userData = response.data;
    
    if (userData.status === 'success' && userData.data) {
      tokenManager.setUser(userData.data);
    }
    
    return userData;
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<BaseApiResponse<null>> => {
    const response = await api.post<BaseApiResponse<null>>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Request password reset
  requestPasswordReset: async (email: string): Promise<BaseApiResponse<null>> => {
    const response = await api.post<BaseApiResponse<null>>('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password with token
  resetPassword: async (token: string, newPassword: string): Promise<BaseApiResponse<null>> => {
    const response = await api.post<BaseApiResponse<null>>('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  },
};

// Initialize authentication on app start
export const initializeAuth = (): void => {
  const token = tokenManager.getToken();
  if (token) {
    apiClient.setAuthToken(token);
  }
};