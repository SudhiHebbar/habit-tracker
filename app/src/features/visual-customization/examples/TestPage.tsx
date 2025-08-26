import React, { useState } from 'react';
import {
  ColorPalette,
  ColorPicker,
  ColorContrastIndicator,
  IconSelector,
  CustomizationPreview,
  CustomizationPresets,
  RecentColors,
  ColorSwatch,
  IconDisplay,
  PreviewCard,
  ColorSystem,
  ContrastCalculator,
  IconLibrary,
} from '../index';

/**
 * Test page to demonstrate and test all visual customization components
 * This can be used as a reference implementation and testing harness
 */
export const VisualCustomizationTestPage: React.FC = () => {
  // State for testing
  const [selectedColor, setSelectedColor] = useState<string>('#3B82F6');
  const [selectedIcon, setSelectedIcon] = useState<string>('heart');
  const [recentColors, setRecentColors] = useState<string[]>([
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'
  ]);

  // Handlers
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    // Add to recent colors
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

  const clearRecentColors = () => {
    setRecentColors([]);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Visual Customization System Test Page</h1>
      
      {/* Current Selection Display */}
      <div style={{ 
        marginBottom: '2rem', 
        padding: '1rem', 
        border: '1px solid #e5e7eb', 
        borderRadius: '8px',
        backgroundColor: '#f9fafb'
      }}>
        <h2>Current Selection</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ColorSwatch 
            color={selectedColor}
            selected={true}
            size="large"
            onClick={handleColorSelect}
          />
          <IconDisplay
            iconId={selectedIcon}
            selected={true}
            size="large"
            color={selectedColor}
          />
          <div>
            <p><strong>Color:</strong> {selectedColor}</p>
            <p><strong>Icon:</strong> {selectedIcon}</p>
            <p><strong>Color Name:</strong> {ColorSystem.getColorByHex(selectedColor)?.name || 'Custom'}</p>
          </div>
        </div>
      </div>

      {/* Component Tests */}
      <div style={{ display: 'grid', gap: '2rem' }}>
        
        {/* Color Palette Test */}
        <section>
          <h2>ColorPalette Component</h2>
          <ColorPalette
            onColorSelect={handleColorSelect}
            selectedColor={selectedColor}
            showAccessibility={true}
            allowCustomColors={true}
          />
        </section>

        {/* Color Picker Test */}
        <section>
          <h2>ColorPicker Component</h2>
          <ColorPicker
            selectedColor={selectedColor}
            onColorChange={handleColorSelect}
            showHexInput={true}
            showEyeDropper={true}
            showSavedColors={true}
          />
        </section>

        {/* Color Contrast Indicator Test */}
        <section>
          <h2>ColorContrastIndicator Component</h2>
          <ColorContrastIndicator
            foregroundColor={selectedColor}
            backgroundColor="#FFFFFF"
            showDetails={true}
            size="large"
          />
          <div style={{ marginTop: '1rem' }}>
            <ColorContrastIndicator
              foregroundColor={selectedColor}
              backgroundColor="#000000"
              showDetails={true}
              size="large"
            />
          </div>
        </section>

        {/* Icon Selector Test */}
        <section>
          <h2>IconSelector Component</h2>
          <IconSelector
            onIconSelect={handleIconSelect}
            selectedIcon={selectedIcon}
            showSearch={true}
            showCategories={true}
            showPopular={true}
            size="medium"
          />
        </section>

        {/* Recent Colors Test */}
        <section>
          <h2>RecentColors Component</h2>
          <RecentColors
            recentColors={recentColors}
            onColorSelect={handleColorSelect}
            onClearRecent={clearRecentColors}
            selectedColor={selectedColor}
            showAccessibility={true}
            showClearButton={true}
          />
        </section>

        {/* Customization Presets Test */}
        <section>
          <h2>CustomizationPresets Component</h2>
          <CustomizationPresets
            onPresetSelect={handlePresetSelect}
            selectedColor={selectedColor}
            selectedIcon={selectedIcon}
            showCategories={true}
            showSearch={true}
            allowCustomSave={true}
          />
        </section>

        {/* Preview Components Test */}
        <section>
          <h2>Preview Components</h2>
          
          <h3>CustomizationPreview</h3>
          <CustomizationPreview
            color={selectedColor}
            iconId={selectedIcon}
            title="Daily Exercise"
            description="30 minutes of physical activity"
            showAllContexts={true}
            showAccessibilityInfo={true}
          />

          <h3>PreviewCard Examples</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <PreviewCard
              title="Dashboard Preview"
              description="How it looks on the dashboard"
              color={selectedColor}
              iconId={selectedIcon}
              context="dashboard"
              showAccessibilityInfo={true}
            />
            <PreviewCard
              title="List Preview"
              description="How it looks in habit lists"
              color={selectedColor}
              iconId={selectedIcon}
              context="list"
              showAccessibilityInfo={true}
            />
            <PreviewCard
              title="Detail Preview"
              description="How it looks in detail view"
              color={selectedColor}
              iconId={selectedIcon}
              context="detail"
              showAccessibilityInfo={true}
            />
          </div>
        </section>

        {/* Shared Components Test */}
        <section>
          <h2>Shared Components Test</h2>
          
          <h3>ColorSwatch Variations</h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
            <ColorSwatch color={selectedColor} size="small" />
            <ColorSwatch color={selectedColor} size="medium" />
            <ColorSwatch color={selectedColor} size="large" />
            <ColorSwatch color={selectedColor} size="medium" shape="circle" />
            <ColorSwatch color={selectedColor} size="medium" shape="square" />
            <ColorSwatch color={selectedColor} size="medium" selected={true} />
            <ColorSwatch color={selectedColor} size="medium" disabled={true} />
          </div>

          <h3>IconDisplay Variations</h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
            <IconDisplay iconId={selectedIcon} size="small" />
            <IconDisplay iconId={selectedIcon} size="medium" />
            <IconDisplay iconId={selectedIcon} size="large" />
            <IconDisplay iconId={selectedIcon} size="xlarge" />
            <IconDisplay iconId={selectedIcon} size="medium" variant="filled" />
            <IconDisplay iconId={selectedIcon} size="medium" variant="outlined" />
            <IconDisplay iconId={selectedIcon} size="medium" selected={true} />
            <IconDisplay iconId={selectedIcon} size="medium" color={selectedColor} />
          </div>
        </section>

        {/* Service Testing */}
        <section>
          <h2>Service Testing</h2>
          
          <h3>ColorSystem Service</h3>
          <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <p><strong>Popular Colors:</strong> {ColorSystem.getPopularColors()?.length || 0} colors</p>
            <p><strong>All Categories:</strong> {ColorSystem.getAllCategories().map(c => c.name).join(', ')}</p>
            <p><strong>Selected Color Info:</strong> {JSON.stringify(ColorSystem.getColorByHex(selectedColor), null, 2)}</p>
          </div>

          <h3>IconLibrary Service</h3>
          <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px', marginTop: '1rem' }}>
            <p><strong>Total Icons:</strong> {IconLibrary.getAllIcons().length} icons</p>
            <p><strong>Categories:</strong> {IconLibrary.getAllCategories().map(c => c.name).join(', ')}</p>
            <p><strong>Popular Icons:</strong> {IconLibrary.getPopularIcons()?.length || 0} icons</p>
          </div>

          <h3>ContrastCalculator Service</h3>
          <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px', marginTop: '1rem' }}>
            {(() => {
              const whiteContrast = ContrastCalculator.analyzeContrast(selectedColor, '#FFFFFF');
              const blackContrast = ContrastCalculator.analyzeContrast(selectedColor, '#000000');
              return (
                <>
                  <p><strong>Contrast with White:</strong> {whiteContrast.contrast.ratio.toFixed(2)}:1 ({whiteContrast.contrast.grade})</p>
                  <p><strong>Contrast with Black:</strong> {blackContrast.contrast.ratio.toFixed(2)}:1 ({blackContrast.contrast.grade})</p>
                  <p><strong>Recommended Text Color:</strong> {ColorSystem.getTextColor(selectedColor)}</p>
                </>
              );
            })()}
          </div>
        </section>

        {/* Accessibility Testing */}
        <section>
          <h2>Accessibility Testing</h2>
          <div style={{ padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
            <p>Test keyboard navigation: Use Tab, Enter, Space, and Arrow keys</p>
            <p>Test screen reader: Enable screen reader and navigate through components</p>
            <p>Test high contrast mode: Enable high contrast mode in your OS</p>
            <p>Test color blindness: Use browser extensions to simulate color blindness</p>
            <p>Test responsive design: Resize the browser window</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default VisualCustomizationTestPage;