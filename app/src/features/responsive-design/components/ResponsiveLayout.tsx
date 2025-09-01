/**
 * ResponsiveLayout Component
 *
 * Main responsive layout orchestrator that manages different
 * layouts based on device type and screen size
 */

import React, { useMemo } from 'react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useDeviceDetection } from '../hooks/useDeviceDetection';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import MobileNavigation from './MobileNavigation';
import TabletLayout from './TabletLayout';
import DesktopLayout from './DesktopLayout';
import styles from './ResponsiveLayout.module.css';

/**
 * Component props
 */
interface ResponsiveLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  navigationItems?: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    path: string;
    badge?: number;
  }>;
  showNavigation?: boolean;
  className?: string;
}

/**
 * ResponsiveLayout component
 */
const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  header,
  sidebar,
  footer,
  navigationItems = [],
  showNavigation = true,
  className = '',
}) => {
  const { current, isMobile, isTablet, isDesktop } = useBreakpoint();
  const { hasTouch } = useDeviceDetection();
  const { navigationLayout } = useResponsiveLayout();

  // Determine which layout to render
  const layout = useMemo(() => {
    if (isMobile) {
      return (
        <div className={`${styles.mobileLayout} ${className}`}>
          {header && <header className={styles.mobileHeader}>{header}</header>}

          <main className={styles.mobileContent}>{children}</main>

          {showNavigation && navigationLayout === 'bottom' && (
            <MobileNavigation items={navigationItems} position='bottom' />
          )}
        </div>
      );
    }

    if (isTablet) {
      return (
        <TabletLayout
          header={header}
          sidebar={sidebar}
          footer={footer}
          navigationItems={navigationItems}
          showNavigation={showNavigation}
          className={className}
        >
          {children}
        </TabletLayout>
      );
    }

    // Desktop and wide layouts
    return (
      <DesktopLayout
        header={header}
        sidebar={sidebar}
        footer={footer}
        navigationItems={navigationItems}
        showNavigation={showNavigation}
        className={className}
      >
        {children}
      </DesktopLayout>
    );
  }, [
    isMobile,
    isTablet,
    children,
    header,
    sidebar,
    footer,
    navigationItems,
    showNavigation,
    navigationLayout,
    className,
  ]);

  return (
    <div className={styles.responsiveLayout} data-breakpoint={current} data-touch={hasTouch}>
      {layout}
    </div>
  );
};

export default ResponsiveLayout;
