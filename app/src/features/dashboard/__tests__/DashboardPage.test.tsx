import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import DashboardPage from '../DashboardPage';

// Mock the Dashboard component
vi.mock('../components/Dashboard', () => ({
  Dashboard: ({ initialTrackerId }: { initialTrackerId?: number }) => (
    <div data-testid='dashboard'>
      Dashboard Component
      {initialTrackerId && <div data-testid='initial-tracker-id'>{initialTrackerId}</div>}
    </div>
  ),
}));

// Mock all external dependencies
vi.mock('../../tracker-management/hooks/useTrackers', () => ({
  useTrackers: () => ({
    trackers: [],
    isLoading: false,
    refetch: vi.fn(),
  }),
}));

vi.mock('../../habit-management/hooks/useHabits', () => ({
  useHabits: () => ({
    habits: [],
    loading: false,
    refetch: vi.fn(),
  }),
}));

vi.mock('../../../shared/hooks/useLocalStorage', () => ({
  useDashboardPreferences: () => [{ viewMode: 'grid', timeRange: 'daily' }, vi.fn()],
}));

vi.mock('../hooks/useDashboardProgress', () => ({
  useDashboardProgress: () => ({
    stats: {
      completedToday: 0,
      totalHabits: 0,
      completionRate: 0,
      activeStreaks: 0,
    },
  }),
}));

vi.mock('../../../shared/hooks/useEventBus', () => ({
  useHabitCompletionListener: vi.fn(),
}));

vi.mock('../../tracker-management/services/trackerApi', () => ({
  trackerApi: {
    createTracker: vi.fn(),
  },
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Dashboard component without MainLayout wrapper', () => {
    renderWithRouter(<DashboardPage />);

    // Should render the Dashboard component
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    expect(screen.getByText('Dashboard Component')).toBeInTheDocument();
  });

  it('passes initialTrackerId prop correctly to Dashboard', () => {
    const initialTrackerId = 123;
    renderWithRouter(<DashboardPage initialTrackerId={initialTrackerId} />);

    // Should pass the initialTrackerId prop
    expect(screen.getByTestId('initial-tracker-id')).toHaveTextContent('123');
  });

  it('does not render duplicate headers or navigation', () => {
    renderWithRouter(<DashboardPage />);

    // Should not have any header elements in the DashboardPage itself
    // (Layout.tsx handles header/navigation at router level)
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();

    // Should only render the Dashboard component content
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });

  it('handles undefined initialTrackerId correctly', () => {
    renderWithRouter(<DashboardPage initialTrackerId={undefined} />);

    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    expect(screen.queryByTestId('initial-tracker-id')).not.toBeInTheDocument();
  });
});
