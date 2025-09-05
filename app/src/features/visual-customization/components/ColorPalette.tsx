import React, { useState, useCallback, useMemo } from 'react';
import { ColorSystem } from '../services/colorSystem';
import type { ColorOption, ColorCategory } from '../services/colorSystem';
import styles from './ColorPalette.module.css';

interface ColorPaletteProps {
  selectedColor?: string;
  onColorSelect: (color: string) => void;
  className?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  showCategories?: boolean;
  showSearch?: boolean;
  allowCustom?: boolean;
  maxSelection?: number;
  orientation?: 'horizontal' | 'vertical';
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({
  selectedColor,
  onColorSelect,
  className = '',
  disabled = false,
  size = 'medium',
  showCategories = true,
  showSearch = true,
  orientation = 'vertical',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['primary', 'secondary'])
  );

  // Get filtered colors based on search and category
  const filteredColors = useMemo(() => {
    let colors = ColorSystem.searchColors(searchQuery);

    if (selectedCategory !== 'all') {
      colors = colors.filter(color => color.category === selectedCategory);
    }

    return colors;
  }, [searchQuery, selectedCategory]);

  // Get categories with filtered colors
  const categoriesWithColors = useMemo(() => {
    const categories = ColorSystem.getCategories();
    return categories
      .map(category => ({
        ...category,
        colors: filteredColors.filter(color => color.category === category.id),
      }))
      .filter(category => category.colors.length > 0);
  }, [filteredColors]);

  // Handle color selection
  const handleColorSelect = useCallback(
    (colorHex: string) => {
      if (disabled) return;
      onColorSelect(colorHex);
    },
    [disabled, onColorSelect]
  );

