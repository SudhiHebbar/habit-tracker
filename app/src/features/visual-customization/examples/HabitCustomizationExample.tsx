import React, { useState } from 'react';
import {
  ColorPalette,
  IconSelector,
  CustomizationPreview,
  CustomizationPresets,
  RecentColors,
} from '../index';

interface HabitCustomizationExampleProps {
  initialColor?: string;
  initialIcon?: string;
  onSave?: (customization: { color: string; iconId: string }) => void;
  onCancel?: () => void;
}

/**
 * Example integration component showing how to use visual customization
 * in a habit creation or editing workflow
 */
export const HabitCustomizationExample: React.FC<HabitCustomizationExampleProps> = ({
  initialColor = '#3B82F6',
  initialIcon = 'heart',
  onSave,
  onCancel,
}) => {
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [selectedIcon, setSelectedIcon] = useState(initialIcon);
  const [recentColors, setRecentColors] = useState<string[]>([
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'
  ]);
  const [activeTab, setActiveTab] = useState<'presets' | 'color' | 'icon'>('presets');

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    // Update recent colors
    if (!recentColors.includes(color)) {
      setRecentColors(prev => [color, ...prev.slice(0, 7)]);
    }
  };

  const handleIconSelect = (iconId: string | null) => {
    if (iconId) {
      setSelectedIcon(iconId);
    }
  };

  const handlePresetSelect = (preset: { color: string; iconId: string }) => {
    setSelectedColor(preset.color);
    setSelectedIcon(preset.iconId);
    handleColorSelect(preset.color);
  };

  const handleSave = () => {
    if (onSave) {
      onSave({ color: selectedColor, iconId: selectedIcon });
    }
  };

  const clearRecentColors = () => {
    setRecentColors([]);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2>Customize Your Habit</h2>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
          Choose colors and icons that motivate you and make your habit stand out.
        </p>

        {/* Preview */}
        <div style={{ 
          border: '1px solid #e5e7eb', 
          borderRadius: '8px', 
          padding: '1rem',
          backgroundColor: '#f9fafb'
        }}>
          <CustomizationPreview
            color={selectedColor}
            iconId={selectedIcon}
            title="Daily Exercise"
            description="30 minutes of physical activity"
            showAllContexts={false}
            contexts={['dashboard', 'card']}
            size="small"
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ 
        borderBottom: '1px solid #e5e7eb', 
        marginBottom: '1.5rem'
      }}>
        <nav style={{ display: 'flex', gap: '2rem' }}>
          {[
            { key: 'presets', label: 'Quick Presets' },
            { key: 'color', label: 'Colors' },
            { key: 'icon', label: 'Icons' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: '0.75rem 0',
                border: 'none',
                background: 'none',
                color: activeTab === tab.key ? '#3b82f6' : '#6b7280',
                borderBottom: activeTab === tab.key ? '2px solid #3b82f6' : '2px solid transparent',
                fontWeight: activeTab === tab.key ? '600' : '400',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div style={{ marginBottom: '2rem' }}>
        {activeTab === 'presets' && (
          <div>
            <h3>Choose from curated combinations</h3>
            <CustomizationPresets
              onPresetSelect={handlePresetSelect}
              selectedColor={selectedColor}
              selectedIcon={selectedIcon}
              showCategories={true}
              showSearch={true}
              maxDisplayed={12}
              size="small"
            />
          </div>
        )}

        {activeTab === 'color' && (
          <div>
            <h3>Select a color</h3>
            
            {/* Recent Colors */}
            {recentColors.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <RecentColors
                  recentColors={recentColors}
                  onColorSelect={handleColorSelect}
                  onClearRecent={clearRecentColors}
                  selectedColor={selectedColor}
                  showAccessibility={true}
                  size="small"
                />
              </div>
            )}

            {/* Color Palette */}
            <ColorPalette
              onColorSelect={handleColorSelect}
              selectedColor={selectedColor}
              showAccessibility={true}
              allowCustomColors={true}
              size="small"
              layout="grid"
              maxColors={30}
            />
          </div>
        )}

        {activeTab === 'icon' && (
          <div>
            <h3>Choose an icon</h3>
            <IconSelector
              onIconSelect={handleIconSelect}
              selectedIcon={selectedIcon}
              showSearch={true}
              showCategories={true}
              showPopular={true}
              size="small"
              maxDisplayed={24}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        paddingTop: '1.5rem',
        borderTop: '1px solid #e5e7eb'
      }}>
        <button
          onClick={onCancel}
          style={{
            padding: '0.75rem 1.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            background: 'white',
            color: '#374151',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
          }}
        >
          Cancel
        </button>
        
        <button
          onClick={handleSave}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '6px',
            background: selectedColor,
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
          }}
        >
          Save Customization
        </button>
      </div>

      {/* Helper Text */}
      <div style={{ 
        marginTop: '1rem', 
        padding: '0.75rem', 
        backgroundColor: '#f0f9ff', 
        borderRadius: '6px',
        fontSize: '0.75rem',
        color: '#1e40af'
      }}>
        <strong>Tip:</strong> Choose high-contrast colors for better visibility. 
        Colors marked with ✓ meet WCAG AA accessibility standards.
      </div>
    </div>
  );
};

export default HabitCustomizationExample;