import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/test-utils';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByRole('presentation', { hidden: true });
    expect(spinner).toHaveClass('spinner', 'medium');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<LoadingSpinner size="small" />);
    let spinner = screen.getByRole('presentation', { hidden: true });
    expect(spinner).toHaveClass('small');

    rerender(<LoadingSpinner size="large" />);
    spinner = screen.getByRole('presentation', { hidden: true });
    expect(spinner).toHaveClass('large');
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-spinner" />);
    
    const spinner = screen.getByRole('presentation', { hidden: true });
    expect(spinner).toHaveClass('custom-spinner');
  });

  it('applies custom color to circle', () => {
    render(<LoadingSpinner color="#ff0000" />);
    
    const circle = document.querySelector('.circle');
    expect(circle).toHaveStyle({ borderTopColor: '#ff0000' });
  });

  it('renders circle element', () => {
    render(<LoadingSpinner />);
    
    const circle = document.querySelector('.circle');
    expect(circle).toBeInTheDocument();
    expect(circle).toHaveClass('circle');
  });
});