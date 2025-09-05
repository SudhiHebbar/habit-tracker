/**
 * WCAG 2.1 Color Contrast Calculator
 * Provides utilities for calculating color contrast ratios and determining accessibility compliance
 * Based on WCAG 2.1 AA/AAA guidelines
 */

import { ColorSystem } from './colorSystem';

export interface ContrastResult {
  ratio: number;
  wcagAA: boolean;
  wcagAAA: boolean;
  wcagAALarge: boolean;
  wcagAAALarge: boolean;
  grade: 'AAA' | 'AA' | 'AA Large' | 'Fail';
  score: number; // 0-100 accessibility score
}

export interface ColorAccessibilityInfo {
  color: string;
  background: string;
  contrast: ContrastResult;
  recommendations?: {
    lighterVariant?: string;
    darkerVariant?: string;
    alternativeColors?: string[];
  };
}

/**
 * WCAG 2.1 Contrast Requirements
 */
export const WCAG_STANDARDS = {
  AA_NORMAL: 4.5, // WCAG 2.1 AA for normal text
  AAA_NORMAL: 7.0, // WCAG 2.1 AAA for normal text
  AA_LARGE: 3.0, // WCAG 2.1 AA for large text (18pt+ or 14pt+ bold)
  AAA_LARGE: 4.5, // WCAG 2.1 AAA for large text
  MINIMUM: 1.0, // Absolute minimum (no contrast)
} as const;

/**
 * Common background colors for testing
 */
export const COMMON_BACKGROUNDS = {
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  LIGHT_GRAY: '#F5F5F5',
  DARK_GRAY: '#2D2D2D',
  SURFACE_LIGHT: '#F9FAFB',
  SURFACE_DARK: '#374151',
} as const;

/**
 * Color Contrast Calculator Class
 */
