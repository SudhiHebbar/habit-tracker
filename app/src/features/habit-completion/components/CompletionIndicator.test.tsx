import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test/test-utils';
import { CompletionIndicator } from './CompletionIndicator';

describe('CompletionIndicator Component', () => {
  it('renders incomplete state by default', () => {
    render(<CompletionIndicator isCompleted={false} />);
    
    const indicator = screen.getByRole('generic');
    expect(indicator).toHaveAttribute('data-completed', 'false');
    expect(indicator).toHaveAttribute('data-optimistic', 'false');
    
    // Should not show checkmark when incomplete
    expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument();
  });

  it('renders completed state with checkmark', () => {
    render(<CompletionIndicator isCompleted={true} />);
    
    const indicator = screen.getByRole('generic');
    expect(indicator).toHaveAttribute('data-completed', 'true');
    
    // Should show checkmark when completed
    const checkmark = screen.getByRole('img', { hidden: true });
    expect(checkmark).toBeInTheDocument();
  });

  it('shows optimistic state when specified', () => {
    render(<CompletionIndicator isCompleted={true} isOptimistic={true} />);
    
    const indicator = screen.getByRole('generic');
    expect(indicator).toHaveAttribute('data-optimistic', 'true');
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<CompletionIndicator isCompleted={false} size="small" />);
    expect(screen.getByRole('generic')).toHaveClass('small');

    rerender(<CompletionIndicator isCompleted={false} size="large" />);
    expect(screen.getByRole('generic')).toHaveClass('large');

    rerender(<CompletionIndicator isCompleted={false} />);
    expect(screen.getByRole('generic')).toHaveClass('medium');
  });

  it('applies custom color as CSS variable', () => {
    render(<CompletionIndicator isCompleted={false} color="#FF6B35" />);
    
    const indicator = screen.getByRole('generic');
    expect(indicator).toHaveStyle({ '--indicator-color': '#FF6B35' });
  });

  it('uses default color when not specified', () => {
    render(<CompletionIndicator isCompleted={false} />);
    
    const indicator = screen.getByRole('generic');
    expect(indicator).toHaveStyle({ '--indicator-color': '#10B981' });
  });

  it('shows completion label when showLabel is true and completed', () => {
    render(<CompletionIndicator isCompleted={true} showLabel={true} />);
    
    expect(screen.getByText('Complete')).toBeInTheDocument();
  });

  it('shows incomplete label when showLabel is true and not completed', () => {
    render(<CompletionIndicator isCompleted={false} showLabel={true} />);
    
    expect(screen.getByText('Incomplete')).toBeInTheDocument();
  });

  it('does not show label when showLabel is false', () => {
    render(<CompletionIndicator isCompleted={true} showLabel={false} />);
    
    expect(screen.queryByText('Complete')).not.toBeInTheDocument();
    expect(screen.queryByText('Incomplete')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<CompletionIndicator isCompleted={false} className="custom-indicator" />);
    
    expect(screen.getByRole('generic')).toHaveClass('custom-indicator');
  });

  it('has correct structure with dot and optional label', () => {
    const { container } = render(
      <CompletionIndicator isCompleted={true} showLabel={true} />
    );
    
    const indicator = container.firstChild as HTMLElement;
    expect(indicator).toHaveClass('indicator');
    
    const dot = container.querySelector('.dot');
    expect(dot).toBeInTheDocument();
    
    const label = container.querySelector('.label');
    expect(label).toBeInTheDocument();
    expect(label).toHaveTextContent('Complete');
  });

  it('checkmark has correct SVG attributes', () => {
    render(<CompletionIndicator isCompleted={true} />);
    
    const svg = screen.getByRole('img', { hidden: true });
    expect(svg).toHaveAttribute('viewBox', '0 0 12 12');
    expect(svg).toHaveAttribute('fill', 'none');
    expect(svg).toHaveAttribute('stroke', 'currentColor');
    expect(svg).toHaveAttribute('stroke-width', '2');
  });

  it('handles state transitions correctly', () => {
    const { rerender } = render(<CompletionIndicator isCompleted={false} />);
    
    expect(screen.getByRole('generic')).toHaveAttribute('data-completed', 'false');
    expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument();
    
    rerender(<CompletionIndicator isCompleted={true} />);
    
    expect(screen.getByRole('generic')).toHaveAttribute('data-completed', 'true');
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('handles optimistic state transitions', () => {
    const { rerender } = render(<CompletionIndicator isCompleted={false} isOptimistic={false} />);
    
    expect(screen.getByRole('generic')).toHaveAttribute('data-optimistic', 'false');
    
    rerender(<CompletionIndicator isCompleted={true} isOptimistic={true} />);
    
    expect(screen.getByRole('generic')).toHaveAttribute('data-optimistic', 'true');
  });

  it('maintains accessibility structure', () => {
    const { container } = render(<CompletionIndicator isCompleted={true} showLabel={true} />);
    
    // Should have meaningful structure for screen readers
    const indicator = screen.getByRole('generic');
    expect(indicator).toBeInTheDocument();
    
    // Label should be present and readable
    const label = screen.getByText('Complete');
    expect(label).toBeInTheDocument();
  });
});