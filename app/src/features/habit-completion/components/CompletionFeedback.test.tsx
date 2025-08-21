import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../test/test-utils';
import { CompletionFeedback } from './CompletionFeedback';

describe('CompletionFeedback Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders success feedback with correct message', () => {
    render(
      <CompletionFeedback 
        type="success" 
        message="Habit completed successfully!" 
      />
    );
    
    expect(screen.getByText('Habit completed successfully!')).toBeInTheDocument();
    expect(screen.getByRole('generic')).toHaveClass('success');
  });

  it('renders error feedback with correct message', () => {
    render(
      <CompletionFeedback 
        type="error" 
        message="Failed to complete habit" 
      />
    );
    
    expect(screen.getByText('Failed to complete habit')).toBeInTheDocument();
    expect(screen.getByRole('generic')).toHaveClass('error');
  });

  it('renders offline feedback with correct message', () => {
    render(
      <CompletionFeedback 
        type="offline" 
        message="Saved locally - will sync when online" 
      />
    );
    
    expect(screen.getByText('Saved locally - will sync when online')).toBeInTheDocument();
    expect(screen.getByRole('generic')).toHaveClass('offline');
  });

  it('shows habit name when provided', () => {
    render(
      <CompletionFeedback 
        type="success" 
        message="Completed!" 
        habitName="Morning Exercise"
      />
    );
    
    expect(screen.getByText('Morning Exercise')).toBeInTheDocument();
  });

  it('does not show habit name when not provided', () => {
    render(
      <CompletionFeedback 
        type="success" 
        message="Completed!" 
      />
    );
    
    // Should not have any habit name element
    const habitNameElement = screen.queryByText('Morning Exercise');
    expect(habitNameElement).not.toBeInTheDocument();
  });

  it('shows streak when provided and greater than 0', () => {
    render(
      <CompletionFeedback 
        type="success" 
        message="Great job!" 
        streak={7}
      />
    );
    
    expect(screen.getByText('🔥')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('does not show streak when 0', () => {
    render(
      <CompletionFeedback 
        type="success" 
        message="Great job!" 
        streak={0}
      />
    );
    
    expect(screen.queryByText('🔥')).not.toBeInTheDocument();
  });

  it('does not show streak when not provided', () => {
    render(
      <CompletionFeedback 
        type="success" 
        message="Great job!" 
      />
    );
    
    expect(screen.queryByText('🔥')).not.toBeInTheDocument();
  });

  it('shows particles animation for success type', () => {
    const { container } = render(
      <CompletionFeedback 
        type="success" 
        message="Success!" 
      />
    );
    
    const particles = container.querySelector('.particles');
    expect(particles).toBeInTheDocument();
    
    const particleElements = container.querySelectorAll('.particle');
    expect(particleElements).toHaveLength(8);
  });

  it('does not show particles for error type', () => {
    const { container } = render(
      <CompletionFeedback 
        type="error" 
        message="Error!" 
      />
    );
    
    const particles = container.querySelector('.particles');
    expect(particles).not.toBeInTheDocument();
  });

  it('does not show particles for offline type', () => {
    const { container } = render(
      <CompletionFeedback 
        type="offline" 
        message="Offline!" 
      />
    );
    
    const particles = container.querySelector('.particles');
    expect(particles).not.toBeInTheDocument();
  });

  it('has close button that calls onHide', async () => {
    const mockOnHide = vi.fn();
    
    render(
      <CompletionFeedback 
        type="success" 
        message="Success!" 
        onHide={mockOnHide}
        autoHide={false}
      />
    );
    
    const closeButton = screen.getByRole('button', { name: /close notification/i });
    fireEvent.click(closeButton);
    
    // Wait for hide animation
    vi.advanceTimersByTime(300);
    
    await waitFor(() => {
      expect(mockOnHide).toHaveBeenCalledTimes(1);
    });
  });

  it('auto-hides after specified delay', async () => {
    const mockOnHide = vi.fn();
    
    render(
      <CompletionFeedback 
        type="success" 
        message="Success!" 
        onHide={mockOnHide}
        autoHide={true}
        autoHideDelay={2000}
      />
    );
    
    // Fast-forward to just before auto-hide
    vi.advanceTimersByTime(1999);
    expect(mockOnHide).not.toHaveBeenCalled();
    
    // Fast-forward past auto-hide delay + animation
    vi.advanceTimersByTime(301);
    
    await waitFor(() => {
      expect(mockOnHide).toHaveBeenCalledTimes(1);
    });
  });

  it('does not auto-hide when autoHide is false', async () => {
    const mockOnHide = vi.fn();
    
    render(
      <CompletionFeedback 
        type="success" 
        message="Success!" 
        onHide={mockOnHide}
        autoHide={false}
      />
    );
    
    // Fast-forward a reasonable amount of time
    vi.advanceTimersByTime(5000);
    
    expect(mockOnHide).not.toHaveBeenCalled();
  });

  it('uses default auto-hide delay when not specified', async () => {
    const mockOnHide = vi.fn();
    
    render(
      <CompletionFeedback 
        type="success" 
        message="Success!" 
        onHide={mockOnHide}
      />
    );
    
    // Default should be 3000ms
    vi.advanceTimersByTime(2999);
    expect(mockOnHide).not.toHaveBeenCalled();
    
    vi.advanceTimersByTime(301);
    
    await waitFor(() => {
      expect(mockOnHide).toHaveBeenCalledTimes(1);
    });
  });

  it('starts with animating state', () => {
    render(
      <CompletionFeedback 
        type="success" 
        message="Success!" 
      />
    );
    
    expect(screen.getByRole('generic')).toHaveAttribute('data-animating', 'true');
  });

  it('ends animation after 300ms', async () => {
    render(
      <CompletionFeedback 
        type="success" 
        message="Success!" 
      />
    );
    
    vi.advanceTimersByTime(300);
    
    await waitFor(() => {
      expect(screen.getByRole('generic')).toHaveAttribute('data-animating', 'false');
    });
  });

  it('applies custom className', () => {
    render(
      <CompletionFeedback 
        type="success" 
        message="Success!" 
        className="custom-feedback"
      />
    );
    
    expect(screen.getByRole('generic')).toHaveClass('custom-feedback');
  });

  it('shows correct icon for success type', () => {
    render(
      <CompletionFeedback 
        type="success" 
        message="Success!" 
      />
    );
    
    // Success icon should be a checkmark
    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('stroke', 'currentColor');
  });

  it('shows correct icon for error type', () => {
    render(
      <CompletionFeedback 
        type="error" 
        message="Error!" 
      />
    );
    
    // Error icon should be an X
    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('stroke', 'currentColor');
  });

  it('shows correct icon for offline type', () => {
    render(
      <CompletionFeedback 
        type="offline" 
        message="Offline!" 
      />
    );
    
    // Offline icon should be present
    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('stroke', 'currentColor');
  });

  it('removes component from DOM after hide animation', async () => {
    const mockOnHide = vi.fn();
    
    const { container } = render(
      <CompletionFeedback 
        type="success" 
        message="Success!" 
        onHide={mockOnHide}
        autoHide={true}
        autoHideDelay={1000}
      />
    );
    
    expect(container.firstChild).toBeInTheDocument();
    
    // Trigger auto-hide
    vi.advanceTimersByTime(1000);
    
    // Component should be invisible but still in DOM
    await waitFor(() => {
      expect(container.firstChild).not.toBeInTheDocument();
    });
    
    // After hide animation
    vi.advanceTimersByTime(300);
    
    await waitFor(() => {
      expect(mockOnHide).toHaveBeenCalledTimes(1);
    });
  });

  it('cleans up timers on unmount', () => {
    const { unmount } = render(
      <CompletionFeedback 
        type="success" 
        message="Success!" 
      />
    );
    
    // Should not throw when unmounting before timers complete
    expect(() => unmount()).not.toThrow();
  });

  it('has proper accessibility attributes', () => {
    render(
      <CompletionFeedback 
        type="success" 
        message="Great job completing your habit!" 
        habitName="Morning Run"
        streak={5}
      />
    );
    
    // Should have close button with proper label
    const closeButton = screen.getByRole('button', { name: /close notification/i });
    expect(closeButton).toHaveAttribute('aria-label', 'Close notification');
    
    // Content should be accessible
    expect(screen.getByText('Great job completing your habit!')).toBeInTheDocument();
    expect(screen.getByText('Morning Run')).toBeInTheDocument();
  });
});