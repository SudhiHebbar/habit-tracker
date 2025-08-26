import React, { useState, useCallback, useMemo } from 'react';
import { IconLibrary } from '../services/iconLibrary';
import type { IconOption, IconCategory, IconCategoryInfo } from '../services/iconLibrary';
import styles from './IconSelector.module.css';

interface IconSelectorProps {
  selectedIcon?: string | null;
  onIconSelect: (iconId: string | null) => void;
  className?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  showSearch?: boolean;
  showCategories?: boolean;
  showCategoryFilter?: boolean;
  maxSelection?: number;
  orientation?: 'horizontal' | 'vertical';
  allowDeselect?: boolean;
  popularFirst?: boolean;
}

export const IconSelector: React.FC<IconSelectorProps> = ({
  selectedIcon,
  onIconSelect,
  className = '',
  disabled = false,
  size = 'medium',
  showSearch = true,
  showCategories = true,
  showCategoryFilter = true,
  maxSelection = 1,
  orientation = 'vertical',
  allowDeselect = true,
  popularFirst = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(popularFirst ? ['system'] : ['health', 'fitness'])
  );

  // Get filtered icons based on search and category
  const filteredIcons = useMemo(() => {
    let icons = IconLibrary.searchIcons(searchQuery);
    
    if (selectedCategory !== 'all') {
      icons = icons.filter(icon => icon.category === selectedCategory);
    }
    
    // Sort with popular icons first if enabled
    if (popularFirst) {
      icons.sort((a, b) => {
        if (a.isPopular && !b.isPopular) return -1;
        if (!a.isPopular && b.isPopular) return 1;
        return a.name.localeCompare(b.name);
      });
    }
    
    return icons;
  }, [searchQuery, selectedCategory, popularFirst]);

  // Get categories with filtered icons
  const categoriesWithIcons = useMemo(() => {
    const categories = IconLibrary.getCategories();
    return categories.map(category => ({
      ...category,
      icons: filteredIcons.filter(icon => icon.category === category.id),
    })).filter(category => category.icons.length > 0);
  }, [filteredIcons]);

  // Handle icon selection
  const handleIconSelect = useCallback((iconId: string) => {
    if (disabled) return;
    
    if (selectedIcon === iconId && allowDeselect) {
      onIconSelect(null);
    } else {
      onIconSelect(iconId);
    }
  }, [disabled, selectedIcon, allowDeselect, onIconSelect]);

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
  const handleIconKeyDown = useCallback((
    event: React.KeyboardEvent,
    iconId: string
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleIconSelect(iconId);
    }
  }, [handleIconSelect]);

  // Render individual icon button
  const renderIconButton = useCallback((icon: IconOption) => {
    const isSelected = selectedIcon === icon.id;

    return (
      <button
        key={icon.id}
        type="button"
        className={`
          ${styles.iconButton}
          ${styles[size]}
          ${isSelected ? styles.selected : ''}
          ${disabled ? styles.disabled : ''}
          ${icon.isPopular ? styles.popular : ''}
          ${icon.isNew ? styles.new : ''}
        `}
        onClick={() => handleIconSelect(icon.id)}
        onKeyDown={(e) => handleIconKeyDown(e, icon.id)}
        disabled={disabled}
        title={`${icon.name}${icon.description ? ` - ${icon.description}` : ''}`}
        aria-label={icon.accessibility?.ariaLabel || `Select ${icon.name} icon`}
        aria-pressed={isSelected}
        aria-describedby={`icon-${icon.id}-desc`}
      >
        <div 
          className={styles.iconSvg} 
          dangerouslySetInnerHTML={{ __html: icon.svg }}
          aria-hidden="true"
        />
        
        {/* Badges */}
        {icon.isPopular && (
          <span className={styles.popularBadge} title="Popular icon">
            ⭐
          </span>
        )}
        {icon.isNew && (
          <span className={styles.newBadge} title="New icon">
            🆕
          </span>
        )}
        
        {/* Selection indicator */}
        {isSelected && (
          <div className={styles.selectionIndicator}>
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}

        {/* Screen reader description */}
        <span id={`icon-${icon.id}-desc`} className={styles.srOnly}>
          {icon.accessibility?.description || `${icon.name} icon in ${icon.category} category`}
          {icon.tags.length > 0 && `. Tags: ${icon.tags.join(', ')}`}
        </span>
      </button>
    );
  }, [selectedIcon, size, disabled, handleIconSelect, handleIconKeyDown]);

  // Render category section
  const renderCategory = useCallback((category: IconCategoryInfo & { icons: IconOption[] }) => {
    if (category.icons.length === 0) return null;

    const isExpanded = expandedCategories.has(category.id);
    const categoryIconCount = category.icons.length;

    return (
      <div key={category.id} className={styles.categorySection}>
        <button
          type="button"
          className={styles.categoryHeader}
          onClick={() => toggleCategory(category.id)}
          aria-expanded={isExpanded}
          aria-controls={`category-${category.id}-icons`}
          disabled={disabled}
        >
          <div className={styles.categoryInfo}>
            <div className={styles.categoryTitleRow}>
              <h3 className={styles.categoryTitle}>{category.name}</h3>
              <div 
                className={styles.categoryColor}
                style={{ backgroundColor: category.color }}
                aria-hidden="true"
              />
            </div>
            <p className={styles.categoryDescription}>{category.description}</p>
            <span className={styles.categoryCount}>
              {categoryIconCount} icon{categoryIconCount !== 1 ? 's' : ''}
            </span>
          </div>
          <svg
            className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        
        {isExpanded && (
          <div
            id={`category-${category.id}-icons`}
            className={`${styles.categoryIcons} ${styles[orientation]}`}
          >
            {category.icons.map(renderIconButton)}
          </div>
        )}
      </div>
    );
  }, [expandedCategories, toggleCategory, disabled, orientation, renderIconButton]);

  // Clear selection handler
  const handleClearSelection = useCallback(() => {
    if (!disabled && allowDeselect) {
      onIconSelect(null);
    }
  }, [disabled, allowDeselect, onIconSelect]);

  return (
    <div className={`${styles.iconSelector} ${styles[size]} ${className}`}>
      {/* Search and Filter Controls */}
      {(showSearch || showCategoryFilter) && (
        <div className={styles.controls}>
          {showSearch && (
            <div className={styles.searchBox}>
              <svg
                className={styles.searchIcon}
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                type="text"
                placeholder="Search icons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
                disabled={disabled}
                aria-label="Search icons by name, category, or tags"
              />
              {searchQuery && (
                <button
                  type="button"
                  className={styles.clearSearch}
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  disabled={disabled}
                >
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}

          {showCategoryFilter && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={styles.categoryFilter}
              disabled={disabled}
              aria-label="Filter icons by category"
            >
              <option value="all">All Categories</option>
              {IconLibrary.getCategories().map(category => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Selected Icon Display */}
      {selectedIcon && (
        <div className={styles.selectedIconDisplay}>
          <span className={styles.selectedLabel}>Selected:</span>
          <div className={styles.selectedIconInfo}>
            {(() => {
              const icon = IconLibrary.getIconById(selectedIcon);
              return icon ? (
                <>
                  <div className={styles.selectedIconPreview}>
                    {renderIconButton(icon)}
                  </div>
                  <div className={styles.selectedIconDetails}>
                    <span className={styles.selectedIconName}>{icon.name}</span>
                    <span className={styles.selectedIconCategory}>
                      {IconLibrary.getCategoryById(icon.category)?.name}
                    </span>
                  </div>
                </>
              ) : null;
            })()}
          </div>
          {allowDeselect && (
            <button
              type="button"
              className={styles.clearSelection}
              onClick={handleClearSelection}
              disabled={disabled}
              title="Clear icon selection"
              aria-label="Clear icon selection"
            >
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Popular Icons Section */}
      {popularFirst && !searchQuery && selectedCategory === 'all' && (
        <div className={styles.popularSection}>
          <h3 className={styles.sectionTitle}>Popular Icons</h3>
          <div className={`${styles.popularIcons} ${styles[orientation]}`}>
            {IconLibrary.getPopularIcons().slice(0, 8).map(renderIconButton)}
          </div>
        </div>
      )}

      {/* Icon Categories */}
      {showCategories ? (
        <div className={styles.categories}>
          {categoriesWithIcons.map(renderCategory)}
        </div>
      ) : (
        <div className={`${styles.allIcons} ${styles[orientation]}`}>
          {filteredIcons.map(renderIconButton)}
        </div>
      )}

      {/* Results Count */}
      <div className={styles.resultsInfo}>
        {filteredIcons.length === 0 ? (
          <div className={styles.noResults}>
            <svg
              className={styles.noResultsIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <p>No icons found</p>
            <p className={styles.noResultsHint}>
              Try adjusting your search or category filter
            </p>
          </div>
        ) : (
          <p className={styles.resultsCount}>
            {filteredIcons.length} of {IconLibrary.getAllIcons().length} icons
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        )}
      </div>

      {/* Quick Stats */}
      <div className={styles.quickStats}>
        <span className={styles.stat}>
          Categories: {IconLibrary.getCategories().length}
        </span>
        <span className={styles.stat}>
          Popular: {IconLibrary.getPopularIcons().length}
        </span>
        {IconLibrary.getNewIcons().length > 0 && (
          <span className={styles.stat}>
            New: {IconLibrary.getNewIcons().length}
          </span>
        )}
      </div>

      {/* Screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className={styles.srOnly}>
        {searchQuery && `${filteredIcons.length} icons found for "${searchQuery}"`}
        {selectedIcon && `Selected ${IconLibrary.getIconById(selectedIcon)?.name} icon`}
      </div>
    </div>
  );
};

export default IconSelector;