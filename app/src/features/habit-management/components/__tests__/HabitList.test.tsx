import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { HabitList } from '../HabitList';
import type { Habit } from '../../types/habit.types';

// Mock HabitCard component
vi.mock('../HabitCard', () => ({
  default: ({ habit, onEdit, onDelete, onToggleComplete, showStats }: any) => (
    <div data-testid={`habit-card-${habit.id}`}>
      <h3>{habit.name}</h3>
      <p>{habit.description}</p>
      <span data-testid='frequency'>{habit.targetFrequency}</span>
      <span data-testid='target-count'>{habit.targetCount}</span>
      {onEdit && (
        <button onClick={() => onEdit(habit)} data-testid={`edit-${habit.id}`}>
          Edit
        </button>
      )}
      {onDelete && (
        <button onClick={() => onDelete(habit)} data-testid={`delete-${habit.id}`}>
          Delete
        </button>
      )}
      {onToggleComplete && (
        <button onClick={() => onToggleComplete(habit)} data-testid={`toggle-${habit.id}`}>
          Toggle
        </button>
      )}
      {showStats && <span data-testid='stats-shown'>Stats</span>}
    </div>
  ),
}));

describe('HabitList', () => {
  const mockHabits: Habit[] = [
    {
      id: 1,
      trackerId: 1,
      name: 'Exercise',
      description: 'Daily workout',
      targetFrequency: 'Daily',
      targetCount: 1,
      color: '#FF0000',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      isActive: true,
      displayOrder: 0,
      completionsThisWeek: 5,
      completionsThisMonth: 20,
    },
    {
      id: 2,
      trackerId: 1,
      name: 'Read',
      description: 'Read for 30 minutes',
      targetFrequency: 'Daily',
      targetCount: 1,
      color: '#00FF00',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      isActive: true,
      displayOrder: 1,
      completionsThisWeek: 3,
      completionsThisMonth: 15,
    },
    {
      id: 3,
      trackerId: 1,
      name: 'Meditate',
      description: 'Morning meditation',
      targetFrequency: 'Weekly',
      targetCount: 3,
      color: '#0000FF',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      isActive: false,
      displayOrder: 2,
      completionsThisWeek: 1,
      completionsThisMonth: 4,
    },
  ];

  const mockCallbacks = {
    onCreateHabit: vi.fn(),
    onEditHabit: vi.fn(),
    onDeleteHabit: vi.fn(),
    onToggleComplete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render habit list with habits', () => {
      render(<HabitList habits={mockHabits} {...mockCallbacks} />);

      expect(screen.getByText('Habits')).toBeInTheDocument();
      expect(screen.getByText('3 of 3')).toBeInTheDocument();
      expect(screen.getByTestId('habit-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('habit-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('habit-card-3')).toBeInTheDocument();
    });

    it('should render create habit button when onCreateHabit is provided', () => {
      render(<HabitList habits={mockHabits} {...mockCallbacks} />);

      expect(screen.getByText('Add Habit')).toBeInTheDocument();
      expect(screen.getByLabelText('Create new habit')).toBeInTheDocument();
    });

    it('should not render create habit button when onCreateHabit is not provided', () => {
      const { onCreateHabit, ...callbacks } = mockCallbacks;
      render(<HabitList habits={mockHabits} {...callbacks} />);

      expect(screen.queryByText('Add Habit')).not.toBeInTheDocument();
    });

    it('should render search input', () => {
      render(<HabitList habits={mockHabits} {...mockCallbacks} />);

      expect(screen.getByPlaceholderText('Search habits...')).toBeInTheDocument();
    });

    it('should render filter and sort controls', () => {
      render(<HabitList habits={mockHabits} {...mockCallbacks} />);

      expect(screen.getByDisplayValue('All Frequencies')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Order')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading state when loading is true', () => {
      render(<HabitList habits={[]} loading {...mockCallbacks} />);

      expect(screen.getByText('Loading habits...')).toBeInTheDocument();
      expect(screen.queryByText('Habits')).not.toBeInTheDocument();
    });

    it('should not show loading state when loading is false', () => {
      render(<HabitList habits={mockHabits} loading={false} {...mockCallbacks} />);

      expect(screen.queryByText('Loading habits...')).not.toBeInTheDocument();
      expect(screen.getByText('Habits')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should show error state when error is provided', () => {
      const errorMessage = 'Failed to load habits';
      render(<HabitList habits={[]} error={errorMessage} {...mockCallbacks} />);

      expect(screen.getByText('Error loading habits')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should not show error state when error is null', () => {
      render(<HabitList habits={mockHabits} error={null} {...mockCallbacks} />);

      expect(screen.queryByText('Error loading habits')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no habits exist', () => {
      render(<HabitList habits={[]} {...mockCallbacks} />);

      expect(screen.getByText('No habits yet')).toBeInTheDocument();
      expect(
        screen.getByText('Create your first habit to start building positive routines.')
      ).toBeInTheDocument();
      expect(screen.getByText('Create Your First Habit')).toBeInTheDocument();
    });

    it('should show no results state when habits exist but none match filters', async () => {
      const user = userEvent.setup();
      render(<HabitList habits={mockHabits} {...mockCallbacks} />);

      // Search for something that doesn't exist
      const searchInput = screen.getByPlaceholderText('Search habits...');
      await user.type(searchInput, 'nonexistent habit');

      expect(screen.getByText('No habits found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search or filters.')).toBeInTheDocument();
    });

    it('should call onCreateHabit when "Create Your First Habit" is clicked', async () => {
      const user = userEvent.setup();
      render(<HabitList habits={[]} {...mockCallbacks} />);

      const createButton = screen.getByText('Create Your First Habit');
      await user.click(createButton);

      expect(mockCallbacks.onCreateHabit).toHaveBeenCalled();
    });
  });

  describe('Search Functionality', () => {
    it('should filter habits by name', async () => {
      const user = userEvent.setup();
      render(<HabitList habits={mockHabits} {...mockCallbacks} />);

      const searchInput = screen.getByPlaceholderText('Search habits...');
      await user.type(searchInput, 'Exercise');

      expect(screen.getByTestId('habit-card-1')).toBeInTheDocument();
      expect(screen.queryByTestId('habit-card-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('habit-card-3')).not.toBeInTheDocument();
      expect(screen.getByText('1 of 3')).toBeInTheDocument();
    });

    it('should filter habits by description', async () => {
      const user = userEvent.setup();
      render(<HabitList habits={mockHabits} {...mockCallbacks} />);

      const searchInput = screen.getByPlaceholderText('Search habits...');
      await user.type(searchInput, 'meditation');

      expect(screen.getByTestId('habit-card-3')).toBeInTheDocument();
      expect(screen.queryByTestId('habit-card-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('habit-card-2')).not.toBeInTheDocument();
    });

    it('should be case insensitive', async () => {
      const user = userEvent.setup();
      render(<HabitList habits={mockHabits} {...mockCallbacks} />);

      const searchInput = screen.getByPlaceholderText('Search habits...');
      await user.type(searchInput, 'EXERCISE');

      expect(screen.getByTestId('habit-card-1')).toBeInTheDocument();
    });
  });

  describe('Filter Functionality', () => {
    it('should filter habits by frequency', async () => {
      const user = userEvent.setup();
      render(<HabitList habits={mockHabits} {...mockCallbacks} />);

      const frequencyFilter = screen.getByDisplayValue('All Frequencies');
      await user.selectOptions(frequencyFilter, 'Weekly');

      expect(screen.getByTestId('habit-card-3')).toBeInTheDocument();
      expect(screen.queryByTestId('habit-card-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('habit-card-2')).not.toBeInTheDocument();
      expect(screen.getByText('1 of 3')).toBeInTheDocument();
    });

    it('should show clear filters button when filters are active', async () => {
      const user = userEvent.setup();
      render(<HabitList habits={mockHabits} {...mockCallbacks} />);

      const frequencyFilter = screen.getByDisplayValue('All Frequencies');
      await user.selectOptions(frequencyFilter, 'Daily');

      expect(screen.getByText('Clear')).toBeInTheDocument();
    });

    it('should clear filters when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(<HabitList habits={mockHabits} {...mockCallbacks} />);

      // Apply filter
      const frequencyFilter = screen.getByDisplayValue('All Frequencies');
      await user.selectOptions(frequencyFilter, 'Daily');

      // Clear filters
      const clearButton = screen.getByText('Clear');
      await user.click(clearButton);

      expect(screen.getByText('3 of 3')).toBeInTheDocument();
      expect(screen.queryByText('Clear')).not.toBeInTheDocument();
    });
  });

  describe('Sort Functionality', () => {
    it('should sort habits by name', async () => {
      const user = userEvent.setup();
      render(<HabitList habits={mockHabits} {...mockCallbacks} />);

      const sortSelect = screen.getByDisplayValue('Order');
      await user.selectOptions(sortSelect, 'name');

      // Verify order by checking the DOM order
      const habitCards = screen.getAllByTestId(/habit-card-/);
      expect(habitCards[0]).toHaveAttribute('data-testid', 'habit-card-1'); // Exercise
      expect(habitCards[1]).toHaveAttribute('data-testid', 'habit-card-3'); // Meditate
      expect(habitCards[2]).toHaveAttribute('data-testid', 'habit-card-2'); // Read
    });

    it('should toggle sort direction on repeated selection', async () => {
      const user = userEvent.setup();
      render(<HabitList habits={mockHabits} {...mockCallbacks} />);

      const sortSelect = screen.getByDisplayValue('Order');

      // First click - ascending
      await user.selectOptions(sortSelect, 'name');
      let habitCards = screen.getAllByTestId(/habit-card-/);
      expect(habitCards[0]).toHaveAttribute('data-testid', 'habit-card-1'); // Exercise (first alphabetically)

      // Second click - descending
      await user.selectOptions(sortSelect, 'name');
      habitCards = screen.getAllByTestId(/habit-card-/);
      expect(habitCards[0]).toHaveAttribute('data-testid', 'habit-card-2'); // Read (last alphabetically, now first)
    });
  });

  describe('Combined Search and Filter', () => {
    it('should apply both search and filter', async () => {
      const user = userEvent.setup();
      render(<HabitList habits={mockHabits} {...mockCallbacks} />);

      // Search for habits containing 'e' and filter by Daily
      const searchInput = screen.getByPlaceholderText('Search habits...');
      await user.type(searchInput, 'e');

      const frequencyFilter = screen.getByDisplayValue('All Frequencies');
      await user.selectOptions(frequencyFilter, 'Daily');

      // Should show Exercise and Read, but Read doesn't contain 'e' in description
      // So should show only Exercise
      expect(screen.getByTestId('habit-card-1')).toBeInTheDocument(); // Exercise
      expect(screen.getByTestId('habit-card-2')).toBeInTheDocument(); // Read
      expect(screen.queryByTestId('habit-card-3')).not.toBeInTheDocument(); // Meditate (Weekly)
    });

    it('should show clear button when both search and filter are applied', async () => {
      const user = userEvent.setup();
      render(<HabitList habits={mockHabits} {...mockCallbacks} />);

      const searchInput = screen.getByPlaceholderText('Search habits...');
      await user.type(searchInput, 'exercise');

      const frequencyFilter = screen.getByDisplayValue('All Frequencies');
      await user.selectOptions(frequencyFilter, 'Daily');

      expect(screen.getByText('Clear')).toBeInTheDocument();
    });
  });

  describe('Habit Actions', () => {
    it('should call onCreateHabit when Add Habit button is clicked', async () => {
      const user = userEvent.setup();
      render(<HabitList habits={mockHabits} {...mockCallbacks} />);

      const addButton = screen.getByText('Add Habit');
      await user.click(addButton);

      expect(mockCallbacks.onCreateHabit).toHaveBeenCalled();
    });

    it('should pass habit actions to HabitCard components', () => {
      render(<HabitList habits={mockHabits} {...mockCallbacks} />);

      // Check that action buttons are rendered (meaning callbacks were passed)
      expect(screen.getByTestId('edit-1')).toBeInTheDocument();
      expect(screen.getByTestId('delete-1')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-1')).toBeInTheDocument();
    });

    it('should pass showStats prop to HabitCard components', () => {
      render(<HabitList habits={mockHabits} showStats {...mockCallbacks} />);

      // Check that stats are shown in habit cards
      const statsElements = screen.getAllByTestId('stats-shown');
      expect(statsElements).toHaveLength(3);
    });
  });

  describe('View Mode', () => {
    it('should apply grid view mode by default', () => {
      render(<HabitList habits={mockHabits} {...mockCallbacks} />);

      const habitGrid = screen.getByTestId('habit-card-1').parentElement;
      expect(habitGrid).toHaveClass('habitGrid');
    });

    it('should apply list view mode when specified', () => {
      render(<HabitList habits={mockHabits} viewMode='list' {...mockCallbacks} />);

      const habitGrid = screen.getByTestId('habit-card-1').parentElement;
      expect(habitGrid).toHaveClass('list');
    });
  });

  describe('Custom CSS Classes', () => {
    it('should apply custom className', () => {
      render(<HabitList habits={mockHabits} className='custom-class' {...mockCallbacks} />);

      const habitList = screen.getByText('Habits').closest('.habitList');
      expect(habitList).toHaveClass('custom-class');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<HabitList habits={mockHabits} {...mockCallbacks} />);

      expect(screen.getByLabelText('Create new habit')).toBeInTheDocument();
    });

    it('should have searchable input with proper accessibility', () => {
      render(<HabitList habits={mockHabits} {...mockCallbacks} />);

      const searchInput = screen.getByPlaceholderText('Search habits...');
      expect(searchInput).toHaveAttribute('type', 'text');
    });
  });
});
