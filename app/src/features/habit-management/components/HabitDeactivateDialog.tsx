import React, { useState } from 'react';
import styles from './HabitDeactivateDialog.module.css';

interface HabitDeactivateDialogProps {
  isOpen: boolean;
  habitName: string;
  onConfirm: (reason: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const deactivationReasons = [
  'Taking a break',
  'Habit completed',
  'No longer relevant',
  'Too difficult',
  'Changing goals',
  'Other'
];

export const HabitDeactivateDialog: React.FC<HabitDeactivateDialogProps> = ({
  isOpen,
  habitName,
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    const reason = selectedReason === 'Other' ? customReason : selectedReason;
    
    if (!reason.trim()) {
      setError('Please select or provide a reason');
      return;
    }

    try {
      await onConfirm(reason);
      handleClose();
    } catch (err) {
      console.error('Error deactivating habit:', err);
      setError('Failed to deactivate habit');
    }
  };

  const handleClose = () => {
    setSelectedReason('');
    setCustomReason('');
    setError('');
    onCancel();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.dialogOverlay} onClick={handleClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Deactivate Habit</h3>
          <button 
            className={styles.closeButton} 
            onClick={handleClose}
            aria-label="Close dialog"
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.warningBox}>
            <svg className={styles.warningIcon} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className={styles.warningTitle}>
                Are you sure you want to deactivate "{habitName}"?
              </p>
              <p className={styles.warningText}>
                The habit will be hidden from your active list, but all your completion history will be preserved. You can reactivate it anytime.
              </p>
            </div>
          </div>

          <div className={styles.reasonSection}>
            <label className={styles.label}>Reason for deactivation:</label>
            <div className={styles.reasonOptions}>
              {deactivationReasons.map((reason) => (
                <label key={reason} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="reason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => {
                      setSelectedReason(e.target.value);
                      setError('');
                    }}
                    disabled={isLoading}
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            {selectedReason === 'Other' && (
              <div className={styles.customReasonBox}>
                <textarea
                  className={styles.textarea}
                  placeholder="Please specify your reason..."
                  value={customReason}
                  onChange={(e) => {
                    setCustomReason(e.target.value);
                    setError('');
                  }}
                  rows={3}
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            )}

            {error && (
              <div className={styles.errorMessage}>{error}</div>
            )}
          </div>

          <div className={styles.infoBox}>
            <h4 className={styles.infoTitle}>What happens when you deactivate?</h4>
            <ul className={styles.infoList}>
              <li>The habit will be removed from your active dashboard</li>
              <li>All completion history and streaks are preserved</li>
              <li>You can view deactivated habits in settings</li>
              <li>You can reactivate the habit anytime</li>
            </ul>
          </div>
        </div>

        <div className={styles.footer}>
          <button
            className={styles.cancelButton}
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className={styles.confirmButton}
            onClick={handleConfirm}
            disabled={isLoading || !selectedReason}
          >
            {isLoading ? 'Deactivating...' : 'Deactivate Habit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HabitDeactivateDialog;