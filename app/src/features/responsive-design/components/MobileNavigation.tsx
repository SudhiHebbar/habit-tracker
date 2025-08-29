/**
 * MobileNavigation Component
 * 
 * Mobile-optimized navigation with bottom navigation bar
 * and hamburger menu options
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useHaptics } from '../hooks/useDeviceDetection';
import { useTap } from '../hooks/useTouchCapabilities';
import styles from './MobileNavigation.module.css';

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
interface MobileNavigationProps {
  items: NavigationItem[];
  position?: 'top' | 'bottom';
  activeItem?: string;
  onItemSelect?: (item: NavigationItem) => void;
  showLabels?: boolean;
  maxVisibleItems?: number;
  className?: string;
}

/**
 * MobileNavigation component
 */
const MobileNavigation: React.FC<MobileNavigationProps> = ({
  items,
  position = 'bottom',
  activeItem,
  onItemSelect,
  showLabels = true,
  maxVisibleItems = 5,
  className = '',
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { trigger: triggerHaptic } = useHaptics();

  // Split items into visible and overflow
  const { visibleItems, overflowItems } = useMemo(() => {
    if (items.length <= maxVisibleItems) {
      return { visibleItems: items, overflowItems: [] };
    }

    const visible = items.slice(0, maxVisibleItems - 1);
    const overflow = items.slice(maxVisibleItems - 1);
    
    return { visibleItems: visible, overflowItems: overflow };
  }, [items, maxVisibleItems]);

  // Handle item selection
  const handleItemSelect = useCallback((item: NavigationItem) => {
    triggerHaptic();
    onItemSelect?.(item);
    setIsMenuOpen(false);
  }, [onItemSelect, triggerHaptic]);

  // Handle menu toggle
  const toggleMenu = useCallback(() => {
    triggerHaptic();
    setIsMenuOpen(prev => !prev);
  }, [triggerHaptic]);

  // Tap handlers for items
  const { ref: itemRef, bind: bindItem } = useTap(
    () => {}, // Handled in individual items
    undefined,
    () => {} // Long press could show tooltip
  );

  return (
    <>
      <nav
        className={`
          ${styles.mobileNav}
          ${styles[position]}
          ${className}
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        <ul className={styles.navList}>
          {visibleItems.map(item => (
            <li key={item.id} className={styles.navItem}>
              <button
                className={`
                  ${styles.navButton}
                  ${activeItem === item.id ? styles.active : ''}
                `}
                onClick={() => handleItemSelect(item)}
                aria-label={item.label}
                aria-current={activeItem === item.id ? 'page' : undefined}
              >
                {item.icon && (
                  <span className={styles.navIcon}>
                    {item.icon}
                  </span>
                )}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={styles.badge} aria-label={`${item.badge} new`}>
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
                {showLabels && (
                  <span className={styles.navLabel}>
                    {item.label}
                  </span>
                )}
              </button>
            </li>
          ))}
          
          {overflowItems.length > 0 && (
            <li className={styles.navItem}>
              <button
                className={`
                  ${styles.navButton}
                  ${styles.menuButton}
                  ${isMenuOpen ? styles.menuOpen : ''}
                `}
                onClick={toggleMenu}
                aria-label="More options"
                aria-expanded={isMenuOpen}
                aria-haspopup="true"
              >
                <span className={styles.navIcon}>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </span>
                {showLabels && (
                  <span className={styles.navLabel}>More</span>
                )}
              </button>
            </li>
          )}
        </ul>
      </nav>

      {/* Overflow menu */}
      {isMenuOpen && overflowItems.length > 0 && (
        <>
          <div
            className={styles.menuOverlay}
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            className={`
              ${styles.overflowMenu}
              ${position === 'bottom' ? styles.menuAbove : styles.menuBelow}
            `}
            role="menu"
          >
            <ul className={styles.menuList}>
              {overflowItems.map(item => (
                <li key={item.id} className={styles.menuItem}>
                  <button
                    className={`
                      ${styles.menuButton}
                      ${activeItem === item.id ? styles.active : ''}
                    `}
                    onClick={() => handleItemSelect(item)}
                    role="menuitem"
                  >
                    {item.icon && (
                      <span className={styles.menuIcon}>
                        {item.icon}
                      </span>
                    )}
                    <span className={styles.menuLabel}>
                      {item.label}
                    </span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={styles.badge}>
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </>
  );
};

/**
 * Hamburger menu component for mobile navigation
 */
export const HamburgerMenu: React.FC<{
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}> = ({ isOpen, onToggle, className = '' }) => {
  const { trigger: triggerHaptic } = useHaptics();
  
  const handleToggle = useCallback(() => {
    triggerHaptic();
    onToggle();
  }, [onToggle, triggerHaptic]);

  return (
    <button
      className={`
        ${styles.hamburger}
        ${isOpen ? styles.open : ''}
        ${className}
      `}
      onClick={handleToggle}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
    >
      <span className={styles.hamburgerLine} />
      <span className={styles.hamburgerLine} />
      <span className={styles.hamburgerLine} />
    </button>
  );
};

export default MobileNavigation;