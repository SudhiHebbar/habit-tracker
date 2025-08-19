import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../../test/test-utils';
import TrackerCard from './TrackerCard';
import type { TrackerResponseDto } from '../types/tracker.types';

const mockTracker: TrackerResponseDto = {
  id: 1,
  name: 'Fitness Tracker',
  description: 'Track my daily fitness habits',
  userId: null,
  isShared: false,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  isActive: true,
  displayOrder: 0,
  habitCount: 5,
};

describe('TrackerCard Component', () => {
  it('renders tracker information correctly', () => {
    render(<TrackerCard tracker={mockTracker} />);
    
    expect(screen.getByText('Fitness Tracker')).toBeInTheDocument();
    expect(screen.getByText('Track my daily fitness habits')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // habit count
  });

  it('renders with default props when optional props are missing', () => {
    const minimalTracker: TrackerResponseDto = {
      ...mockTracker,
      description: '',
      habitCount: 0,
    };
    
    render(<TrackerCard tracker={minimalTracker} />);
    
    expect(screen.getByText('Fitness Tracker')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const handleEdit = vi.fn();
    render(<TrackerCard tracker={mockTracker} onEdit={handleEdit} />);
    
    const editButton = screen.getByLabelText(/edit tracker/i);
    fireEvent.click(editButton);
    
    expect(handleEdit).toHaveBeenCalledWith(mockTracker);
  });

  it('calls onDelete when delete button is clicked', () => {
    const handleDelete = vi.fn();
    render(<TrackerCard tracker={mockTracker} onDelete={handleDelete} />);
    
    const deleteButton = screen.getByLabelText(/delete tracker/i);
    fireEvent.click(deleteButton);
    
    expect(handleDelete).toHaveBeenCalledWith(mockTracker.id);
  });

  it('calls onSelect when card is clicked', () => {
    const handleSelect = vi.fn();
    render(<TrackerCard tracker={mockTracker} onSelect={handleSelect} />);
    
    const card = screen.getByRole('article');
    fireEvent.click(card);
    
    expect(handleSelect).toHaveBeenCalledWith(mockTracker);
  });

  it('does not show action buttons when handlers are not provided', () => {
    render(<TrackerCard tracker={mockTracker} />);
    
    expect(screen.queryByLabelText(/edit tracker/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/delete tracker/i)).not.toBeInTheDocument();
  });

  it('shows shared indicator when tracker is shared', () => {
    const sharedTracker: TrackerResponseDto = {
      ...mockTracker,
      isShared: true,
    };
    
    render(<TrackerCard tracker={sharedTracker} />);
    
    expect(screen.getByLabelText(/shared tracker/i)).toBeInTheDocument();
  });

  it('displays correct habit count with proper pluralization', () => {
    const { rerender } = render(<TrackerCard tracker={{ ...mockTracker, habitCount: 1 }} />);
    expect(screen.getByText('1 habit')).toBeInTheDocument();
    
    rerender(<TrackerCard tracker={{ ...mockTracker, habitCount: 0 }} />);
    expect(screen.getByText('0 habits')).toBeInTheDocument();
    
    rerender(<TrackerCard tracker={{ ...mockTracker, habitCount: 5 }} />);
    expect(screen.getByText('5 habits')).toBeInTheDocument();
  });

  it('applies selected state styling when selected prop is true', () => {
    render(<TrackerCard tracker={mockTracker} selected />);
    
    const card = screen.getByRole('article');
    expect(card).toHaveClass('selected');
  });

  it('does not apply selected state styling when selected prop is false', () => {
    render(<TrackerCard tracker={mockTracker} selected={false} />);
    
    const card = screen.getByRole('article');
    expect(card).not.toHaveClass('selected');
  });

  it('displays formatted creation date', () => {
    render(<TrackerCard tracker={mockTracker} showDetails />);
    
    // Should show some form of date (the exact format may vary)
    expect(screen.getByText(/created/i)).toBeInTheDocument();
  });

  it('handles keyboard navigation for accessibility', () => {
    const handleSelect = vi.fn();
    render(<TrackerCard tracker={mockTracker} onSelect={handleSelect} />);
    
    const card = screen.getByRole('article');
    
    // Test Enter key
    fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });
    expect(handleSelect).toHaveBeenCalledWith(mockTracker);
    
    // Test Space key
    fireEvent.keyDown(card, { key: ' ', code: 'Space' });
    expect(handleSelect).toHaveBeenCalledTimes(2);
  });

  it('has proper ARIA attributes for accessibility', () => {
    render(<TrackerCard tracker={mockTracker} />);
    
    const card = screen.getByRole('article');
    expect(card).toHaveAttribute('tabIndex', '0');
    expect(card).toHaveAttribute('aria-label', expect.stringContaining('Fitness Tracker'));
  });

  it('prevents card selection when action buttons are clicked', () => {
    const handleSelect = vi.fn();
    const handleEdit = vi.fn();
    
    render(
      <TrackerCard 
        tracker={mockTracker} 
        onSelect={handleSelect} 
        onEdit={handleEdit} 
      />
    );
    
    const editButton = screen.getByLabelText(/edit tracker/i);
    fireEvent.click(editButton);
    
    // Only edit handler should be called, not select
    expect(handleEdit).toHaveBeenCalledTimes(1);
    expect(handleSelect).not.toHaveBeenCalled();
  });

  it('shows loading state when isLoading prop is true', () => {
    render(<TrackerCard tracker={mockTracker} isLoading />);
    
    const card = screen.getByRole('article');
    expect(card).toHaveClass('loading');
    
    // Action buttons should be disabled during loading
    const editButton = screen.queryByLabelText(/edit tracker/i);
    if (editButton) {
      expect(editButton).toBeDisabled();
    }
  });

  it('renders with custom className', () => {
    render(<TrackerCard tracker={mockTracker} className="custom-tracker-card" />);
    
    const card = screen.getByRole('article');
    expect(card).toHaveClass('custom-tracker-card');
  });

  it('handles long tracker names gracefully', () => {
    const longNameTracker: TrackerResponseDto = {
      ...mockTracker,
      name: 'This is a very long tracker name that should be handled gracefully by the component',
      description: 'This is also a very long description that should wrap properly and not break the layout of the tracker card component',
    };
    
    render(<TrackerCard tracker={longNameTracker} />);
    
    expect(screen.getByText(longNameTracker.name)).toBeInTheDocument();
    expect(screen.getByText(longNameTracker.description)).toBeInTheDocument();
  });

  it('handles missing description gracefully', () => {
    const noDescriptionTracker: TrackerResponseDto = {
      ...mockTracker,
      description: '',
    };
    
    render(<TrackerCard tracker={noDescriptionTracker} />);
    
    expect(screen.getByText('Fitness Tracker')).toBeInTheDocument();
    // Should not crash when description is empty
  });
});