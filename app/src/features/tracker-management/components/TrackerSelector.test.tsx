import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../../test/test-utils';
import { TrackerSelector } from './TrackerSelector';
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
    habitCount: 5
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
    habitCount: 3
  }
];

describe('TrackerSelector Component', () => {
  const mockOnSelect = vi.fn();
  const mockOnCreate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with placeholder text when no tracker selected', () => {
    render(
      <TrackerSelector
        trackers={mockTrackers}
        selectedTracker={null}
        onSelect={mockOnSelect}
        placeholder="Choose a tracker"
      />
    );

    expect(screen.getByText('Choose a tracker')).toBeInTheDocument();
  });

  it('renders selected tracker name', () => {
    render(
      <TrackerSelector
        trackers={mockTrackers}
        selectedTracker={mockTrackers[0]}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('Fitness Tracker')).toBeInTheDocument();
  });

  it('opens dropdown when clicked', () => {
    render(
      <TrackerSelector
        trackers={mockTrackers}
        selectedTracker={null}
        onSelect={mockOnSelect}
      />
    );

    const selector = screen.getByRole('button');
    fireEvent.click(selector);

    expect(screen.getByText('Fitness Tracker')).toBeInTheDocument();
    expect(screen.getByText('Study Tracker')).toBeInTheDocument();
  });

  it('calls onSelect when tracker is chosen', () => {
    render(
      <TrackerSelector
        trackers={mockTrackers}
        selectedTracker={null}
        onSelect={mockOnSelect}
      />
    );

    const selector = screen.getByRole('button');
    fireEvent.click(selector);

    const fitnessOption = screen.getByText('Fitness Tracker');
    fireEvent.click(fitnessOption);

    expect(mockOnSelect).toHaveBeenCalledWith(mockTrackers[0]);
  });

  it('shows loading state', () => {
    render(
      <TrackerSelector
        trackers={[]}
        selectedTracker={null}
        onSelect={mockOnSelect}
        isLoading={true}
      />
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows create option when onCreate is provided', () => {
    render(
      <TrackerSelector
        trackers={mockTrackers}
        selectedTracker={null}
        onSelect={mockOnSelect}
        onCreate={mockOnCreate}
      />
    );

    const selector = screen.getByRole('button');
    fireEvent.click(selector);

    const createOption = screen.getByText(/create new tracker/i);
    fireEvent.click(createOption);

    expect(mockOnCreate).toHaveBeenCalled();
  });
});