import React, { useState, useMemo } from 'react';
import { ColorSystem } from '../services/colorSystem';
import { IconLibrary } from '../services/iconLibrary';
import { ContrastCalculator } from '../services/contrastCalculator';
import styles from './CustomizationPresets.module.css';

interface CustomizationPreset {
  id: string;
  name: string;
  description: string;
  color: string;
  iconId: string;
  category: 'default' | 'theme' | 'seasonal' | 'activity' | 'mood';
  tags: string[];
  isPopular?: boolean;
  isNew?: boolean;
}

interface CustomizationPresetsProps {
  onPresetSelect: (preset: { color: string; iconId: string }) => void;
  selectedColor?: string;
  selectedIcon?: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  showCategories?: boolean;
  showSearch?: boolean;
  allowCustomSave?: boolean;
  maxDisplayed?: number;
}

// Curated preset combinations
const CUSTOMIZATION_PRESETS: CustomizationPreset[] = [
  // Default/Popular Presets
  {
    id: 'fitness-energy',
    name: 'Fitness Energy',
    description: 'High-energy orange with fitness icon for workout habits',
    color: '#F97316', // Orange
    iconId: 'dumbbell',
    category: 'default',
    tags: ['fitness', 'workout', 'energy', 'exercise'],
    isPopular: true,
  },
  {
    id: 'health-vitality',
    name: 'Health Vitality',
    description: 'Fresh green with heart icon for health habits',
    color: '#10B981', // Emerald
    iconId: 'heart',
    category: 'default',
    tags: ['health', 'vitality', 'wellness', 'medical'],
    isPopular: true,
  },
  {
    id: 'learning-focus',
    name: 'Learning Focus',
    description: 'Professional blue with book icon for study habits',
    color: '#3B82F6', // Blue
    iconId: 'book',
    category: 'default',
    tags: ['learning', 'study', 'education', 'focus'],
    isPopular: true,
  },
  {
    id: 'mindfulness-calm',
    name: 'Mindfulness Calm',
    description: 'Soothing purple with meditation icon for wellness',
    color: '#8B5CF6', // Violet
    iconId: 'yoga',
    category: 'default',
    tags: ['mindfulness', 'meditation', 'calm', 'wellness'],
    isPopular: true,
  },

  // Theme Presets
  {
    id: 'professional-work',
    name: 'Professional',
    description: 'Clean indigo with laptop for work habits',
    color: '#6366F1', // Indigo
    iconId: 'laptop',
    category: 'theme',
    tags: ['professional', 'work', 'business', 'productivity'],
  },
  {
    id: 'creative-inspiration',
    name: 'Creative',
    description: 'Vibrant pink with star for creative pursuits',
    color: '#EC4899', // Pink
    iconId: 'star',
    category: 'theme',
    tags: ['creative', 'art', 'inspiration', 'design'],
  },
  {
    id: 'nature-outdoor',
    name: 'Nature',
    description: 'Earthy green with tree for outdoor activities',
    color: '#059669', // Emerald 600
    iconId: 'tree',
    category: 'theme',
    tags: ['nature', 'outdoor', 'environment', 'green'],
  },

  // Activity-Specific Presets
  {
    id: 'hydration-tracker',
    name: 'Hydration',
    description: 'Cool cyan with water drop for drinking habits',
    color: '#06B6D4', // Cyan
    iconId: 'water-drop',
    category: 'activity',
    tags: ['hydration', 'water', 'health', 'drink'],
  },
  {
    id: 'morning-routine',
    name: 'Morning Routine',
    description: 'Warm yellow with sun for morning habits',
    color: '#EAB308', // Yellow
    iconId: 'sun',
    category: 'activity',
    tags: ['morning', 'routine', 'sunrise', 'start'],
  },
  {
    id: 'sleep-schedule',
    name: 'Sleep Schedule',
    description: 'Deep purple with sleep icon for bedtime habits',
    color: '#7E22CE', // Purple 700
    iconId: 'sleep',
    category: 'activity',
    tags: ['sleep', 'bedtime', 'rest', 'night'],
  },
  {
    id: 'nutrition-healthy',
    name: 'Healthy Eating',
    description: 'Fresh green with apple for nutrition habits',
    color: '#22C55E', // Green
    iconId: 'apple',
    category: 'activity',
    tags: ['nutrition', 'food', 'healthy', 'diet'],
  },
  {
    id: 'productivity-tasks',
    name: 'Task Master',
    description: 'Focused blue with checklist for productivity',
    color: '#2563EB', // Blue 600
    iconId: 'checklist',
    category: 'activity',
    tags: ['productivity', 'tasks', 'organize', 'efficiency'],
  },

  // Mood-Based Presets
  {
    id: 'motivation-boost',
    name: 'Motivation',
    description: 'Bold red with target for goal-oriented habits',
    color: '#EF4444', // Red
    iconId: 'target',
    category: 'mood',
    tags: ['motivation', 'goals', 'achievement', 'drive'],
  },
  {
    id: 'gentle-reminder',
    name: 'Gentle Reminder',
    description: 'Soft rose with heart for self-care habits',
    color: '#F43F5E', // Rose
    iconId: 'heart',
    category: 'mood',
    tags: ['gentle', 'self-care', 'love', 'kindness'],
  },
  {
    id: 'celebration-reward',
    name: 'Celebration',
    description: 'Joyful amber with gift for milestone habits',
    color: '#F59E0B', // Amber
    iconId: 'gift',
    category: 'mood',
    tags: ['celebration', 'reward', 'milestone', 'joy'],
  },

  // Seasonal Presets (Future enhancement)
  {
    id: 'spring-renewal',
    name: 'Spring Renewal',
    description: 'Fresh lime with tree for spring habits',
    color: '#84CC16', // Lime
    iconId: 'tree',
    category: 'seasonal',
    tags: ['spring', 'renewal', 'growth', 'fresh'],
    isNew: true,
  },
];

