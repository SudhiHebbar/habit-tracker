/**
 * Color System Service
 * Manages the comprehensive color palette and provides color-related utilities
 * Based on Figma design system specifications
 */

export interface ColorOption {
  hex: string;
  name: string;
  category: 'primary' | 'secondary' | 'accent' | 'extended' | 'neutral';
  variants?: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  isDefault?: boolean;
  accessibility?: {
    contrastOnWhite: number;
    contrastOnBlack: number;
    wcagAA: boolean;
    wcagAAA: boolean;
  };
}

export interface ColorCategory {
  id: string;
  name: string;
  description: string;
  colors: ColorOption[];
}

/**
 * Complete color palette matching Figma design system
 */
export const COLOR_PALETTE: ColorOption[] = [
  // Primary Colors - Core brand colors
  {
    hex: '#6366F1',
    name: 'Indigo',
    category: 'primary',
    isDefault: true,
    variants: {
      50: '#EEF2FF',
      100: '#E0E7FF',
      200: '#C7D2FE',
      300: '#A5B4FC',
      400: '#818CF8',
      500: '#6366F1',
      600: '#4F46E5',
      700: '#4338CA',
      800: '#3730A3',
      900: '#312E81',
    },
    accessibility: {
      contrastOnWhite: 5.93,
      contrastOnBlack: 3.54,
      wcagAA: true,
      wcagAAA: false,
    },
  },
  {
    hex: '#8B5CF6',
    name: 'Violet',
    category: 'primary',
    variants: {
      50: '#F5F3FF',
      100: '#EDE9FE',
      200: '#DDD6FE',
      300: '#C4B5FD',
      400: '#A78BFA',
      500: '#8B5CF6',
      600: '#7C3AED',
      700: '#6D28D9',
      800: '#5B21B6',
      900: '#4C1D95',
    },
    accessibility: {
      contrastOnWhite: 4.73,
      contrastOnBlack: 4.44,
      wcagAA: true,
      wcagAAA: false,
    },
  },

  // Secondary Colors - Supporting brand colors
  {
    hex: '#10B981',
    name: 'Emerald',
    category: 'secondary',
    variants: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      200: '#A7F3D0',
      300: '#6EE7B7',
      400: '#34D399',
      500: '#10B981',
      600: '#059669',
      700: '#047857',
      800: '#065F46',
      900: '#064E3B',
    },
    accessibility: {
      contrastOnWhite: 6.74,
      contrastOnBlack: 3.11,
      wcagAA: true,
      wcagAAA: false,
    },
  },
  {
    hex: '#F59E0B',
    name: 'Amber',
    category: 'secondary',
    variants: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F',
    },
    accessibility: {
      contrastOnWhite: 3.97,
      contrastOnBlack: 5.28,
      wcagAA: false,
      wcagAAA: false,
    },
  },
  {
    hex: '#EF4444',
    name: 'Red',
    category: 'secondary',
    variants: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      200: '#FECACA',
      300: '#FCA5A5',
      400: '#F87171',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
      800: '#991B1B',
      900: '#7F1D1D',
    },
    accessibility: {
      contrastOnWhite: 4.5,
      contrastOnBlack: 4.66,
      wcagAA: true,
      wcagAAA: false,
    },
  },

  // Accent Colors - Vibrant options
  {
    hex: '#3B82F6',
    name: 'Blue',
    category: 'accent',
    variants: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A',
    },
    accessibility: {
      contrastOnWhite: 7.37,
      contrastOnBlack: 2.85,
      wcagAA: true,
      wcagAAA: true,
    },
  },
  {
    hex: '#06B6D4',
    name: 'Cyan',
    category: 'accent',
    variants: {
      50: '#ECFEFF',
      100: '#CFFAFE',
      200: '#A5F3FC',
      300: '#67E8F9',
      400: '#22D3EE',
      500: '#06B6D4',
      600: '#0891B2',
      700: '#0E7490',
      800: '#155E75',
      900: '#164E63',
    },
    accessibility: {
      contrastOnWhite: 6.18,
      contrastOnBlack: 3.4,
      wcagAA: true,
      wcagAAA: false,
    },
  },
  {
    hex: '#84CC16',
    name: 'Lime',
    category: 'accent',
    variants: {
      50: '#F7FEE7',
      100: '#ECFCCB',
      200: '#D9F99D',
      300: '#BEF264',
      400: '#A3E635',
      500: '#84CC16',
      600: '#65A30D',
      700: '#4D7C0F',
      800: '#365314',
      900: '#1A2E05',
    },
    accessibility: {
      contrastOnWhite: 3.31,
      contrastOnBlack: 6.34,
      wcagAA: false,
      wcagAAA: false,
    },
  },
  {
    hex: '#EC4899',
    name: 'Pink',
    category: 'accent',
    variants: {
      50: '#FDF2F8',
      100: '#FCE7F3',
      200: '#FBCFE8',
      300: '#F9A8D4',
      400: '#F472B6',
      500: '#EC4899',
      600: '#DB2777',
      700: '#BE185D',
      800: '#9D174D',
      900: '#831843',
    },
    accessibility: {
      contrastOnWhite: 4.63,
      contrastOnBlack: 4.53,
      wcagAA: true,
      wcagAAA: false,
    },
  },

  // Extended Colors - Additional variety
  {
    hex: '#0EA5E9',
    name: 'Sky',
    category: 'extended',
    variants: {
      50: '#F0F9FF',
      100: '#E0F2FE',
      200: '#BAE6FD',
      300: '#7DD3FC',
      400: '#38BDF8',
      500: '#0EA5E9',
      600: '#0284C7',
      700: '#0369A1',
      800: '#075985',
      900: '#0C4A6E',
    },
    accessibility: {
      contrastOnWhite: 6.85,
      contrastOnBlack: 3.06,
      wcagAA: true,
      wcagAAA: false,
    },
  },
  {
    hex: '#14B8A6',
    name: 'Teal',
    category: 'extended',
    variants: {
      50: '#F0FDFA',
      100: '#CCFBF1',
      200: '#99F6E4',
      300: '#5EEAD4',
      400: '#2DD4BF',
      500: '#14B8A6',
      600: '#0D9488',
      700: '#0F766E',
      800: '#115E59',
      900: '#134E4A',
    },
    accessibility: {
      contrastOnWhite: 6.33,
      contrastOnBlack: 3.32,
      wcagAA: true,
      wcagAAA: false,
    },
  },
  {
    hex: '#F97316',
    name: 'Orange',
    category: 'extended',
    variants: {
      50: '#FFF7ED',
      100: '#FFEDD5',
      200: '#FED7AA',
      300: '#FDBA74',
      400: '#FB923C',
      500: '#F97316',
      600: '#EA580C',
      700: '#C2410C',
      800: '#9A3412',
      900: '#7C2D12',
    },
    accessibility: {
      contrastOnWhite: 3.73,
      contrastOnBlack: 5.63,
      wcagAA: false,
      wcagAAA: false,
    },
  },
  {
    hex: '#A855F7',
    name: 'Purple',
    category: 'extended',
    variants: {
      50: '#FAF5FF',
      100: '#F3E8FF',
      200: '#E9D5FF',
      300: '#D8B4FE',
      400: '#C084FC',
      500: '#A855F7',
      600: '#9333EA',
      700: '#7E22CE',
      800: '#6B21A8',
      900: '#581C87',
    },
    accessibility: {
      contrastOnWhite: 4.35,
      contrastOnBlack: 4.82,
      wcagAA: false,
      wcagAAA: false,
    },
  },
  {
    hex: '#D946EF',
    name: 'Fuchsia',
    category: 'extended',
    variants: {
      50: '#FDF4FF',
      100: '#FAE8FF',
      200: '#F5D0FE',
      300: '#F0ABFC',
      400: '#E879F9',
      500: '#D946EF',
      600: '#C026D3',
      700: '#A21CAF',
      800: '#86198F',
      900: '#701A75',
    },
    accessibility: {
      contrastOnWhite: 3.72,
      contrastOnBlack: 5.64,
      wcagAA: false,
      wcagAAA: false,
    },
  },

  // Neutral Colors - Grays and subtle tones
  {
    hex: '#64748B',
    name: 'Slate',
    category: 'neutral',
    variants: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },
    accessibility: {
      contrastOnWhite: 6.93,
      contrastOnBlack: 3.03,
      wcagAA: true,
      wcagAAA: false,
    },
  },
  {
    hex: '#6B7280',
    name: 'Gray',
    category: 'neutral',
    variants: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
    accessibility: {
      contrastOnWhite: 6.86,
      contrastOnBlack: 3.06,
      wcagAA: true,
      wcagAAA: false,
    },
  },
];

