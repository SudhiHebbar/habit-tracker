import React from 'react';
import styles from '@styles/shared/loading.module.css';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  fullScreen?: boolean;
  transparent?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Loading...',
  fullScreen = false,
  transparent = false
}) => {
  if (!visible) return null;

  return (
    <div
      className={`${styles.loadingOverlay} ${fullScreen ? styles.fullScreen : ''} ${transparent ? styles.transparent : ''}`}
      aria-live="polite"
      aria-busy="true"
    >
      <div className={styles.loadingContent}>
        <div className={styles.spinner}>
          <div className={styles.spinnerRing}></div>
          <div className={styles.spinnerRing}></div>
          <div className={styles.spinnerRing}></div>
        </div>
        {message && <p className={styles.loadingMessage}>{message}</p>}
      </div>
    </div>
  );
};