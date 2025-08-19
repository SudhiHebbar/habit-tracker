import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../test/test-utils';
import TrackerSelector from './TrackerSelector';
import { useTrackers } from '../hooks/useTrackers';
import type { TrackerResponseDto } from '../types/tracker.types';

// Mock the custom hook
vi.mock('../hooks/useTrackers');

const mockTrackers: TrackerResponseDto[] = [
  {
    id: 1,
    name: 'Fitness Tracker',
    description: 'Track fitness habits',
    userId: null,
    isShared: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isActive: true,
    displayOrder: 0,
    habitCount: 5,
  },
  {
    id: 2,
    name: 'Study Tracker',
    description: 'Track study habits',
    userId: null,
    isShared: false,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
    isActive: true,
    displayOrder: 1,
    habitCount: 3,
  },
];

describe('TrackerSelector Component', () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    (useTrackers as any).mockReturnValue({
      trackers: mockTrackers,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('renders with default placeholder when no tracker is selected', () => {
    render(<TrackerSelector onSelect={mockOnSelect} />);
    
    expect(screen.getByText('Select a tracker...')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(
      <TrackerSelector 
        onSelect={mockOnSelect} 
        placeholder="Choose your tracker" 
      />
    );
    
    expect(screen.getByText('Choose your tracker')).toBeInTheDocument();
  });

  it('displays selected tracker name', () => {
    render(
      <TrackerSelector 
        onSelect={mockOnSelect} 
        selectedTrackerId={1} 
      />
    );
    
    expect(screen.getByText('Fitness Tracker')).toBeInTheDocument();
  });

  it('opens dropdown when clicked', () => {
    render(<TrackerSelector onSelect={mockOnSelect} />);
    
    const selector = screen.getByRole('button');
    fireEvent.click(selector);
    
    expect(screen.getByText('Fitness Tracker')).toBeInTheDocument();
    expect(screen.getByText('Study Tracker')).toBeInTheDocument();
  });

  it('closes dropdown when clicking outside', () => {
    render(<TrackerSelector onSelect={mockOnSelect} />);
    
    const selector = screen.getByRole('button');
    fireEvent.click(selector);
    
    // Dropdown should be open
    expect(screen.getByText('Fitness Tracker')).toBeInTheDocument();
    
    // Click outside
    fireEvent.click(document.body);
    
    // Dropdown should be closed
    expect(screen.queryByText('Fitness Tracker')).not.toBeInTheDocument();
  });

  it('calls onSelect when tracker is selected', () => {
    render(<TrackerSelector onSelect={mockOnSelect} />);
    
    const selector = screen.getByRole('button');
    fireEvent.click(selector);
    
    const fitnessOption = screen.getByText('Fitness Tracker');
    fireEvent.click(fitnessOption);
    
    expect(mockOnSelect).toHaveBeenCalledWith(mockTrackers[0]);
  });

  it('closes dropdown after selection', () => {
    render(<TrackerSelector onSelect={mockOnSelect} />);
    
    const selector = screen.getByRole('button');
    fireEvent.click(selector);
    
    const fitnessOption = screen.getByText('Fitness Tracker');
    fireEvent.click(fitnessOption);
    
    // Dropdown should be closed
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('shows loading state', () => {
    (useTrackers as any).mockReturnValue({
      trackers: [],
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(<TrackerSelector onSelect={mockOnSelect} />);
    
    const selector = screen.getByRole('button');
    fireEvent.click(selector);
    
    expect(screen.getByText('Loading trackers...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    (useTrackers as any).mockReturnValue({
      trackers: [],
      isLoading: false,
      error: 'Failed to load trackers',
      refetch: vi.fn(),
    });

    render(<TrackerSelector onSelect={mockOnSelect} />);
    
    const selector = screen.getByRole('button');
    fireEvent.click(selector);
    
    expect(screen.getByText('Error loading trackers')).toBeInTheDocument();
  });

  it('shows empty state when no trackers available', () => {
    (useTrackers as any).mockReturnValue({
      trackers: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<TrackerSelector onSelect={mockOnSelect} />);
    
    const selector = screen.getByRole('button');
    fireEvent.click(selector);
    
    expect(screen.getByText('No trackers available')).toBeInTheDocument();
  });

  it('handles keyboard navigation', () => {
    render(<TrackerSelector onSelect={mockOnSelect} />);
    
    const selector = screen.getByRole('button');
    
    // Open with Enter key
    fireEvent.keyDown(selector, { key: 'Enter', code: 'Enter' });
    expect(screen.getByText('Fitness Tracker')).toBeInTheDocument();
    
    // Navigate with Arrow Down
    fireEvent.keyDown(selector, { key: 'ArrowDown', code: 'ArrowDown' });
    
    // Select with Enter
    fireEvent.keyDown(selector, { key: 'Enter', code: 'Enter' });
    
    expect(mockOnSelect).toHaveBeenCalled();
  });

  it('closes dropdown with Escape key', () => {
    render(<TrackerSelector onSelect={mockOnSelect} />);
    
    const selector = screen.getByRole('button');
    fireEvent.click(selector);
    
    // Dropdown should be open
    expect(screen.getByText('Fitness Tracker')).toBeInTheDocument();
    
    // Close with Escape
    fireEvent.keyDown(selector, { key: 'Escape', code: 'Escape' });
    
    // Dropdown should be closed
    expect(screen.queryByText('Fitness Tracker')).not.toBeInTheDocument();
  });

  it('filters trackers by active status when showInactiveTrackers is false', () => {
    const trackersWithInactive = [
      ...mockTrackers,
      {
        id: 3,
        name: 'Inactive Tracker',
        description: 'Inactive tracker',
        userId: null,
        isShared: false,
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
        isActive: false,
        displayOrder: 2,
        habitCount: 0,
      },
    ];

    (useTrackers as any).mockReturnValue({
      trackers: trackersWithInactive,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<TrackerSelector onSelect={mockOnSelect} />);
    
    const selector = screen.getByRole('button');
    fireEvent.click(selector);
    
    expect(screen.getByText('Fitness Tracker')).toBeInTheDocument();
    expect(screen.getByText('Study Tracker')).toBeInTheDocument();
    expect(screen.queryByText('Inactive Tracker')).not.toBeInTheDocument();
  });

  it('shows all trackers when showInactiveTrackers is true', () => {
    const trackersWithInactive = [
      ...mockTrackers,
      {
        id: 3,
        name: 'Inactive Tracker',
        description: 'Inactive tracker',
        userId: null,
        isShared: false,
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
        isActive: false,
        displayOrder: 2,
        habitCount: 0,
      },
    ];

    (useTrackers as any).mockReturnValue({
      trackers: trackersWithInactive,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(
      <TrackerSelector 
        onSelect={mockOnSelect} 
        showInactiveTrackers={true} 
      />
    );
    
    const selector = screen.getByRole('button');
    fireEvent.click(selector);
    
    expect(screen.getByText('Fitness Tracker')).toBeInTheDocument();
    expect(screen.getByText('Study Tracker')).toBeInTheDocument();
    expect(screen.getByText('Inactive Tracker')).toBeInTheDocument();
  });

  it('displays tracker habit count in options', () => {
    render(<TrackerSelector onSelect={mockOnSelect} showHabitCount />);
    
    const selector = screen.getByRole('button');
    fireEvent.click(selector);
    
    expect(screen.getByText('5 habits')).toBeInTheDocument();
    expect(screen.getByText('3 habits')).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    render(<TrackerSelector onSelect={mockOnSelect} disabled />);
    
    const selector = screen.getByRole('button');
    expect(selector).toBeDisabled();
    
    fireEvent.click(selector);
    
    // Dropdown should not open
    expect(screen.queryByText('Fitness Tracker')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <TrackerSelector 
        onSelect={mockOnSelect} 
        className="custom-selector" 
      />
    );
    
    const selector = screen.getByRole('button');
    expect(selector.closest('.custom-selector')).toBeInTheDocument();
  });

  it('has proper ARIA attributes for accessibility', () => {
    render(<TrackerSelector onSelect={mockOnSelect} />);
    
    const selector = screen.getByRole('button');
    expect(selector).toHaveAttribute('aria-haspopup', 'listbox');
    expect(selector).toHaveAttribute('aria-expanded', 'false');
    
    fireEvent.click(selector);
    
    expect(selector).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('maintains focus management for accessibility', () => {
    render(<TrackerSelector onSelect={mockOnSelect} />);
    
    const selector = screen.getByRole('button');
    selector.focus();
    
    fireEvent.click(selector);
    
    // First option should be highlighted
    const firstOption = screen.getByRole('option', { name: /fitness tracker/i });
    expect(firstOption).toHaveClass('highlighted');
  });

  it('sorts trackers by display order', () => {
    const unsortedTrackers = [
      { ...mockTrackers[1], displayOrder: 0 }, // Study Tracker first
      { ...mockTrackers[0], displayOrder: 1 }, // Fitness Tracker second
    ];

    (useTrackers as any).mockReturnValue({
      trackers: unsortedTrackers,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<TrackerSelector onSelect={mockOnSelect} />);
    
    const selector = screen.getByRole('button');
    fireEvent.click(selector);
    
    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveTextContent('Study Tracker');
    expect(options[1]).toHaveTextContent('Fitness Tracker');
  });

  it('refreshes trackers when refetch is triggered', async () => {
    const mockRefetch = vi.fn();
    
    (useTrackers as any).mockReturnValue({
      trackers: mockTrackers,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<TrackerSelector onSelect={mockOnSelect} allowRefresh />);
    
    const selector = screen.getByRole('button');
    fireEvent.click(selector);
    
    const refreshButton = screen.getByLabelText(/refresh trackers/i);
    fireEvent.click(refreshButton);
    
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });
});