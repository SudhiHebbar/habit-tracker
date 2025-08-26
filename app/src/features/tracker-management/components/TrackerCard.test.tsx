import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../../test/test-utils';
import { TrackerCard } from './TrackerCard';
import type { Tracker } from '../types/tracker.types';

const mockTracker: Tracker = {
  id: 1,
  name: 'Fitness Tracker',
  description: 'Track my daily fitness habits',
  userId: 'user-1',
  isShared: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  isActive: true,
  displayOrder: 0,
  habitCount: 5,
};

describe('TrackerCard Component', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders tracker information correctly', () => {
    render(
      <TrackerCard
        tracker={mockTracker}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('Fitness Tracker')).toBeInTheDocument();
    expect(screen.getByText('Track my daily fitness habits')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <TrackerCard
        tracker={mockTracker}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
      />
    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockTracker);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <TrackerCard
        tracker={mockTracker}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(mockTracker);
  });

  it('calls onSelect when card is clicked', () => {
    render(
      <TrackerCard
        tracker={mockTracker}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
      />
    );

    const card = screen.getByRole('article');
    fireEvent.click(card);

    expect(mockOnSelect).toHaveBeenCalledWith(mockTracker);
  });

  it('applies selected styles when isSelected is true', () => {
    render(
      <TrackerCard
        tracker={mockTracker}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onSelect={mockOnSelect}
        isSelected
      />
    );

    const card = screen.getByRole('article');
    expect(card).toHaveClass('selected');
  });
});
