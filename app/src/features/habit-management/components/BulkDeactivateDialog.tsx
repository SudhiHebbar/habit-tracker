import React, { useState } from 'react';
import styles from '../../../styles/features/habit-management/BulkDeactivateDialog.module.css';
import { Habit } from '../types/habit.types';

interface BulkDeactivateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedHabits: Habit[];
  onBulkDeactivate: (habitIds: string[], reason?: string) => Promise<void>;
  isLoading?: boolean;
}

const DEACTIVATION_REASONS = [
  { value: 'temporary_break', label: 'Taking a temporary break' },
  { value: 'goal_achieved', label: 'Goal has been achieved' },
  { value: 'no_longer_relevant', label: 'No longer relevant to my goals' },
  { value: 'too_difficult', label: 'Found it too difficult to maintain' },
  { value: 'lifestyle_change', label: 'Lifestyle has changed' },
  { value: 'other', label: 'Other reason' }
];

export const BulkDeactivateDialog: React.FC<BulkDeactivateDialogProps> = ({
  isOpen,
  onClose,
  selectedHabits,
  onBulkDeactivate,
  isLoading = false
}) => {
  const [reason, setReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [confirmText, setConfirmText] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleDeactivate = () => {
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    const deactivationReason = reason === 'other' ? customReason : reason;
    const habitIds = selectedHabits.map(h => h.id);
    
    await onBulkDeactivate(habitIds, deactivationReason);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setReason('');
    setCustomReason('');
    setConfirmText('');
    setShowConfirmation(false);
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const isConfirmValid = confirmText.toLowerCase() === 'deactivate';
  const canProceed = reason && (reason !== 'other' || customReason.trim());

  if (!isOpen) return null;

  if (showConfirmation) {
    return (
      <div className={styles.overlay}>
        <div className={styles.dialog}>
          <div className={styles.header}>
            <h2 className={styles.title}>⚠️ Confirm Bulk Deactivation</h2>
          </div>

          <div className={styles.content}>
            <div className={styles.warning}>
              <p>You are about to deactivate <strong>{selectedHabits.length}</strong> habits:</p>
              
              <div className={styles.habitList}>
                {selectedHabits.map(habit => (
                  <div key={habit.id} className={styles.habitItem}>
                    <span className={styles.habitIcon}>{habit.icon}</span>
                    <span className={styles.habitName}>{habit.name}</span>
                    <span className={styles.habitFreq}>({habit.targetFrequency})</span>
                  </div>
                ))}
              </div>

              <div className={styles.consequences}>
                <h4>What happens when you deactivate habits:</h4>
                <ul>
                  <li>Habits will be hidden from your active tracking</li>
                  <li>All historical completion data will be preserved</li>
                  <li>You can reactivate them later if needed</li>
                  <li>Current streaks will be paused (not reset)</li>
                </ul>
              </div>

              <div className={styles.reasonSummary}>
                <strong>Reason:</strong> {reason === 'other' ? customReason : DEACTIVATION_REASONS.find(r => r.value === reason)?.label}
              </div>
            </div>

            <div className={styles.confirmationSection}>
              <label htmlFor="confirmText" className={styles.confirmLabel}>
                Type "deactivate" to confirm this action:
              </label>
              <input
                id="confirmText"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className={styles.confirmInput}
                placeholder="deactivate"
                autoComplete="off"
              />
            </div>
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => setShowConfirmation(false)}
              disabled={isLoading}
            >
              Back
            </button>
            <button
              type="button"
              className={`${styles.confirmButton} ${styles.destructive}`}
              onClick={handleConfirm}
              disabled={!isConfirmValid || isLoading}
            >
              {isLoading ? 'Deactivating...' : `Deactivate ${selectedHabits.length} Habits`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <div className={styles.header}>
          <h2 className={styles.title}>Deactivate Multiple Habits</h2>
          <button className={styles.closeButton} onClick={handleCancel}>×</button>
        </div>

        <div className={styles.content}>
          <div className={styles.selectedHabits}>
            <h3>Selected Habits ({selectedHabits.length}):</h3>
            <div className={styles.habitGrid}>
              {selectedHabits.map(habit => (
                <div key={habit.id} className={styles.habitChip}>
                  <span className={styles.habitIcon}>{habit.icon}</span>
                  <div className={styles.habitInfo}>
                    <span className={styles.habitName}>{habit.name}</span>
                    <span className={styles.habitFreq}>{habit.targetFrequency}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.reasonSection}>
            <h4>Why are you deactivating these habits?</h4>
            <p className={styles.reasonHelp}>
              This helps you understand your habit patterns and make better decisions in the future.
            </p>

            <div className={styles.reasonOptions}>
              {DEACTIVATION_REASONS.map(reasonOption => (
                <label key={reasonOption.value} className={styles.reasonOption}>
                  <input
                    type="radio"
                    name="deactivation-reason"
                    value={reasonOption.value}
                    checked={reason === reasonOption.value}
                    onChange={(e) => setReason(e.target.value)}
                    className={styles.radio}
                  />
                  <span className={styles.reasonLabel}>{reasonOption.label}</span>
                </label>
              ))}
            </div>

            {reason === 'other' && (
              <div className={styles.customReasonSection}>
                <label htmlFor="customReason" className={styles.customReasonLabel}>
                  Please specify:
                </label>
                <textarea
                  id="customReason"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Enter your reason..."
                  className={styles.customReasonInput}
                  rows={3}
                />
              </div>
            )}
          </div>

          <div className={styles.infoBox}>
            <div className={styles.infoIcon}>ℹ️</div>
            <div className={styles.infoContent}>
              <h4>Don't worry!</h4>
              <p>Your historical data will be preserved and you can reactivate these habits anytime.</p>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.deactivateButton}
            onClick={handleDeactivate}
            disabled={!canProceed}
          >
            Continue to Confirmation
          </button>
        </div>
      </div>
    </div>
  );
};