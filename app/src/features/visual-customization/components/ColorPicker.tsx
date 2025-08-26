import React, { useState, useCallback, useEffect } from 'react';
import { ColorSystem } from '../services/colorSystem';
import ColorPalette from './ColorPalette';
import styles from './ColorPicker.module.css';

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  className?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  showPalette?: boolean;
  showHexInput?: boolean;
  showRecentColors?: boolean;
  allowCustomColors?: boolean;
  recentColors?: string[];
  onRecentColorsUpdate?: (colors: string[]) => void;
}

interface HSV {
  h: number; // hue: 0-360
  s: number; // saturation: 0-100
  v: number; // value: 0-100
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  onColorSelect,
  className = '',
  disabled = false,
  size = 'medium',
  showPalette = true,
  showHexInput = true,
  showRecentColors = true,
  allowCustomColors = true,
  recentColors = [],
  onRecentColorsUpdate,
}) => {
  const [hexInput, setHexInput] = useState(selectedColor);
  const [hexError, setHexError] = useState('');
  const [activeTab, setActiveTab] = useState<'palette' | 'custom'>('palette');
  const [hsv, setHsv] = useState<HSV>({ h: 0, s: 100, v: 100 });
  const saturationRef = React.useRef<HTMLDivElement>(null);

  // Update hex input when selected color changes
  useEffect(() => {
    if (selectedColor !== hexInput) {
      setHexInput(selectedColor);
      setHexError('');
      
      // Convert hex to HSV for color wheel
      const rgb = ColorSystem.hexToRgb(selectedColor);
      if (rgb) {
        const hsvValue = rgbToHsv(rgb.r, rgb.g, rgb.b);
        setHsv(hsvValue);
      }
    }
  }, [selectedColor, hexInput]);

  // RGB to HSV conversion
  const rgbToHsv = useCallback((r: number, g: number, b: number): HSV => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    let h = 0;
    let s = max === 0 ? 0 : (diff / max) * 100;
    let v = max * 100;

    if (diff !== 0) {
      switch (max) {
        case r:
          h = ((g - b) / diff + (g < b ? 6 : 0)) * 60;
          break;
        case g:
          h = ((b - r) / diff + 2) * 60;
          break;
        case b:
          h = ((r - g) / diff + 4) * 60;
          break;
      }
    }

    return { h: Math.round(h), s: Math.round(s), v: Math.round(v) };
  }, []);

  // HSV to RGB conversion
  const hsvToRgb = useCallback((h: number, s: number, v: number) => {
    h = h / 360;
    s = s / 100;
    v = v / 100;

    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    let r: number, g: number, b: number;

    switch (i % 6) {
      case 0:
        [r, g, b] = [v, t, p];
        break;
      case 1:
        [r, g, b] = [q, v, p];
        break;
      case 2:
        [r, g, b] = [p, v, t];
        break;
      case 3:
        [r, g, b] = [p, q, v];
        break;
      case 4:
        [r, g, b] = [t, p, v];
        break;
      case 5:
        [r, g, b] = [v, p, q];
        break;
      default:
        [r, g, b] = [0, 0, 0];
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }, []);

  // Handle hex input change
  const handleHexInputChange = useCallback((value: string) => {
    setHexInput(value);
    
    // Validate hex format
    if (!value) {
      setHexError('');
      return;
    }

    if (!ColorSystem.isValidHex(value)) {
      setHexError('Invalid hex color format');
      return;
    }

    setHexError('');
    onColorSelect(value);
  }, [onColorSelect]);

  // Handle hex input submission
  const handleHexInputSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (hexError || !hexInput) return;

    if (ColorSystem.isValidHex(hexInput)) {
      onColorSelect(hexInput);
      updateRecentColors(hexInput);
    }
  }, [hexError, hexInput, onColorSelect]);

  // Update recent colors
  const updateRecentColors = useCallback((color: string) => {
    if (!onRecentColorsUpdate) return;
    
    const updatedRecent = [color, ...recentColors.filter(c => c !== color)].slice(0, 8);
    onRecentColorsUpdate(updatedRecent);
  }, [recentColors, onRecentColorsUpdate]);

  // Handle color selection from palette
  const handlePaletteColorSelect = useCallback((color: string) => {
    onColorSelect(color);
    updateRecentColors(color);
  }, [onColorSelect, updateRecentColors]);

  // Handle recent color selection
  const handleRecentColorSelect = useCallback((color: string) => {
    onColorSelect(color);
  }, [onColorSelect]);

  // Handle HSV change and convert to hex
  const handleHsvChange = useCallback((newHsv: HSV) => {
    setHsv(newHsv);
    const rgb = hsvToRgb(newHsv.h, newHsv.s, newHsv.v);
    const hex = ColorSystem.rgbToHex(rgb.r, rgb.g, rgb.b);
    onColorSelect(hex);
    updateRecentColors(hex);
  }, [hsvToRgb, onColorSelect, updateRecentColors]);

  // Handle hue slider change
  const handleHueChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const hue = parseInt(e.target.value);
    handleHsvChange({ ...hsv, h: hue });
  }, [hsv, handleHsvChange]);

  // Handle saturation/value change
  const handleSaturationValueChange = useCallback((
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    if (!saturationRef.current) return;
    
    const rect = saturationRef.current.getBoundingClientRect();
    const s = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const v = Math.round((1 - (e.clientY - rect.top) / rect.height) * 100);
    
    handleHsvChange({
      ...hsv,
      s: Math.max(0, Math.min(100, s)),
      v: Math.max(0, Math.min(100, v)),
    });
  }, [hsv, handleHsvChange]);

  // Generate random color
  const generateRandomColor = useCallback(() => {
    const colors = ColorSystem.getPopularColors();
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    onColorSelect(randomColor.hex);
    updateRecentColors(randomColor.hex);
  }, [onColorSelect, updateRecentColors]);

  return (
    <div className={`${styles.colorPicker} ${styles[size]} ${className}`}>
      {/* Tab Navigation */}
      {allowCustomColors && (
        <div className={styles.tabNav}>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === 'palette' ? styles.active : ''}`}
            onClick={() => setActiveTab('palette')}
            disabled={disabled}
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4 2a2 2 0 00-2 2v11a2 2 0 002 2h3a1 1 0 000-2H4V4h12v11h-3a1 1 0 100 2h3a2 2 0 002-2V4a2 2 0 00-2-2H4z"
                clipRule="evenodd"
              />
              <path d="M10 8a2 2 0 100-4 2 2 0 000 4z" />
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path d="M10 16a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
            Palette
          </button>
          
          <button
            type="button"
            className={`${styles.tab} ${activeTab === 'custom' ? styles.active : ''}`}
            onClick={() => setActiveTab('custom')}
            disabled={disabled}
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                clipRule="evenodd"
              />
            </svg>
            Custom
          </button>
        </div>
      )}

      {/* Current Color Display */}
      <div className={styles.currentColor}>
        <div className={styles.colorPreview}>
          <div
            className={styles.colorSwatch}
            style={{ backgroundColor: selectedColor }}
            aria-label={`Current color: ${selectedColor}`}
          />
          <div className={styles.colorInfo}>
            <span className={styles.colorHex}>{selectedColor}</span>
            {ColorSystem.getColorByHex(selectedColor) && (
              <span className={styles.colorName}>
                {ColorSystem.getColorByHex(selectedColor)?.name}
              </span>
            )}
          </div>
        </div>
        
        <button
          type="button"
          className={styles.randomButton}
          onClick={generateRandomColor}
          disabled={disabled}
          title="Generate random color"
          aria-label="Generate random color"
        >
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Hex Input */}
      {showHexInput && (
        <form onSubmit={handleHexInputSubmit} className={styles.hexInput}>
          <div className={styles.inputGroup}>
            <label htmlFor="hex-input" className={styles.inputLabel}>
              Hex Color
            </label>
            <input
              id="hex-input"
              type="text"
              value={hexInput}
              onChange={(e) => handleHexInputChange(e.target.value)}
              placeholder="#6366F1"
              className={`${styles.hexField} ${hexError ? styles.error : ''}`}
              disabled={disabled}
              maxLength={7}
            />
            <button
              type="submit"
              className={styles.hexSubmit}
              disabled={disabled || !!hexError || !hexInput}
              title="Apply hex color"
            >
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          {hexError && (
            <p className={styles.errorMessage} role="alert">
              {hexError}
            </p>
          )}
        </form>
      )}

      {/* Content based on active tab */}
      {activeTab === 'palette' && showPalette ? (
        <ColorPalette
          selectedColor={selectedColor}
          onColorSelect={handlePaletteColorSelect}
          size={size}
          disabled={disabled}
          className={styles.embeddedPalette}
        />
      ) : activeTab === 'custom' && allowCustomColors ? (
        <div className={styles.customColorPicker}>
          {/* Hue Slider */}
          <div className={styles.hueSlider}>
            <label htmlFor="hue-slider" className={styles.sliderLabel}>
              Hue
            </label>
            <input
              id="hue-slider"
              type="range"
              min="0"
              max="360"
              value={hsv.h}
              onChange={handleHueChange}
              className={styles.hueInput}
              disabled={disabled}
              style={{
                background: `linear-gradient(to right, 
                  #ff0000 0%, 
                  #ffff00 16.66%, 
                  #00ff00 33.33%, 
                  #00ffff 50%, 
                  #0000ff 66.66%, 
                  #ff00ff 83.33%, 
                  #ff0000 100%)`
              }}
            />
            <span className={styles.sliderValue}>{hsv.h}°</span>
          </div>

          {/* Saturation/Value Picker */}
          <div className={styles.saturationPicker}>
            <div
              ref={saturationRef}
              className={styles.saturationCanvas}
              onClick={handleSaturationValueChange}
              style={{
                backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
              }}
            >
              <div className={styles.saturationOverlay} />
              <div className={styles.valueOverlay} />
              <div
                className={styles.colorIndicator}
                style={{
                  left: `${hsv.s}%`,
                  top: `${100 - hsv.v}%`,
                }}
              />
            </div>
            <div className={styles.saturationLabels}>
              <span>Saturation: {hsv.s}%</span>
              <span>Brightness: {hsv.v}%</span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Recent Colors */}
      {showRecentColors && recentColors.length > 0 && (
        <div className={styles.recentColors}>
          <h4 className={styles.recentTitle}>Recent Colors</h4>
          <div className={styles.recentGrid}>
            {recentColors.map((color, index) => (
              <button
                key={`${color}-${index}`}
                type="button"
                className={`${styles.recentSwatch} ${selectedColor === color ? styles.selected : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => handleRecentColorSelect(color)}
                disabled={disabled}
                title={`Use recent color: ${color}`}
                aria-label={`Select recent color: ${color}`}
              >
                {selectedColor === color && (
                  <svg
                    className={styles.checkIcon}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    style={{ color: ColorSystem.getTextColor(color) }}
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;