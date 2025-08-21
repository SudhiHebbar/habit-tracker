import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../test/test-utils';
import { CreateTrackerModal } from './CreateTrackerModal';

describe('CreateTrackerModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal when open is true', () => {
    render(
      <CreateTrackerModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSuccess} 
      />
    );
    
    expect(screen.getByText('Create New Tracker')).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it('does not render modal when open is false', () => {
    render(
      <CreateTrackerModal 
        isOpen={false} 
        onClose={mockOnClose} 
        onSubmit={mockOnSuccess} 
      />
    );
    
    expect(screen.queryByText('Create New Tracker')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <CreateTrackerModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSuccess} 
      />
    );
    
    const closeButton = screen.getByLabelText(/close modal/i);
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <CreateTrackerModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSuccess} 
      />
    );
    
    const cancelButton = screen.getByText(/cancel/i);
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    render(
      <CreateTrackerModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSuccess} 
      />
    );
    
    const backdrop = screen.getByRole('presentation');
    fireEvent.click(backdrop);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('submits form with correct data', async () => {
    mockOnSuccess.mockResolvedValueOnce(undefined);

    render(
      <CreateTrackerModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSuccess} 
      />
    );
    
    const nameInput = screen.getByLabelText(/name/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const submitButton = screen.getByText(/create tracker/i);
    
    fireEvent.change(nameInput, { target: { value: 'Test Tracker' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith({
        name: 'Test Tracker',
        description: 'Test Description',
        isShared: false,
        displayOrder: 0
      });
    });
  });

  it('calls onClose after successful creation', async () => {
    mockOnSuccess.mockResolvedValueOnce(undefined);

    render(
      <CreateTrackerModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSuccess} 
      />
    );
    
    const nameInput = screen.getByLabelText(/name/i);
    const submitButton = screen.getByText(/create tracker/i);
    
    fireEvent.change(nameInput, { target: { value: 'Test Tracker' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('shows loading state during submission', () => {
    render(
      <CreateTrackerModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSuccess}
        isCreating={true}
      />
    );
    
    const submitButton = screen.getByText(/creating.../i);
    expect(submitButton).toBeDisabled();
    
    // Input should be disabled during creation
    const nameInput = screen.getByLabelText(/name/i);
    expect(nameInput).toBeDisabled();
  });

  it('displays error message when creation fails', () => {
    render(
      <CreateTrackerModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSuccess}
        error="Failed to create tracker"
      />
    );
    
    expect(screen.getByText('Failed to create tracker')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <CreateTrackerModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSuccess} 
      />
    );
    
    const submitButton = screen.getByText(/create tracker/i);
    fireEvent.click(submitButton);
    
    // Should show validation error for empty name
    await waitFor(() => {
      expect(screen.getByText(/tracker name is required/i)).toBeInTheDocument();
    });
    
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('validates name length constraints', async () => {
    render(
      <CreateTrackerModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSuccess} 
      />
    );
    
    const nameInput = screen.getByLabelText(/name/i);
    const submitButton = screen.getByText(/create tracker/i);
    
    // Test name too long
    fireEvent.change(nameInput, { 
      target: { value: 'A'.repeat(101) } // Over 100 characters
    });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/must not exceed 100 characters/i)).toBeInTheDocument();
    });
    
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('validates description length constraints', async () => {
    render(
      <CreateTrackerModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSuccess} 
      />
    );
    
    const nameInput = screen.getByLabelText(/name/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const submitButton = screen.getByText(/create tracker/i);
    
    fireEvent.change(nameInput, { target: { value: 'Valid Name' } });
    fireEvent.change(descriptionInput, { 
      target: { value: 'A'.repeat(501) } // Over 500 characters
    });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/must not exceed 500 characters/i)).toBeInTheDocument();
    });
    
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('maintains form state when modal is reopened', () => {
    const { rerender } = render(
      <CreateTrackerModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSuccess} 
      />
    );
    
    const nameInput = screen.getByLabelText(/name/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    
    // Fill in form
    fireEvent.change(nameInput, { target: { value: 'Test Name' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    
    // Close modal
    rerender(
      <CreateTrackerModal 
        isOpen={false} 
        onClose={mockOnClose} 
        onSubmit={mockOnSuccess} 
      />
    );
    
    // Reopen modal
    rerender(
      <CreateTrackerModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSuccess} 
      />
    );
    
    // Form should maintain its previous state
    const newNameInput = screen.getByLabelText(/name/i);
    const newDescriptionInput = screen.getByLabelText(/description/i);
    
    expect(newNameInput).toHaveValue('Test Name');
    expect(newDescriptionInput).toHaveValue('Test Description');
  });

  // Escape key handling is not implemented in the current component

  it('focuses on name input when modal opens', () => {
    render(
      <CreateTrackerModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSuccess} 
      />
    );
    
    const nameInput = screen.getByLabelText(/name/i);
    expect(nameInput).toHaveFocus();
  });

  // Focus trapping is not implemented in the current component

  it('prevents form submission on Enter in text inputs', () => {
    render(
      <CreateTrackerModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSuccess} 
      />
    );
    
    const nameInput = screen.getByLabelText(/name/i);
    
    fireEvent.keyDown(nameInput, { key: 'Enter', code: 'Enter' });
    
    // Should not submit with empty form
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  // Character count features are not implemented in the current component
});