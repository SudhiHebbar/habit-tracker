/**
 * DesktopLayout Component
 *
 * Desktop-optimized layout with persistent sidebar and multi-column support
 */

import React, { useMemo } from 'react';
import FlexibleSidebar from './FlexibleSidebar';
import styles from './DesktopLayout.module.css';

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
interface DesktopLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  navigationItems?: NavigationItem[];
  showNavigation?: boolean;
  sidebarPosition?: 'left' | 'right';
  sidebarWidth?: number | string;
  maxWidth?: number | string;
  className?: string;
}

/**
 * DesktopLayout component
 */
const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  children,
  header,
  sidebar,
  footer,
  navigationItems = [],
  showNavigation = true,
  sidebarPosition = 'left',
  sidebarWidth = 280,
  maxWidth = 1440,
  className = '',
}) => {
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
      className={`
        ${styles.desktopLayout}
        ${styles[sidebarPosition]}
        ${className}
      `}
      style={
        {
          '--max-width': typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
          '--sidebar-width': typeof sidebarWidth === 'number' ? `${sidebarWidth}px` : sidebarWidth,
        } as React.CSSProperties
      }
    >
      {/* Header */}
      {header && (
        <header className={styles.header}>
          <div className={styles.headerContainer}>{header}</div>
        </header>
      )}

      {/* Main container */}
      <div className={styles.container}>
        <div className={styles.wrapper}>
          {/* Sidebar */}
          {sidebarContent && (
            <FlexibleSidebar
              isOpen
              position={sidebarPosition}
              mode='persistent'
              width={sidebarWidth}
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
      </div>

      {/* Footer */}
      {footer && (
        <footer className={styles.footer}>
          <div className={styles.footerContainer}>{footer}</div>
        </footer>
      )}
    </div>
  );
};

/**
 * Multi-column layout for wide screens
 */
export const MultiColumnLayout: React.FC<{
  columns: React.ReactNode[];
  columnWidths?: string[];
  gap?: number;
  className?: string;
}> = ({ columns, columnWidths, gap = 24, className = '' }) => {
  const columnStyles = useMemo(() => {
    if (!columnWidths || columnWidths.length === 0) {
      return `repeat(${columns.length}, 1fr)`;
    }
    return columnWidths.join(' ');
  }, [columns.length, columnWidths]);

  return (
    <div
      className={`${styles.multiColumn} ${className}`}
      style={{
        gridTemplateColumns: columnStyles,
        gap: `${gap}px`,
      }}
    >
      {columns.map((column, index) => (
        <div key={index} className={styles.column}>
          {column}
        </div>
      ))}
    </div>
  );
};

export default DesktopLayout;
