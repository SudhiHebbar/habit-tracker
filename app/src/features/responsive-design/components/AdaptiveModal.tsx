/**
 * AdaptiveModal Component
 *
 * Modal that adapts its presentation based on device type
 * Bottom sheet on mobile, centered modal on desktop
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useSwipe } from '../hooks/useTouchCapabilities';
import { useHaptics } from '../hooks/useDeviceDetection';
import styles from './AdaptiveModal.module.css';

/**
 * Component props
 */
interface AdaptiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'full';
  showCloseButton?: boolean;
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
  swipeToClose?: boolean;
  className?: string;
}

/**
 * AdaptiveModal component
 */
const AdaptiveModal: React.FC<AdaptiveModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  closeOnOverlay = true,
  closeOnEscape = true,
  swipeToClose = true,
  className = '',
}) => {
  const { isMobile, isTablet } = useBreakpoint();
  const { trigger: triggerHaptic } = useHaptics();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Determine presentation style
  const presentationStyle = isMobile ? 'bottomSheet' : isTablet ? 'drawer' : 'modal';

  // Handle swipe to close (mobile only)
  const { ref: swipeRef, bind: swipeBind } = useSwipe<HTMLDivElement>(direction => {
    if (!swipeToClose || !isMobile) return;

    if (direction === 'down') {
      triggerHaptic();
      onClose();
    }
  });

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store current focus
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus modal
      setTimeout(() => {
        const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      }, 100);
    } else {
      // Restore focus
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (closeOnOverlay && e.target === e.currentTarget) {
        onClose();
      }
    },
    [closeOnOverlay, onClose]
  );

  if (!isOpen) return null;

  const modalContent = (
    <div
      className={`
        ${styles.modalContainer}
        ${styles[presentationStyle]}
        ${styles[size]}
        ${className}
      `}
      onClick={handleOverlayClick}
      role='dialog'
      aria-modal='true'
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={modalRef}
        className={styles.modal}
        {...(isMobile && swipeToClose ? swipeBind() : {})}
      >
        {/* Swipe indicator for mobile */}
        {isMobile && swipeToClose && (
          <div className={styles.swipeIndicator}>
            <div className={styles.swipeBar} />
          </div>
        )}

        {/* Header */}
        {(title || showCloseButton) && (
          <div className={styles.header}>
            {title && (
              <h2 id='modal-title' className={styles.title}>
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button className={styles.closeButton} onClick={onClose} aria-label='Close modal'>
                <svg
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <line x1='18' y1='6' x2='6' y2='18' />
                  <line x1='6' y1='6' x2='18' y2='18' />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );

  // Portal render
  return createPortal(modalContent, document.body);
};

/**
 * Modal Footer Component
 */
export const ModalFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return <div className={`${styles.footer} ${className}`}>{children}</div>;
};

/**
 * Modal Actions Component
 */
export const ModalActions: React.FC<{
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}> = ({ children, align = 'right', className = '' }) => {
  return (
    <div className={`${styles.actions} ${styles[`align-${align}`]} ${className}`}>{children}</div>
  );
};

export default AdaptiveModal;
