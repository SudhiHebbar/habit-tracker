import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <React.StrictMode>
      {/* Add global providers here as they are implemented */}
      {/* Example: <ThemeProvider><ErrorBoundary>{children}</ErrorBoundary></ThemeProvider> */}
      {children}
    </React.StrictMode>
  );
};

const customRender = (ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Common test utilities
export const mockLocalStorage = () => {
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });
  return localStorageMock;
};

export const createMockIntersectionObserver = () => {
  const mockIntersectionObserver = vi.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
  return mockIntersectionObserver;
};

// Common test data factories
export const createMockUser = (overrides = {}) => ({
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  ...overrides,
});

export const createMockTracker = (overrides = {}) => ({
  id: 1,
  name: 'Test Tracker',
  description: 'Test description',
  isActive: true,
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createMockHabit = (overrides = {}) => ({
  id: 1,
  trackerId: 1,
  name: 'Test Habit',
  description: 'Test habit description',
  targetFrequency: 'Daily',
  targetCount: 1,
  color: '#6366f1',
  icon: 'check',
  isActive: true,
  createdAt: new Date().toISOString(),
  ...overrides,
});