export class ContrastCalculator {
  private static _alternativeColorCache = new Map<string, string[]>();
  /**
   * Calculate relative luminance of a color
   * Based on WCAG 2.1 formula
   */
  static getRelativeLuminance(hex: string): number {
    const rgb = ColorSystem.hexToRgb(hex);
    if (!rgb) return 0;

    // Convert to sRGB
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(channel => {
      const sRGB = channel / 255;
      return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
    });

    // Calculate relative luminance using WCAG formula
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Calculate contrast ratio between two colors
   * Based on WCAG 2.1 formula
   */
  static getContrastRatio(foreground: string, background: string): number {
    const l1 = this.getRelativeLuminance(foreground);
    const l2 = this.getRelativeLuminance(background);

    // Ensure lighter color is l1
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Evaluate contrast ratio against WCAG standards
   */
  static evaluateContrast(ratio: number): ContrastResult {
    const wcagAA = ratio >= WCAG_STANDARDS.AA_NORMAL;
    const wcagAAA = ratio >= WCAG_STANDARDS.AAA_NORMAL;
    const wcagAALarge = ratio >= WCAG_STANDARDS.AA_LARGE;
    const wcagAAALarge = ratio >= WCAG_STANDARDS.AAA_LARGE;

    // Determine grade
    let grade: ContrastResult['grade'];
    if (wcagAAA) {
      grade = 'AAA';
    } else if (wcagAA) {
      grade = 'AA';
    } else if (wcagAALarge) {
      grade = 'AA Large';
    } else {
      grade = 'Fail';
    }

    // Calculate accessibility score (0-100)
    const score = Math.min(100, Math.round((ratio / WCAG_STANDARDS.AAA_NORMAL) * 100));

    return {
      ratio,
      wcagAA,
      wcagAAA,
      wcagAALarge,
      wcagAAALarge,
      grade,
      score,
    };
  }

  /**
   * Get full contrast analysis for a color against a background
   */
  static analyzeContrast(color: string, background: string): ColorAccessibilityInfo {
    const ratio = this.getContrastRatio(color, background);
    const contrast = this.evaluateContrast(ratio);

    const analysis: ColorAccessibilityInfo = {
      color,
      background,
      contrast,
    };

    // Add recommendations if contrast is insufficient
    if (!contrast.wcagAA) {
      analysis.recommendations = this.generateRecommendations(color, background);
    }

    return analysis;
  }

  /**
   * Generate color recommendations for better contrast
   */
  static generateRecommendations(
    color: string,
    background: string
  ): {
    lighterVariant?: string;
    darkerVariant?: string;
    alternativeColors?: string[];
  } {
    const recommendations: NonNullable<ColorAccessibilityInfo['recommendations']> = {};

    // Generate lighter and darker variants
    const rgb = ColorSystem.hexToRgb(color);
    if (rgb) {
      // Try lighter variant
      const lighterRgb = {
        r: Math.min(255, Math.round(rgb.r * 1.3)),
        g: Math.min(255, Math.round(rgb.g * 1.3)),
        b: Math.min(255, Math.round(rgb.b * 1.3)),
      };
      const lighterHex = ColorSystem.rgbToHex(lighterRgb.r, lighterRgb.g, lighterRgb.b);
      const lighterContrast = this.getContrastRatio(lighterHex, background);

      if (lighterContrast >= WCAG_STANDARDS.AA_NORMAL) {
        recommendations.lighterVariant = lighterHex;
      }

      // Try darker variant
      const darkerRgb = {
        r: Math.max(0, Math.round(rgb.r * 0.7)),
        g: Math.max(0, Math.round(rgb.g * 0.7)),
        b: Math.max(0, Math.round(rgb.b * 0.7)),
      };
      const darkerHex = ColorSystem.rgbToHex(darkerRgb.r, darkerRgb.g, darkerRgb.b);
      const darkerContrast = this.getContrastRatio(darkerHex, background);

      if (darkerContrast >= WCAG_STANDARDS.AA_NORMAL) {
        recommendations.darkerVariant = darkerHex;
      }
    }

    // Suggest alternative colors from the palette, with caching per background color
    let alternativeColors: string[] | undefined = this._alternativeColorCache.get(background);
    if (!alternativeColors) {
      alternativeColors = ColorSystem.getPopularColors()
        .map(colorOption => colorOption.hex)
        .filter(hex => {
          const altContrast = this.getContrastRatio(hex, background);
          return altContrast >= WCAG_STANDARDS.AA_NORMAL;
        })
        .slice(0, 5);
      this._alternativeColorCache.set(background, alternativeColors);
    }

    if (alternativeColors.length > 0) {
      recommendations.alternativeColors = alternativeColors;
    }

    return recommendations;
  }

  /**
   * Test color against multiple common backgrounds
   */
  static testAgainstCommonBackgrounds(color: string): Record<string, ColorAccessibilityInfo> {
    const results: Record<string, ColorAccessibilityInfo> = {};

    Object.entries(COMMON_BACKGROUNDS).forEach(([name, background]) => {
      results[name] = this.analyzeContrast(color, background);
    });

    return results;
  }

  /**
   * Get the best text color (black or white) for a given background
   */
  static getBestTextColor(backgroundColor: string): {
    color: string;
    contrast: ContrastResult;
  } {
    const blackContrast = this.getContrastRatio('#000000', backgroundColor);
    const whiteContrast = this.getContrastRatio('#FFFFFF', backgroundColor);

    if (blackContrast > whiteContrast) {
      return {
        color: '#000000',
        contrast: this.evaluateContrast(blackContrast),
      };
    } else {
      return {
        color: '#FFFFFF',
        contrast: this.evaluateContrast(whiteContrast),
      };
    }
  }

  /**
   * Check if a color combination is accessible for different use cases
   */
  static isAccessible(
    foreground: string,
    background: string,
    standard: 'AA' | 'AAA' = 'AA',
    isLargeText: boolean = false
  ): boolean {
    const ratio = this.getContrastRatio(foreground, background);

    if (standard === 'AAA') {
      return isLargeText ? ratio >= WCAG_STANDARDS.AAA_LARGE : ratio >= WCAG_STANDARDS.AAA_NORMAL;
    } else {
      return isLargeText ? ratio >= WCAG_STANDARDS.AA_LARGE : ratio >= WCAG_STANDARDS.AA_NORMAL;
    }
  }

  /**
   * Find the minimum opacity needed for accessibility
   */
  static findMinimumOpacity(
    foreground: string,
    background: string,
    targetRatio: number = WCAG_STANDARDS.AA_NORMAL
  ): number {
    const baseRatio = this.getContrastRatio(foreground, background);

    if (baseRatio >= targetRatio) {
      return 1.0; // Already accessible at full opacity
    }

    // Binary search for minimum opacity
    let low = 0;
    let high = 1;
    let result = 1;

    for (let i = 0; i < 20; i++) {
      // Max 20 iterations
      const mid = (low + high) / 2;
      const adjustedColor = this.adjustOpacity(foreground, background, mid);
      const ratio = this.getContrastRatio(adjustedColor, background);

      if (ratio >= targetRatio) {
        result = mid;
        high = mid;
      } else {
        low = mid;
      }

      if (high - low < 0.01) break; // Close enough
    }

    return Math.ceil(result * 100) / 100; // Round up to 2 decimal places
  }

  /**
   * Simulate color with opacity over background
   */
  private static adjustOpacity(foreground: string, background: string, opacity: number): string {
    const fgRgb = ColorSystem.hexToRgb(foreground);
    const bgRgb = ColorSystem.hexToRgb(background);

    if (!fgRgb || !bgRgb) return foreground;

    // Alpha compositing
    const r = Math.round(fgRgb.r * opacity + bgRgb.r * (1 - opacity));
    const g = Math.round(fgRgb.g * opacity + bgRgb.g * (1 - opacity));
    const b = Math.round(fgRgb.b * opacity + bgRgb.b * (1 - opacity));

    return ColorSystem.rgbToHex(r, g, b);
  }

  /**
   * Get accessibility status with user-friendly description
   */
  static getAccessibilityStatus(contrast: ContrastResult): {
    status: 'excellent' | 'good' | 'acceptable' | 'poor';
    message: string;
    icon: string;
  } {
    if (contrast.wcagAAA) {
      return {
        status: 'excellent',
        message: 'Excellent contrast - meets WCAG AAA standards',
        icon: '✅',
      };
    } else if (contrast.wcagAA) {
      return {
        status: 'good',
        message: 'Good contrast - meets WCAG AA standards',
        icon: '✓',
      };
    } else if (contrast.wcagAALarge) {
      return {
        status: 'acceptable',
        message: 'Acceptable for large text - meets WCAG AA Large standards',
        icon: '⚠️',
      };
    } else {
      return {
        status: 'poor',
        message: 'Poor contrast - does not meet accessibility standards',
        icon: '❌',
      };
    }
  }

  /**
   * Batch analyze multiple colors against a background
   */
  static batchAnalyze(colors: string[], background: string): ColorAccessibilityInfo[] {
    return colors.map(color => this.analyzeContrast(color, background));
  }

  /**
   * Filter colors by accessibility standard
   */
  static filterByAccessibility(
    colors: string[],
    background: string,
    standard: 'AA' | 'AAA' = 'AA',
    isLargeText: boolean = false
  ): string[] {
    return colors.filter(color => this.isAccessible(color, background, standard, isLargeText));
  }

  /**
   * Sort colors by contrast ratio (highest first)
   */
  static sortByContrast(colors: string[], background: string): string[] {
    return colors.slice().sort((a, b) => {
      const ratioA = this.getContrastRatio(a, background);
      const ratioB = this.getContrastRatio(b, background);
      return ratioB - ratioA;
    });
  }
}

export default ContrastCalculator;
