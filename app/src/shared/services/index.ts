// Shared Services
export { api, apiClient, ApiClient } from './api';
export type { ApiResponse, ApiError } from './api';

export { authService, tokenManager, initializeAuth } from './authService';
export { habitService, habitEntryService, habitStatsService } from './habitService';
export { dashboardService } from './dashboardService';
