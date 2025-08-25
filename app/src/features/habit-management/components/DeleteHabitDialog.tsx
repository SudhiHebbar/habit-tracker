import React, { useState, useEffect } from 'react';
import { useDeleteHabit } from '../hooks/useDeleteHabit';
import type { Habit, DeletionImpact } from '../types/habit.types';
import styles from './DeleteHabitDialog.module.css';

interface DeleteHabitDialogProps {
  isOpen: boolean;
  habit: Habit | null;
  onClose: () => void;
  onDeleted: (habitId: number) => void;
  isLoading?: boolean;
}

export const DeleteHabitDialog: React.FC<DeleteHabitDialogProps> = ({
  isOpen,
  habit,
  onClose,
  onDeleted,
  isLoading = false,
}) => {
  const [step, setStep] = useState<'confirm' | 'impact' | 'deleting'>('confirm');
  const [deleteReason, setDeleteReason] = useState('');
  const [impact, setImpact] = useState<DeletionImpact | null>(null);
  const [showImpactDetails, setShowImpactDetails] = useState(false);

  const {
    getDeletionImpact,
    deleteHabitWithConfirmation,
    loading: deleteLoading,
    error,
    clearError,
  } = useDeleteHabit();

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen && habit) {
      setStep('confirm');
      setDeleteReason('');
      setImpact(null);
      setShowImpactDetails(false);
      clearError();
    }
  }, [isOpen, habit, clearError]);

  // Load deletion impact when showing impact step
  useEffect(() => {
    if (step === 'impact' && habit && !impact) {
      loadDeletionImpact();
    }
  }, [step, habit, impact]);

  const loadDeletionImpact = async () => {
    if (!habit) return;

    try {
      const impactData = await getDeletionImpact(habit.id);
      if (impactData) {
        setImpact(impactData);
      }
    } catch (err) {
      console.error('Failed to load deletion impact:', err);
    }
  };

  const handleConfirmClick = () => {
    if (habit) {
      setStep('impact');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!habit) return;

    setStep('deleting');

    try {
      const requestData = {
        confirmed: true,
        requestImpactAnalysis: false,
        ...(deleteReason.trim() && { deleteReason: deleteReason.trim() }),
      };
      const response = await deleteHabitWithConfirmation(habit.id, requestData);

      if (response) {
        onDeleted(habit.id);
        onClose();
      }
    } catch (err) {
      console.error('Failed to delete habit:', err);
      setStep('impact'); // Return to previous step on error
    }
  };

  const handleClose = () => {
    if (step === 'deleting' || deleteLoading || isLoading) {
      return; // Prevent closing during deletion
    }

    setStep('confirm');
    setDeleteReason('');
    setImpact(null);
    setShowImpactDetails(false);
    clearError();
    onClose();
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDeleteReason(e.target.value);
  };

  const isProcessing = step === 'deleting' || deleteLoading || isLoading;
  const canDelete = step === 'impact' && impact;

  if (!isOpen || !habit) {
    return null;
  }

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <div className={styles.habitIndicator} style={{ backgroundColor: habit.color }} />
            <div>
              <h2>Delete Habit</h2>
              <p className={styles.habitName}>{habit.name}</p>
            </div>
          </div>
          <button
            className={styles.closeButton}
            onClick={handleClose}
            aria-label='Close dialog'
            disabled={isProcessing}
          >
            ×
          </button>
        </div>

        <div className={styles.content}>
          {step === 'confirm' && (
            <div className={styles.confirmStep}>
              <div className={styles.warningIcon}>⚠️</div>
              <h3>Are you sure you want to delete this habit?</h3>
              <p className={styles.description}>
                This action will remove the habit from your active list, but all your completion
                history will be preserved. You can restore this habit later if needed.
              </p>

              <div className={styles.formGroup}>
                <label htmlFor='deleteReason' className={styles.label}>
                  Reason for deletion (optional)
                </label>
                <textarea
                  id='deleteReason'
                  value={deleteReason}
                  onChange={handleReasonChange}
                  className={styles.textarea}
                  placeholder='e.g., No longer relevant, replaced with similar habit...'
                  rows={3}
                  maxLength={200}
                  disabled={isProcessing}
                />
                <div className={styles.characterCount}>{deleteReason.length}/200</div>
              </div>
            </div>
          )}

          {step === 'impact' && (
            <div className={styles.impactStep}>
              {!impact ? (
                <div className={styles.loading}>
                  <div className={styles.spinner} />
                  <p>Analyzing deletion impact...</p>
                </div>
              ) : (
                <>
                  <div className={styles.impactHeader}>
                    <h3>Deletion Impact</h3>
                    <div
                      className={`${styles.severityBadge} ${styles[`severity${impact.impactSeverity}`]}`}
                    >
                      {impact.impactSeverity} Impact
                    </div>
                  </div>

                  <div className={styles.impactSummary}>
                    <div className={styles.impactStat}>
                      <div className={styles.statValue}>{impact.totalCompletions}</div>
                      <div className={styles.statLabel}>Total Completions</div>
                    </div>
                    <div className={styles.impactStat}>
                      <div className={styles.statValue}>{impact.currentStreak || 0}</div>
                      <div className={styles.statLabel}>Current Streak</div>
                    </div>
                    <div className={styles.impactStat}>
                      <div className={styles.statValue}>{impact.daysOfHistory}</div>
                      <div className={styles.statLabel}>Days of History</div>
                    </div>
                  </div>

                  {impact.impactWarnings.length > 0 && (
                    <div className={styles.warnings}>
                      <h4>⚠️ Important Notes:</h4>
                      <ul>
                        {impact.impactWarnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    className={styles.detailsToggle}
                    onClick={() => setShowImpactDetails(!showImpactDetails)}
                  >
                    {showImpactDetails ? 'Hide' : 'Show'} detailed impact
                  </button>

                  {showImpactDetails && (
                    <div className={styles.impactDetails}>
                      <div className={styles.detailGrid}>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Last 7 days:</span>
                          <span className={styles.detailValue}>
                            {impact.completionsLast7Days} completions
                          </span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Last 30 days:</span>
                          <span className={styles.detailValue}>
                            {impact.completionsLast30Days} completions
                          </span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Longest streak:</span>
                          <span className={styles.detailValue}>
                            {impact.longestStreak || 0} days
                          </span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Created:</span>
                          <span className={styles.detailValue}>
                            {new Date(impact.habitCreatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        {impact.lastCompletionDate && (
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Last completed:</span>
                            <span className={styles.detailValue}>
                              {new Date(impact.lastCompletionDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className={styles.preservationNote}>
                    <span className={styles.preservationIcon}>💾</span>
                    <span>
                      Your completion history will be preserved and can be restored later.
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 'deleting' && (
            <div className={styles.deletingStep}>
              <div className={styles.spinner} />
              <h3>Deleting habit...</h3>
              <p>Please wait while we process your request.</p>
            </div>
          )}

          {error && (
            <div className={styles.errorMessage}>
              <span className={styles.errorIcon}>❌</span>
              {error}
            </div>
          )}
        </div>

        <div className={styles.actions}>
          {step === 'confirm' && (
            <>
              <button
                type='button'
                className={styles.cancelButton}
                onClick={handleClose}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                type='button'
                className={styles.continueButton}
                onClick={handleConfirmClick}
                disabled={isProcessing}
              >
                Continue
              </button>
            </>
          )}

          {step === 'impact' && (
            <>
              <button
                type='button'
                className={styles.cancelButton}
                onClick={handleClose}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                type='button'
                className={styles.deleteButton}
                onClick={handleDeleteConfirm}
                disabled={isProcessing || !canDelete}
              >
                {isProcessing ? 'Deleting...' : 'Delete Habit'}
              </button>
            </>
          )}

          {step === 'deleting' && (
            <div className={styles.processingActions}>
              <span>Deletion in progress...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteHabitDialog;
