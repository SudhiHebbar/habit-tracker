/**
 * TabletLayout Component
 *
 * Tablet-optimized layout with adaptive sidebar and navigation
 */

import React, { useState, useCallback, useMemo } from 'react';
import { HamburgerMenu } from './MobileNavigation';
import FlexibleSidebar from './FlexibleSidebar';
import { useSwipe } from '../hooks/useTouchCapabilities';
import { useHaptics } from '../hooks/useDeviceDetection';
import styles from './TabletLayout.module.css';

/**
 * Navigation item type
 */
interface NavigationItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  path: string;
  badge?: number;
}

/**
 * Component props
 */
interface TabletLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  navigationItems?: NavigationItem[];
  showNavigation?: boolean;
  defaultSidebarOpen?: boolean;
  sidebarPosition?: 'left' | 'right';
  className?: string;
}

/**
 * TabletLayout component
 */
const TabletLayout: React.FC<TabletLayoutProps> = ({
  children,
  header,
  sidebar,
  footer,
  navigationItems = [],
  showNavigation = true,
  defaultSidebarOpen = false,
  sidebarPosition = 'left',
  className = '',
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(defaultSidebarOpen);
  const { trigger: triggerHaptic } = useHaptics();

  // Handle sidebar toggle
  const toggleSidebar = useCallback(() => {
    triggerHaptic();
    setIsSidebarOpen(prev => !prev);
  }, [triggerHaptic]);

  // Handle swipe to open/close sidebar
  const { ref: swipeRef, bind: swipeBind } = useSwipe<HTMLDivElement>(direction => {
    if (sidebarPosition === 'left') {
      if (direction === 'right' && !isSidebarOpen) {
        toggleSidebar();
      } else if (direction === 'left' && isSidebarOpen) {
        toggleSidebar();
      }
    } else {
      if (direction === 'left' && !isSidebarOpen) {
        toggleSidebar();
      } else if (direction === 'right' && isSidebarOpen) {
        toggleSidebar();
      }
    }
  });

  // Build navigation for sidebar
  const sidebarContent = useMemo(() => {
    if (sidebar) return sidebar;

    if (showNavigation && navigationItems.length > 0) {
      return (
        <nav className={styles.sidebarNav}>
          <ul className={styles.navList}>
            {navigationItems.map(item => (
              <li key={item.id} className={styles.navItem}>
                <a
                  href={item.path}
                  className={styles.navLink}
                  onClick={e => {
                    e.preventDefault();
                    // Handle navigation
                    setIsSidebarOpen(false);
                  }}
                >
                  {item.icon && <span className={styles.navIcon}>{item.icon}</span>}
                  <span className={styles.navLabel}>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={styles.badge}>{item.badge > 99 ? '99+' : item.badge}</span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      );
    }

    return null;
  }, [sidebar, showNavigation, navigationItems]);

  return (
    <div
      ref={swipeRef}
      className={`
        ${styles.tabletLayout}
        ${isSidebarOpen ? styles.sidebarOpen : ''}
        ${styles[sidebarPosition]}
        ${className}
      `}
      {...swipeBind()}
    >
      {/* Header */}
      {header && (
        <header className={styles.header}>
          {showNavigation && (
            <HamburgerMenu
              isOpen={isSidebarOpen}
              onToggle={toggleSidebar}
              className={styles.hamburger}
            />
          )}
          <div className={styles.headerContent}>{header}</div>
        </header>
      )}

      {/* Main container */}
      <div className={styles.container}>
        {/* Sidebar */}
        {sidebarContent && (
          <FlexibleSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            position={sidebarPosition}
            mode='overlay'
            className={styles.sidebar}
          >
            {sidebarContent}
          </FlexibleSidebar>
        )}

        {/* Main content */}
        <main className={styles.main}>
          <div className={styles.content}>{children}</div>
        </main>
      </div>

      {/* Footer */}
      {footer && <footer className={styles.footer}>{footer}</footer>}

      {/* Overlay for sidebar */}
      {isSidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden='true'
        />
      )}
    </div>
  );
};

export default TabletLayout;
