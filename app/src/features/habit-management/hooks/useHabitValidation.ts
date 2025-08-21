import { useState, useCallback, useMemo } from 'react';
import type { UpdateHabitRequest, EditHabitRequest } from '../types/habit.types';

interface ValidationError {
  field: string;
  message: string;
}

interface UseHabitValidationReturn {
  validateHabit: (data: UpdateHabitRequest | EditHabitRequest) => ValidationError[];
  validateField: (field: string, value: any, data: UpdateHabitRequest | EditHabitRequest) => string | null;
  errors: Record<string, string>;
  setFieldError: (field: string, error: string | null) => void;
  clearErrors: () => void;
  hasErrors: boolean;
}

export const useHabitValidation = (): UseHabitValidationReturn => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = useCallback((
    field: string, 
    value: any, 
    _data: UpdateHabitRequest | EditHabitRequest
  ): string | null => {
    switch (field) {
      case 'name':
        if (!value || typeof value !== 'string') {
          return 'Habit name is required';
        }
        if (value.trim().length === 0) {
          return 'Habit name cannot be empty';
        }
        if (value.length > 100) {
          return 'Habit name must not exceed 100 characters';
        }
        return null;

      case 'description':
        if (value && typeof value === 'string' && value.length > 500) {
          return 'Description must not exceed 500 characters';
        }
        return null;

      case 'targetCount':
        if (typeof value !== 'number') {
          return 'Target count must be a number';
        }
        if (value < 1) {
          return 'Target count must be at least 1';
        }
        if (value > 100) {
          return 'Target count must not exceed 100';
        }
        return null;

      case 'targetFrequency':
        if (!value || typeof value !== 'string') {
          return 'Frequency is required';
        }
        const validFrequencies = ['Daily', 'Weekly', 'BiWeekly', 'Monthly', 'Custom'];
        if (!validFrequencies.includes(value)) {
          return 'Invalid frequency selected';
        }
        return null;

      case 'color':
        if (!value || typeof value !== 'string') {
          return 'Color is required';
        }
        const colorRegex = /^#[0-9A-Fa-f]{6}$/;
        if (!colorRegex.test(value)) {
          return 'Color must be a valid hex color code (e.g., #6366F1)';
        }
        return null;

      case 'icon':
        if (value && typeof value === 'string' && value.length > 50) {
          return 'Icon identifier must not exceed 50 characters';
        }
        return null;

      case 'displayOrder':
        if (typeof value !== 'number') {
          return 'Display order must be a number';
        }
        if (value < 0) {
          return 'Display order must be 0 or greater';
        }
        return null;

      default:
        return null;
    }
  }, []);

  const validateHabit = useCallback((
    data: UpdateHabitRequest | EditHabitRequest
  ): ValidationError[] => {
    const validationErrors: ValidationError[] = [];

    // Check if it's an edit request (partial updates allowed)
    const isEditRequest = (data: any): data is EditHabitRequest => {
      return typeof data === 'object' && data !== null;
    };

    const fields = Object.keys(data) as Array<keyof typeof data>;
    
    for (const field of fields) {
      const value = data[field];
      
      // Skip validation for null/undefined values in edit requests
      if (isEditRequest(data) && (value === null || value === undefined)) {
        continue;
      }

      const error = validateField(field, value, data);
      if (error) {
        validationErrors.push({ field, message: error });
      }
    }

    // Special validation: ensure at least one field is provided for edit requests
    if (isEditRequest(data)) {
      const hasValidFields = Object.values(data).some(value => 
        value !== null && value !== undefined && value !== ''
      );
      
      if (!hasValidFields) {
        validationErrors.push({ 
          field: 'general', 
          message: 'At least one field must be provided for editing' 
        });
      }
    } else {
      // For create/update requests, ensure required fields are present
      const requiredFields = ['name', 'targetFrequency', 'targetCount', 'color'];
      for (const field of requiredFields) {
        if (!data[field as keyof typeof data]) {
          validationErrors.push({ 
            field, 
            message: `${field} is required` 
          });
        }
      }
    }

    return validationErrors;
  }, [validateField]);

  const setFieldError = useCallback((field: string, error: string | null) => {
    setErrors(prev => {
      if (error === null) {
        const { [field]: removed, ...rest } = prev;
        return rest;
      } else {
        return { ...prev, [field]: error };
      }
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const hasErrors = useMemo(() => {
    return Object.keys(errors).length > 0;
  }, [errors]);

  return {
    validateHabit,
    validateField,
    errors,
    setFieldError,
    clearErrors,
    hasErrors
  };
};