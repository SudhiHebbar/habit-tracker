/**
 * Visual Customization Types
 * Consolidated type definitions for the visual customization system
 */

// Import and re-export types from services
import type {
  ColorOption,
  ColorCategory,
} from '../services/colorSystem';

import type {
  IconOption,
  IconCategory,
  IconCategoryInfo,
} from '../services/iconLibrary';

import type {
  ContrastResult,
  ColorAccessibilityInfo,
} from '../services/contrastCalculator';

// Re-export the imported types
export type {
  ColorOption,
  ColorCategory,
  IconOption,
  IconCategory,
  IconCategoryInfo,
  ContrastResult,
  ColorAccessibilityInfo,
};

// Customization-specific types
export interface HabitCustomization {
  id?: string;
  habitId: string;
  color: string;
  iconId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomizationPreset {
  id: string;
  name: string;
  description: string;
  color: string;
  iconId: string;
  category: 'default' | 'theme' | 'seasonal' | 'user';
  tags: string[];
  isPopular?: boolean;
  isNew?: boolean;
  createdBy?: string;
  createdAt: Date;
}

export interface CustomizationHistory {
  id: string;
  type: 'color' | 'icon' | 'preset';
  value: string;
  habitId?: string;
  timestamp: Date;
}

export interface CustomizationPreferences {
  userId?: string;
  recentColors: string[];
  recentIcons: string[];
  favoritePresets: string[];
  defaultColorCategory: string;
  defaultIconCategory: string;
  enableAccessibilityWarnings: boolean;
  preferHighContrast: boolean;
  colorHistory: CustomizationHistory[];
  iconHistory: CustomizationHistory[];
}

export interface CustomizationValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  accessibility: {
    hasContrastIssues: boolean;
    contrastRatio?: number;
    wcagCompliance: 'AAA' | 'AA' | 'AA Large' | 'Fail';
  };
}

// Component prop types
export interface BaseCustomizationProps {
  className?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export interface ColorSelectionProps extends BaseCustomizationProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  showCategories?: boolean;
  showSearch?: boolean;
  allowCustom?: boolean;
  testBackgrounds?: string[];
}

export interface IconSelectionProps extends BaseCustomizationProps {
  selectedIcon?: string | null;
  onIconSelect: (iconId: string | null) => void;
  category?: string;
  showSearch?: boolean;
  showCategories?: boolean;
  maxSelection?: number;
}

export interface PreviewProps extends BaseCustomizationProps {
  color: string;
  iconId?: string;
  habitName?: string;
  showInContext?: boolean;
  contexts?: ('dashboard' | 'list' | 'card' | 'detail')[];
}

// API/Service types
export interface CustomizationApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  validationErrors?: string[];
}

export interface SaveCustomizationRequest {
  habitId: string;
  color: string;
  iconId?: string;
  validateAccessibility?: boolean;
}

export interface CustomizationSearchParams {
  query?: string;
  category?: string;
  tags?: string[];
  isPopular?: boolean;
  isNew?: boolean;
  limit?: number;
  offset?: number;
}

// Theme and accessibility types
export interface ColorTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  accessibility: {
    contrastRatio: number;
    wcagCompliant: boolean;
    highContrastMode: boolean;
  };
}

export interface AccessibilitySettings {
  enableContrastValidation: boolean;
  minimumContrastRatio: number;
  showAccessibilityIndicators: boolean;
  preferHighContrastColors: boolean;
  enableColorBlindnessSimulation: boolean;
  reduceMotion: boolean;
}

// Event types
export interface CustomizationEvent {
  type: 'color_selected' | 'icon_selected' | 'preset_applied' | 'customization_saved';
  data: {
    habitId?: string;
    color?: string;
    iconId?: string;
    presetId?: string;
    timestamp: Date;
  };
}

// Storage types
export interface CustomizationStorage {
  preferences: CustomizationPreferences;
  presets: CustomizationPreset[];
  history: CustomizationHistory[];
  cache: {
    colors: { [key: string]: ColorOption };
    icons: { [key: string]: IconOption };
    lastUpdated: Date;
  };
}