/**
 * Organizes colors by category for easier navigation
 */
export const COLOR_CATEGORIES: ColorCategory[] = [
  {
    id: 'primary',
    name: 'Primary',
    description: 'Core brand colors for primary actions and emphasis',
    colors: COLOR_PALETTE.filter(color => color.category === 'primary'),
  },
  {
    id: 'secondary',
    name: 'Secondary',
    description: 'Supporting colors for secondary actions and states',
    colors: COLOR_PALETTE.filter(color => color.category === 'secondary'),
  },
  {
    id: 'accent',
    name: 'Accent',
    description: 'Vibrant colors for highlights and visual interest',
    colors: COLOR_PALETTE.filter(color => color.category === 'accent'),
  },
  {
    id: 'extended',
    name: 'Extended',
    description: 'Additional color options for variety and personalization',
    colors: COLOR_PALETTE.filter(color => color.category === 'extended'),
  },
  {
    id: 'neutral',
    name: 'Neutral',
    description: 'Grays and subtle tones for text and backgrounds',
    colors: COLOR_PALETTE.filter(color => color.category === 'neutral'),
  },
];

/**
 * Color System Utilities
 */
export class ColorSystem {
  /**
   * Get color by hex value
   */
  static getColorByHex(hex: string): ColorOption | undefined {
    return COLOR_PALETTE.find(color => color.hex.toLowerCase() === hex.toLowerCase());
  }

