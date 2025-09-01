/**
 * FlexibleSidebar Component
 *
 * Adaptive sidebar that can be persistent, overlay, or push content
 */

import React, { useEffect, useRef } from 'react';
import { useSwipe } from '../hooks/useTouchCapabilities';
import styles from './FlexibleSidebar.module.css';

/**
 * Component props
 */
interface FlexibleSidebarProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  position?: 'left' | 'right';
  mode?: 'persistent' | 'overlay' | 'push';
  width?: number | string;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

/**
 * FlexibleSidebar component
 */
const FlexibleSidebar: React.FC<FlexibleSidebarProps> = ({
  children,
  isOpen,
  onClose,
  position = 'left',
  mode = 'overlay',
  width = 280,
  closeOnEscape = true,
  closeOnOutsideClick = true,
  showCloseButton = false,
  className = '',
}) => {
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Handle swipe to close
  const { ref: swipeRef, bind: swipeBind } = useSwipe<HTMLDivElement>(direction => {
    if (!onClose) return;

    if (position === 'left' && direction === 'left') {
      onClose();
    } else if (position === 'right' && direction === 'right') {
      onClose();
    }
  });

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape || !onClose || !isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeOnEscape, onClose, isOpen]);

  // Handle outside click
  useEffect(() => {
    if (!closeOnOutsideClick || !onClose || !isOpen || mode === 'persistent') return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Delay to avoid immediate close on open
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleOutsideClick);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [closeOnOutsideClick, onClose, isOpen, mode]);

  // Focus management
  useEffect(() => {
    if (!isOpen || mode === 'persistent') return;

    // Store current focus
    const previousFocus = document.activeElement as HTMLElement;

    // Focus sidebar
    if (sidebarRef.current) {
      const firstFocusable = sidebarRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }

    // Restore focus on close
    return () => {
      previousFocus?.focus();
    };
  }, [isOpen, mode]);

  return (
    <aside
      ref={sidebarRef}
      className={`
        ${styles.sidebar}
        ${styles[position]}
        ${styles[mode]}
        ${isOpen ? styles.open : ''}
        ${className}
      `}
      style={
        {
          '--sidebar-width': typeof width === 'number' ? `${width}px` : width,
        } as React.CSSProperties
      }
      aria-hidden={!isOpen && mode !== 'persistent'}
      {...(mode !== 'persistent' && swipeBind())}
    >
      {showCloseButton && onClose && (
        <button className={styles.closeButton} onClick={onClose} aria-label='Close sidebar'>
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

      <div className={styles.content}>{children}</div>
    </aside>
  );
};

export default FlexibleSidebar;
