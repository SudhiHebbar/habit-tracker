import React from 'react';
import styles from '../../../styles/features/habit-management/BulkOperationProgress.module.css';

interface BulkOperationStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  error?: string;
}

interface BulkOperationProgressProps {
  isOpen: boolean;
  operation: 'edit' | 'deactivate' | 'activate' | 'delete';
  steps: BulkOperationStep[];
  onClose?: () => void;
  allowCancel?: boolean;
  onCancel?: () => void;
}

export const BulkOperationProgress: React.FC<BulkOperationProgressProps> = ({
  isOpen,
  operation,
  steps,
  onClose,
  allowCancel = false,
  onCancel,
}) => {
  const totalSteps = steps.length;
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const errorSteps = steps.filter(step => step.status === 'error').length;
  const inProgressStep = steps.find(step => step.status === 'in_progress');

  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  const isComplete = completedSteps === totalSteps;
  const hasErrors = errorSteps > 0;

  const getOperationTitle = () => {
    const operationNames = {
      edit: 'Editing Habits',
      deactivate: 'Deactivating Habits',
      activate: 'Activating Habits',
      delete: 'Deleting Habits',
    };
    return operationNames[operation];
  };

  const getStepIcon = (status: BulkOperationStep['status']) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'error':
        return '❌';
      case 'in_progress':
        return '⏳';
      default:
        return '⏳';
    }
  };

  const getStepStatusText = (status: BulkOperationStep['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Error';
      case 'in_progress':
        return 'In Progress';
      default:
        return 'Pending';
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>{getOperationTitle()}</h2>
          {isComplete && onClose && (
            <button className={styles.closeButton} onClick={onClose}>
              ×
            </button>
          )}
        </div>

        <div className={styles.content}>
          {/* Overall Progress */}
          <div className={styles.overallProgress}>
            <div className={styles.progressHeader}>
              <span className={styles.progressText}>
                Progress: {completedSteps}/{totalSteps} habits
              </span>
              <span className={styles.progressPercentage}>{Math.round(progressPercentage)}%</span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={`${styles.progressFill} ${hasErrors ? styles.hasErrors : ''}`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Current Step */}
          {inProgressStep && !isComplete && (
            <div className={styles.currentStep}>
              <div className={styles.currentStepIndicator}>
                <div className={styles.spinner} />
                <span>Processing: {inProgressStep.name}</span>
              </div>
            </div>
          )}

          {/* Step List */}
          <div className={styles.stepsList}>
            <h4>Details:</h4>
            <div className={styles.stepsContainer}>
              {steps.map(step => (
                <div key={step.id} className={`${styles.step} ${styles[step.status]}`}>
                  <div className={styles.stepIcon}>{getStepIcon(step.status)}</div>
                  <div className={styles.stepContent}>
                    <span className={styles.stepName}>{step.name}</span>
                    <span className={styles.stepStatus}>{getStepStatusText(step.status)}</span>
                  </div>
                  {step.error && (
                    <div className={styles.stepError}>
                      <small>{step.error}</small>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          {isComplete && (
            <div className={styles.summary}>
              {hasErrors ? (
                <div className={styles.summaryWithErrors}>
                  <h4>⚠️ Completed with errors</h4>
                  <p>
                    {completedSteps} habits processed successfully,
                    {errorSteps} failed.
                  </p>
                </div>
              ) : (
                <div className={styles.summarySuccess}>
                  <h4>✅ All operations completed successfully!</h4>
                  <p>
                    All {totalSteps} habits have been{' '}
                    {operation === 'edit' ? 'updated' : operation + 'd'} successfully.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          {!isComplete ? (
            <>
              {allowCancel && onCancel && (
                <button className={styles.cancelButton} onClick={onCancel}>
                  Cancel
                </button>
              )}
              <div className={styles.processingText}>
                <div className={styles.dots}>
                  <span />
                  <span />
                  <span />
                </div>
                Processing...
              </div>
            </>
          ) : (
            <div className={styles.completeActions}>
              {hasErrors && (
                <button
                  className={styles.retryButton}
                  onClick={() => {
                    /* Retry failed operations */
                  }}
                >
                  Retry Failed
                </button>
              )}
              {onClose && (
                <button className={styles.closeCompleteButton} onClick={onClose}>
                  Close
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
