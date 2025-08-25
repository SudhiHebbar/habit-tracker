import React, { useState, useEffect, useRef, useMemo } from 'react';
import styles from '../../../../styles/shared/components/VirtualScrollList.module.css';

interface VirtualScrollListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
}

export function VirtualScrollList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
  onScroll,
}: VirtualScrollListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const { visibleItems, totalHeight, offsetY } = useMemo(() => {
    const itemCount = items.length;
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(startIndex + visibleCount + overscan * 2, itemCount);
    const visibleStartIndex = Math.max(0, startIndex - overscan);

    return {
      visibleItems: items.slice(visibleStartIndex, endIndex).map((item, index) => ({
        item,
        index: visibleStartIndex + index,
      })),
      totalHeight: itemCount * itemHeight,
      offsetY: visibleStartIndex * itemHeight,
    };
  }, [items, itemHeight, containerHeight, scrollTop, overscan]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setScrollTop(scrollTop);
    onScroll?.(scrollTop);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const element = scrollElementRef.current;
    if (!element) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const { key } = e;
      const currentIndex = Math.floor((scrollTop + containerHeight / 2) / itemHeight);

      if (key === 'ArrowDown' || key === 'ArrowUp') {
        e.preventDefault();
        const newIndex = key === 'ArrowDown' 
          ? Math.min(currentIndex + 1, items.length - 1)
          : Math.max(currentIndex - 1, 0);
        
        const newScrollTop = Math.max(0, newIndex * itemHeight - containerHeight / 2);
        element.scrollTo({ top: newScrollTop, behavior: 'smooth' });
      } else if (key === 'Home') {
        e.preventDefault();
        element.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (key === 'End') {
        e.preventDefault();
        element.scrollTo({ top: items.length * itemHeight, behavior: 'smooth' });
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    return () => element.removeEventListener('keydown', handleKeyDown);
  }, [scrollTop, containerHeight, itemHeight, items.length]);

  if (items.length === 0) {
    return (
      <div className={`${styles.emptyState} ${className}`}>
        <p>No items to display</p>
      </div>
    );
  }

  return (
    <div
      ref={scrollElementRef}
      className={`${styles.virtualScrollContainer} ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
      tabIndex={0}
      role="grid"
      aria-label="Virtual scrollable list"
    >
      <div
        className={styles.virtualScrollContent}
        style={{ height: totalHeight }}
      >
        <div
          className={styles.virtualScrollViewport}
          style={{
            transform: `translateY(${offsetY}px)`,
          }}
        >
          {visibleItems.map(({ item, index }) => (
            <div
              key={index}
              className={styles.virtualScrollItem}
              style={{ height: itemHeight }}
              role="gridcell"
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VirtualScrollList;