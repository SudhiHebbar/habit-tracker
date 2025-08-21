import React, { useState } from 'react';
import styles from '../../../styles/features/habit-management/BulkEditModal.module.css';
import type { Habit, UpdateHabitRequest } from '../types/habit.types';
import { ColorPicker } from './ColorPicker';
import { IconSelector } from './IconSelector';
import { FrequencySelector } from './FrequencySelector';
import { BulkDeactivateDialog } from './BulkDeactivateDialog';
import { BulkOperationProgress } from './BulkOperationProgress';

interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedHabits: Habit[];
  onBulkEdit: (updates: Partial<UpdateHabitRequest>) => Promise<void>;
  onBulkDeactivate?: (habitIds: string[], reason?: string) => Promise<void>;
  isLoading?: boolean;
}

interface BulkEditFormData {
  name?: string;
  color?: string;
  icon?: string;
  frequency?: 'Daily' | 'Weekly' | 'Custom';
  isActive?: boolean;
}

export const BulkEditModal: React.FC<BulkEditModalProps> = ({
  isOpen,
  onClose,
  selectedHabits,
  onBulkEdit,
  onBulkDeactivate,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<BulkEditFormData>({});
  const [fieldsToUpdate, setFieldsToUpdate] = useState<Set<keyof BulkEditFormData>>(new Set());
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [progressSteps, setProgressSteps] = useState<any[]>([]);

  const handleFieldToggle = (field: keyof BulkEditFormData) => {
    const newFields = new Set(fieldsToUpdate);
    if (newFields.has(field)) {
      newFields.delete(field);
      const newFormData = { ...formData };
      delete newFormData[field];
      setFormData(newFormData);
    } else {
      newFields.add(field);
    }
    setFieldsToUpdate(newFields);
  };

  const handleInputChange = (field: keyof BulkEditFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    const updates: Partial<UpdateHabitRequest> = {};
    fieldsToUpdate.forEach(field => {
      if (formData[field] !== undefined) {
        (updates as any)[field] = formData[field];
      }
    });

    // Show progress dialog
    const steps = selectedHabits.map(habit => ({
      id: habit.id,
      name: habit.name,
      status: 'pending' as const
    }));
    setProgressSteps(steps);
    setShowProgress(true);
    setShowConfirmation(false);

    try {
      await onBulkEdit(updates);
      // Update all steps to completed
      setProgressSteps(prev => prev.map(step => ({ ...step, status: 'completed' as const })));
    } catch (error) {
      // Mark steps as error
      setProgressSteps(prev => prev.map(step => ({ 
        ...step, 
        status: 'error' as const, 
        error: 'Failed to update habit' 
      })));
    }
  };

  const resetForm = () => {
    setFormData({});
    setFieldsToUpdate(new Set());
    setShowConfirmation(false);
    setShowProgress(false);
    setProgressSteps([]);
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  if (showConfirmation) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.header}>
            <h2>Confirm Bulk Edit</h2>
          </div>
          
          <div className={styles.content}>
            <div className={styles.confirmationInfo}>
              <p>You are about to update {selectedHabits.length} habits:</p>
              <ul className={styles.habitList}>
                {selectedHabits.map(habit => (
                  <li key={habit.id} className={styles.habitItem}>
                    <span className={styles.habitIcon}>{habit.icon}</span>
                    <span className={styles.habitName}>{habit.name}</span>
                  </li>
                ))}
              </ul>
              
              <div className={styles.changesPreview}>
                <h4>Changes to apply:</h4>
                <ul>
                  {fieldsToUpdate.has('name') && (
                    <li>Name: "{formData.name}"</li>
                  )}
                  {fieldsToUpdate.has('color') && (
                    <li>Color: <span style={{ backgroundColor: formData.color }} className={styles.colorPreview}></span></li>
                  )}
                  {fieldsToUpdate.has('icon') && (
                    <li>Icon: {formData.icon}</li>
                  )}
                  {fieldsToUpdate.has('frequency') && (
                    <li>Frequency: {formData.frequency}</li>
                  )}
                  {fieldsToUpdate.has('isActive') && (
                    <li>Status: {formData.isActive ? 'Active' : 'Inactive'}</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => setShowConfirmation(false)}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.confirmButton}
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Confirm Changes'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Bulk Edit Habits ({selectedHabits.length} selected)</h2>
          <button className={styles.closeButton} onClick={handleCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.content}>
            <div className={styles.selectedHabits}>
              <h4>Selected Habits:</h4>
              <div className={styles.habitGrid}>
                {selectedHabits.map(habit => (
                  <div key={habit.id} className={styles.habitChip}>
                    <span className={styles.habitIcon}>{habit.icon}</span>
                    <span className={styles.habitName}>{habit.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.fieldsSection}>
              <h4>Fields to Update:</h4>
              
              <div className={styles.fieldGroup}>
                <label className={styles.fieldToggle}>
                  <input
                    type="checkbox"
                    checked={fieldsToUpdate.has('name')}
                    onChange={() => handleFieldToggle('name')}
                  />
                  <span>Name</span>
                </label>
                {fieldsToUpdate.has('name') && (
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="New habit name"
                    className={styles.input}
                    required
                  />
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldToggle}>
                  <input
                    type="checkbox"
                    checked={fieldsToUpdate.has('color')}
                    onChange={() => handleFieldToggle('color')}
                  />
                  <span>Color</span>
                </label>
                {fieldsToUpdate.has('color') && (
                  <ColorPicker
                    selectedColor={formData.color || '#3b82f6'}
                    onColorSelect={(color) => handleInputChange('color', color)}
                  />
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldToggle}>
                  <input
                    type="checkbox"
                    checked={fieldsToUpdate.has('icon')}
                    onChange={() => handleFieldToggle('icon')}
                  />
                  <span>Icon</span>
                </label>
                {fieldsToUpdate.has('icon') && (
                  <IconSelector
                    selectedIcon={formData.icon || '📝'}
                    onIconSelect={(icon) => handleInputChange('icon', icon)}
                  />
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldToggle}>
                  <input
                    type="checkbox"
                    checked={fieldsToUpdate.has('frequency')}
                    onChange={() => handleFieldToggle('frequency')}
                  />
                  <span>Frequency</span>
                </label>
                {fieldsToUpdate.has('frequency') && (
                  <FrequencySelector
                    selectedFrequency={formData.frequency || 'Daily'}
                    onFrequencyChange={(frequency: 'Daily' | 'Weekly' | 'Custom') => handleInputChange('frequency', frequency)}
                  />
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldToggle}>
                  <input
                    type="checkbox"
                    checked={fieldsToUpdate.has('isActive')}
                    onChange={() => handleFieldToggle('isActive')}
                  />
                  <span>Status</span>
                </label>
                {fieldsToUpdate.has('isActive') && (
                  <select
                    value={formData.isActive ? 'active' : 'inactive'}
                    onChange={(e) => handleInputChange('isActive', e.target.value === 'active')}
                    className={styles.select}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                )}
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <div className={styles.leftActions}>
              {onBulkDeactivate && (
                <button
                  type="button"
                  className={styles.deactivateButton}
                  onClick={() => setShowDeactivateDialog(true)}
                >
                  Deactivate All ({selectedHabits.length})
                </button>
              )}
            </div>
            <div className={styles.rightActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={fieldsToUpdate.size === 0}
              >
                Preview Changes
              </button>
            </div>
          </div>
        </form>

        {/* Bulk Deactivate Dialog */}
        <BulkDeactivateDialog
          isOpen={showDeactivateDialog}
          onClose={() => setShowDeactivateDialog(false)}
          selectedHabits={selectedHabits}
          onBulkDeactivate={onBulkDeactivate || (async () => {})}
        />

        {/* Progress Dialog */}
        <BulkOperationProgress
          isOpen={showProgress}
          operation="edit"
          steps={progressSteps}
          onClose={() => {
            setShowProgress(false);
            resetForm();
            onClose();
          }}
        />
      </div>
    </div>
  );
};