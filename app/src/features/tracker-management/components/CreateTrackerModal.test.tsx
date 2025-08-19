import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../test/test-utils';
import { CreateTrackerModal } from './CreateTrackerModal';
import { useCreateTracker } from '../hooks/useCreateTracker';

// Mock the custom hook
vi.mock('../hooks/useCreateTracker');

describe('CreateTrackerModal Component', () => {
  const mockCreateTracker = vi.fn();
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    (useCreateTracker as any).mockReturnValue({
      createTracker: mockCreateTracker,
      isLoading: false,
      error: null,
    });
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
    expect(screen.getByLabelText(/tracker name/i)).toBeInTheDocument();
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
    
    const backdrop = screen.getByTestId('modal-backdrop');
    fireEvent.click(backdrop);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('submits form with correct data', async () => {
    mockCreateTracker.mockResolvedValueOnce({ 
      id: 1, 
      name: 'Test Tracker', 
      description: 'Test Description' 
    });

    render(
      <CreateTrackerModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSuccess} 
      />
    );
    
    const nameInput = screen.getByLabelText(/tracker name/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const submitButton = screen.getByText(/create tracker/i);
    
    fireEvent.change(nameInput, { target: { value: 'Test Tracker' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockCreateTracker).toHaveBeenCalledWith({
        name: 'Test Tracker',
        description: 'Test Description',
      });
    });
  });

  it('calls onSuccess after successful creation', async () => {
    const createdTracker = { 
      id: 1, 
      name: 'Test Tracker', 
      description: 'Test Description' 
    };
    
    mockCreateTracker.mockResolvedValueOnce(createdTracker);

    render(
      <CreateTrackerModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSuccess} 
      />
    );
    
    const nameInput = screen.getByLabelText(/tracker name/i);
    const submitButton = screen.getByText(/create tracker/i);
    
    fireEvent.change(nameInput, { target: { value: 'Test Tracker' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(createdTracker);
    });
  });

  it('shows loading state during submission', () => {
    (useCreateTracker as any).mockReturnValue({
      createTracker: mockCreateTracker,
      isLoading: true,
      error: null,
    });

    render(
      <CreateTrackerModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSuccess} 
      />
    );
    
    const submitButton = screen.getByText(/creating.../i);
    expect(submitButton).toBeDisabled();
    
    // Loading spinner should be visible
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays error message when creation fails', () => {
    (useCreateTracker as any).mockReturnValue({
      createTracker: mockCreateTracker,
      isLoading: false,
      error: 'Failed to create tracker',
    });

    render(
      <CreateTrackerModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSuccess} 
      />
    );
    
    expect(screen.getByText('Failed to create tracker')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
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
    
    expect(mockCreateTracker).not.toHaveBeenCalled();
  });

  it('validates name length constraints', async () => {
    render(
      <CreateTrackerModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSuccess} 
      />
    );
    
    const nameInput = screen.getByLabelText(/tracker name/i);
    const submitButton = screen.getByText(/create tracker/i);
    
    // Test name too long
    fireEvent.change(nameInput, { 
      target: { value: 'A'.repeat(101) } // Over 100 characters
    });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/name must be between 1 and 100 characters/i)).toBeInTheDocument();
    });
    
    expect(mockCreateTracker).not.toHaveBeenCalled();
  });

  it('validates description length constraints', async () => {
    render(
      <CreateTrackerModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSuccess} 
      />
    );
    
    const nameInput = screen.getByLabelText(/tracker name/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const submitButton = screen.getByText(/create tracker/i);
    
    fireEvent.change(nameInput, { target: { value: 'Valid Name' } });
    fireEvent.change(descriptionInput, { 
      target: { value: 'A'.repeat(501) } // Over 500 characters
    });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/description must be less than 500 characters/i)).toBeInTheDocument();
    });
    
    expect(mockCreateTracker).not.toHaveBeenCalled();
  });

  it('resets form when modal is reopened', () => {
    const { rerender } = render(
      <CreateTrackerModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSuccess} 
      />
    );
    
    const nameInput = screen.getByLabelText(/tracker name/i);
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
    
    // Form should be reset
    const newNameInput = screen.getByLabelText(/tracker name/i);
    const newDescriptionInput = screen.getByLabelText(/description/i);
    
    expect(newNameInput).toHaveValue('');
    expect(newDescriptionInput).toHaveValue('');
  });

  it('handles escape key to close modal', () => {
    render(
      <CreateTrackerModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSuccess} 
      />
    );
    
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('focuses on name input when modal opens', () => {
    render(
      <CreateTrackerModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSuccess} 
      />
    );
    
    const nameInput = screen.getByLabelText(/tracker name/i);
    expect(nameInput).toHaveFocus();
  });

  it('traps focus within modal', () => {
    render(
      <CreateTrackerModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSuccess} 
      />
    );
    
    const nameInput = screen.getByLabelText(/tracker name/i);
    
    // Tab through elements
    nameInput.focus();
    fireEvent.keyDown(nameInput, { key: 'Tab' });
    
    // Focus should move to next focusable element
    expect(screen.getByLabelText(/description/i)).toHaveFocus();
  });

  it('prevents form submission on Enter in text inputs', () => {
    render(
      <CreateTrackerModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSuccess} 
      />
    );
    
    const nameInput = screen.getByLabelText(/tracker name/i);
    
    fireEvent.keyDown(nameInput, { key: 'Enter', code: 'Enter' });
    
    // Should not submit with empty form
    expect(mockCreateTracker).not.toHaveBeenCalled();
  });

  it('shows character count for name input', () => {
    render(
      <CreateTrackerModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSuccess} 
      />
    );
    
    const nameInput = screen.getByLabelText(/tracker name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Name' } });
    
    expect(screen.getByText('9/100')).toBeInTheDocument();
  });

  it('shows character count for description input', () => {
    render(
      <CreateTrackerModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSuccess} 
      />
    );
    
    const descriptionInput = screen.getByLabelText(/description/i);
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    
    expect(screen.getByText('16/500')).toBeInTheDocument();
  });
});