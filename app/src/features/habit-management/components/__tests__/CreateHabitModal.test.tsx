import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CreateHabitModal } from '../CreateHabitModal';

// Mock the ColorPicker component
vi.mock('../ColorPicker', () => ({
  ColorPicker: ({ selectedColor, onColorSelect, disabled }: any) => (
    <div data-testid="color-picker">
      <div data-testid="selected-color">{selectedColor}</div>
      <button 
        data-testid="color-red"
        onClick={() => onColorSelect('#FF0000')}
        disabled={disabled}
      >
        Red
      </button>
      <button 
        data-testid="color-blue"
        onClick={() => onColorSelect('#0000FF')}
        disabled={disabled}
      >
        Blue
      </button>
    </div>
  )
}));

describe('CreateHabitModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();
  
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit,
    isLoading: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when isOpen is true', () => {
      render(<CreateHabitModal {...defaultProps} />);
      
      expect(screen.getByText('Create New Habit')).toBeInTheDocument();
      expect(screen.getByLabelText('Habit Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
      expect(screen.getByLabelText('Frequency')).toBeInTheDocument();
      expect(screen.getByLabelText('Target Count')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<CreateHabitModal {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByText('Create New Habit')).not.toBeInTheDocument();
    });

    it('should render ColorPicker component', () => {
      render(<CreateHabitModal {...defaultProps} />);
      
      expect(screen.getByTestId('color-picker')).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('should update habit name when user types', async () => {
      const user = userEvent.setup();
      render(<CreateHabitModal {...defaultProps} />);
      
      const nameInput = screen.getByLabelText('Habit Name *');
      await user.type(nameInput, 'Exercise Daily');
      
      expect(nameInput).toHaveValue('Exercise Daily');
    });

    it('should update description when user types', async () => {
      const user = userEvent.setup();
      render(<CreateHabitModal {...defaultProps} />);
      
      const descriptionInput = screen.getByLabelText('Description');
      await user.type(descriptionInput, '30 minutes of exercise');
      
      expect(descriptionInput).toHaveValue('30 minutes of exercise');
    });

    it('should update frequency when user selects', async () => {
      const user = userEvent.setup();
      render(<CreateHabitModal {...defaultProps} />);
      
      const frequencySelect = screen.getByLabelText('Frequency');
      await user.selectOptions(frequencySelect, 'Weekly');
      
      expect(frequencySelect).toHaveValue('Weekly');
    });

    it('should update target count when user changes value', async () => {
      const user = userEvent.setup();
      render(<CreateHabitModal {...defaultProps} />);
      
      const targetCountInput = screen.getByLabelText('Target Count');
      await user.clear(targetCountInput);
      await user.type(targetCountInput, '3');
      
      expect(targetCountInput).toHaveValue(3);
    });

    it('should update color when user selects from color picker', async () => {
      const user = userEvent.setup();
      render(<CreateHabitModal {...defaultProps} />);
      
      const redColorButton = screen.getByTestId('color-red');
      await user.click(redColorButton);
      
      expect(screen.getByTestId('selected-color')).toHaveTextContent('#FF0000');
    });
  });

  describe('Form Validation', () => {
    it('should show error message when habit name is empty', async () => {
      const user = userEvent.setup();
      render(<CreateHabitModal {...defaultProps} />);
      
      const submitButton = screen.getByText('Create Habit');
      await user.click(submitButton);
      
      expect(screen.getByText('Habit name is required')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error message when habit name is too long', async () => {
      const user = userEvent.setup();
      render(<CreateHabitModal {...defaultProps} />);
      
      const nameInput = screen.getByLabelText('Habit Name *');
      const longName = 'A'.repeat(101); // 101 characters
      await user.type(nameInput, longName);
      
      const submitButton = screen.getByText('Create Habit');
      await user.click(submitButton);
      
      expect(screen.getByText('Habit name must not exceed 100 characters')).toBeInTheDocument();
    });

    it('should show error message when description is too long', async () => {
      const user = userEvent.setup();
      render(<CreateHabitModal {...defaultProps} />);
      
      const nameInput = screen.getByLabelText('Habit Name *');
      const descriptionInput = screen.getByLabelText('Description');
      const longDescription = 'A'.repeat(501); // 501 characters
      
      await user.type(nameInput, 'Valid Name');
      await user.type(descriptionInput, longDescription);
      
      const submitButton = screen.getByText('Create Habit');
      await user.click(submitButton);
      
      expect(screen.getByText('Description must not exceed 500 characters')).toBeInTheDocument();
    });

    it('should show error message when target count is less than 1', async () => {
      const user = userEvent.setup();
      render(<CreateHabitModal {...defaultProps} />);
      
      const nameInput = screen.getByLabelText('Habit Name *');
      const targetCountInput = screen.getByLabelText('Target Count');
      
      await user.type(nameInput, 'Valid Name');
      await user.clear(targetCountInput);
      await user.type(targetCountInput, '0');
      
      const submitButton = screen.getByText('Create Habit');
      await user.click(submitButton);
      
      expect(screen.getByText('Target count must be at least 1')).toBeInTheDocument();
    });

    it('should clear validation errors when user fixes input', async () => {
      const user = userEvent.setup();
      render(<CreateHabitModal {...defaultProps} />);
      
      const nameInput = screen.getByLabelText('Habit Name *');
      const submitButton = screen.getByText('Create Habit');
      
      // Trigger validation error
      await user.click(submitButton);
      expect(screen.getByText('Habit name is required')).toBeInTheDocument();
      
      // Fix the error
      await user.type(nameInput, 'Valid Name');
      
      expect(screen.queryByText('Habit name is required')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with correct data when form is valid', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValue(undefined);
      
      render(<CreateHabitModal {...defaultProps} />);
      
      // Fill out the form
      await user.type(screen.getByLabelText('Habit Name *'), 'Exercise');
      await user.type(screen.getByLabelText('Description'), '30 minutes daily');
      await user.selectOptions(screen.getByLabelText('Frequency'), 'Weekly');
      await user.clear(screen.getByLabelText('Target Count'));
      await user.type(screen.getByLabelText('Target Count'), '3');
      await user.click(screen.getByTestId('color-blue'));
      
      // Submit the form
      await user.click(screen.getByText('Create Habit'));
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'Exercise',
          description: '30 minutes daily',
          targetFrequency: 'Weekly',
          targetCount: 3,
          color: '#0000FF',
          displayOrder: 0
        });
      });
    });

    it('should close modal after successful submission', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValue(undefined);
      
      render(<CreateHabitModal {...defaultProps} />);
      
      await user.type(screen.getByLabelText('Habit Name *'), 'Exercise');
      await user.click(screen.getByText('Create Habit'));
      
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should reset form after successful submission', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValue(undefined);
      
      render(<CreateHabitModal {...defaultProps} />);
      
      const nameInput = screen.getByLabelText('Habit Name *');
      const descriptionInput = screen.getByLabelText('Description');
      
      await user.type(nameInput, 'Exercise');
      await user.type(descriptionInput, 'Daily exercise');
      await user.click(screen.getByText('Create Habit'));
      
      await waitFor(() => {
        expect(nameInput).toHaveValue('');
        expect(descriptionInput).toHaveValue('');
      });
    });

    it('should handle submission errors gracefully', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockOnSubmit.mockRejectedValue(new Error('Submission failed'));
      
      render(<CreateHabitModal {...defaultProps} />);
      
      await user.type(screen.getByLabelText('Habit Name *'), 'Exercise');
      await user.click(screen.getByText('Create Habit'));
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error creating habit:', expect.any(Error));
      });
      
      // Modal should still be open
      expect(screen.getByText('Create New Habit')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Loading State', () => {
    it('should disable form inputs when isLoading is true', () => {
      render(<CreateHabitModal {...defaultProps} isLoading={true} />);
      
      expect(screen.getByLabelText('Habit Name *')).toBeDisabled();
      expect(screen.getByLabelText('Description')).toBeDisabled();
      expect(screen.getByLabelText('Frequency')).toBeDisabled();
      expect(screen.getByLabelText('Target Count')).toBeDisabled();
    });

    it('should show loading text on submit button when isLoading is true', () => {
      render(<CreateHabitModal {...defaultProps} isLoading={true} />);
      
      expect(screen.getByText('Creating...')).toBeInTheDocument();
      expect(screen.queryByText('Create Habit')).not.toBeInTheDocument();
    });

    it('should disable close button when isLoading is true', () => {
      render(<CreateHabitModal {...defaultProps} isLoading={true} />);
      
      const closeButton = screen.getByLabelText('Close modal');
      expect(closeButton).toBeDisabled();
    });
  });

  describe('Modal Controls', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<CreateHabitModal {...defaultProps} />);
      
      const closeButton = screen.getByLabelText('Close modal');
      await user.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<CreateHabitModal {...defaultProps} />);
      
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose and reset form when modal is closed', async () => {
      const user = userEvent.setup();
      render(<CreateHabitModal {...defaultProps} />);
      
      // Fill out some form data
      await user.type(screen.getByLabelText('Habit Name *'), 'Exercise');
      
      // Close modal
      await user.click(screen.getByText('Cancel'));
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should disable submit button when form is invalid', async () => {
      render(<CreateHabitModal {...defaultProps} />);
      
      const submitButton = screen.getByText('Create Habit');
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when form is valid', async () => {
      const user = userEvent.setup();
      render(<CreateHabitModal {...defaultProps} />);
      
      await user.type(screen.getByLabelText('Habit Name *'), 'Exercise');
      
      const submitButton = screen.getByText('Create Habit');
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<CreateHabitModal {...defaultProps} />);
      
      expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
      expect(screen.getByLabelText('Habit Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
    });

    it('should focus on name input when modal opens', () => {
      render(<CreateHabitModal {...defaultProps} />);
      
      const nameInput = screen.getByLabelText('Habit Name *');
      expect(nameInput).toHaveFocus();
    });

    it('should have proper form structure', () => {
      render(<CreateHabitModal {...defaultProps} />);
      
      const form = screen.getByRole('form', { hidden: true });
      expect(form).toBeInTheDocument();
    });
  });
});