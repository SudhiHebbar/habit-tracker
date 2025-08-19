// Router Component
// Application routing configuration with React Router
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import ErrorBoundary from './ErrorBoundary';

// Lazy load page components for better performance
import { lazy, Suspense } from 'react';
import LoadingSpinner from './LoadingSpinner';

// Lazy loaded pages (to be created later)
const HomePage = lazy(() => import('../../features/home/HomePage'));
const DashboardPage = lazy(() => import('../../features/dashboard/DashboardPage'));
const HabitsPage = lazy(() => import('../../features/habits/HabitsPage'));
const SettingsPage = lazy(() => import('../../features/settings/SettingsPage'));
const NotFoundPage = lazy(() => import('../../features/404/NotFoundPage'));

/**
 * Loading fallback component for lazy loaded pages
 */
const PageLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh'
  }}>
    <LoadingSpinner size="large" />
  </div>
);

/**
 * Main application router
 */
const Router = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Layout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Home route */}
              <Route path="/" element={<HomePage />} />
              
              {/* Dashboard route */}
              <Route path="/dashboard" element={<DashboardPage />} />
              
              {/* Habits management routes */}
              <Route path="/habits" element={<HabitsPage />} />
              <Route path="/habits/:id" element={<HabitsPage />} />
              
              {/* Settings route */}
              <Route path="/settings" element={<SettingsPage />} />
              
              {/* 404 and catch-all routes */}
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </Suspense>
        </Layout>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Router;