// Hook return types
export interface UseColorPaletteReturn {
  colors: ColorOption[];
  categories: ColorCategory[];
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  searchColors: (query: string) => ColorOption[];
  getColorsByCategory: (category: string) => ColorOption[];
  recentColors: string[];
  addToRecent: (color: string) => void;
  clearRecent: () => void;
}

export interface UseIconLibraryReturn {
  icons: IconOption[];
  categories: IconCategoryInfo[];
  selectedIcon: string | null;
  setSelectedIcon: (iconId: string | null) => void;
  searchIcons: (query: string) => IconOption[];
  getIconsByCategory: (category: string) => IconOption[];
  recentIcons: string[];
  addToRecent: (iconId: string) => void;
  clearRecent: () => void;
}

export interface UseCustomizationPreviewReturn {
  preview: {
    color: string;
    iconId?: string;
    isValid: boolean;
    accessibility: ContrastResult;
  };
  updatePreview: (updates: Partial<{ color: string; iconId: string }>) => void;
  validateCustomization: () => CustomizationValidation;
  resetPreview: () => void;
}

export interface UseColorContrastReturn {
  contrastRatio: number;
  wcagCompliance: ContrastResult;
  isAccessible: boolean;
  recommendations: string[];
  testColor: (foreground: string, background: string) => ContrastResult;
  getBestTextColor: (backgroundColor: string) => string;
}

export interface UseCustomizationHistoryReturn {
  colorHistory: CustomizationHistory[];
  iconHistory: CustomizationHistory[];
  allHistory: CustomizationHistory[];
  addToHistory: (item: Omit<CustomizationHistory, 'id' | 'timestamp'>) => void;
  clearHistory: (type?: 'color' | 'icon') => void;
  getRecentItems: (type: 'color' | 'icon', limit?: number) => CustomizationHistory[];
}

// Error types
export interface CustomizationErrorData {
  message: string;
  code: string;
  details?: any;
}

export interface AccessibilityErrorData extends CustomizationErrorData {
  contrastRatio: number;
}

export interface ValidationErrorData extends CustomizationErrorData {
  field: string;
}

// Utility types
export type CustomizationComponent = 
  | 'ColorPalette'
  | 'ColorPicker' 
  | 'IconLibrary'
  | 'IconSelector'
  | 'CustomizationPreview'
  | 'ContrastIndicator'
  | 'PresetSelector'
  | 'RecentColors';

export type CustomizationSize = 'small' | 'medium' | 'large';

export type CustomizationTheme = 'light' | 'dark' | 'auto';

export interface CustomizationConfig {
  enableColorCustomization: boolean;
  enableIconCustomization: boolean;
  enablePresets: boolean;
  enableAccessibilityValidation: boolean;
  enableHistory: boolean;
  maxRecentItems: number;
  defaultColor: string;
  defaultIconId: string;
  allowCustomColors: boolean;
  allowCustomIcons: boolean;
  theme: CustomizationTheme;
}

// Default values
export const DEFAULT_CUSTOMIZATION_CONFIG: CustomizationConfig = {
  enableColorCustomization: true,
  enableIconCustomization: true,
  enablePresets: true,
  enableAccessibilityValidation: true,
  enableHistory: true,
  maxRecentItems: 8,
  defaultColor: '#6366F1',
  defaultIconId: 'star',
  allowCustomColors: true,
  allowCustomIcons: false,
  theme: 'auto',
};

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  enableContrastValidation: true,
  minimumContrastRatio: 4.5, // WCAG AA
  showAccessibilityIndicators: true,
  preferHighContrastColors: false,
  enableColorBlindnessSimulation: false,
  reduceMotion: false,
};

export default {
  DEFAULT_CUSTOMIZATION_CONFIG,
  DEFAULT_ACCESSIBILITY_SETTINGS,
};