import React, { useCallback, useMemo } from 'react';
import { ColorSystem } from '../services/colorSystem';
import { ContrastCalculator } from '../services/contrastCalculator';
import styles from './RecentColors.module.css';

interface RecentColorsProps {
  recentColors: string[];
  onColorSelect: (color: string) => void;
  onClearRecent?: () => void;
  selectedColor?: string;
  className?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  maxDisplay?: number;
  showAccessibility?: boolean;
  showClearButton?: boolean;
  orientation?: 'horizontal' | 'vertical';
  animated?: boolean;
}

export const RecentColors: React.FC<RecentColorsProps> = ({
  recentColors,
  onColorSelect,
  onClearRecent,
  selectedColor,
  className = '',
  disabled = false,
  size = 'medium',
  maxDisplay = 8,
  showAccessibility = true,
  showClearButton = true,
  orientation = 'horizontal',
  animated = true,
}) => {
  // Limit displayed colors
  const displayedColors = useMemo(() => {
    return recentColors.slice(0, maxDisplay);
  }, [recentColors, maxDisplay]);

  // Color information with accessibility data
  const colorsWithInfo = useMemo(() => {
    return displayedColors.map(color => {
      const colorInfo = ColorSystem.getColorByHex(color);
      const contrastInfo = ContrastCalculator.analyzeContrast(color, '#FFFFFF');
      const textColor = ColorSystem.getTextColor(color);

      return {
        hex: color,
        name: colorInfo?.name || color,
        category: colorInfo?.category || 'custom',
        contrast: contrastInfo,
        textColor,
        isAccessible: contrastInfo.contrast.wcagAA,
      };
    });
  }, [displayedColors]);

  // Handle color selection
  const handleColorSelect = useCallback(
    (color: string) => {
      if (!disabled) {
        onColorSelect(color);
      }
    },
    [disabled, onColorSelect]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, color: string) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleColorSelect(color);
      }
    },
    [handleColorSelect]
  );

  // Handle clear recent colors
  const handleClearRecent = useCallback(() => {
    if (!disabled && onClearRecent) {
      onClearRecent();
    }
  }, [disabled, onClearRecent]);

  // Render individual color swatch
  const renderColorSwatch = useCallback(
    (colorInfo: (typeof colorsWithInfo)[0], index: number) => {
      const isSelected = selectedColor === colorInfo.hex;

      return (
        <button
          key={`${colorInfo.hex}-${index}`}
          type='button'
          className={`
          ${styles.colorSwatch}
          ${styles[size]}
          ${isSelected ? styles.selected : ''}
          ${disabled ? styles.disabled : ''}
          ${colorInfo.isAccessible ? styles.accessible : ''}
          ${animated ? styles.animated : ''}
        `}
          style={
            {
              backgroundColor: colorInfo.hex,
              '--text-color': colorInfo.textColor,
              '--animation-delay': `${index * 0.05}s`,
            } as React.CSSProperties
          }
          onClick={() => handleColorSelect(colorInfo.hex)}
          onKeyDown={e => handleKeyDown(e, colorInfo.hex)}
          disabled={disabled}
          title={`${colorInfo.name} (${colorInfo.hex})${colorInfo.isAccessible ? ' - WCAG AA' : ' - Check contrast'}`}
          aria-label={`Select recent color ${colorInfo.name} (${colorInfo.hex})`}
          aria-pressed={isSelected}
        >
          {/* Selection indicator */}
          {isSelected && (
            <svg
              className={styles.checkIcon}
              viewBox='0 0 20 20'
              fill='currentColor'
              style={{ color: colorInfo.textColor }}
              aria-hidden='true'
            >
              <path
                fillRule='evenodd'
                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                clipRule='evenodd'
              />
            </svg>
          )}

          {/* Accessibility indicator */}
          {showAccessibility && colorInfo.isAccessible && (
            <div className={styles.accessibilityBadge}>
              <span className={styles.srOnly}>WCAG AA Compliant</span>
            </div>
          )}

          {/* Hover tooltip content */}
          <div className={styles.tooltip}>
            <div className={styles.tooltipContent}>
              <div className={styles.tooltipHeader}>
                <span className={styles.colorName}>{colorInfo.name}</span>
                <span className={styles.colorHex}>{colorInfo.hex}</span>
              </div>
              {showAccessibility && (
                <div className={styles.tooltipAccessibility}>
                  <span className={styles.contrastRatio}>
                    Contrast: {colorInfo.contrast.contrast.ratio.toFixed(1)}:1
                  </span>
                  <span
                    className={`${styles.wcagBadge} ${colorInfo.isAccessible ? styles.pass : styles.fail}`}
                  >
                    {colorInfo.contrast.contrast.grade}
                  </span>
                </div>
              )}
            </div>
          </div>
        </button>
      );
    },
    [selectedColor, size, disabled, animated, showAccessibility, handleColorSelect, handleKeyDown]
  );

  // Don't render if no recent colors
  if (displayedColors.length === 0) {
    return (
      <div className={`${styles.recentColors} ${styles.empty} ${className}`}>
        <div className={styles.emptyState}>
          <svg className={styles.emptyIcon} viewBox='0 0 24 24' fill='none' stroke='currentColor'>
            <circle cx='12' cy='12' r='10' />
            <path d='M8 14s1.5 2 4 2 4-2 4-2' />
            <line x1='9' y1='9' x2='9.01' y2='9' />
            <line x1='15' y1='9' x2='15.01' y2='9' />
          </svg>
          <p className={styles.emptyText}>No recent colors</p>
          <p className={styles.emptyHint}>Colors you select will appear here for quick access</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.recentColors} ${styles[size]} ${styles[orientation]} ${className}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>Recent Colors</h3>
          <span className={styles.count}>{displayedColors.length}</span>
        </div>

        {showClearButton && onClearRecent && displayedColors.length > 0 && (
          <button
            type='button'
            className={styles.clearButton}
            onClick={handleClearRecent}
            disabled={disabled}
            title='Clear recent colors'
            aria-label='Clear all recent colors'
          >
            <svg viewBox='0 0 20 20' fill='currentColor'>
              <path fillRule='evenodd' d='M9 2a1 1 0 000 2h2a1 1 0 100-2H9z' clipRule='evenodd' />
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                clipRule='evenodd'
              />
            </svg>
          </button>
        )}
      </div>

      {/* Color Grid */}
      <div className={styles.colorGrid}>{colorsWithInfo.map(renderColorSwatch)}</div>

      {/* Usage Stats */}
      {showAccessibility && colorsWithInfo.length > 0 && (
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>
              {colorsWithInfo.filter(c => c.isAccessible).length}
            </span>
            <span className={styles.statLabel}>Accessible</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>
              {new Set(colorsWithInfo.map(c => c.category)).size}
            </span>
            <span className={styles.statLabel}>Categories</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>
              {Math.round(
                (colorsWithInfo.reduce((sum, c) => sum + c.contrast.contrast.ratio, 0) /
                  colorsWithInfo.length) *
                  10
              ) / 10}
            </span>
            <span className={styles.statLabel}>Avg Contrast</span>
          </div>
        </div>
      )}

      {/* Overflow indicator */}
      {recentColors.length > maxDisplay && (
        <div className={styles.overflowIndicator}>
          <span className={styles.moreColors}>+{recentColors.length - maxDisplay} more</span>
        </div>
      )}

      {/* Screen reader announcements */}
      <div aria-live='polite' aria-atomic='true' className={styles.srOnly}>
        {selectedColor &&
          `Selected ${ColorSystem.getColorByHex(selectedColor)?.name || selectedColor}`}
      </div>
    </div>
  );
};

export default RecentColors;
