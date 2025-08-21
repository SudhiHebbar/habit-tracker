import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { BulkEditModal } from '../BulkEditModal';
import { Habit } from '../../types/habit.types';

const mockHabits: Habit[] = [
  {
    id: '1',
    name: 'Morning Exercise',
    description: 'Daily workout routine',
    icon: '🏃',
    color: '#3b82f6',
    targetFrequency: 'daily',
    targetCount: 1,
    isActive: true,
    displayOrder: 1,
    trackerId: 'tracker1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    streakCount: 5,
    completionRate: 80
  },
  {
    id: '2',
    name: 'Read Books',
    description: 'Reading habit',
    icon: '📚',
    color: '#10b981',
    targetFrequency: 'daily',
    targetCount: 1,
    isActive: true,
    displayOrder: 2,
    trackerId: 'tracker1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    streakCount: 3,
    completionRate: 75
  }
];

describe('BulkEditModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    selectedHabits: mockHabits,
    onBulkEdit: vi.fn().mockResolvedValue(undefined),
    onBulkDeactivate: vi.fn().mockResolvedValue(undefined)
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal when open', () => {
    render(<BulkEditModal {...defaultProps} />);
    
    expect(screen.getByText('Bulk Edit Habits (2 selected)')).toBeInTheDocument();
    expect(screen.getByText('Morning Exercise')).toBeInTheDocument();
    expect(screen.getByText('Read Books')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<BulkEditModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Bulk Edit Habits')).not.toBeInTheDocument();
  });

  it('displays selected habits', () => {
    render(<BulkEditModal {...defaultProps} />);
    
    expect(screen.getByText('Selected Habits:')).toBeInTheDocument();
    expect(screen.getByText('Morning Exercise')).toBeInTheDocument();
    expect(screen.getByText('Read Books')).toBeInTheDocument();
  });

  it('allows selecting fields to update', async () => {
    const user = userEvent.setup();
    render(<BulkEditModal {...defaultProps} />);
    
    // Initially no fields selected
    const previewButton = screen.getByText('Preview Changes');
    expect(previewButton).toBeDisabled();
    
    // Select name field
    const nameCheckbox = screen.getByLabelText('Name');
    await user.click(nameCheckbox);
    
    // Name input should appear
    expect(screen.getByPlaceholderText('New habit name')).toBeInTheDocument();
    expect(previewButton).toBeEnabled();
  });

  it('shows input fields when field is selected', async () => {
    const user = userEvent.setup();
    render(<BulkEditModal {...defaultProps} />);
    
    // Select color field
    const colorCheckbox = screen.getByLabelText('Color');
    await user.click(colorCheckbox);
    
    // Color picker should appear
    expect(screen.getByTestId('color-picker')).toBeInTheDocument();
  });

  it('hides input fields when field is deselected', async () => {
    const user = userEvent.setup();
    render(<BulkEditModal {...defaultProps} />);
    
    // Select and then deselect name field
    const nameCheckbox = screen.getByLabelText('Name');
    await user.click(nameCheckbox);
    expect(screen.getByPlaceholderText('New habit name')).toBeInTheDocument();
    
    await user.click(nameCheckbox);
    expect(screen.queryByPlaceholderText('New habit name')).not.toBeInTheDocument();
  });

  it('shows confirmation dialog before applying changes', async () => {
    const user = userEvent.setup();
    render(<BulkEditModal {...defaultProps} />);
    
    // Select name field and enter value
    const nameCheckbox = screen.getByLabelText('Name');
    await user.click(nameCheckbox);
    
    const nameInput = screen.getByPlaceholderText('New habit name');
    await user.type(nameInput, 'Updated Habit');
    
    // Click preview
    const previewButton = screen.getByText('Preview Changes');
    await user.click(previewButton);
    
    // Confirmation dialog should appear
    expect(screen.getByText('Confirm Bulk Edit')).toBeInTheDocument();
    expect(screen.getByText('You are about to update 2 habits:')).toBeInTheDocument();
    expect(screen.getByText('Name: "Updated Habit"')).toBeInTheDocument();
  });

  it('calls onBulkEdit when changes are confirmed', async () => {
    const user = userEvent.setup();
    const onBulkEdit = vi.fn().mockResolvedValue(undefined);
    
    render(<BulkEditModal {...defaultProps} onBulkEdit={onBulkEdit} />);
    
    // Select name field and enter value
    const nameCheckbox = screen.getByLabelText('Name');
    await user.click(nameCheckbox);
    
    const nameInput = screen.getByPlaceholderText('New habit name');
    await user.type(nameInput, 'Updated Habit');
    
    // Click preview
    const previewButton = screen.getByText('Preview Changes');
    await user.click(previewButton);
    
    // Confirm changes
    const confirmButton = screen.getByText('Confirm Changes');
    await user.click(confirmButton);
    
    await waitFor(() => {
      expect(onBulkEdit).toHaveBeenCalledWith({ name: 'Updated Habit' });
    });
  });

  it('shows deactivate button when onBulkDeactivate is provided', () => {
    render(<BulkEditModal {...defaultProps} />);
    
    expect(screen.getByText('Deactivate All (2)')).toBeInTheDocument();
  });

  it('does not show deactivate button when onBulkDeactivate is not provided', () => {
    const propsWithoutDeactivate = { ...defaultProps };
    delete propsWithoutDeactivate.onBulkDeactivate;
    
    render(<BulkEditModal {...propsWithoutDeactivate} />);
    
    expect(screen.queryByText('Deactivate All')).not.toBeInTheDocument();
  });

  it('opens deactivate dialog when deactivate button is clicked', async () => {
    const user = userEvent.setup();
    render(<BulkEditModal {...defaultProps} />);
    
    const deactivateButton = screen.getByText('Deactivate All (2)');
    await user.click(deactivateButton);
    
    expect(screen.getByText('Deactivate Multiple Habits')).toBeInTheDocument();
  });

  it('closes modal when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<BulkEditModal {...defaultProps} onClose={onClose} />);
    
    const closeButton = screen.getByText('×');
    await user.click(closeButton);
    
    expect(onClose).toHaveBeenCalled();
  });

  it('closes modal when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<BulkEditModal {...defaultProps} onClose={onClose} />);
    
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    
    expect(onClose).toHaveBeenCalled();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<BulkEditModal {...defaultProps} />);
    
    // Select name field but don't enter value
    const nameCheckbox = screen.getByLabelText('Name');
    await user.click(nameCheckbox);
    
    const previewButton = screen.getByText('Preview Changes');
    await user.click(previewButton);
    
    // Form should not submit without required field
    expect(screen.queryByText('Confirm Bulk Edit')).not.toBeInTheDocument();
  });

  it('handles multiple field updates', async () => {
    const user = userEvent.setup();
    const onBulkEdit = vi.fn().mockResolvedValue(undefined);
    
    render(<BulkEditModal {...defaultProps} onBulkEdit={onBulkEdit} />);
    
    // Select multiple fields
    await user.click(screen.getByLabelText('Name'));
    await user.click(screen.getByLabelText('Color'));
    await user.click(screen.getByLabelText('Status'));
    
    // Fill in values
    await user.type(screen.getByPlaceholderText('New habit name'), 'Multi Update');
    
    const statusSelect = screen.getByDisplayValue('active');
    await user.selectOptions(statusSelect, 'inactive');
    
    // Submit form
    await user.click(screen.getByText('Preview Changes'));
    await user.click(screen.getByText('Confirm Changes'));
    
    await waitFor(() => {
      expect(onBulkEdit).toHaveBeenCalledWith({
        name: 'Multi Update',
        color: '#3b82f6', // Default color
        isActive: false
      });
    });
  });

  it('shows loading state during bulk edit', async () => {
    const user = userEvent.setup();
    const onBulkEdit = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<BulkEditModal {...defaultProps} onBulkEdit={onBulkEdit} isLoading={true} />);
    
    // Select field and submit
    await user.click(screen.getByLabelText('Name'));
    await user.type(screen.getByPlaceholderText('New habit name'), 'Loading Test');
    await user.click(screen.getByText('Preview Changes'));
    
    // Should show loading state in confirmation
    expect(screen.getByText('Updating...')).toBeInTheDocument();
  });

  it('resets form when modal is closed and reopened', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<BulkEditModal {...defaultProps} />);
    
    // Make some changes
    await user.click(screen.getByLabelText('Name'));
    await user.type(screen.getByPlaceholderText('New habit name'), 'Test');
    
    // Close modal
    rerender(<BulkEditModal {...defaultProps} isOpen={false} />);
    
    // Reopen modal
    rerender(<BulkEditModal {...defaultProps} isOpen={true} />);
    
    // Form should be reset
    expect(screen.getByText('Preview Changes')).toBeDisabled();
    expect(screen.queryByPlaceholderText('New habit name')).not.toBeInTheDocument();
  });
});