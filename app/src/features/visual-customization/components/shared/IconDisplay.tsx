import React, { useCallback, useMemo } from 'react';
import { IconLibrary, type Icon } from '../../services/iconLibrary';
import styles from './IconDisplay.module.css';

interface IconDisplayProps {
  iconId: string | null;
  onClick?: (iconId: string) => void;
  onDoubleClick?: (iconId: string) => void;
  selected?: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  variant?: 'default' | 'filled' | 'outlined' | 'minimal';
  color?: string;
  backgroundColor?: string;
  showTooltip?: boolean;
  showFallback?: boolean;
  fallbackText?: string;
  className?: string;
  title?: string;
  'aria-label'?: string;
  tabIndex?: number;
  draggable?: boolean;
  onDragStart?: (event: React.DragEvent, iconId: string) => void;
  style?: React.CSSProperties;
  testId?: string;
  loading?: boolean;
  animateOnLoad?: boolean;
}

export const IconDisplay: React.FC<IconDisplayProps> = ({
  iconId,
  onClick,
  onDoubleClick,
  selected = false,
  disabled = false,
  size = 'medium',
  variant = 'default',
  color,
  backgroundColor,
  showTooltip = true,
  showFallback = true,
  fallbackText,
  className = '',
  title,
  'aria-label': ariaLabel,
  tabIndex,
  draggable = false,
  onDragStart,
  style,
  testId,
  loading = false,
  animateOnLoad = false,
}) => {
  // Get icon data
  const icon: Icon | null = useMemo(() => {
    if (!iconId) return null;
    return IconLibrary.getIconById(iconId);
  }, [iconId]);

  // Handle click events
  const handleClick = useCallback(() => {
    if (!disabled && onClick && iconId) {
      onClick(iconId);
    }
  }, [disabled, onClick, iconId]);

  const handleDoubleClick = useCallback(() => {
    if (!disabled && onDoubleClick && iconId) {
      onDoubleClick(iconId);
    }
  }, [disabled, onDoubleClick, iconId]);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled || !iconId) return;

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleClick();
      }
    },
    [disabled, handleClick, iconId]
  );

  // Handle drag events
  const handleDragStart = useCallback(
    (event: React.DragEvent) => {
      if (disabled || !onDragStart || !iconId) return;
      onDragStart(event, iconId);
    },
    [disabled, onDragStart, iconId]
  );

  // Generate accessible title
  const accessibleTitle = useMemo(() => {
    if (title) return title;
    if (!icon) return 'No icon selected';
    return `${icon.name} icon${icon.category ? ` from ${icon.category} category` : ''}`;
  }, [title, icon]);

  // Generate aria-label
  const accessibleLabel = useMemo(() => {
    if (ariaLabel) return ariaLabel;
    if (!icon) return 'No icon';
    return `${icon.name} icon${selected ? ', selected' : ''}${disabled ? ', disabled' : ''}`;
  }, [ariaLabel, icon, selected, disabled]);

  // Render loading state
  if (loading) {
    return (
      <div
        className={`
          ${styles.iconDisplay}
          ${styles[size]}
          ${styles[variant]}
          ${styles.loading}
          ${className}
        `}
        data-testid={testId}
      >
        <div className={styles.loadingSpinner} />
      </div>
    );
  }

  // Render fallback when no icon or invalid iconId
  if (!icon) {
    if (!showFallback) return null;

    return (
      <div
        className={`
          ${styles.iconDisplay}
          ${styles[size]}
          ${styles[variant]}
          ${styles.fallback}
          ${className}
        `}
        style={{
          color,
          backgroundColor,
          ...style,
        }}
        title={accessibleTitle}
        aria-label='No icon selected'
        data-testid={testId}
      >
        {fallbackText ? (
          <span className={styles.fallbackText}>{fallbackText}</span>
        ) : (
          <svg
            className={styles.fallbackIcon}
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
          >
            <rect x='3' y='3' width='18' height='18' rx='2' ry='2' />
            <circle cx='8.5' cy='8.5' r='1.5' />
            <polyline points='21,15 16,10 5,21' />
          </svg>
        )}

        {showTooltip && (
          <div className={styles.tooltip}>
            <div className={styles.tooltipContent}>
              <span className={styles.tooltipText}>No icon selected</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render icon
  const isInteractive = !disabled && (onClick || onDoubleClick || draggable);
  const Component = isInteractive ? 'button' : 'div';

  return (
    <Component
      type={isInteractive ? 'button' : undefined}
      className={`
        ${styles.iconDisplay}
        ${styles[size]}
        ${styles[variant]}
        ${selected ? styles.selected : ''}
        ${disabled ? styles.disabled : ''}
        ${isInteractive ? styles.interactive : ''}
        ${animateOnLoad ? styles.animated : ''}
        ${className}
      `}
      style={
        {
          color: color || 'currentColor',
          backgroundColor,
          '--icon-color': color || 'currentColor',
          ...style,
        } as React.CSSProperties
      }
      onClick={isInteractive ? handleClick : undefined}
      onDoubleClick={isInteractive ? handleDoubleClick : undefined}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      disabled={disabled}
      title={accessibleTitle}
      aria-label={accessibleLabel}
      aria-pressed={selected}
      tabIndex={disabled ? -1 : (tabIndex ?? (isInteractive ? 0 : undefined))}
      draggable={draggable && !disabled}
      onDragStart={handleDragStart}
      data-testid={testId}
      data-icon-id={iconId}
      data-icon-category={icon.category}
    >
      {/* Icon SVG */}
      <div
        className={styles.iconSvg}
        dangerouslySetInnerHTML={{ __html: icon.svg }}
        aria-hidden='true'
      />

      {/* Selection indicator */}
      {selected && (
        <div className={styles.selectionIndicator}>
          <svg viewBox='0 0 20 20' fill='currentColor'>
            <path
              fillRule='evenodd'
              d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
              clipRule='evenodd'
            />
          </svg>
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && (
        <div className={styles.tooltip}>
          <div className={styles.tooltipContent}>
            <div className={styles.tooltipHeader}>
              <span className={styles.iconName}>{icon.name}</span>
              {icon.category && <span className={styles.iconCategory}>{icon.category}</span>}
            </div>

            {icon.tags && icon.tags.length > 0 && (
              <div className={styles.iconTags}>
                {icon.tags.slice(0, 3).map(tag => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className={styles.iconMeta}>
              <span className={styles.iconId}>ID: {iconId}</span>
            </div>
          </div>
        </div>
      )}

      {/* Screen reader content */}
      <span className={styles.srOnly}>{accessibleLabel}</span>
    </Component>
  );
};

export default IconDisplay;
