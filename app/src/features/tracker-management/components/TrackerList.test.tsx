import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../../test/test-utils';
import { TrackerList } from './TrackerList';
import type { Tracker } from '../types/tracker.types';

const mockTrackers: Tracker[] = [
  {
    id: 1,
    name: 'Fitness Tracker',
    description: 'Track fitness habits',
    userId: 'user-1',
    isShared: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isActive: true,
    displayOrder: 0,
    habitCount: 5,
  },
  {
    id: 2,
    name: 'Study Tracker',
    description: 'Track study habits',
    userId: 'user-1',
    isShared: true,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    isActive: true,
    displayOrder: 1,
    habitCount: 3,
  },
];

describe('TrackerList Component', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders list of trackers', () => {
    render(
      <TrackerList
        trackers={mockTrackers}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('Fitness Tracker')).toBeInTheDocument();
    expect(screen.getByText('Study Tracker')).toBeInTheDocument();
  });

  it('renders empty state when no trackers', () => {
    render(
      <TrackerList
        trackers={[]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText(/no trackers/i)).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(
      <TrackerList
        trackers={[]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
        isLoading
      />
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows error message when error prop is provided', () => {
    render(
      <TrackerList
        trackers={[]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
        error='Failed to load trackers'
      />
    );

    expect(screen.getByText('Failed to load trackers')).toBeInTheDocument();
  });

  it('highlights selected tracker', () => {
    render(
      <TrackerList
        trackers={mockTrackers}
        selectedTracker={mockTrackers[0]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
      />
    );

    const selectedCard = screen.getByText('Fitness Tracker').closest('article');
    expect(selectedCard).toHaveClass('selected');
  });
});
