import React from 'react';
import type { Habit, UpdateHabitRequest } from '../types/habit.types';
import styles from './HabitChangePreview.module.css';

interface HabitChangePreviewProps {
  original: Habit;
  changes: UpdateHabitRequest;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const HabitChangePreview: React.FC<HabitChangePreviewProps> = ({
  original,
  changes,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const getChangedFields = () => {
    const changedFields: Array<{
      field: string;
      original: any;
      new: any;
      impact?: string;
    }> = [];

    if (changes.name !== original.name) {
      changedFields.push({
        field: 'Name',
        original: original.name,
        new: changes.name,
      });
    }

    if (changes.description !== original.description) {
      changedFields.push({
        field: 'Description',
        original: original.description || 'None',
        new: changes.description || 'None',
      });
    }

    if (changes.targetFrequency !== original.targetFrequency) {
      changedFields.push({
        field: 'Frequency',
        original: original.targetFrequency,
        new: changes.targetFrequency,
        impact: 'Changing frequency may affect streak calculations',
      });
    }

    if (changes.targetCount !== original.targetCount) {
      changedFields.push({
        field: 'Target Count',
        original: original.targetCount,
        new: changes.targetCount,
        impact: 'This will affect future completion requirements',
      });
    }

    if (changes.color !== original.color) {
      changedFields.push({
        field: 'Color',
        original: original.color,
        new: changes.color,
      });
    }

    if (changes.icon !== original.icon) {
      changedFields.push({
        field: 'Icon',
        original: original.icon || 'None',
        new: changes.icon || 'None',
      });
    }

    if (changes.displayOrder !== original.displayOrder) {
      changedFields.push({
        field: 'Display Order',
        original: original.displayOrder,
        new: changes.displayOrder,
      });
    }

    if (changes.isActive !== original.isActive) {
      changedFields.push({
        field: 'Status',
        original: original.isActive ? 'Active' : 'Inactive',
        new: changes.isActive ? 'Active' : 'Inactive',
        impact: changes.isActive
          ? 'Habit will be visible in your dashboard'
          : 'Habit will be hidden from your dashboard',
      });
    }

    return changedFields;
  };

  const changedFields = getChangedFields();

  if (changedFields.length === 0) {
    return (
      <div className={styles.noChanges}>
        <p>No changes detected</p>
      </div>
    );
  }

  return (
    <div className={styles.previewContainer}>
      <h3 className={styles.title}>Review Changes</h3>

      <div className={styles.changesGrid}>
        {changedFields.map((change, index) => (
          <div key={index} className={styles.changeItem}>
            <div className={styles.changeHeader}>
              <span className={styles.fieldName}>{change.field}</span>
              {change.impact && (
                <span className={styles.impactIndicator} title={change.impact}>
                  ⚠️
                </span>
              )}
            </div>

            <div className={styles.changeValues}>
              <div className={styles.originalValue}>
                {change.field === 'Color' ? (
                  <div className={styles.colorPreview}>
                    <div className={styles.colorBox} style={{ backgroundColor: change.original }} />
                    <span>{change.original}</span>
                  </div>
                ) : (
                  <span>{change.original}</span>
                )}
              </div>

              <div className={styles.arrow}>→</div>

              <div className={styles.newValue}>
                {change.field === 'Color' ? (
                  <div className={styles.colorPreview}>
                    <div className={styles.colorBox} style={{ backgroundColor: change.new }} />
                    <span>{change.new}</span>
                  </div>
                ) : (
                  <span>{change.new}</span>
                )}
              </div>
            </div>

            {change.impact && <div className={styles.impactMessage}>{change.impact}</div>}
          </div>
        ))}
      </div>

      <div className={styles.historyNote}>
        <svg className={styles.infoIcon} viewBox='0 0 20 20' fill='currentColor'>
          <path
            fillRule='evenodd'
            d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
            clipRule='evenodd'
          />
        </svg>
        <p>Your completion history will be preserved with these changes.</p>
      </div>

      <div className={styles.actions}>
        <button className={styles.cancelButton} onClick={onCancel} disabled={isLoading}>
          Cancel
        </button>
        <button className={styles.confirmButton} onClick={onConfirm} disabled={isLoading}>
          {isLoading ? 'Applying Changes...' : 'Apply Changes'}
        </button>
      </div>
    </div>
  );
};

export default HabitChangePreview;
