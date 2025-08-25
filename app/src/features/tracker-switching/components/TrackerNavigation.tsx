import React from 'react';
import styles from '@styles/features/tracker-switching/TrackerNavigation.module.css';

interface TrackerNavigationProps {
  canGoBack: boolean;
  canGoForward: boolean;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onBack: () => void;
  onForward: () => void;
  onPrevious: () => void;
  onNext: () => void;
  isLoading?: boolean;
}

export const TrackerNavigation: React.FC<TrackerNavigationProps> = ({
  canGoBack,
  canGoForward,
  canGoPrevious,
  canGoNext,
  onBack,
  onForward,
  onPrevious,
  onNext,
  isLoading = false,
}) => {
  return (
    <nav className={styles.trackerNavigation} aria-label='Tracker navigation'>
      <div className={styles.historyNavigation}>
        <button
          className={styles.navButton}
          onClick={onBack}
          disabled={!canGoBack || isLoading}
          aria-label='Go back in history'
          title='Back (Alt+Left)'
        >
          <svg
            width='20'
            height='20'
            viewBox='0 0 20 20'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M12.5 15L7.5 10L12.5 5'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </button>

        <button
          className={styles.navButton}
          onClick={onForward}
          disabled={!canGoForward || isLoading}
          aria-label='Go forward in history'
          title='Forward (Alt+Right)'
        >
          <svg
            width='20'
            height='20'
            viewBox='0 0 20 20'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M7.5 15L12.5 10L7.5 5'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </button>
      </div>

      <div className={styles.sequentialNavigation}>
        <button
          className={styles.navButton}
          onClick={onPrevious}
          disabled={!canGoPrevious || isLoading}
          aria-label='Go to previous tracker'
          title='Previous Tracker'
        >
          <svg
            width='20'
            height='20'
            viewBox='0 0 20 20'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M15 10H5M5 10L10 5M5 10L10 15'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </button>

        <button
          className={styles.navButton}
          onClick={onNext}
          disabled={!canGoNext || isLoading}
          aria-label='Go to next tracker'
          title='Next Tracker'
        >
          <svg
            width='20'
            height='20'
            viewBox='0 0 20 20'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M5 10H15M15 10L10 5M15 10L10 15'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </button>
      </div>

      {isLoading && (
        <div className={styles.loadingIndicator}>
          <span className={styles.spinner} />
        </div>
      )}
    </nav>
  );
};