  // Handle category expansion toggle
  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }, []);

  // Handle keyboard navigation
  const handleColorKeyDown = useCallback(
    (event: React.KeyboardEvent, colorHex: string) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleColorSelect(colorHex);
      }
    },
    [handleColorSelect]
  );

  // Render individual color swatch
  const renderColorSwatch = useCallback(
    (color: ColorOption) => {
      const isSelected = selectedColor === color.hex;
      const textColor = ColorSystem.getTextColor(color.hex);

      return (
        <button
          key={color.hex}
          type='button'
          className={`
          ${styles.colorSwatch}
          ${styles[size]}
          ${isSelected ? styles.selected : ''}
          ${disabled ? styles.disabled : ''}
          ${color.accessibility?.wcagAA ? styles.accessibleAA : ''}
          ${color.accessibility?.wcagAAA ? styles.accessibleAAA : ''}
        `}
          style={
            {
              backgroundColor: color.hex,
              '--text-color': textColor,
            } as React.CSSProperties
          }
          onClick={() => handleColorSelect(color.hex)}
          onKeyDown={e => handleColorKeyDown(e, color.hex)}
          disabled={disabled}
          title={`${color.name} (${color.hex})${color.accessibility?.wcagAA ? ' - WCAG AA' : ''}${color.accessibility?.wcagAAA ? ' - WCAG AAA' : ''}`}
          aria-label={`Select ${color.name} color (${color.hex})`}
          aria-pressed={isSelected}
          aria-describedby={`color-${color.hex.replace('#', '')}-desc`}
        >
          {isSelected && (
            <svg
              className={styles.checkIcon}
              viewBox='0 0 20 20'
              fill='currentColor'
              aria-hidden='true'
              style={{ color: textColor }}
            >
              <path
                fillRule='evenodd'
                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                clipRule='evenodd'
              />
            </svg>
          )}

          {/* Accessibility indicator */}
          {color.accessibility?.wcagAA && (
            <div className={styles.accessibilityBadge}>
              <span className={styles.srOnly}>WCAG AA Compliant</span>
            </div>
          )}
        </button>
      );
    },
    [selectedColor, size, disabled, handleColorSelect, handleColorKeyDown]
  );

  // Render category section
  const renderCategory = useCallback(
    (category: ColorCategory & { colors: ColorOption[] }) => {
      if (category.colors.length === 0) return null;

      const isExpanded = expandedCategories.has(category.id);
      const categoryColorCount = category.colors.length;

      return (
        <div key={category.id} className={styles.categorySection}>
          <button
            type='button'
            className={styles.categoryHeader}
            onClick={() => toggleCategory(category.id)}
            aria-expanded={isExpanded}
            aria-controls={`category-${category.id}-colors`}
            disabled={disabled}
          >
            <div className={styles.categoryInfo}>
              <h3 className={styles.categoryTitle}>{category.name}</h3>
              <p className={styles.categoryDescription}>{category.description}</p>
              <span className={styles.categoryCount}>
                {categoryColorCount} color{categoryColorCount !== 1 ? 's' : ''}
              </span>
            </div>
            <svg
              className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`}
              viewBox='0 0 20 20'
              fill='currentColor'
              aria-hidden='true'
            >
              <path
                fillRule='evenodd'
                d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
                clipRule='evenodd'
              />
            </svg>
          </button>

          {isExpanded && (
            <div
              id={`category-${category.id}-colors`}
              className={`${styles.categoryColors} ${styles[orientation]}`}
            >
              {category.colors.map(renderColorSwatch)}
            </div>
          )}
        </div>
      );
    },
    [expandedCategories, toggleCategory, disabled, orientation, renderColorSwatch]
  );

  return (
    <div className={`${styles.colorPalette} ${styles[size]} ${className}`}>
      {/* Search and Filter Controls */}
      {showSearch && (
        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <svg
              className={styles.searchIcon}
              viewBox='0 0 20 20'
              fill='currentColor'
              aria-hidden='true'
            >
              <path
                fillRule='evenodd'
                d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
                clipRule='evenodd'
              />
            </svg>
            <input
              type='text'
              placeholder='Search colors...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={styles.searchInput}
              disabled={disabled}
              aria-label='Search colors by name or hex value'
            />
            {searchQuery && (
              <button
                type='button'
                className={styles.clearSearch}
                onClick={() => setSearchQuery('')}
                aria-label='Clear search'
                disabled={disabled}
              >
                <svg viewBox='0 0 20 20' fill='currentColor'>
                  <path
                    fillRule='evenodd'
                    d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                    clipRule='evenodd'
                  />
                </svg>
              </button>
            )}
          </div>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className={styles.categoryFilter}
            disabled={disabled}
            aria-label='Filter colors by category'
          >
            <option value='all'>All Categories</option>
            {ColorSystem.getCategories().map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Selected Color Display */}
      {selectedColor && (
        <div className={styles.selectedColorDisplay}>
          <span className={styles.selectedLabel}>Selected:</span>
          <div className={styles.selectedColorInfo}>
            <div
              className={styles.selectedColorSwatch}
              style={{ backgroundColor: selectedColor }}
              aria-label={`Selected color: ${selectedColor}`}
            />
            <div className={styles.selectedColorDetails}>
              <span className={styles.selectedColorHex}>{selectedColor}</span>
              {ColorSystem.getColorByHex(selectedColor) && (
                <span className={styles.selectedColorName}>
                  {ColorSystem.getColorByHex(selectedColor)?.name}
                </span>
              )}
            </div>
          </div>
          <button
            type='button'
            className={styles.clearSelection}
            onClick={() => onColorSelect('')}
            disabled={disabled}
            title='Clear color selection'
            aria-label='Clear color selection'
          >
            <svg viewBox='0 0 20 20' fill='currentColor'>
              <path
                fillRule='evenodd'
                d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                clipRule='evenodd'
              />
            </svg>
          </button>
        </div>
      )}

      {/* Color Categories */}
      {showCategories ? (
        <div className={styles.categories}>{categoriesWithColors.map(renderCategory)}</div>
      ) : (
        <div className={`${styles.allColors} ${styles[orientation]}`}>
          {filteredColors.map(renderColorSwatch)}
        </div>
      )}

      {/* Results Count */}
      <div className={styles.resultsInfo}>
        {filteredColors.length === 0 ? (
          <div className={styles.noResults}>
            <svg
              className={styles.noResultsIcon}
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
            >
              <circle cx='11' cy='11' r='8' />
              <path d='M21 21l-4.35-4.35' />
            </svg>
            <p>No colors found</p>
            <p className={styles.noResultsHint}>Try adjusting your search or category filter</p>
          </div>
        ) : (
          <p className={styles.resultsCount}>
            {filteredColors.length} of{' '}
            {ColorSystem.getCategories().reduce((total, cat) => total + cat.colors.length, 0)}{' '}
            colors
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        )}
      </div>

      {/* Accessibility Information */}
      <div className={styles.accessibilityInfo}>
        <div className={styles.accessibilityLegend}>
          <span className={styles.accessibilityItem}>
            <div className={`${styles.legendSwatch} ${styles.accessibleAA}`} />
            WCAG AA Compliant
          </span>
          <span className={styles.accessibilityItem}>
            <div className={`${styles.legendSwatch} ${styles.accessibleAAA}`} />
            WCAG AAA Compliant
          </span>
        </div>
        <p className={styles.accessibilityNote}>
          Colors with accessibility badges meet WCAG contrast requirements
        </p>
      </div>
    </div>
  );
};

export default ColorPalette;
