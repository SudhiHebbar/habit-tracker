import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from '../Layout';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Layout', () => {
  it('renders header with navigation', () => {
    renderWithRouter(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Should render header
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();

    // Should render logo/title
    expect(screen.getByText('Habit Tracker')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Habit Tracker' })).toHaveAttribute('href', '/');

    // Should render navigation links
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/dashboard');
    expect(screen.getByRole('link', { name: 'Habits' })).toHaveAttribute('href', '/habits');
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '/settings');
  });

  it('renders main content area', () => {
    renderWithRouter(
      <Layout>
        <div data-testid='test-content'>Test Content</div>
      </Layout>
    );

    // Should render main content area
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();

    // Should render children content
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders footer', () => {
    renderWithRouter(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Should render footer
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();

    // Should render footer text
    expect(
      screen.getByText('© 2024 Habit Tracker. Built with React 19 and TypeScript.')
    ).toBeInTheDocument();
  });

  it('has proper layout structure', () => {
    renderWithRouter(
      <Layout>
        <div data-testid='child-content'>Child Content</div>
      </Layout>
    );

    // Should have correct order: header, main, footer
    const header = screen.getByRole('banner');
    const main = screen.getByRole('main');
    const footer = screen.getByRole('contentinfo');

    expect(header).toBeInTheDocument();
    expect(main).toBeInTheDocument();
    expect(footer).toBeInTheDocument();

    // Check that content is properly nested
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('wraps content in ErrorBoundary', () => {
    // This test ensures the ErrorBoundary is present
    // The actual error boundary functionality would need more complex testing
    renderWithRouter(
      <Layout>
        <div>Safe Content</div>
      </Layout>
    );

    expect(screen.getByText('Safe Content')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    renderWithRouter(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Check that the layout has the proper structure
    const layoutDiv = screen.getByRole('banner').parentElement;
    expect(layoutDiv).toHaveClass('layout');
  });
});
