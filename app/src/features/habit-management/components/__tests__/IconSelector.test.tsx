import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { IconSelector } from '../IconSelector';

describe('IconSelector', () => {
  const mockOnIconSelect = vi.fn();
  
  const defaultProps = {
    selectedIcon: null,
    onIconSelect: mockOnIconSelect,
    disabled: false,
    size: 'medium' as const
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render search input and category select', () => {
      render(<IconSelector {...defaultProps} />);
      
      expect(screen.getByPlaceholderText('Search icons...')).toBeInTheDocument();
      expect(screen.getByDisplayValue('All Categories')).toBeInTheDocument();
    });

    it('should render icon grid with icons', () => {
      render(<IconSelector {...defaultProps} />);
      
      const iconGrid = screen.getByRole('button', { name: /Heart/i });
      expect(iconGrid).toBeInTheDocument();
    });

    it('should show icon count', () => {
      render(<IconSelector {...defaultProps} />);
      
      expect(screen.getByText(/\d+ of \d+ icons/)).toBeInTheDocument();
    });
  });

  describe('Icon Selection', () => {
    it('should call onIconSelect when an icon is clicked', async () => {
      const user = userEvent.setup();
      render(<IconSelector {...defaultProps} />);
      
      const heartIcon = screen.getByTitle('Heart');
      await user.click(heartIcon);
      
      expect(mockOnIconSelect).toHaveBeenCalledWith('heart');
    });

    it('should show selected icon in preview when an icon is selected', () => {
      render(<IconSelector {...defaultProps} selectedIcon="heart" />);
      
      expect(screen.getByText('Selected:')).toBeInTheDocument();
      expect(screen.getByText('Heart')).toBeInTheDocument();
    });

    it('should deselect icon when clicking selected icon again', async () => {
      const user = userEvent.setup();
      render(<IconSelector {...defaultProps} selectedIcon="heart" />);
      
      const heartIcon = screen.getByTitle('Heart');
      await user.click(heartIcon);
      
      expect(mockOnIconSelect).toHaveBeenCalledWith(null);
    });

    it('should clear selection when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(<IconSelector {...defaultProps} selectedIcon="heart" />);
      
      const clearButton = screen.getByTitle('Clear selection');
      await user.click(clearButton);
      
      expect(mockOnIconSelect).toHaveBeenCalledWith(null);
    });
  });

  describe('Search Functionality', () => {
    it('should filter icons by name', async () => {
      const user = userEvent.setup();
      render(<IconSelector {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search icons...');
      await user.type(searchInput, 'heart');
      
      expect(screen.getByTitle('Heart')).toBeInTheDocument();
      expect(screen.queryByTitle('Brain')).not.toBeInTheDocument();
    });

    it('should filter icons by category', async () => {
      const user = userEvent.setup();
      render(<IconSelector {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search icons...');
      await user.type(searchInput, 'health');
      
      // Should show health category icons
      expect(screen.getByTitle('Heart')).toBeInTheDocument();
      expect(screen.getByTitle('Water Drop')).toBeInTheDocument();
    });

    it('should be case insensitive', async () => {
      const user = userEvent.setup();
      render(<IconSelector {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search icons...');
      await user.type(searchInput, 'HEART');
      
      expect(screen.getByTitle('Heart')).toBeInTheDocument();
    });

    it('should update icon count when search filters results', async () => {
      const user = userEvent.setup();
      render(<IconSelector {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search icons...');
      await user.type(searchInput, 'heart');
      
      expect(screen.getByText(/1 of \d+ icons matching "heart"/)).toBeInTheDocument();
    });
  });

  describe('Category Filtering', () => {
    it('should filter icons by category', async () => {
      const user = userEvent.setup();
      render(<IconSelector {...defaultProps} />);
      
      const categorySelect = screen.getByDisplayValue('All Categories');
      await user.selectOptions(categorySelect, 'Health & Fitness');
      
      expect(screen.getByTitle('Heart')).toBeInTheDocument();
      expect(screen.getByTitle('Water Drop')).toBeInTheDocument();
      expect(screen.queryByTitle('Book')).not.toBeInTheDocument();
    });

    it('should show all icons when "All Categories" is selected', async () => {
      const user = userEvent.setup();
      render(<IconSelector {...defaultProps} />);
      
      // First select a specific category
      const categorySelect = screen.getByDisplayValue('All Categories');
      await user.selectOptions(categorySelect, 'Health & Fitness');
      
      // Then select all categories
      await user.selectOptions(categorySelect, 'All Categories');
      
      expect(screen.getByTitle('Heart')).toBeInTheDocument();
      expect(screen.getByTitle('Book')).toBeInTheDocument();
      expect(screen.getByTitle('Laptop')).toBeInTheDocument();
    });
  });

  describe('Combined Search and Category Filtering', () => {
    it('should apply both search and category filters', async () => {
      const user = userEvent.setup();
      render(<IconSelector {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search icons...');
      const categorySelect = screen.getByDisplayValue('All Categories');
      
      await user.type(searchInput, 'w');
      await user.selectOptions(categorySelect, 'Health & Fitness');
      
      expect(screen.getByTitle('Water Drop')).toBeInTheDocument();
      expect(screen.queryByTitle('Work')).not.toBeInTheDocument(); // Work is not in Health category
    });
  });

  describe('No Results State', () => {
    it('should show no results message when search returns no matches', async () => {
      const user = userEvent.setup();
      render(<IconSelector {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search icons...');
      await user.type(searchInput, 'nonexistenticon');
      
      expect(screen.getByText('No icons found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search or category filter')).toBeInTheDocument();
    });

    it('should show no results when category filter returns no matches', async () => {
      const user = userEvent.setup();
      render(<IconSelector {...defaultProps} />);
      
      // This might happen if we add categories without icons in the future
      const searchInput = screen.getByPlaceholderText('Search icons...');
      await user.type(searchInput, 'xyz123impossible');
      
      expect(screen.getByText('No icons found')).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should disable all interactive elements when disabled', () => {
      render(<IconSelector {...defaultProps} disabled={true} />);
      
      expect(screen.getByPlaceholderText('Search icons...')).toBeDisabled();
      expect(screen.getByDisplayValue('All Categories')).toBeDisabled();
      
      const allButtons = screen.getAllByRole('button');
      allButtons.forEach(button => {
        if (button.hasAttribute('data-testid')) {
          expect(button).toBeDisabled();
        }
      });
    });

    it('should disable clear button when disabled', () => {
      render(<IconSelector {...defaultProps} selectedIcon="heart" disabled={true} />);
      
      const clearButton = screen.getByTitle('Clear selection');
      expect(clearButton).toBeDisabled();
    });

    it('should not call onIconSelect when disabled', async () => {
      const user = userEvent.setup();
      render(<IconSelector {...defaultProps} disabled={true} />);
      
      const heartIcon = screen.getByTitle('Heart');
      await user.click(heartIcon);
      
      expect(mockOnIconSelect).not.toHaveBeenCalled();
    });
  });

  describe('Size Variants', () => {
    it('should apply small size class', () => {
      render(<IconSelector {...defaultProps} size="small" />);
      
      const iconSelector = screen.getByPlaceholderText('Search icons...').closest('.iconSelector');
      expect(iconSelector).toHaveClass('small');
    });

    it('should apply large size class', () => {
      render(<IconSelector {...defaultProps} size="large" />);
      
      const iconSelector = screen.getByPlaceholderText('Search icons...').closest('.iconSelector');
      expect(iconSelector).toHaveClass('large');
    });

    it('should apply medium size by default', () => {
      render(<IconSelector {...defaultProps} />);
      
      const iconSelector = screen.getByPlaceholderText('Search icons...').closest('.iconSelector');
      expect(iconSelector).not.toHaveClass('small');
      expect(iconSelector).not.toHaveClass('large');
    });
  });

  describe('Custom CSS Classes', () => {
    it('should apply custom className', () => {
      render(<IconSelector {...defaultProps} className="custom-class" />);
      
      const iconSelector = screen.getByPlaceholderText('Search icons...').closest('.iconSelector');
      expect(iconSelector).toHaveClass('custom-class');
    });
  });

  describe('Icon Grid Behavior', () => {
    it('should show selected icon with selected styling', () => {
      render(<IconSelector {...defaultProps} selectedIcon="heart" />);
      
      const heartIcon = screen.getByTitle('Heart');
      expect(heartIcon).toHaveClass('selected');
    });

    it('should not show selected styling for non-selected icons', () => {
      render(<IconSelector {...defaultProps} selectedIcon="heart" />);
      
      const brainIcon = screen.getByTitle('Brain');
      expect(brainIcon).not.toHaveClass('selected');
    });

    it('should render SVG icons correctly', () => {
      render(<IconSelector {...defaultProps} />);
      
      const heartIcon = screen.getByTitle('Heart');
      const svgElement = heartIcon.querySelector('svg');
      expect(svgElement).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<IconSelector {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search icons...');
      expect(searchInput).toHaveAttribute('type', 'text');
    });

    it('should have proper button roles for icons', () => {
      render(<IconSelector {...defaultProps} />);
      
      const heartIcon = screen.getByTitle('Heart');
      expect(heartIcon).toHaveAttribute('type', 'button');
    });

    it('should have proper titles for icons', () => {
      render(<IconSelector {...defaultProps} />);
      
      expect(screen.getByTitle('Heart')).toBeInTheDocument();
      expect(screen.getByTitle('Brain')).toBeInTheDocument();
      expect(screen.getByTitle('Book')).toBeInTheDocument();
    });
  });

  describe('Icon Library Content', () => {
    it('should include health category icons', () => {
      render(<IconSelector {...defaultProps} />);
      
      expect(screen.getByTitle('Heart')).toBeInTheDocument();
      expect(screen.getByTitle('Water Drop')).toBeInTheDocument();
      expect(screen.getByTitle('Running')).toBeInTheDocument();
      expect(screen.getByTitle('Meditation')).toBeInTheDocument();
    });

    it('should include learning category icons', () => {
      render(<IconSelector {...defaultProps} />);
      
      expect(screen.getByTitle('Book')).toBeInTheDocument();
      expect(screen.getByTitle('Brain')).toBeInTheDocument();
      expect(screen.getByTitle('Language')).toBeInTheDocument();
    });

    it('should include work category icons', () => {
      render(<IconSelector {...defaultProps} />);
      
      expect(screen.getByTitle('Laptop')).toBeInTheDocument();
      expect(screen.getByTitle('Checklist')).toBeInTheDocument();
      expect(screen.getByTitle('Clock')).toBeInTheDocument();
    });

    it('should include lifestyle category icons', () => {
      render(<IconSelector {...defaultProps} />);
      
      expect(screen.getByTitle('Home')).toBeInTheDocument();
      expect(screen.getByTitle('Music')).toBeInTheDocument();
      expect(screen.getByTitle('Coffee')).toBeInTheDocument();
    });
  });
});