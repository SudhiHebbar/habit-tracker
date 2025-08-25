import React from 'react';
import type { ColorOption } from '../types/habit.types';
import styles from './ColorPicker.module.css';

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  className?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

// Design system color palette
const COLOR_PALETTE: ColorOption[] = [
  // Primary colors
  { hex: '#6366F1', name: 'Indigo', category: 'primary' },
  { hex: '#8B5CF6', name: 'Violet', category: 'primary' },
  { hex: '#A855F7', name: 'Purple', category: 'primary' },
  { hex: '#D946EF', name: 'Fuchsia', category: 'primary' },
  { hex: '#EC4899', name: 'Pink', category: 'primary' },
  { hex: '#EF4444', name: 'Red', category: 'primary' },

  // Secondary colors
  { hex: '#F97316', name: 'Orange', category: 'secondary' },
  { hex: '#EAB308', name: 'Yellow', category: 'secondary' },
  { hex: '#22C55E', name: 'Green', category: 'secondary' },
  { hex: '#10B981', name: 'Emerald', category: 'secondary' },
  { hex: '#06B6D4', name: 'Cyan', category: 'secondary' },
  { hex: '#3B82F6', name: 'Blue', category: 'secondary' },

  // Accent colors
  { hex: '#84CC16', name: 'Lime', category: 'accent' },
  { hex: '#F59E0B', name: 'Amber', category: 'accent' },
  { hex: '#14B8A6', name: 'Teal', category: 'accent' },
  { hex: '#0EA5E9', name: 'Sky', category: 'accent' },
  { hex: '#6366F1', name: 'Indigo Light', category: 'accent' },
  { hex: '#8B5CF6', name: 'Violet Light', category: 'accent' },

  // Neutral colors
  { hex: '#64748B', name: 'Slate', category: 'neutral' },
  { hex: '#6B7280', name: 'Gray', category: 'neutral' },
  { hex: '#71717A', name: 'Zinc', category: 'neutral' },
  { hex: '#737373', name: 'Neutral', category: 'neutral' },
  { hex: '#78716C', name: 'Stone', category: 'neutral' },
  { hex: '#374151', name: 'Dark Gray', category: 'neutral' },
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  onColorSelect,
  className = '',
  disabled = false,
  size = 'medium',
}) => {
  const handleColorClick = (color: string) => {
    if (!disabled) {
      onColorSelect(color);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, color: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleColorClick(color);
    }
  };

  const groupedColors = COLOR_PALETTE.reduce(
    (acc, color) => {
      if (!acc[color.category]) {
        acc[color.category] = [];
      }
      acc[color.category].push(color);
      return acc;
    },
    {} as Record<string, ColorOption[]>
  );

  return (
    <div className={`${styles.colorPicker} ${styles[size]} ${className}`}>
      <div className={styles.selectedColor}>
        <div
          className={styles.selectedSwatch}
          style={{ backgroundColor: selectedColor }}
          aria-label={`Selected color: ${selectedColor}`}
        />
        <span className={styles.selectedValue}>{selectedColor}</span>
      </div>

      <div className={styles.colorGrid}>
        {Object.entries(groupedColors).map(([category, colors]) => (
          <div key={category} className={styles.colorCategory}>
            <h4 className={styles.categoryTitle}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </h4>
            <div className={styles.categoryColors}>
              {colors.map(color => (
                <button
                  key={color.hex}
                  type='button'
                  className={`
                    ${styles.colorSwatch}
                    ${selectedColor === color.hex ? styles.selected : ''}
                    ${disabled ? styles.disabled : ''}
                  `}
                  style={{ backgroundColor: color.hex }}
                  onClick={() => handleColorClick(color.hex)}
                  onKeyDown={e => handleKeyDown(e, color.hex)}
                  disabled={disabled}
                  title={`${color.name} (${color.hex})`}
                  aria-label={`Select ${color.name} color (${color.hex})`}
                  aria-pressed={selectedColor === color.hex}
                >
                  {selectedColor === color.hex && (
                    <svg
                      className={styles.checkIcon}
                      viewBox='0 0 20 20'
                      fill='currentColor'
                      aria-hidden='true'
                    >
                      <path
                        fillRule='evenodd'
                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;
