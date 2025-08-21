import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../test/test-utils';
import { CompletionCheckbox } from './CompletionCheckbox';
import { useCompletion } from '../hooks/useCompletion';

// Mock the completion hook
vi.mock('../hooks/useCompletion');

const mockUseCompletion = useCompletion as any;

describe('CompletionCheckbox Component', () => {
  const defaultProps = {
    habitId: 1,
    habitName: 'Daily Exercise',
    habitColor: '#4F46E5',
    date: '2024-01-15'
  };

  const defaultHookReturn = {
    isCompleted: false,
    isOptimistic: false,
    isToggling: false,
    currentStreak: 0,
    toggleCompletion: vi.fn()
  };

  beforeEach(() => {
    mockUseCompletion.mockReturnValue(defaultHookReturn);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('renders uncompleted checkbox by default', () => {
    render(<CompletionCheckbox {...defaultProps} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
    expect(checkbox).toHaveAttribute('aria-label', 'Mark Daily Exercise as complete');
  });

  it('renders completed checkbox when isCompleted is true', () => {
    mockUseCompletion.mockReturnValue({
      ...defaultHookReturn,
      isCompleted: true
    });

    render(<CompletionCheckbox {...defaultProps} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
    expect(checkbox).toHaveAttribute('aria-label', 'Mark Daily Exercise as incomplete');
    
    // Check if checkmark icon is visible
    const checkmark = screen.getByRole('img', { hidden: true });
    expect(checkmark).toBeInTheDocument();
  });

  it('calls toggleCompletion when clicked', async () => {
    const mockToggleCompletion = vi.fn().mockResolvedValue({});
    mockUseCompletion.mockReturnValue({
      ...defaultHookReturn,
      toggleCompletion: mockToggleCompletion
    });

    render(<CompletionCheckbox {...defaultProps} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    await waitFor(() => {
      expect(mockToggleCompletion).toHaveBeenCalledTimes(1);
    });
  });

  it('prevents multiple clicks when toggling', async () => {
    const mockToggleCompletion = vi.fn().mockResolvedValue({});
    mockUseCompletion.mockReturnValue({
      ...defaultHookReturn,
      isToggling: true,
      toggleCompletion: mockToggleCompletion
    });

    render(<CompletionCheckbox {...defaultProps} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
    
    fireEvent.click(checkbox);
    expect(mockToggleCompletion).not.toHaveBeenCalled();
  });

  it('shows loading spinner when toggling', () => {
    mockUseCompletion.mockReturnValue({
      ...defaultHookReturn,
      isToggling: true
    });

    render(<CompletionCheckbox {...defaultProps} />);
    
    const spinner = screen.getByRole('progressbar');
    expect(spinner).toBeInTheDocument();
  });

  it('handles keyboard events (Enter and Space)', async () => {
    const mockToggleCompletion = vi.fn().mockResolvedValue({});
    mockUseCompletion.mockReturnValue({
      ...defaultHookReturn,
      toggleCompletion: mockToggleCompletion
    });

    render(<CompletionCheckbox {...defaultProps} />);
    
    const checkbox = screen.getByRole('checkbox');
    
    // Test Enter key
    fireEvent.keyDown(checkbox, { key: 'Enter' });
    await waitFor(() => {
      expect(mockToggleCompletion).toHaveBeenCalledTimes(1);
    });

    // Test Space key
    fireEvent.keyDown(checkbox, { key: ' ' });
    await waitFor(() => {
      expect(mockToggleCompletion).toHaveBeenCalledTimes(2);
    });
  });

  it('ignores other keyboard events', async () => {
    const mockToggleCompletion = vi.fn().mockResolvedValue({});
    mockUseCompletion.mockReturnValue({
      ...defaultHookReturn,
      toggleCompletion: mockToggleCompletion
    });

    render(<CompletionCheckbox {...defaultProps} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.keyDown(checkbox, { key: 'Tab' });
    fireEvent.keyDown(checkbox, { key: 'Escape' });
    
    expect(mockToggleCompletion).not.toHaveBeenCalled();
  });

  it('shows streak badge when showStreak is true and streak exists', () => {
    mockUseCompletion.mockReturnValue({
      ...defaultHookReturn,
      currentStreak: 5
    });

    render(<CompletionCheckbox {...defaultProps} showStreak={true} />);
    
    expect(screen.getByText('🔥')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('hides streak badge when showStreak is false', () => {
    mockUseCompletion.mockReturnValue({
      ...defaultHookReturn,
      currentStreak: 5
    });

    render(<CompletionCheckbox {...defaultProps} showStreak={false} />);
    
    expect(screen.queryByText('🔥')).not.toBeInTheDocument();
    expect(screen.queryByText('5')).not.toBeInTheDocument();
  });

  it('hides streak badge when streak is zero', () => {
    mockUseCompletion.mockReturnValue({
      ...defaultHookReturn,
      currentStreak: 0
    });

    render(<CompletionCheckbox {...defaultProps} showStreak={true} />);
    
    expect(screen.queryByText('🔥')).not.toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<CompletionCheckbox {...defaultProps} size="small" />);
    expect(screen.getByRole('checkbox').closest('div')).toHaveClass('small');

    rerender(<CompletionCheckbox {...defaultProps} size="large" />);
    expect(screen.getByRole('checkbox').closest('div')).toHaveClass('large');

    rerender(<CompletionCheckbox {...defaultProps} />);
    expect(screen.getByRole('checkbox').closest('div')).toHaveClass('medium');
  });

  it('applies custom className', () => {
    render(<CompletionCheckbox {...defaultProps} className="custom-class" />);
    
    expect(screen.getByRole('checkbox').closest('div')).toHaveClass('custom-class');
  });

  it('applies habit color as CSS custom property', () => {
    render(<CompletionCheckbox {...defaultProps} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveStyle({ '--habit-color': '#4F46E5' });
  });

  it('sets correct data attributes', () => {
    mockUseCompletion.mockReturnValue({
      ...defaultHookReturn,
      isCompleted: true,
      isOptimistic: true
    });

    render(<CompletionCheckbox {...defaultProps} />);
    
    const container = screen.getByRole('checkbox').closest('div');
    expect(container).toHaveAttribute('data-completed', 'true');
    expect(container).toHaveAttribute('data-optimistic', 'true');
  });

  it('calls onToggle callback when provided', async () => {
    const mockOnToggle = vi.fn();
    const mockToggleCompletion = vi.fn().mockResolvedValue({});
    
    mockUseCompletion.mockReturnValue({
      ...defaultHookReturn,
      toggleCompletion: mockToggleCompletion
    });

    // Mock the onToggleSuccess callback being called
    mockUseCompletion.mockImplementation(({ onToggleSuccess }) => {
      const toggleCompletion = vi.fn().mockImplementation(async () => {
        if (onToggleSuccess) {
          onToggleSuccess({ isCompleted: true });
        }
      });
      
      return {
        ...defaultHookReturn,
        toggleCompletion
      };
    });

    render(<CompletionCheckbox {...defaultProps} onToggle={mockOnToggle} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
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
        toggleCompletion
      };
    });

    render(<CompletionCheckbox {...defaultProps} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    await waitFor(() => {
      const container = screen.getByRole('checkbox').closest('div');
      expect(container).toHaveAttribute('data-animating', 'true');
    });

    // Fast-forward timers to end animation
    vi.advanceTimersByTime(600);
    
    await waitFor(() => {
      const container = screen.getByRole('checkbox').closest('div');
      expect(container).toHaveAttribute('data-animating', 'false');
    });
    
    vi.useRealTimers();
  });

  it('handles toggle completion errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockToggleCompletion = vi.fn().mockRejectedValue(new Error('Network error'));
    
    mockUseCompletion.mockReturnValue({
      ...defaultHookReturn,
      toggleCompletion: mockToggleCompletion
    });

    render(<CompletionCheckbox {...defaultProps} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to toggle completion:', expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });

  it('uses current date when no date prop provided', () => {
    const { habitId, habitName, habitColor } = defaultProps;
    
    render(
      <CompletionCheckbox 
        habitId={habitId}
        habitName={habitName}
        habitColor={habitColor}
      />
    );
    
    const today = new Date().toISOString().split('T')[0];
    expect(mockUseCompletion).toHaveBeenCalledWith(
      expect.objectContaining({
        habitId,
        date: today
      })
    );
  });

  it('prevents event propagation and default behavior', async () => {
    const mockToggleCompletion = vi.fn().mockResolvedValue({});
    mockUseCompletion.mockReturnValue({
      ...defaultHookReturn,
      toggleCompletion: mockToggleCompletion
    });

    const mockStopPropagation = vi.fn();
    const mockPreventDefault = vi.fn();

    render(<CompletionCheckbox {...defaultProps} />);
    
    const checkbox = screen.getByRole('checkbox');
    const clickEvent = {
      preventDefault: mockPreventDefault,
      stopPropagation: mockStopPropagation
    } as any;
    
    fireEvent.click(checkbox, clickEvent);
    
    expect(mockPreventDefault).toHaveBeenCalled();
    expect(mockStopPropagation).toHaveBeenCalled();
  });
});