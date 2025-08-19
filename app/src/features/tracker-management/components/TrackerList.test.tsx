import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../test/test-utils';
import TrackerList from './TrackerList';
import { useTrackers } from '../hooks/useTrackers';
import { useDeleteTracker } from '../hooks/useDeleteTracker';
import type { TrackerResponseDto } from '../types/tracker.types';

// Mock the custom hooks
vi.mock('../hooks/useTrackers');
vi.mock('../hooks/useDeleteTracker');

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

describe('TrackerList Component', () => {
  const mockOnTrackerSelect = vi.fn();
  const mockOnTrackerEdit = vi.fn();
  const mockDeleteTracker = vi.fn();
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    (useTrackers as any).mockReturnValue({
      trackers: mockTrackers,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    (useDeleteTracker as any).mockReturnValue({
      deleteTracker: mockDeleteTracker,
      isLoading: false,
      error: null,
    });
  });

  it('renders list of trackers', () => {
    render(
      <TrackerList
        onTrackerSelect={mockOnTrackerSelect}
        onTrackerEdit={mockOnTrackerEdit}
      />
    );
    
    expect(screen.getByText('Fitness Tracker')).toBeInTheDocument();
    expect(screen.getByText('Study Tracker')).toBeInTheDocument();
    expect(screen.getByText('Track fitness habits')).toBeInTheDocument();
    expect(screen.getByText('Track study habits')).toBeInTheDocument();
  });

  it('shows loading state when fetching trackers', () => {
    (useTrackers as any).mockReturnValue({
      trackers: [],
      isLoading: true,
      error: null,
      refetch: mockRefetch,
    });

    render(
      <TrackerList
        onTrackerSelect={mockOnTrackerSelect}
        onTrackerEdit={mockOnTrackerEdit}
      />
    );
    
    expect(screen.getByText('Loading trackers...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows error state when fetch fails', () => {
    (useTrackers as any).mockReturnValue({
      trackers: [],
      isLoading: false,
      error: 'Failed to load trackers',
      refetch: mockRefetch,
    });

    render(
      <TrackerList
        onTrackerSelect={mockOnTrackerSelect}
        onTrackerEdit={mockOnTrackerEdit}
      />
    );
    
    expect(screen.getByText('Error loading trackers')).toBeInTheDocument();
    expect(screen.getByText('Failed to load trackers')).toBeInTheDocument();
  });

  it('shows empty state when no trackers exist', () => {
    (useTrackers as any).mockReturnValue({
      trackers: [],
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(
      <TrackerList
        onTrackerSelect={mockOnTrackerSelect}
        onTrackerEdit={mockOnTrackerEdit}
      />
    );
    
    expect(screen.getByText('No trackers found')).toBeInTheDocument();
    expect(screen.getByText(/create your first tracker/i)).toBeInTheDocument();
  });

  it('calls onTrackerSelect when tracker is clicked', () => {
    render(
      <TrackerList
        onTrackerSelect={mockOnTrackerSelect}
        onTrackerEdit={mockOnTrackerEdit}
      />
    );
    
    const fitnessTracker = screen.getByText('Fitness Tracker').closest('article');
    fireEvent.click(fitnessTracker!);
    
    expect(mockOnTrackerSelect).toHaveBeenCalledWith(mockTrackers[0]);
  });

  it('calls onTrackerEdit when edit button is clicked', () => {
    render(
      <TrackerList
        onTrackerSelect={mockOnTrackerSelect}
        onTrackerEdit={mockOnTrackerEdit}
      />
    );
    
    const editButtons = screen.getAllByLabelText(/edit tracker/i);
    fireEvent.click(editButtons[0]);
    
    expect(mockOnTrackerEdit).toHaveBeenCalledWith(mockTrackers[0]);
  });

  it('shows delete confirmation dialog when delete is clicked', async () => {
    render(
      <TrackerList
        onTrackerSelect={mockOnTrackerSelect}
        onTrackerEdit={mockOnTrackerEdit}
      />
    );
    
    const deleteButtons = screen.getAllByLabelText(/delete tracker/i);
    fireEvent.click(deleteButtons[0]);
    
    expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
    expect(screen.getByText('Fitness Tracker')).toBeInTheDocument();
  });

  it('deletes tracker when confirmed', async () => {
    mockDeleteTracker.mockResolvedValueOnce(true);

    render(
      <TrackerList
        onTrackerSelect={mockOnTrackerSelect}
        onTrackerEdit={mockOnTrackerEdit}
      />
    );
    
    const deleteButtons = screen.getAllByLabelText(/delete tracker/i);
    fireEvent.click(deleteButtons[0]);
    
    const confirmButton = screen.getByText(/delete/i);
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(mockDeleteTracker).toHaveBeenCalledWith(mockTrackers[0].id);
    });
  });

  it('cancels deletion when cancel is clicked', () => {
    render(
      <TrackerList
        onTrackerSelect={mockOnTrackerSelect}
        onTrackerEdit={mockOnTrackerEdit}
      />
    );
    
    const deleteButtons = screen.getAllByLabelText(/delete tracker/i);
    fireEvent.click(deleteButtons[0]);
    
    const cancelButton = screen.getByText(/cancel/i);
    fireEvent.click(cancelButton);
    
    expect(screen.queryByText(/are you sure you want to delete/i)).not.toBeInTheDocument();
    expect(mockDeleteTracker).not.toHaveBeenCalled();
  });

  it('shows loading state during deletion', () => {
    (useDeleteTracker as any).mockReturnValue({
      deleteTracker: mockDeleteTracker,
      isLoading: true,
      error: null,
    });

    render(
      <TrackerList
        onTrackerSelect={mockOnTrackerSelect}
        onTrackerEdit={mockOnTrackerEdit}
      />
    );
    
    const deleteButtons = screen.getAllByLabelText(/delete tracker/i);
    fireEvent.click(deleteButtons[0]);
    
    const confirmButton = screen.getByText(/deleting.../i);
    expect(confirmButton).toBeDisabled();
  });

  it('shows error message when deletion fails', () => {
    (useDeleteTracker as any).mockReturnValue({
      deleteTracker: mockDeleteTracker,
      isLoading: false,
      error: 'Failed to delete tracker',
    });

    render(
      <TrackerList
        onTrackerSelect={mockOnTrackerSelect}
        onTrackerEdit={mockOnTrackerEdit}
      />
    );
    
    expect(screen.getByText('Failed to delete tracker')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('displays trackers in grid view by default', () => {
    render(
      <TrackerList
        onTrackerSelect={mockOnTrackerSelect}
        onTrackerEdit={mockOnTrackerEdit}
      />
    );
    
    const container = screen.getByTestId('tracker-list-container');
    expect(container).toHaveClass('grid-view');
  });

  it('displays trackers in list view when specified', () => {
    render(
      <TrackerList
        onTrackerSelect={mockOnTrackerSelect}
        onTrackerEdit={mockOnTrackerEdit}
        viewMode="list"
      />
    );
    
    const container = screen.getByTestId('tracker-list-container');
    expect(container).toHaveClass('list-view');
  });

  it('toggles view mode when view toggle is clicked', () => {
    render(
      <TrackerList
        onTrackerSelect={mockOnTrackerSelect}
        onTrackerEdit={mockOnTrackerEdit}
        showViewToggle
      />
    );
    
    const viewToggle = screen.getByLabelText(/switch to list view/i);
    fireEvent.click(viewToggle);
    
    const container = screen.getByTestId('tracker-list-container');
    expect(container).toHaveClass('list-view');
    
    // Button text should change
    expect(screen.getByLabelText(/switch to grid view/i)).toBeInTheDocument();
  });

  it('filters trackers by search term', () => {
    render(
      <TrackerList
        onTrackerSelect={mockOnTrackerSelect}
        onTrackerEdit={mockOnTrackerEdit}
        showSearch
      />
    );
    
    const searchInput = screen.getByPlaceholderText(/search trackers/i);
    fireEvent.change(searchInput, { target: { value: 'Fitness' } });
    
    expect(screen.getByText('Fitness Tracker')).toBeInTheDocument();
    expect(screen.queryByText('Study Tracker')).not.toBeInTheDocument();
  });

  it('shows no results message when search has no matches', () => {
    render(
      <TrackerList
        onTrackerSelect={mockOnTrackerSelect}
        onTrackerEdit={mockOnTrackerEdit}
        showSearch
      />
    );
    
    const searchInput = screen.getByPlaceholderText(/search trackers/i);
    fireEvent.change(searchInput, { target: { value: 'NonexistentTracker' } });
    
    expect(screen.getByText(/no trackers match your search/i)).toBeInTheDocument();
  });

  it('clears search when clear button is clicked', () => {
    render(
      <TrackerList
        onTrackerSelect={mockOnTrackerSelect}
        onTrackerEdit={mockOnTrackerEdit}
        showSearch
      />
    );
    
    const searchInput = screen.getByPlaceholderText(/search trackers/i);
    fireEvent.change(searchInput, { target: { value: 'Fitness' } });
    
    const clearButton = screen.getByLabelText(/clear search/i);
    fireEvent.click(clearButton);
    
    expect(searchInput).toHaveValue('');
    expect(screen.getByText('Fitness Tracker')).toBeInTheDocument();
    expect(screen.getByText('Study Tracker')).toBeInTheDocument();
  });

  it('sorts trackers by name when sort is changed', () => {
    render(
      <TrackerList
        onTrackerSelect={mockOnTrackerSelect}
        onTrackerEdit={mockOnTrackerEdit}
        showSort
      />
    );
    
    const sortSelect = screen.getByLabelText(/sort by/i);
    fireEvent.change(sortSelect, { target: { value: 'name' } });
    
    const trackerCards = screen.getAllByRole('article');
    const firstTrackerName = trackerCards[0].querySelector('[class*="name"]');
    
    // Should be sorted alphabetically, so "Fitness Tracker" comes before "Study Tracker"
    expect(firstTrackerName).toHaveTextContent('Fitness Tracker');
  });

  it('sorts trackers by creation date when specified', () => {
    render(
      <TrackerList
        onTrackerSelect={mockOnTrackerSelect}
        onTrackerEdit={mockOnTrackerEdit}
        showSort
      />
    );
    
    const sortSelect = screen.getByLabelText(/sort by/i);
    fireEvent.change(sortSelect, { target: { value: 'createdAt' } });
    
    const trackerCards = screen.getAllByRole('article');
    const firstTrackerName = trackerCards[0].querySelector('[class*="name"]');
    
    // Should be sorted by creation date (oldest first)
    expect(firstTrackerName).toHaveTextContent('Fitness Tracker');
  });

  it('handles drag and drop reordering', () => {
    render(
      <TrackerList
        onTrackerSelect={mockOnTrackerSelect}
        onTrackerEdit={mockOnTrackerEdit}
        allowReorder
      />
    );
    
    const trackerCards = screen.getAllByRole('article');
    
    // Mock drag events
    const dragStartEvent = new DragEvent('dragstart', {
      dataTransfer: new DataTransfer(),
    });
    
    fireEvent(trackerCards[0], dragStartEvent);
    
    // Verify drag handle is present
    expect(screen.getAllByLabelText(/drag to reorder/i)).toHaveLength(2);
  });

  it('refreshes trackers when retry button is clicked', () => {
    (useTrackers as any).mockReturnValue({
      trackers: [],
      isLoading: false,
      error: 'Failed to load trackers',
      refetch: mockRefetch,
    });

    render(
      <TrackerList
        onTrackerSelect={mockOnTrackerSelect}
        onTrackerEdit={mockOnTrackerEdit}
      />
    );
    
    const retryButton = screen.getByText(/try again/i);
    fireEvent.click(retryButton);
    
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    render(
      <TrackerList
        onTrackerSelect={mockOnTrackerSelect}
        onTrackerEdit={mockOnTrackerEdit}
        className="custom-tracker-list"
      />
    );
    
    const container = screen.getByTestId('tracker-list-container');
    expect(container).toHaveClass('custom-tracker-list');
  });

  it('highlights selected tracker', () => {
    render(
      <TrackerList
        onTrackerSelect={mockOnTrackerSelect}
        onTrackerEdit={mockOnTrackerEdit}
        selectedTrackerId={1}
      />
    );
    
    const fitnessTrackerCard = screen.getByText('Fitness Tracker').closest('article');
    expect(fitnessTrackerCard).toHaveClass('selected');
    
    const studyTrackerCard = screen.getByText('Study Tracker').closest('article');
    expect(studyTrackerCard).not.toHaveClass('selected');
  });

  it('shows shared trackers with appropriate indicator', () => {
    const sharedTrackers = [
      { ...mockTrackers[0], isShared: true },
      mockTrackers[1],
    ];

    (useTrackers as any).mockReturnValue({
      trackers: sharedTrackers,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(
      <TrackerList
        onTrackerSelect={mockOnTrackerSelect}
        onTrackerEdit={mockOnTrackerEdit}
      />
    );
    
    expect(screen.getByLabelText(/shared tracker/i)).toBeInTheDocument();
  });

  it('supports keyboard navigation', () => {
    render(
      <TrackerList
        onTrackerSelect={mockOnTrackerSelect}
        onTrackerEdit={mockOnTrackerEdit}
      />
    );
    
    const firstTracker = screen.getByText('Fitness Tracker').closest('article');
    
    // Focus first tracker
    firstTracker?.focus();
    
    // Press Enter to select
    fireEvent.keyDown(firstTracker!, { key: 'Enter', code: 'Enter' });
    
    expect(mockOnTrackerSelect).toHaveBeenCalledWith(mockTrackers[0]);
  });
});