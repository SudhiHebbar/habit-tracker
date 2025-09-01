/**
 * Visual Customization Feature
 * Export all components, services, hooks, and types
 */

// Components
export { default as ColorPalette } from './components/ColorPalette';
export { default as ColorPicker } from './components/ColorPicker';
export { default as ColorContrastIndicator } from './components/ColorContrastIndicator';
export { default as IconSelector } from './components/IconSelector';
export { default as CustomizationPreview } from './components/CustomizationPreview';
export { default as CustomizationPresets } from './components/CustomizationPresets';
export { default as RecentColors } from './components/RecentColors';

// Shared Components
export { ColorSwatch, IconDisplay, PreviewCard } from './components/shared';

// Services
export { ColorSystem } from './services/colorSystem';
export { ContrastCalculator } from './services/contrastCalculator';
export { IconLibrary } from './services/iconLibrary';

// Import services for local use
import { ColorSystem } from './services/colorSystem';
import { ContrastCalculator } from './services/contrastCalculator';
import { IconLibrary } from './services/iconLibrary';

// Types
export type {
  // Color types
  ColorOption,
  ColorCategory,

  // Icon types
  IconOption,
  IconCategory,
  IconCategoryInfo,

  // Contrast types
  ContrastResult,
  ColorAccessibilityInfo,

  // Customization types
  HabitCustomization,
  CustomizationPreset,
  CustomizationHistory,
  CustomizationPreferences,
  CustomizationValidation,
  CustomizationConfig,

  // Component prop types
  BaseCustomizationProps,
  ColorSelectionProps,
  IconSelectionProps,
  PreviewProps,

  // Hook return types
  UseColorPaletteReturn,
  UseIconLibraryReturn,
  UseCustomizationPreviewReturn,
  UseColorContrastReturn,
  UseCustomizationHistoryReturn,

  // Theme and accessibility types
  ColorTheme,
  AccessibilitySettings,

  // Error types
  CustomizationErrorData,
  AccessibilityErrorData,
  ValidationErrorData,

  // Utility types
  CustomizationComponent,
  CustomizationSize,
  CustomizationTheme,
} from './types/customization.types';

// Re-export from services for convenience
export {
  COLOR_PALETTE as DESIGN_SYSTEM_COLORS,
  COLOR_CATEGORIES as DESIGN_SYSTEM_CATEGORIES,
} from './services/colorSystem';

export {
  ICON_LIBRARY as COMPREHENSIVE_ICON_LIBRARY,
  ICON_CATEGORIES as COMPREHENSIVE_ICON_CATEGORIES,
} from './services/iconLibrary';

export {
  WCAG_STANDARDS as ACCESSIBILITY_STANDARDS,
  COMMON_BACKGROUNDS as TEST_BACKGROUNDS,
} from './services/contrastCalculator';

// Constants
export {
  DEFAULT_CUSTOMIZATION_CONFIG,
  DEFAULT_ACCESSIBILITY_SETTINGS,
} from './types/customization.types';

/**
 * Feature metadata
 */
export const VISUAL_CUSTOMIZATION_FEATURE = {
  name: 'Visual Customization System',
  version: '1.0.0',
  description: 'Comprehensive visual customization system for habit personalization',
  components: [
    'ColorPalette',
    'ColorPicker',
    'ColorContrastIndicator',
    'IconLibrary',
    'IconSelector',
    'CustomizationPreview',
    'CustomizationPresets',
    'RecentColors',
    'ColorSwatch',
    'IconDisplay',
    'PreviewCard',
  ],
  services: ['ColorSystem', 'ContrastCalculator', 'IconLibrary'],
  features: {
    colorCustomization: {
      enabled: true,
      paletteSize: 50, // Approximate count
      categories: 5,
      wcagCompliant: true,
      customColors: true,
    },
    iconCustomization: {
      enabled: true,
      iconCount: 30, // Approximate count
      categories: 12,
      searchable: true,
      customIcons: false, // Future enhancement
    },
    accessibility: {
      contrastValidation: true,
      wcagAASupport: true,
      wcagAAASupport: true,
      colorBlindnessSupport: true, // Future enhancement
      screenReaderSupport: true,
      keyboardNavigation: true,
    },
    persistence: {
      localStorage: true,
      cloudSync: false, // Future enhancement
      history: true,
      recentItems: true,
    },
  },
  accessibility: {
    wcagLevel: 'AA',
    keyboardNavigation: true,
    screenReaderSupport: true,
    highContrastMode: true,
    colorBlindnessConsideration: true,
  },
} as const;

/**
 * Quick access utilities
 */
export const QuickCustomization = {
  // Popular colors for quick selection
  popularColors: () => ColorSystem.getPopularColors() || [],

  // Popular icons for quick selection
  popularIcons: () => IconLibrary.getPopularIcons() || [],

  // Get suggestions for a habit category
  getHabitSuggestions: (category: string) => ({
    colors: ColorSystem.getColorsForHabitCategory(category) || [],
    icons: IconLibrary.getIconSuggestionsForHabit(category) || [],
  }),

  // Validate customization quickly
  validateCustomization: (color: string, backgroundColor: string = '#FFFFFF') =>
    ContrastCalculator.analyzeContrast(color, backgroundColor),

  // Get accessible color alternatives
  getAccessibleAlternatives: (color: string, background: string = '#FFFFFF') =>
    ContrastCalculator.generateRecommendations(color, background),

  // Quick search across colors and icons
  search: (query: string) => ({
    colors: ColorSystem.searchColors(query) || [],
    icons: IconLibrary.searchIcons(query) || [],
  }),
};

export default {
  ColorSystem,
  ContrastCalculator,
  IconLibrary,
  QuickCustomization,
  VISUAL_CUSTOMIZATION_FEATURE,
};
