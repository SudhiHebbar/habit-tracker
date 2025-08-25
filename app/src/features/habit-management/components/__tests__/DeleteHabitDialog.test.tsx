import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { DeleteHabitDialog } from '../DeleteHabitDialog';
import type { Habit } from '../../types/habit.types';

// Mock the useDeleteHabit hook
vi.mock('../../hooks/useDeleteHabit', () => ({
  useDeleteHabit: () => ({
    getDeletionImpact: vi.fn().mockResolvedValue({
      habitId: 1,
      habitName: 'Test Habit',
      color: '#6366f1',
      totalCompletions: 25,
      currentStreak: 5,
      daysOfHistory: 30,
      impactSeverity: 'Medium',
      impactWarnings: ['This will break a current streak of 5 days'],
      longestStreak: 10,
      completionsLast7Days: 5,
      completionsLast30Days: 20,
      willPreserveHistory: true,
      habitCreatedAt: '2024-01-01T00:00:00Z',
      targetFrequency: 'Daily',
      targetCount: 1,
    }),
    deleteHabitWithConfirmation: vi.fn().mockResolvedValue({
      message: 'Habit deleted successfully',
      deletedAt: new Date().toISOString(),
      canUndo: true,
      undoTimeoutSeconds: 300,
    }),
    loading: false,
    error: null,
    clearError: vi.fn(),
  }),
}));

describe('DeleteHabitDialog', () => {
  const mockHabit: Habit = {
    id: 1,
    trackerId: 1,
    name: 'Test Habit',
    description: 'A test habit for deletion',
    targetFrequency: 'Daily',
    targetCount: 1,
    color: '#6366f1',
    icon: '💪',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isActive: true,
    displayOrder: 0,
    completionsThisWeek: 5,
    completionsThisMonth: 20,
    currentStreak: 5,
    longestStreak: 10,
  };

  const defaultProps = {
    isOpen: true,
    habit: mockHabit,
    onClose: vi.fn(),
    onDeleted: vi.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders delete confirmation dialog when open', () => {
    render(<DeleteHabitDialog {...defaultProps} />);

    expect(screen.getByRole('heading', { name: /delete habit/i })).toBeInTheDocument();
    expect(screen.getByText('Test Habit')).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to delete this habit/i)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<DeleteHabitDialog {...defaultProps} isOpen={false} />);

    expect(screen.queryByRole('heading', { name: /delete habit/i })).not.toBeInTheDocument();
  });

  it('does not render when habit is null', () => {
    render(<DeleteHabitDialog {...defaultProps} habit={null} />);

    expect(screen.queryByRole('heading', { name: /delete habit/i })).not.toBeInTheDocument();
  });

  it('allows user to enter deletion reason', async () => {
    render(<DeleteHabitDialog {...defaultProps} />);

    const reasonTextarea = screen.getByLabelText(/reason for deletion/i);
    expect(reasonTextarea).toBeInTheDocument();

    await fireEvent.change(reasonTextarea, { target: { value: 'No longer needed' } });
    expect(reasonTextarea).toHaveValue('No longer needed');
  });

  it('shows character count for deletion reason', async () => {
    render(<DeleteHabitDialog {...defaultProps} />);

    const reasonTextarea = screen.getByLabelText(/reason for deletion/i);
    await fireEvent.change(reasonTextarea, { target: { value: 'Test reason' } });

    expect(screen.getByText('11/200')).toBeInTheDocument();
  });

  it('proceeds to impact step when continue is clicked', async () => {
    render(<DeleteHabitDialog {...defaultProps} />);

    const continueButton = screen.getByRole('button', { name: /continue/i });
    await fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText(/deletion impact/i)).toBeInTheDocument();
    });
  });

  it('shows loading state while analyzing impact', async () => {
    render(<DeleteHabitDialog {...defaultProps} />);

    const continueButton = screen.getByRole('button', { name: /continue/i });
    await fireEvent.click(continueButton);

    expect(screen.getByText(/analyzing deletion impact/i)).toBeInTheDocument();
  });

  it('displays impact analysis results', async () => {
    render(<DeleteHabitDialog {...defaultProps} />);

    // Go to impact step
    const continueButton = screen.getByRole('button', { name: /continue/i });
    await fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText('25')).toBeInTheDocument(); // Total completions
      expect(screen.getByText('5')).toBeInTheDocument(); // Current streak
      expect(screen.getByText('30')).toBeInTheDocument(); // Days of history
      expect(screen.getByText('Medium Impact')).toBeInTheDocument();
      expect(screen.getByText(/this will break a current streak of 5 days/i)).toBeInTheDocument();
    });
  });

  it('shows detailed impact when requested', async () => {
    render(<DeleteHabitDialog {...defaultProps} />);

    // Navigate to impact step
    const continueButton = screen.getByRole('button', { name: /continue/i });
    await fireEvent.click(continueButton);

    await waitFor(() => {
      const detailsToggle = screen.getByRole('button', { name: /show detailed impact/i });
      fireEvent.click(detailsToggle);
    });

    await waitFor(() => {
      expect(screen.getByText(/last 7 days/i)).toBeInTheDocument();
      expect(screen.getByText(/last 30 days/i)).toBeInTheDocument();
      expect(screen.getByText(/longest streak/i)).toBeInTheDocument();
    });
  });

  it('calls onClose when cancel is clicked', async () => {
    const onClose = vi.fn();
    render(<DeleteHabitDialog {...defaultProps} onClose={onClose} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await fireEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onDeleted when deletion is confirmed', async () => {
    const onDeleted = vi.fn();
    render(<DeleteHabitDialog {...defaultProps} onDeleted={onDeleted} />);

    // Navigate to impact step
    const continueButton = screen.getByRole('button', { name: /continue/i });
    await fireEvent.click(continueButton);

    // Wait for impact to load and confirm deletion
    await waitFor(() => {
      const deleteButton = screen.getByRole('button', { name: /delete habit/i });
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(onDeleted).toHaveBeenCalledWith(1);
    });
  });

  it('prevents closing during deletion process', async () => {
    const onClose = vi.fn();
    render(<DeleteHabitDialog {...defaultProps} onClose={onClose} />);

    // Navigate to impact step and start deletion
    const continueButton = screen.getByRole('button', { name: /continue/i });
    await fireEvent.click(continueButton);

    await waitFor(() => {
      const deleteButton = screen.getByRole('button', { name: /delete habit/i });
      fireEvent.click(deleteButton);
    });

    // Try to close during deletion
    const overlay =
      screen.getByTestId('modal-overlay') ||
      document.querySelector('[data-testid="modal-overlay"]');
    if (overlay) {
      await fireEvent.click(overlay);
    }

    // onClose should not be called during deletion
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows preservation note', async () => {
    render(<DeleteHabitDialog {...defaultProps} />);

    const continueButton = screen.getByRole('button', { name: /continue/i });
    await fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText(/your completion history will be preserved/i)).toBeInTheDocument();
    });
  });

  it('displays habit color indicator', () => {
    render(<DeleteHabitDialog {...defaultProps} />);

    const colorIndicator = document.querySelector('[style*="background-color: rgb(99, 102, 241)"]');
    expect(colorIndicator).toBeInTheDocument();
  });
});
