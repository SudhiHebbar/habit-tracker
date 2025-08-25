import React, { useState } from 'react';
import { ColorPicker } from './ColorPicker';
import type { CreateHabitRequest } from '../types/habit.types';
import styles from './CreateHabitModal.module.css';

interface CreateHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (habitData: CreateHabitRequest) => Promise<void>;
  isLoading?: boolean;
}

export const CreateHabitModal: React.FC<CreateHabitModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<CreateHabitRequest>({
    name: '',
    description: '',
    targetFrequency: 'Daily',
    targetCount: 1,
    color: '#6366F1',
    displayOrder: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'targetCount' || name === 'displayOrder' ? parseInt(value) || 0 : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleColorSelect = (color: string) => {
    setFormData(prev => ({ ...prev, color }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Habit name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Habit name must not exceed 100 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must not exceed 500 characters';
    }

    if (formData.targetCount < 1) {
      newErrors.targetCount = 'Target count must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      // Reset form and close modal on success
      setFormData({
        name: '',
        description: '',
        targetFrequency: 'Daily',
        targetCount: 1,
        color: '#6366F1',
        displayOrder: 0,
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error creating habit:', error);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      name: '',
      description: '',
      targetFrequency: 'Daily',
      targetCount: 1,
      color: '#6366F1',
      displayOrder: 0,
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Create New Habit</h2>
          <button
            className={styles.closeButton}
            onClick={handleClose}
            aria-label='Close modal'
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Habit Name */}
          <div className={styles.formGroup}>
            <label htmlFor='name' className={styles.label}>
              Habit Name *
            </label>
            <input
              type='text'
              id='name'
              name='name'
              value={formData.name}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
              placeholder='e.g., Drink 8 glasses of water'
              disabled={isLoading}
              autoFocus
            />
            {errors.name && <span className={styles.errorMessage}>{errors.name}</span>}
          </div>

          {/* Description */}
          <div className={styles.formGroup}>
            <label htmlFor='description' className={styles.label}>
              Description
            </label>
            <textarea
              id='description'
              name='description'
              value={formData.description}
              onChange={handleInputChange}
              className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
              placeholder='Optional: Add more details about this habit...'
              rows={3}
              disabled={isLoading}
            />
            {errors.description && (
              <span className={styles.errorMessage}>{errors.description}</span>
            )}
          </div>

          {/* Frequency */}
          <div className={styles.formGroup}>
            <label htmlFor='targetFrequency' className={styles.label}>
              Frequency
            </label>
            <select
              id='targetFrequency'
              name='targetFrequency'
              value={formData.targetFrequency}
              onChange={handleInputChange}
              className={styles.select}
              disabled={isLoading}
            >
              <option value='Daily'>Daily</option>
              <option value='Weekly'>Weekly</option>
              <option value='Custom'>Custom</option>
            </select>
          </div>

          {/* Target Count */}
          <div className={styles.formGroup}>
            <label htmlFor='targetCount' className={styles.label}>
              Target Count
            </label>
            <input
              type='number'
              id='targetCount'
              name='targetCount'
              value={formData.targetCount}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.targetCount ? styles.inputError : ''}`}
              min='1'
              max='100'
              disabled={isLoading}
            />
            {errors.targetCount && (
              <span className={styles.errorMessage}>{errors.targetCount}</span>
            )}
          </div>

          {/* Color Picker */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Color</label>
            <ColorPicker
              selectedColor={formData.color}
              onColorSelect={handleColorSelect}
              disabled={isLoading}
            />
          </div>

          {/* Form Actions */}
          <div className={styles.formActions}>
            <button
              type='button'
              className={styles.cancelButton}
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type='submit'
              className={styles.submitButton}
              disabled={isLoading || !formData.name.trim()}
            >
              {isLoading ? 'Creating...' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateHabitModal;
