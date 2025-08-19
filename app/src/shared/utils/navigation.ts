// Navigation utilities for React Router
import { useNavigate, useLocation, useParams } from 'react-router-dom';

/**
 * Application routes configuration
 */
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  HABITS: '/habits',
  HABIT_DETAIL: (id: string) => `/habits/${id}`,
  SETTINGS: '/settings',
  NOT_FOUND: '/404',
} as const;

/**
 * Navigation hook with application-specific routes
 */
export const useAppNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  return {
    // Navigation methods
    goToHome: () => navigate(ROUTES.HOME),
    goToDashboard: () => navigate(ROUTES.DASHBOARD),
    goToHabits: () => navigate(ROUTES.HABITS),
    goToHabitDetail: (id: string) => navigate(ROUTES.HABIT_DETAIL(id)),
    goToSettings: () => navigate(ROUTES.SETTINGS),
    goBack: () => navigate(-1),
    goForward: () => navigate(1),
    
    // Generic navigation
    navigateTo: (path: string, options?: { replace?: boolean; state?: unknown }) => {
      navigate(path, options);
    },
    
    // Current route information
    currentPath: location.pathname,
    currentSearch: location.search,
    currentState: location.state,
    routeParams: params,
    
    // Route checking utilities
    isHomePage: () => location.pathname === ROUTES.HOME,
    isDashboardPage: () => location.pathname === ROUTES.DASHBOARD,
    isHabitsPage: () => location.pathname.startsWith(ROUTES.HABITS),
    isSettingsPage: () => location.pathname === ROUTES.SETTINGS,
  };
};

/**
 * Get breadcrumb information for current route
 */
export const useBreadcrumbs = () => {
  const { currentPath, routeParams } = useAppNavigation();
  
  const breadcrumbs = [];
  
  // Always include home
  breadcrumbs.push({ label: 'Home', path: ROUTES.HOME });
  
  if (currentPath.startsWith('/dashboard')) {
    breadcrumbs.push({ label: 'Dashboard', path: ROUTES.DASHBOARD });
  } else if (currentPath.startsWith('/habits')) {
    breadcrumbs.push({ label: 'Habits', path: ROUTES.HABITS });
    
    if (routeParams.id) {
      breadcrumbs.push({ 
        label: `Habit ${routeParams.id}`, 
        path: ROUTES.HABIT_DETAIL(routeParams.id) 
      });
    }
  } else if (currentPath.startsWith('/settings')) {
    breadcrumbs.push({ label: 'Settings', path: ROUTES.SETTINGS });
  }
  
  return breadcrumbs;
};

/**
 * Check if a route path is currently active
 */
export const useRouteMatch = (path: string): boolean => {
  const location = useLocation();
  return location.pathname === path;
};

/**
 * Get query parameters from URL
 */
export const useQueryParams = () => {
  const location = useLocation();
  return new URLSearchParams(location.search);
};