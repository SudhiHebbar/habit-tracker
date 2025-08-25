import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../test/test-utils';
import { EditTrackerModal } from './EditTrackerModal';
import type { Tracker } from '../types/tracker.types';

const mockTracker: Tracker = {
  id: 1,
  name: 'Fitness Tracker',
  description: 'Track my fitness habits',
  userId: 'user-1',
  isShared: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  isActive: true,
  displayOrder: 0,
  habitCount: 5,
};

describe('EditTrackerModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal when open is true and tracker is provided', () => {
    render(
      <EditTrackerModal
        isOpen
        tracker={mockTracker}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('Edit Tracker')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Fitness Tracker')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Track my fitness habits')).toBeInTheDocument();
  });

  it('does not render modal when open is false', () => {
    render(
      <EditTrackerModal
        isOpen={false}
        tracker={mockTracker}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.queryByText('Edit Tracker')).not.toBeInTheDocument();
  });

  it('does not render modal when tracker is null', () => {
    render(
      <EditTrackerModal isOpen tracker={null} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    expect(screen.queryByText('Edit Tracker')).not.toBeInTheDocument();
  });

  it('populates form with tracker data when tracker changes', () => {
    const { rerender } = render(
      <EditTrackerModal
        isOpen
        tracker={mockTracker}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByDisplayValue('Fitness Tracker')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Track my fitness habits')).toBeInTheDocument();

    const newTracker: Tracker = {
      ...mockTracker,
      id: 2,
      name: 'Study Tracker',
      description: 'Track study habits',
      isShared: true,
    };

    rerender(
      <EditTrackerModal isOpen tracker={newTracker} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    expect(screen.getByDisplayValue('Study Tracker')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Track study habits')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <EditTrackerModal
        isOpen
        tracker={mockTracker}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const closeButton = screen.getByLabelText(/close modal/i);
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <EditTrackerModal
        isOpen
        tracker={mockTracker}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const cancelButton = screen.getByText(/cancel/i);
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    render(
      <EditTrackerModal
        isOpen
        tracker={mockTracker}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const backdrop = screen.getByRole('presentation');
    fireEvent.click(backdrop);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when modal content is clicked', () => {
    render(
      <EditTrackerModal
        isOpen
        tracker={mockTracker}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const modal = screen.getByText('Edit Tracker').closest('div');
    fireEvent.click(modal!);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('submits form with updated data', async () => {
    mockOnSubmit.mockResolvedValueOnce(undefined);

    render(
      <EditTrackerModal
        isOpen
        tracker={mockTracker}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const nameInput = screen.getByDisplayValue('Fitness Tracker');
    const descriptionInput = screen.getByDisplayValue('Track my fitness habits');
    const shareCheckbox = screen.getByRole('checkbox');
    const submitButton = screen.getByText('Update Tracker');

    fireEvent.change(nameInput, { target: { value: 'Updated Fitness Tracker' } });
    fireEvent.change(descriptionInput, { target: { value: 'Updated description' } });
    fireEvent.click(shareCheckbox);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(1, {
        name: 'Updated Fitness Tracker',
        description: 'Updated description',
        isShared: true,
        displayOrder: 0,
      });
    });
  });

  it('calls onClose after successful update', async () => {
    mockOnSubmit.mockResolvedValueOnce(undefined);

    render(
      <EditTrackerModal
        isOpen
        tracker={mockTracker}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const submitButton = screen.getByText('Update Tracker');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('does not close modal if update fails', async () => {
    mockOnSubmit.mockRejectedValueOnce(new Error('Update failed'));

    render(
      <EditTrackerModal
        isOpen
        tracker={mockTracker}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const submitButton = screen.getByText('Update Tracker');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });

    // Modal should stay open
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('shows loading state during update', () => {
    render(
      <EditTrackerModal
        isOpen
        tracker={mockTracker}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isUpdating
      />
    );

    const submitButton = screen.getByText(/updating.../i);
    expect(submitButton).toBeDisabled();

    const nameInput = screen.getByDisplayValue('Fitness Tracker');
    expect(nameInput).toBeDisabled();

    const cancelButton = screen.getByText(/cancel/i);
    expect(cancelButton).toBeDisabled();
  });

  it('displays error message when error prop is provided', () => {
    render(
      <EditTrackerModal
        isOpen
        tracker={mockTracker}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        error='Failed to update tracker'
      />
    );

    expect(screen.getByText('Failed to update tracker')).toBeInTheDocument();
  });

  it('validates required name field', async () => {
    render(
      <EditTrackerModal
        isOpen
        tracker={mockTracker}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const nameInput = screen.getByDisplayValue('Fitness Tracker');
    const submitButton = screen.getByText('Update Tracker');

    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/tracker name is required/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates name length constraints', async () => {
    render(
      <EditTrackerModal
        isOpen
        tracker={mockTracker}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const nameInput = screen.getByDisplayValue('Fitness Tracker');
    const submitButton = screen.getByText('Update Tracker');

    // Test name too long
    fireEvent.change(nameInput, {
      target: { value: 'A'.repeat(101) }, // Over 100 characters
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/must not exceed 100 characters/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates name format', async () => {
    render(
      <EditTrackerModal
        isOpen
        tracker={mockTracker}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const nameInput = screen.getByDisplayValue('Fitness Tracker');
    const submitButton = screen.getByText('Update Tracker');

    // Test invalid characters
    fireEvent.change(nameInput, { target: { value: 'Invalid@Name!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/can only contain letters, numbers, spaces, hyphens, and underscores/i)
      ).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates description length constraints', async () => {
    render(
      <EditTrackerModal
        isOpen
        tracker={mockTracker}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const descriptionInput = screen.getByDisplayValue('Track my fitness habits');
    const submitButton = screen.getByText('Update Tracker');

    fireEvent.change(descriptionInput, {
      target: { value: 'A'.repeat(501) }, // Over 500 characters
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/must not exceed 500 characters/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('clears validation errors when input changes', () => {
    render(
      <EditTrackerModal
        isOpen
        tracker={mockTracker}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const nameInput = screen.getByDisplayValue('Fitness Tracker');
    const submitButton = screen.getByText('Update Tracker');

    // Trigger validation error
    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.click(submitButton);

    expect(screen.getByText(/tracker name is required/i)).toBeInTheDocument();

    // Fix the error
    fireEvent.change(nameInput, { target: { value: 'Valid Name' } });

    expect(screen.queryByText(/tracker name is required/i)).not.toBeInTheDocument();
  });

  it('focuses on name input when modal opens', () => {
    render(
      <EditTrackerModal
        isOpen
        tracker={mockTracker}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const nameInput = screen.getByDisplayValue('Fitness Tracker');
    expect(nameInput).toHaveFocus();
  });

  it('handles checkbox state correctly', () => {
    const sharedTracker: Tracker = { ...mockTracker, isShared: true };

    render(
      <EditTrackerModal
        isOpen
        tracker={sharedTracker}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const shareCheckbox = screen.getByRole('checkbox');
    expect(shareCheckbox).toBeChecked();

    fireEvent.click(shareCheckbox);
    expect(shareCheckbox).not.toBeChecked();
  });

  it('handles form submission with preventDefault', () => {
    const preventDefault = vi.fn();

    render(
      <EditTrackerModal
        isOpen
        tracker={mockTracker}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const form = screen.getByText('Update Tracker').closest('form');
    fireEvent.submit(form!, { preventDefault });

    expect(preventDefault).toHaveBeenCalled();
  });

  it('handles empty description correctly', () => {
    const trackerWithoutDescription: Tracker = {
      ...mockTracker,
    };
    delete trackerWithoutDescription.description;

    render(
      <EditTrackerModal
        isOpen
        tracker={trackerWithoutDescription}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const descriptionInput = screen.getByPlaceholderText(/enter tracker description/i);
    expect(descriptionInput).toHaveValue('');
  });
});
