import React, { useState, useCallback } from 'react';
import type { CreateTrackerDto } from '../types/tracker.types';
import styles from '../../../styles/features/tracker-management/CreateTrackerModal.module.css';

interface CreateTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTrackerDto) => Promise<void>;
  isCreating?: boolean;
  error?: string | null;
}

export const CreateTrackerModal: React.FC<CreateTrackerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isCreating = false,
  error = null,
}) => {
  const [formData, setFormData] = useState<CreateTrackerDto>({
    name: '',
    description: '',
    isShared: false,
    displayOrder: 0,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      const checked = (e.target as HTMLInputElement).checked;

      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));

      // Clear validation error for this field
      if (validationErrors[name]) {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [validationErrors]
  );

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Tracker name is required';
    } else if (formData.name.length > 100) {
      errors.name = 'Tracker name must not exceed 100 characters';
    } else if (!/^[a-zA-Z0-9\s\-_]+$/.test(formData.name)) {
      errors.name =
        'Tracker name can only contain letters, numbers, spaces, hyphens, and underscores';
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = 'Description must not exceed 500 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      try {
        await onSubmit(formData);
        setFormData({
          name: '',
          description: '',
          isShared: false,
          displayOrder: 0,
        });
        onClose();
      } catch (err) {
        // Error is handled by parent component
      }
    },
    [formData, validateForm, onSubmit, onClose]
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose} role='presentation' aria-hidden='false'>
      <div
        className={styles.modal}
        onClick={e => e.stopPropagation()}
        role='dialog'
        aria-modal='true'
        aria-labelledby='modal-title'
      >
        <div className={styles.modalHeader}>
          <h2 id='modal-title'>Create New Tracker</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label='Close modal'>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorAlert}>{error}</div>}

          <div className={styles.formGroup}>
            <label htmlFor='name'>Name *</label>
            <input
              type='text'
              id='name'
              name='name'
              value={formData.name}
              onChange={handleInputChange}
              className={validationErrors.name ? styles.inputError : ''}
              placeholder='Enter tracker name'
              disabled={isCreating}
              autoFocus
            />
            {validationErrors.name && (
              <span className={styles.fieldError}>{validationErrors.name}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor='description'>Description</label>
            <textarea
              id='description'
              name='description'
              value={formData.description}
              onChange={handleInputChange}
              className={validationErrors.description ? styles.inputError : ''}
              placeholder='Enter tracker description (optional)'
              disabled={isCreating}
              rows={3}
            />
            {validationErrors.description && (
              <span className={styles.fieldError}>{validationErrors.description}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type='checkbox'
                name='isShared'
                checked={formData.isShared || false}
                onChange={handleInputChange}
                disabled={isCreating}
              />
              Share this tracker with others
            </label>
          </div>

          <div className={styles.modalFooter}>
            <button
              type='button'
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isCreating}
            >
              Cancel
            </button>
            <button type='submit' className={styles.submitButton} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Tracker'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
