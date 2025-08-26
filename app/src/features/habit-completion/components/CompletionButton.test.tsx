import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../test/test-utils';
import { CompletionButton } from './CompletionButton';
import { useCompletion } from '../hooks/useCompletion';

// Mock the completion hook
vi.mock('../hooks/useCompletion');

const mockUseCompletion = useCompletion as any;

describe('CompletionButton Component', () => {
  const defaultProps = {
    habitId: 1,
    habitName: 'Morning Meditation',
    habitColor: '#10B981',
    habitIcon: '🧘',
    date: '2024-01-15',
  };

  const defaultHookReturn = {
    isCompleted: false,
    isOptimistic: false,
    isToggling: false,
    currentStreak: 0,
    completionRate: 0,
    toggleCompletion: vi.fn(),
  };

  beforeEach(() => {
    mockUseCompletion.mockReturnValue(defaultHookReturn);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('renders uncompleted button by default', () => {
    render(<CompletionButton {...defaultProps} />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Mark Morning Meditation as complete');
    expect(screen.getByText('Morning Meditation')).toBeInTheDocument();
  });

  it('renders completed button when isCompleted is true', () => {
    mockUseCompletion.mockReturnValue({
      ...defaultHookReturn,
      isCompleted: true,
    });

    render(<CompletionButton {...defaultProps} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Mark Morning Meditation as incomplete');
    expect(button).toHaveAttribute('data-completed', 'true');

    // Check if checkmark icon is visible
    const checkmark = screen.getByRole('img', { hidden: true });
    expect(checkmark).toBeInTheDocument();
  });

  it('shows habit icon when provided', () => {
    render(<CompletionButton {...defaultProps} />);

    expect(screen.getByText('🧘')).toBeInTheDocument();
  });

  it('does not show icon when not provided', () => {
    const { habitIcon, ...propsWithoutIcon } = defaultProps;
    render(<CompletionButton {...propsWithoutIcon} />);

    expect(screen.queryByText('🧘')).not.toBeInTheDocument();
  });

  it('calls toggleCompletion when clicked', async () => {
    const mockToggleCompletion = vi.fn().mockResolvedValue({});
    mockUseCompletion.mockReturnValue({
      ...defaultHookReturn,
      toggleCompletion: mockToggleCompletion,
    });

    render(<CompletionButton {...defaultProps} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockToggleCompletion).toHaveBeenCalledTimes(1);
    });
  });

  it('prevents clicks when toggling', async () => {
    const mockToggleCompletion = vi.fn().mockResolvedValue({});
    mockUseCompletion.mockReturnValue({
      ...defaultHookReturn,
      isToggling: true,
      toggleCompletion: mockToggleCompletion,
    });

    render(<CompletionButton {...defaultProps} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(mockToggleCompletion).not.toHaveBeenCalled();
  });

  it('shows loading overlay when toggling', () => {
    mockUseCompletion.mockReturnValue({
      ...defaultHookReturn,
      isToggling: true,
    });

    render(<CompletionButton {...defaultProps} />);

    const spinner = screen.getByRole('progressbar');
    expect(spinner).toBeInTheDocument();
  });

  it('shows stats when showStats is true', () => {
    mockUseCompletion.mockReturnValue({
      ...defaultHookReturn,
      currentStreak: 7,
      completionRate: 85.5,
    });

    render(<CompletionButton {...defaultProps} showStats />);

    expect(screen.getByText('🔥 7')).toBeInTheDocument();
    expect(screen.getByText('86%')).toBeInTheDocument(); // Rounded
  });

  it('hides stats when showStats is false', () => {
    mockUseCompletion.mockReturnValue({
      ...defaultHookReturn,
      currentStreak: 7,
      completionRate: 85.5,
    });

    render(<CompletionButton {...defaultProps} showStats={false} />);

    expect(screen.queryByText('🔥 7')).not.toBeInTheDocument();
    expect(screen.queryByText('86%')).not.toBeInTheDocument();
  });

  it('only shows streak when it is greater than 0', () => {
    mockUseCompletion.mockReturnValue({
      ...defaultHookReturn,
      currentStreak: 0,
      completionRate: 85.5,
    });

    render(<CompletionButton {...defaultProps} showStats />);

    expect(screen.queryByText('🔥')).not.toBeInTheDocument();
    expect(screen.getByText('86%')).toBeInTheDocument();
  });

  it('only shows completion rate when it is greater than 0', () => {
    mockUseCompletion.mockReturnValue({
      ...defaultHookReturn,
      currentStreak: 5,
      completionRate: 0,
    });

    render(<CompletionButton {...defaultProps} showStats />);

    expect(screen.getByText('🔥 5')).toBeInTheDocument();
    expect(screen.queryByText('%')).not.toBeInTheDocument();
  });

  it('applies correct variant classes', () => {
    const { rerender } = render(<CompletionButton {...defaultProps} variant='card' />);
    expect(screen.getByRole('button')).toHaveClass('card');

    rerender(<CompletionButton {...defaultProps} variant='inline' />);
    expect(screen.getByRole('button')).toHaveClass('inline');

    rerender(<CompletionButton {...defaultProps} />);
    expect(screen.getByRole('button')).toHaveClass('default');
  });

  it('applies custom className', () => {
    render(<CompletionButton {...defaultProps} className='custom-class' />);

    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('applies habit color as CSS custom property', () => {
    render(<CompletionButton {...defaultProps} />);

    const button = screen.getByRole('button');
    expect(button).toHaveStyle({ '--habit-color': '#10B981' });
  });

  it('sets correct data attributes', () => {
    mockUseCompletion.mockReturnValue({
      ...defaultHookReturn,
      isCompleted: true,
      isOptimistic: true,
    });

    render(<CompletionButton {...defaultProps} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-completed', 'true');
    expect(button).toHaveAttribute('data-optimistic', 'true');
  });

  it('shows circle indicator when not completed', () => {
    render(<CompletionButton {...defaultProps} />);

    const circle = screen.getByRole('button').querySelector('.circle');
    expect(circle).toBeInTheDocument();
  });

  it('shows checkmark when completed', () => {
    mockUseCompletion.mockReturnValue({
      ...defaultHookReturn,
      isCompleted: true,
    });

    render(<CompletionButton {...defaultProps} />);

    const checkmark = screen.getByRole('img', { hidden: true });
    expect(checkmark).toBeInTheDocument();
  });

  it('calls onToggle callback when provided', async () => {
    const mockOnToggle = vi.fn();

    mockUseCompletion.mockImplementation(({ onToggleSuccess }) => {
      const toggleCompletion = vi.fn().mockImplementation(async () => {
        if (onToggleSuccess) {
          onToggleSuccess({ isCompleted: true });
        }
      });

      return {
        ...defaultHookReturn,
        toggleCompletion,
      };
    });

    render(<CompletionButton {...defaultProps} onToggle={mockOnToggle} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockOnToggle).toHaveBeenCalledWith(true);
    });
  });

  it('shows success animation when completion succeeds', async () => {
    vi.useFakeTimers();

    mockUseCompletion.mockImplementation(({ onToggleSuccess }) => {
      const toggleCompletion = vi.fn().mockImplementation(async () => {
        if (onToggleSuccess) {
          onToggleSuccess({ isCompleted: true });
        }
      });

      return {
        ...defaultHookReturn,
        toggleCompletion,
      };
    });

    render(<CompletionButton {...defaultProps} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveAttribute('data-animating', 'true');
    });

    // Fast-forward timers to end animation
    vi.advanceTimersByTime(600);

    await waitFor(() => {
      expect(button).toHaveAttribute('data-animating', 'false');
    });

    vi.useRealTimers();
  });

  it('handles toggle completion errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockToggleCompletion = vi.fn().mockRejectedValue(new Error('Network error'));

    mockUseCompletion.mockReturnValue({
      ...defaultHookReturn,
      toggleCompletion: mockToggleCompletion,
    });

    render(<CompletionButton {...defaultProps} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to toggle completion:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('uses current date when no date prop provided', () => {
    const { habitId, habitName, habitColor } = defaultProps;

    render(<CompletionButton habitId={habitId} habitName={habitName} habitColor={habitColor} />);

    const today = new Date().toISOString().split('T')[0];
    expect(mockUseCompletion).toHaveBeenCalledWith(
      expect.objectContaining({
        habitId,
        date: today,
      })
    );
  });

  it('rounds completion rate to nearest integer', () => {
    mockUseCompletion.mockReturnValue({
      ...defaultHookReturn,
      completionRate: 67.89,
    });

    render(<CompletionButton {...defaultProps} showStats />);

    expect(screen.getByText('68%')).toBeInTheDocument();
  });

  it('handles zero completion rate correctly', () => {
    mockUseCompletion.mockReturnValue({
      ...defaultHookReturn,
      completionRate: 0.5, // Less than 1 but greater than 0
    });

    render(<CompletionButton {...defaultProps} showStats />);

    expect(screen.getByText('1%')).toBeInTheDocument();
  });

  it('displays success flash animation during success', () => {
    mockUseCompletion.mockReturnValue({
      ...defaultHookReturn,
      isCompleted: true,
    });

    const { container } = render(<CompletionButton {...defaultProps} />);

    const button = screen.getByRole('button');
    button.setAttribute('data-animating', 'true');

    const successFlash = container.querySelector('.successFlash');
    expect(successFlash).toBeInTheDocument();
  });

  it('accessibly handles completion state changes', () => {
    const { rerender } = render(<CompletionButton {...defaultProps} />);

    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Mark Morning Meditation as complete'
    );

    mockUseCompletion.mockReturnValue({
      ...defaultHookReturn,
      isCompleted: true,
    });

    rerender(<CompletionButton {...defaultProps} />);

    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Mark Morning Meditation as incomplete'
    );
  });
});