const PRESET_CATEGORIES = [
  { id: 'all', name: 'All Presets', description: 'All available preset combinations' },
  { id: 'default', name: 'Popular', description: 'Most popular and recommended presets' },
  { id: 'theme', name: 'Themes', description: 'Style-based color and icon themes' },
  { id: 'activity', name: 'Activities', description: 'Activity-specific combinations' },
  { id: 'mood', name: 'Moods', description: 'Mood and emotion-based presets' },
  { id: 'seasonal', name: 'Seasonal', description: 'Season and time-based themes' },
];

export const CustomizationPresets: React.FC<CustomizationPresetsProps> = ({
  onPresetSelect,
  selectedColor,
  selectedIcon,
  className = '',
  size = 'medium',
  showCategories = true,
  showSearch = true,
  allowCustomSave = false,
  maxDisplayed,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter presets based on search and category
  const filteredPresets = useMemo(() => {
    let presets = CUSTOMIZATION_PRESETS;

    // Filter by category
    if (selectedCategory !== 'all') {
      presets = presets.filter(preset => preset.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      presets = presets.filter(
        preset =>
          preset.name.toLowerCase().includes(query) ||
          preset.description.toLowerCase().includes(query) ||
          preset.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Limit results if specified
    if (maxDisplayed && maxDisplayed > 0) {
      presets = presets.slice(0, maxDisplayed);
    }

    return presets;
  }, [searchQuery, selectedCategory, maxDisplayed]);

  // Check if current selection matches a preset
  const currentPreset = useMemo(() => {
    return CUSTOMIZATION_PRESETS.find(
      preset => preset.color === selectedColor && preset.iconId === selectedIcon
    );
  }, [selectedColor, selectedIcon]);

  // Handle preset selection
  const handlePresetSelect = (preset: CustomizationPreset) => {
    onPresetSelect({
      color: preset.color,
      iconId: preset.iconId,
    });
  };

  // Render individual preset
  const renderPreset = (preset: CustomizationPreset) => {
    const icon = IconLibrary.getIconById(preset.iconId);
    const colorInfo = ColorSystem.getColorByHex(preset.color);
    const textColor = ColorSystem.getTextColor(preset.color);
    const isSelected = currentPreset?.id === preset.id;
    const contrastInfo = ContrastCalculator.analyzeContrast(preset.color, '#FFFFFF');

    return (
      <button
        key={preset.id}
        type='button'
        className={`
          ${styles.presetCard}
          ${styles[size]}
          ${isSelected ? styles.selected : ''}
          ${preset.isPopular ? styles.popular : ''}
          ${preset.isNew ? styles.new : ''}
        `}
        onClick={() => handlePresetSelect(preset)}
        title={`${preset.name} - ${preset.description}`}
        aria-label={`Select ${preset.name} preset with ${colorInfo?.name || preset.color} color and ${icon?.name} icon`}
      >
        {/* Visual Preview */}
        <div className={styles.presetPreview}>
          <div className={styles.presetColor} style={{ backgroundColor: preset.color }}>
            {icon && (
              <div
                className={styles.presetIcon}
                style={{ color: textColor }}
                dangerouslySetInnerHTML={{ __html: icon.svg }}
              />
            )}
          </div>

          {/* Badges */}
          {preset.isPopular && (
            <span className={styles.popularBadge} title='Popular preset'>
              ⭐
            </span>
          )}
          {preset.isNew && (
            <span className={styles.newBadge} title='New preset'>
              🆕
            </span>
          )}

          {/* Accessibility indicator */}
          {contrastInfo.contrast.wcagAA && (
            <span className={styles.accessibilityBadge} title='WCAG AA Compliant'>
              ✓
            </span>
          )}
        </div>

        {/* Preset Info */}
        <div className={styles.presetInfo}>
          <h4 className={styles.presetName}>{preset.name}</h4>
          <p className={styles.presetDescription}>{preset.description}</p>

          <div className={styles.presetDetails}>
            <span className={styles.colorDetail}>{colorInfo?.name || preset.color}</span>
            <span className={styles.iconDetail}>{icon?.name || 'Custom Icon'}</span>
          </div>

          <div className={styles.presetTags}>
            {preset.tags.slice(0, 3).map(tag => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Selection indicator */}
        {isSelected && (
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
      </button>
    );
  };

  return (
    <div className={`${styles.customizationPresets} ${styles[size]} ${className}`}>
      {/* Header */}
      <div className={styles.header}>
        <h3 className={styles.title}>Preset Combinations</h3>
        <p className={styles.subtitle}>Choose from curated color and icon combinations</p>
      </div>

      {/* Controls */}
      {(showSearch || showCategories) && (
        <div className={styles.controls}>
          {showSearch && (
            <div className={styles.searchBox}>
              <svg className={styles.searchIcon} viewBox='0 0 20 20' fill='currentColor'>
                <path
                  fillRule='evenodd'
                  d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
                  clipRule='evenodd'
                />
              </svg>
              <input
                type='text'
                placeholder='Search presets...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              {searchQuery && (
                <button
                  type='button'
                  className={styles.clearSearch}
                  onClick={() => setSearchQuery('')}
                  aria-label='Clear search'
                >
                  ×
                </button>
              )}
            </div>
          )}

          {showCategories && (
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className={styles.categoryFilter}
              aria-label='Filter presets by category'
            >
              {PRESET_CATEGORIES.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Current Selection */}
      {currentPreset && (
        <div className={styles.currentSelection}>
          <span className={styles.currentLabel}>Current:</span>
          <div className={styles.currentPreset}>
            <div className={styles.currentColor} style={{ backgroundColor: currentPreset.color }} />
            <span className={styles.currentName}>{currentPreset.name}</span>
          </div>
        </div>
      )}

      {/* Preset Grid */}
      <div className={styles.presetGrid}>
        {filteredPresets.length > 0 ? (
          filteredPresets.map(renderPreset)
        ) : (
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
            <p>No presets found</p>
            <p className={styles.noResultsHint}>Try adjusting your search or category filter</p>
          </div>
        )}
      </div>

      {/* Custom Save Section */}
      {allowCustomSave && selectedColor && selectedIcon && !currentPreset && (
        <div className={styles.customSave}>
          <p className={styles.customSaveText}>
            Like this combination? Save it as a custom preset.
          </p>
          <button
            type='button'
            className={styles.saveButton}
            onClick={() => {
              /* Future: Save custom preset functionality */
            }}
          >
            Save as Custom Preset
          </button>
        </div>
      )}

      {/* Results Info */}
      <div className={styles.resultsInfo}>
        <p className={styles.resultsCount}>
          {filteredPresets.length} of {CUSTOMIZATION_PRESETS.length} presets
          {searchQuery && ` matching "${searchQuery}"`}
        </p>

        <div className={styles.categoryStats}>
          {PRESET_CATEGORIES.slice(1).map(category => {
            const count = CUSTOMIZATION_PRESETS.filter(p => p.category === category.id).length;
            return (
              <span key={category.id} className={styles.categoryStat}>
                {category.name}: {count}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CustomizationPresets;