  /**
   * Get colors by category
   */
  static getColorsByCategory(category: ColorOption['category']): ColorOption[] {
    return COLOR_PALETTE.filter(color => color.category === category);
  }

  /**
   * Get all categories
   */
  static getCategories(): ColorCategory[] {
    return COLOR_CATEGORIES;
  }

  /**
   * Get default color (primary brand color)
   */
  static getDefaultColor(): ColorOption {
    return COLOR_PALETTE.find(color => color.isDefault) || COLOR_PALETTE[0];
  }

  /**
   * Search colors by name or hex
   */
  static searchColors(query: string): ColorOption[] {
    const searchTerm = query.toLowerCase().trim();

    if (!searchTerm) {
      return COLOR_PALETTE;
    }

    return COLOR_PALETTE.filter(
      color =>
        color.name.toLowerCase().includes(searchTerm) ||
        color.hex.toLowerCase().includes(searchTerm) ||
        color.category.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Validate hex color format
   */
  static isValidHex(hex: string): boolean {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(hex);
  }

  /**
   * Convert hex to RGB values
   */
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    if (!this.isValidHex(hex)) {
      return null;
    }

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  /**
   * Convert RGB to hex
   */
  static rgbToHex(r: number, g: number, b: number): string {
    const toHex = (n: number) => {
      const hex = Math.round(n).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  /**
   * Get color brightness (0-255)
   */
  static getBrightness(hex: string): number {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return 0;

    // Calculate perceived brightness using luminance formula
    return Math.round(0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b);
  }

  /**
   * Determine if color is light or dark
   */
  static isLightColor(hex: string): boolean {
    return this.getBrightness(hex) > 128;
  }

  /**
   * Get appropriate text color (black or white) for given background
   */
  static getTextColor(backgroundColor: string): string {
    return this.isLightColor(backgroundColor) ? '#000000' : '#FFFFFF';
  }

  /**
   * Generate color variants (lighter/darker versions)
   */
  static generateVariants(hex: string): { [key: string]: string } {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return {};

    const variants: { [key: string]: string } = {};

    // Generate lighter variants (50-400)
    for (let i = 50; i <= 400; i += 50) {
      const factor = (500 - i) / 500; // 0.9 to 0.2
      const lighten = (color: number) => Math.min(255, color + (255 - color) * factor);

      variants[i] = this.rgbToHex(lighten(rgb.r), lighten(rgb.g), lighten(rgb.b));
    }

    // Original color at 500
    variants[500] = hex;

    // Generate darker variants (600-900)
    for (let i = 600; i <= 900; i += 100) {
      const factor = (i - 500) / 400; // 0.25 to 1
      const darken = (color: number) => Math.max(0, color * (1 - factor));

      variants[i] = this.rgbToHex(darken(rgb.r), darken(rgb.g), darken(rgb.b));
    }

    return variants;
  }

  /**
   * Get popular/recommended colors for quick selection
   */
  static getPopularColors(): ColorOption[] {
    return [
      this.getDefaultColor(),
      ...COLOR_PALETTE.filter(color =>
        ['Violet', 'Emerald', 'Blue', 'Pink', 'Orange', 'Cyan'].includes(color.name)
      ),
    ];
  }

  /**
   * Get colors suitable for different habit categories
   */
  static getColorsForHabitCategory(habitCategory: string): ColorOption[] {
    const categoryColorMap: { [key: string]: string[] } = {
      health: ['Emerald', 'Lime', 'Teal', 'Green'],
      fitness: ['Red', 'Orange', 'Amber', 'Pink'],
      learning: ['Blue', 'Indigo', 'Violet', 'Purple'],
      work: ['Slate', 'Gray', 'Blue', 'Indigo'],
      lifestyle: ['Pink', 'Purple', 'Fuchsia', 'Rose'],
      nature: ['Emerald', 'Lime', 'Teal', 'Green'],
      creative: ['Purple', 'Pink', 'Fuchsia', 'Violet'],
      social: ['Blue', 'Cyan', 'Sky', 'Teal'],
    };

    const suggestedColors = categoryColorMap[habitCategory.toLowerCase()] || [];

    return COLOR_PALETTE.filter(color => suggestedColors.includes(color.name));
  }
}

export default ColorSystem;
