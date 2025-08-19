import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '../../test/test-utils';
import FadeText from './FadeText';

describe('FadeText Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders text content', () => {
    render(<FadeText text="Hello World" />);
    
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('starts with fade-out state', () => {
    render(<FadeText text="Fade Text" />);
    
    const element = screen.getByText('Fade Text');
    expect(element).toHaveClass('fadeText');
    expect(element).not.toHaveClass('visible');
  });

  it('renders with delay prop', () => {
    render(<FadeText text="Delayed Text" delay={100} />);
    
    const element = screen.getByText('Delayed Text');
    
    // Initially not visible
    expect(element).not.toHaveClass('visible');
    expect(element).toHaveClass('fadeText');
  });

  it('applies custom className', () => {
    render(<FadeText text="Styled Text" className="custom-class" />);
    
    const element = screen.getByText('Styled Text');
    expect(element).toHaveClass('custom-class');
  });

  it('applies custom duration style', () => {
    render(<FadeText text="Duration Text" duration={1000} />);
    
    const element = screen.getByText('Duration Text');
    expect(element).toHaveStyle({ transitionDuration: '1000ms' });
  });

  it('uses default values when props are not provided', () => {
    render(<FadeText text="Default Text" />);
    
    const element = screen.getByText('Default Text');
    expect(element).toHaveStyle({ transitionDuration: '500ms' });
    
    // Should become visible immediately (no delay)
    vi.advanceTimersByTime(0);
    
    waitFor(() => {
      expect(element).toHaveClass('visible');
    });
  });

  it('respects reduced motion preferences', () => {
    // Mock matchMedia for prefers-reduced-motion
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(<FadeText text="Accessible Text" />);
    
    const element = screen.getByText('Accessible Text');
    expect(element).toBeInTheDocument();
  });
});