import React, { useState, useMemo } from 'react';
import type { IconOption } from '../types/habit.types';
import styles from './IconSelector.module.css';

interface IconSelectorProps {
  selectedIcon?: string | null;
  onIconSelect: (icon: string | null) => void;
  className?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

// Comprehensive icon library with categories
const ICON_LIBRARY: IconOption[] = [
  // Health & Fitness
  { id: 'heart', name: 'Heart', category: 'health', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>' },
  { id: 'dumbbell', name: 'Dumbbell', category: 'health', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71 3.43 9.14 7 5.57 15.57 14.14 12 17.71 13.43 19.14 14.86 17.71 16.29 19.14 18.43 17 19.86 18.43 21.29 17l-1.43-1.43L22 13.43z"/></svg>' },
  { id: 'water', name: 'Water Drop', category: 'health', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2C20 10.48 17.33 6.55 12 2z"/></svg>' },
  { id: 'running', name: 'Running', category: 'health', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/></svg>' },
  { id: 'meditation', name: 'Meditation', category: 'health', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 12c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm-2-9c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z"/></svg>' },

  // Learning & Development
  { id: 'book', name: 'Book', category: 'learning', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/></svg>' },
  { id: 'brain', name: 'Brain', category: 'learning', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.33 12.91c.09-.09.15-.2.15-.33s-.06-.24-.15-.33l-1.07-1.07c.09-.09.15-.2.15-.33s-.06-.24-.15-.33L19.2 9.45c.09-.09.15-.2.15-.33s-.06-.24-.15-.33L18.13 7.72c.09-.09.15-.2.15-.33s-.06-.24-.15-.33L17.06 6c.09-.09.15-.2.15-.33s-.06-.24-.15-.33L15.98 4.27c.09-.09.15-.2.15-.33s-.06-.24-.15-.33L14.91 2.55c.09-.09.15-.2.15-.33s-.06-.24-.15-.33L13.84 1c-.18-.18-.47-.18-.65 0L12.12 2.07 11.05 1c-.18-.18-.47-.18-.65 0L9.33 2.07 8.26 1c-.18-.18-.47-.18-.65 0L6.54 2.07 5.47 1c-.18-.18-.47-.18-.65 0L3.75 2.07 2.68 1c-.18-.18-.47-.18-.65 0L1.15 1.88c-.09.09-.15.2-.15.33s.06.24.15.33L2.22 3.61c-.09.09-.15.2-.15.33s.06.24.15.33L3.29 5.34c-.09.09-.15.2-.15.33s.06.24.15.33L4.36 7.07c-.09.09-.15.2-.15.33s.06.24.15.33L5.43 8.8c-.09.09-.15.2-.15.33s.06.24.15.33L6.5 10.53c-.09.09-.15.2-.15.33s.06.24.15.33L7.57 12.26c-.09.09-.15.2-.15.33s.06.24.15.33L8.64 13.99c-.09.09-.15.2-.15.33s.06.24.15.33L9.71 15.72c-.09.09-.15.2-.15.33s.06.24.15.33L10.78 17.45c-.09.09-.15.2-.15.33s.06.24.15.33L11.85 19.18c-.09.09-.15.2-.15.33s.06.24.15.33L12.92 20.91c-.09.09-.15.2-.15.33s.06.24.15.33L14 22.64c.18.18.47.18.65 0L15.72 21.57 16.79 22.64c.18.18.47.18.65 0L18.51 21.57 19.58 22.64c.18.18.47.18.65 0L21.3 21.57 22.37 22.64c.18.18.47.18.65 0L23.85 22.12c.09-.09.15-.2.15-.33s-.06-.24-.15-.33L22.78 20.39c.09-.09.15-.2.15-.33s-.06-.24-.15-.33L21.71 18.66c.09-.09.15-.2.15-.33s-.06-.24-.15-.33L20.64 16.93c.09-.09.15-.2.15-.33s-.06-.24-.15-.33L19.57 15.2c.09-.09.15-.2.15-.33s-.06-.24-.15-.33L18.5 13.47c.09-.09.15-.2.15-.33s-.06-.24-.15-.33L21.33 12.91z"/></svg>' },
  { id: 'language', name: 'Language', category: 'learning', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/></svg>' },

  // Productivity & Work
  { id: 'laptop', name: 'Laptop', category: 'work', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 18c1.1 0 1.99-.9 1.99-2L22 5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2H0c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2h-4zM4 5h16v11H4V5z"/></svg>' },
  { id: 'checklist', name: 'Checklist', category: 'work', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 10H2v2h12v-2zm0-4H2v2h12V6zm4 8v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM2 16h8v-2H2v2z"/></svg>' },
  { id: 'clock', name: 'Clock', category: 'work', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>' },

  // Lifestyle & Daily
  { id: 'home', name: 'Home', category: 'lifestyle', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>' },
  { id: 'music', name: 'Music', category: 'lifestyle', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>' },
  { id: 'coffee', name: 'Coffee', category: 'lifestyle', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3z"/></svg>' },
  { id: 'sleep', name: 'Sleep', category: 'lifestyle', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6.08V4h4v2c2.21 0 4 1.79 4 4s-1.79 4-4 4c-1.86 0-3.41-1.28-3.86-3h-3.9C2.75 12.22 2 13.04 2 14c0 .96.75 1.78 1.24 2H6v2h4v-2.08c3.39-.49 6-3.39 6-6.92s-2.61-6.43-6-6.92V2H6v4.08z"/></svg>' },

  // Nature & Environment
  { id: 'tree', name: 'Tree', category: 'nature', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66c.85-2.15 1.98-4.92 3.46-7.66C10.2 17.23 12 19 14.19 19c4.15 0 7.81-2.09 7.81-6.23C22 8.79 20.21 8 17 8z"/><path d="M13 2L8.5 7h9L13 2z"/></svg>' },
  { id: 'sun', name: 'Sun', category: 'nature', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/></svg>' },

  // Misc/Generic
  { id: 'star', name: 'Star', category: 'misc', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>' },
  { id: 'target', name: 'Target', category: 'misc', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>' },
  { id: 'gift', name: 'Gift', category: 'misc', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"/></svg>' }
];

export const IconSelector: React.FC<IconSelectorProps> = ({
  selectedIcon,
  onIconSelect,
  className = '',
  disabled = false,
  size = 'medium'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get unique categories (for future use)
  // const categories = useMemo(() => {
  //   const cats = ['all', ...new Set(ICON_LIBRARY.map(icon => icon.category))];
  //   return cats;
  // }, []);

  // Filter icons based on search and category
  const filteredIcons = useMemo(() => {
    return ICON_LIBRARY.filter(icon => {
      const matchesSearch = icon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          icon.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || icon.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleIconClick = (iconId: string) => {
    if (disabled) return;
    
    // Toggle selection - if already selected, deselect
    onIconSelect(selectedIcon === iconId ? null : iconId);
  };

  const renderIcon = (icon: IconOption) => (
    <button
      key={icon.id}
      className={`${styles.iconButton} ${styles[size]} ${
        selectedIcon === icon.id ? styles.selected : ''
      } ${disabled ? styles.disabled : ''}`}
      onClick={() => handleIconClick(icon.id)}
      title={icon.name}
      disabled={disabled}
      type="button"
    >
      <div 
        className={styles.iconSvg}
        dangerouslySetInnerHTML={{ __html: icon.svg }}
      />
    </button>
  );

  return (
    <div className={`${styles.iconSelector} ${className} ${styles[size]}`}>
      {/* Search and Filter Controls */}
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <svg className={styles.searchIcon} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            placeholder="Search icons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
            disabled={disabled}
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className={styles.categorySelect}
          disabled={disabled}
        >
          <option value="all">All Categories</option>
          <option value="health">Health & Fitness</option>
          <option value="learning">Learning</option>
          <option value="work">Work & Productivity</option>
          <option value="lifestyle">Lifestyle</option>
          <option value="nature">Nature</option>
          <option value="misc">Miscellaneous</option>
        </select>
      </div>

      {/* Selected Icon Display */}
      {selectedIcon && (
        <div className={styles.selectedIconDisplay}>
          <span className={styles.selectedLabel}>Selected:</span>
          <div className={styles.selectedIconPreview}>
            {renderIcon(ICON_LIBRARY.find(icon => icon.id === selectedIcon)!)}
            <span className={styles.selectedIconName}>
              {ICON_LIBRARY.find(icon => icon.id === selectedIcon)?.name}
            </span>
          </div>
          <button
            type="button"
            className={styles.clearButton}
            onClick={() => onIconSelect(null)}
            disabled={disabled}
            title="Clear selection"
          >
            ×
          </button>
        </div>
      )}

      {/* Icon Grid */}
      <div className={styles.iconGrid}>
        {filteredIcons.length > 0 ? (
          filteredIcons.map(renderIcon)
        ) : (
          <div className={styles.noResults}>
            <svg className={styles.noResultsIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <p>No icons found</p>
            <p className={styles.noResultsHint}>Try adjusting your search or category filter</p>
          </div>
        )}
      </div>

      {/* Icon Count */}
      <div className={styles.iconCount}>
        {filteredIcons.length} of {ICON_LIBRARY.length} icons
        {searchQuery && ` matching "${searchQuery}"`}
      </div>
    </div>
  );
};

export default IconSelector;