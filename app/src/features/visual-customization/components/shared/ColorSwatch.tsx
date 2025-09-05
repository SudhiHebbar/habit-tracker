import React, { useCallback } from 'react';
import { ColorSystem } from '../../services/colorSystem';
import { ContrastCalculator } from '../../services/contrastCalculator';
import styles from './ColorSwatch.module.css';

interface ColorSwatchProps {
  color: string;
  onClick?: (color: string) => void;
  onDoubleClick?: (color: string) => void;
  selected?: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  shape?: 'circle' | 'square' | 'rounded';
  showTooltip?: boolean;
  showAccessibilityBadge?: boolean;
  showCheckmark?: boolean;
  className?: string;
  title?: string;
  'aria-label'?: string;
  tabIndex?: number;
  draggable?: boolean;
  onDragStart?: (event: React.DragEvent, color: string) => void;
  style?: React.CSSProperties;
  testId?: string;
}

export const ColorSwatch: React.FC<ColorSwatchProps> = ({
  color,
  onClick,
  onDoubleClick,
  selected = false,
  disabled = false,
  size = 'medium',
  shape = 'rounded',
  showTooltip = true,
  showAccessibilityBadge = true,
  showCheckmark = true,
  className = '',
  title,
  'aria-label': ariaLabel,
  tabIndex,
  draggable = false,
  onDragStart,
  style,
  testId,
}) => {
  // Get color information
  const colorInfo = ColorSystem.getColorByHex(color);
  const contrastInfo = ContrastCalculator.analyzeContrast(color, '#FFFFFF');
  const textColor = ColorSystem.getTextColor(color);
  const isAccessible = contrastInfo.contrast.wcagAA;

  // Handle click events
  const handleClick = useCallback(() => {
    if (!disabled && onClick) {
      onClick(color);
    }
  }, [disabled, onClick, color]);

  const handleDoubleClick = useCallback(() => {
    if (!disabled && onDoubleClick) {
      onDoubleClick(color);
    }
  }, [disabled, onDoubleClick, color]);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled) return;

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleClick();
      }
    },
    [disabled, handleClick]
  );

  // Handle drag events
  const handleDragStart = useCallback(
    (event: React.DragEvent) => {
      if (disabled || !onDragStart) return;
      onDragStart(event, color);
    },
    [disabled, onDragStart, color]
  );

  // Generate accessible title
  const accessibleTitle =
    title ||
    `${colorInfo?.name || 'Color'} (${color})${isAccessible ? ' - WCAG AA compliant' : ''}`;

  // Generate aria-label
  const accessibleLabel =
    ariaLabel ||
    `Color swatch: ${colorInfo?.name || color}${selected ? ', selected' : ''}${disabled ? ', disabled' : ''}`;

  return (
    <button
      type='button'
      className={`
        ${styles.colorSwatch}
        ${styles[size]}
        ${styles[shape]}
        ${selected ? styles.selected : ''}
        ${disabled ? styles.disabled : ''}
        ${isAccessible ? styles.accessible : ''}
        ${className}
      `}
      style={
        {
          backgroundColor: color,
          '--text-color': textColor,
          '--swatch-color': color,
          ...style,
        } as React.CSSProperties
      }
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      title={accessibleTitle}
      aria-label={accessibleLabel}
      aria-pressed={selected}
      tabIndex={disabled ? -1 : (tabIndex ?? 0)}
      draggable={draggable && !disabled}
      onDragStart={handleDragStart}
      data-testid={testId}
      data-color={color}
      data-accessible={isAccessible}
    >
      {/* Selection checkmark */}
      {selected && showCheckmark && (
        <svg
          className={styles.checkmark}
          viewBox='0 0 20 20'
          fill='currentColor'
          style={{ color: textColor }}
          aria-hidden='true'
        >
          <path
            fillRule='evenodd'
            d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
            clipRule='evenodd'
          />
        </svg>
      )}

      {/* Accessibility badge */}
      {showAccessibilityBadge && isAccessible && (
        <div className={styles.accessibilityBadge}>
          <span className={styles.srOnly}>WCAG AA compliant</span>
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && (
        <div className={styles.tooltip}>
          <div className={styles.tooltipContent}>
            <div className={styles.tooltipHeader}>
              <span className={styles.colorName}>{colorInfo?.name || 'Custom Color'}</span>
              <span className={styles.colorHex}>{color.toUpperCase()}</span>
            </div>

            {colorInfo?.category && (
              <div className={styles.colorCategory}>{colorInfo.category}</div>
            )}

            <div className={styles.contrastInfo}>
              <span className={styles.contrastRatio}>
                Contrast: {contrastInfo.contrast.ratio.toFixed(1)}:1
              </span>
              <span className={`${styles.wcagBadge} ${isAccessible ? styles.pass : styles.fail}`}>
                {contrastInfo.contrast.grade}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Screen reader content */}
      <span className={styles.srOnly}>
        {accessibleLabel}
        {isAccessible && ' (Accessible)'}
      </span>
    </button>
  );
};

export default ColorSwatch;
