/**
 * ResponsiveGrid Component
 * 
 * Flexible grid system that adapts to different screen sizes
 */

import React, { useMemo } from 'react';
import { GridConfig } from '../types/responsive.types';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import styles from './ResponsiveGrid.module.css';

/**
 * Component props
 */
interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: number | 'auto-fit' | 'auto-fill' | {
    mobile?: number | 'auto-fit' | 'auto-fill';
    tablet?: number | 'auto-fit' | 'auto-fill';
    desktop?: number | 'auto-fit' | 'auto-fill';
    wide?: number | 'auto-fit' | 'auto-fill';
  };
  gap?: number | { row?: number; column?: number };
  minChildWidth?: number;
  maxChildWidth?: number;
  alignItems?: GridConfig['alignItems'];
  justifyItems?: GridConfig['justifyItems'];
  className?: string;
}

/**
 * ResponsiveGrid component
 */
const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns,
  gap = 16,
  minChildWidth = 250,
  maxChildWidth,
  alignItems = 'stretch',
  justifyItems = 'stretch',
  className = '',
}) => {
  const { getValue } = useBreakpoint();
  const { getGridConfig } = useResponsiveLayout();

  // Get responsive columns value
  const responsiveColumns = useMemo(() => {
    if (typeof columns === 'object' && columns !== null) {
      return getValue(columns) ?? 'auto-fit';
    }
    return columns ?? 'auto-fit';
  }, [columns, getValue]);

  // Build grid template columns
  const gridTemplateColumns = useMemo(() => {
    if (typeof responsiveColumns === 'number') {
      return `repeat(${responsiveColumns}, 1fr)`;
    }
    
    if (responsiveColumns === 'auto-fit' || responsiveColumns === 'auto-fill') {
      const max = maxChildWidth ? `${maxChildWidth}px` : '1fr';
      return `repeat(${responsiveColumns}, minmax(${minChildWidth}px, ${max}))`;
    }
    
    return 'repeat(auto-fit, minmax(250px, 1fr))';
  }, [responsiveColumns, minChildWidth, maxChildWidth]);

  // Build gap values
  const { rowGap, columnGap } = useMemo(() => {
    if (typeof gap === 'number') {
      return { rowGap: gap, columnGap: gap };
    }
    return { rowGap: gap.row ?? 16, columnGap: gap.column ?? 16 };
  }, [gap]);

  return (
    <div
      className={`${styles.grid} ${className}`}
      style={{
        gridTemplateColumns,
        rowGap: `${rowGap}px`,
        columnGap: `${columnGap}px`,
        alignItems,
        justifyItems,
      }}
    >
      {children}
    </div>
  );
};

/**
 * Container component for consistent max-width and padding
 */
export const Container: React.FC<{
  children: React.ReactNode;
  maxWidth?: number | string | 'full';
  padding?: number | { x?: number; y?: number };
  center?: boolean;
  className?: string;
}> = ({ 
  children, 
  maxWidth, 
  padding, 
  center = true, 
  className = '' 
}) => {
  const { getContainerConfig } = useResponsiveLayout();
  const config = getContainerConfig({ maxWidth, padding, center });

  const paddingStyles = useMemo(() => {
    if (!config.padding) return {};
    
    if (typeof config.padding === 'number') {
      return { padding: `${config.padding}px` };
    }
    
    return {
      paddingLeft: `${config.padding.x ?? 0}px`,
      paddingRight: `${config.padding.x ?? 0}px`,
      paddingTop: `${config.padding.y ?? 0}px`,
      paddingBottom: `${config.padding.y ?? 0}px`,
    };
  }, [config.padding]);

  return (
    <div
      className={`${styles.container} ${className}`}
      style={{
        maxWidth: config.maxWidth === 'full' ? '100%' : 
                  typeof config.maxWidth === 'number' ? `${config.maxWidth}px` : 
                  config.maxWidth,
        marginLeft: config.center ? 'auto' : undefined,
        marginRight: config.center ? 'auto' : undefined,
        ...paddingStyles,
      }}
    >
      {children}
    </div>
  );
};

/**
 * Flex component for flexible layouts
 */
export const Flex: React.FC<{
  children: React.ReactNode;
  direction?: 'row' | 'column' | {
    mobile?: 'row' | 'column';
    tablet?: 'row' | 'column';
    desktop?: 'row' | 'column';
  };
  wrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  alignItems?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  gap?: number;
  className?: string;
}> = ({
  children,
  direction = 'row',
  wrap = 'wrap',
  justifyContent = 'start',
  alignItems = 'center',
  gap = 16,
  className = '',
}) => {
  const { getValue } = useBreakpoint();
  
  const responsiveDirection = useMemo(() => {
    if (typeof direction === 'object') {
      return getValue(direction) ?? 'row';
    }
    return direction;
  }, [direction, getValue]);

  const justifyMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    between: 'space-between',
    around: 'space-around',
    evenly: 'space-evenly',
  };

  const alignMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch',
    baseline: 'baseline',
  };

  return (
    <div
      className={`${styles.flex} ${className}`}
      style={{
        flexDirection: responsiveDirection,
        flexWrap: wrap,
        justifyContent: justifyMap[justifyContent],
        alignItems: alignMap[alignItems],
        gap: `${gap}px`,
      }}
    >
      {children}
    </div>
  );
};

/**
 * Stack component for vertical/horizontal stacking
 */
export const Stack: React.FC<{
  children: React.ReactNode;
  direction?: 'vertical' | 'horizontal';
  spacing?: number | {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  divider?: boolean;
  align?: 'start' | 'center' | 'end' | 'stretch';
  wrap?: boolean;
  className?: string;
}> = ({
  children,
  direction = 'vertical',
  spacing = 16,
  divider = false,
  align = 'stretch',
  wrap = false,
  className = '',
}) => {
  const { getValue } = useBreakpoint();
  
  const responsiveSpacing = useMemo(() => {
    if (typeof spacing === 'object') {
      return getValue(spacing) ?? 16;
    }
    return spacing;
  }, [spacing, getValue]);

  const alignMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch',
  };

  const childrenArray = React.Children.toArray(children);

  return (
    <div
      className={`
        ${styles.stack}
        ${styles[direction]}
        ${divider ? styles.withDivider : ''}
        ${className}
      `}
      style={{
        flexDirection: direction === 'vertical' ? 'column' : 'row',
        flexWrap: wrap ? 'wrap' : 'nowrap',
        alignItems: alignMap[align],
        gap: `${responsiveSpacing}px`,
      }}
    >
      {divider ? (
        childrenArray.map((child, index) => (
          <React.Fragment key={index}>
            {child}
            {index < childrenArray.length - 1 && (
              <div 
                className={styles.divider}
                role="separator"
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        ))
      ) : (
        children
      )}
    </div>
  );
};

export default ResponsiveGrid;