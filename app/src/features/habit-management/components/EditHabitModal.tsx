import React, { useState, useEffect } from 'react';
import { ColorPicker } from './ColorPicker';
import { IconSelector } from './IconSelector';
import { FrequencySelector } from './FrequencySelector';
import type { Habit, UpdateHabitRequest, FrequencyType, CustomFrequency } from '../types/habit.types';
import styles from './EditHabitModal.module.css';

interface EditHabitModalProps {
  isOpen: boolean;
  habit: Habit | null;
  onClose: () => void;
  onSubmit: (habitId: number, data: UpdateHabitRequest) => Promise<void>;
  isLoading?: boolean;
}

export const EditHabitModal: React.FC<EditHabitModalProps> = ({
  isOpen,
  habit,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<UpdateHabitRequest>({
    name: '',
    description: '',
    targetFrequency: 'Daily',
    targetCount: 1,
    color: '#6366F1',
    displayOrder: 0,
    isActive: true
  });
  const [customFrequency, setCustomFrequency] = useState<CustomFrequency>({
    timesPerWeek: 3,
    specificDays: [],
    timesPerMonth: null
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    { title: 'Basic Info', description: 'Name and description' },
    { title: 'Appearance', description: 'Color and icon' },
    { title: 'Frequency', description: 'How often to complete' },
    { title: 'Settings', description: 'Additional options' }
  ];

  // Initialize form data when habit changes
  useEffect(() => {
    if (habit) {
      setFormData({
        name: habit.name,
        description: habit.description || '',
        targetFrequency: habit.targetFrequency,
        targetCount: habit.targetCount,
        color: habit.color,
        ...(habit.icon && { icon: habit.icon }),
        displayOrder: habit.displayOrder,
        isActive: habit.isActive
      });
    }
  }, [habit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              name === 'targetCount' || name === 'displayOrder' ? parseInt(value) || 0 : 
              value
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

  const handleIconSelect = (icon: string | null) => {
    if (icon) {
      setFormData(prev => ({ ...prev, icon }));
    } else {
      setFormData(prev => {
        const { icon: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleFrequencyChange = (frequency: FrequencyType, customFreq?: CustomFrequency) => {
    setFormData(prev => ({ ...prev, targetFrequency: frequency }));
    if (customFreq) {
      setCustomFrequency(customFreq);
    }
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 0) {
      if (!formData.name.trim()) {
        newErrors.name = 'Habit name is required';
      } else if (formData.name.length > 100) {
        newErrors.name = 'Habit name must not exceed 100 characters';
      }

      if (formData.description && formData.description.length > 500) {
        newErrors.description = 'Description must not exceed 500 characters';
      }
    } else if (currentStep === 2) {
      if (formData.targetCount < 1) {
        newErrors.targetCount = 'Target count must be at least 1';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep() && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep() || !habit) {
      return;
    }

    try {
      await onSubmit(habit.id, formData);
      handleClose();
    } catch (error) {
      console.error('Error updating habit:', error);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    setErrors({});
    onClose();
  };

  if (!isOpen || !habit) {
    return null;
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <div className={styles.stepContent}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                Habit Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                placeholder="e.g., Drink 8 glasses of water"
                disabled={isLoading}
                autoFocus
              />
              {errors.name && (
                <span className={styles.errorMessage}>{errors.name}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description" className={styles.label}>
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
                placeholder="Optional: Add more details about this habit..."
                rows={3}
                disabled={isLoading}
              />
              {errors.description && (
                <span className={styles.errorMessage}>{errors.description}</span>
              )}
            </div>
          </div>
        );

      case 1: // Appearance
        return (
          <div className={styles.stepContent}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Color</label>
              <ColorPicker
                selectedColor={formData.color}
                onColorSelect={handleColorSelect}
                disabled={isLoading}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Icon (Optional)</label>
              <IconSelector
                selectedIcon={formData.icon || null}
                onIconSelect={handleIconSelect}
                disabled={isLoading}
                size="medium"
              />
            </div>
          </div>
        );

      case 2: // Frequency
        return (
          <div className={styles.stepContent}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Target Count</label>
              <input
                type="number"
                name="targetCount"
                value={formData.targetCount}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.targetCount ? styles.inputError : ''}`}
                min="1"
                max="100"
                disabled={isLoading}
              />
              {errors.targetCount && (
                <span className={styles.errorMessage}>{errors.targetCount}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Frequency</label>
              <FrequencySelector
                selectedFrequency={formData.targetFrequency}
                customFrequency={customFrequency}
                onFrequencyChange={handleFrequencyChange}
                disabled={isLoading}
              />
            </div>
          </div>
        );

      case 3: // Settings
        return (
          <div className={styles.stepContent}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Display Order</label>
              <input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleInputChange}
                className={styles.input}
                min="0"
                disabled={isLoading}
              />
              <span className={styles.helpText}>
                Lower numbers appear first in the list
              </span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                Active habit (uncheck to pause tracking)
              </label>
            </div>

            {/* Preview */}
            <div className={styles.previewSection}>
              <h4 className={styles.previewTitle}>Preview</h4>
              <div className={styles.previewCard} style={{ borderColor: formData.color }}>
                <div className={styles.previewHeader}>
                  {formData.icon && (
                    <div 
                      className={styles.previewIcon}
                      style={{ color: formData.color }}
                    />
                  )}
                  <span className={styles.previewName}>{formData.name || 'Habit Name'}</span>
                </div>
                {formData.description && (
                  <p className={styles.previewDescription}>{formData.description}</p>
                )}
                <div className={styles.previewMeta}>
                  <span>{formData.targetFrequency}</span>
                  <span>Target: {formData.targetCount}</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Edit Habit</h2>
          <button 
            className={styles.closeButton} 
            onClick={handleClose}
            aria-label="Close modal"
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        {/* Progress Steps */}
        <div className={styles.stepsContainer}>
          {steps.map((step, index) => (
            <div 
              key={step.title}
              className={`${styles.step} ${
                index === currentStep ? styles.currentStep : 
                index < currentStep ? styles.completedStep : ''
              }`}
            >
              <div className={styles.stepNumber}>{index + 1}</div>
              <div className={styles.stepInfo}>
                <div className={styles.stepTitle}>{step.title}</div>
                <div className={styles.stepDescription}>{step.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation */}
        <div className={styles.navigation}>
          <button
            type="button"
            className={styles.backButton}
            onClick={handlePrevious}
            disabled={currentStep === 0 || isLoading}
          >
            Previous
          </button>

          <div className={styles.stepIndicator}>
            Step {currentStep + 1} of {steps.length}
          </div>

          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              className={styles.nextButton}
              onClick={handleNext}
              disabled={isLoading}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              className={styles.submitButton}
              onClick={handleSubmit}
              disabled={isLoading || !formData.name.trim()}
            >
              {isLoading ? 'Updating...' : 'Update Habit'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditHabitModal;