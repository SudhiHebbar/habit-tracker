// Design validation utilities for ensuring Figma compliance

export interface DesignTokens {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  breakpoints: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
}

// Figma design tokens (extracted from design system)
export const figmaTokens: DesignTokens = {
  colors: {
    primary: '#6366F1',
    secondary: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
  },
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem',  // 8px
    md: '1rem',    // 16px
    lg: '1.5rem',  // 24px
    xl: '2rem',    // 32px
    '2xl': '3rem', // 48px
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontSize: {
      xs: '0.75rem',   // 12px
      sm: '0.875rem',  // 14px
      base: '1rem',    // 16px
      lg: '1.125rem',  // 18px
      xl: '1.25rem',   // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  borderRadius: {
    sm: '0.25rem',  // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem',   // 8px
    xl: '0.75rem',  // 12px
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1280px',
  },
};

// Validation functions
export function validateColorCompliance(element: HTMLElement, expectedColor: string): boolean {
  const computedStyle = window.getComputedStyle(element);
  const actualColor = computedStyle.color || computedStyle.backgroundColor;
  
  // Convert colors to hex format for comparison
  const normalizedExpected = normalizeColor(expectedColor);
  const normalizedActual = normalizeColor(actualColor);
  
  return normalizedExpected === normalizedActual;
}

export function validateSpacingCompliance(element: HTMLElement, property: string, expectedValue: string): boolean {
  const computedStyle = window.getComputedStyle(element);
  const actualValue = computedStyle.getPropertyValue(property);
  
  // Convert to pixels for comparison
  const expectedPx = convertToPixels(expectedValue);
  const actualPx = convertToPixels(actualValue);
  
  // Allow 1px tolerance for rounding differences
  return Math.abs(expectedPx - actualPx) <= 1;
}

export function validateTypographyCompliance(element: HTMLElement, expectedTypography: Partial<DesignTokens['typography']>): boolean {
  const computedStyle = window.getComputedStyle(element);
  
  const checks = [];
  
  if (expectedTypography.fontFamily) {
    const actualFontFamily = computedStyle.fontFamily.toLowerCase();
    const expectedFontFamily = expectedTypography.fontFamily.toLowerCase();
    checks.push(actualFontFamily.includes(expectedFontFamily.split(',')[0].trim()));
  }
  
  if (expectedTypography.fontSize) {
    const actualFontSize = convertToPixels(computedStyle.fontSize);
    const expectedFontSize = convertToPixels(expectedTypography.fontSize.toString());
    checks.push(Math.abs(actualFontSize - expectedFontSize) <= 1);
  }
  
  return checks.every(Boolean);
}

export function validateResponsiveBreakpoints(): { mobile: boolean; tablet: boolean; desktop: boolean } {
  const mobileQuery = window.matchMedia(`(max-width: ${figmaTokens.breakpoints.mobile})`);
  const tabletQuery = window.matchMedia(`(min-width: ${figmaTokens.breakpoints.mobile}) and (max-width: ${figmaTokens.breakpoints.tablet})`);
  const desktopQuery = window.matchMedia(`(min-width: ${figmaTokens.breakpoints.tablet})`);
  
  return {
    mobile: mobileQuery.matches,
    tablet: tabletQuery.matches,
    desktop: desktopQuery.matches,
  };
}

// Utility functions
function normalizeColor(color: string): string {
  // Create a temporary element to normalize color
  const temp = document.createElement('div');
  temp.style.color = color;
  document.body.appendChild(temp);
  const normalized = window.getComputedStyle(temp).color;
  document.body.removeChild(temp);
  
  // Convert rgb to hex
  const rgbMatch = normalized.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch.map(Number);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
  }
  
  return normalized;
}

function convertToPixels(value: string): number {
  // Create a temporary element to convert units to pixels
  const temp = document.createElement('div');
  temp.style.position = 'absolute';
  temp.style.left = '-9999px';
  temp.style.width = value;
  document.body.appendChild(temp);
  const pixels = temp.offsetWidth;
  document.body.removeChild(temp);
  return pixels;
}

// Dashboard-specific validation
export interface DashboardValidationResult {
  layout: boolean;
  colors: boolean;
  typography: boolean;
  spacing: boolean;
  components: {
    header: boolean;
    stats: boolean;
    habitCards: boolean;
    viewToggle: boolean;
  };
  responsive: {
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
  };
  overall: boolean;
}

export function validateDashboardDesign(): DashboardValidationResult {
  const results: DashboardValidationResult = {
    layout: false,
    colors: false,
    typography: false,
    spacing: false,
    components: {
      header: false,
      stats: false,
      habitCards: false,
      viewToggle: false,
    },
    responsive: {
      mobile: false,
      tablet: false,
      desktop: false,
    },
    overall: false,
  };

  try {
    // Validate layout structure
    const dashboard = document.querySelector('[class*="dashboard"]');
    const header = document.querySelector('[class*="header"]');
    const content = document.querySelector('[class*="content"]');
    
    results.layout = !!(dashboard && header && content);
    
    // Validate component-specific compliance
    results.components.header = validateHeaderCompliance();
    results.components.stats = validateStatsCompliance();
    results.components.habitCards = validateHabitCardsCompliance();
    results.components.viewToggle = validateViewToggleCompliance();
    
    // Validate responsive design
    const breakpoints = validateResponsiveBreakpoints();
    results.responsive = {
      mobile: breakpoints.mobile || validateMobileLayout(),
      tablet: breakpoints.tablet || validateTabletLayout(),
      desktop: breakpoints.desktop || validateDesktopLayout(),
    };
    
    // Calculate overall compliance
    const componentScores = Object.values(results.components);
    const responsiveScores = Object.values(results.responsive);
    const allScores = [results.layout, ...componentScores, ...responsiveScores];
    
    results.overall = allScores.filter(Boolean).length / allScores.length >= 0.8; // 80% threshold
    
  } catch (error) {
    console.error('Design validation error:', error);
  }

  return results;
}

// Component-specific validation functions
function validateHeaderCompliance(): boolean {
  const header = document.querySelector('[class*="header"]');
  if (!header) return false;
  
  const logo = header.querySelector('[class*="logo"]');
  const navigation = header.querySelector('[class*="navigation"]');
  
  return !!(logo && navigation);
}

function validateStatsCompliance(): boolean {
  const stats = document.querySelector('[class*="stats"]');
  if (!stats) return false;
  
  const statCards = stats.querySelectorAll('[class*="statCard"]');
  return statCards.length >= 3; // Should have at least 3 stat cards
}

function validateHabitCardsCompliance(): boolean {
  const habitCards = document.querySelectorAll('[class*="habitCard"]');
  if (habitCards.length === 0) return true; // No habits is valid
  
  // Validate first habit card structure
  const firstCard = habitCards[0] as HTMLElement;
  const header = firstCard.querySelector('[class*="header"]');
  const content = firstCard.querySelector('[class*="content"]');
  const footer = firstCard.querySelector('[class*="footer"]');
  
  return !!(header && content && footer);
}

function validateViewToggleCompliance(): boolean {
  const viewToggle = document.querySelector('[class*="viewToggle"]');
  if (!viewToggle) return false;
  
  const buttons = viewToggle.querySelectorAll('button');
  return buttons.length >= 2; // Should have grid and list buttons
}

function validateMobileLayout(): boolean {
  const content = document.querySelector('[class*="content"]');
  if (!content) return false;
  
  const computedStyle = window.getComputedStyle(content as HTMLElement);
  const flexDirection = computedStyle.flexDirection;
  
  return flexDirection === 'column'; // Mobile should be column layout
}

function validateTabletLayout(): boolean {
  const habitGrid = document.querySelector('[class*="habitGrid"]');
  if (!habitGrid) return true;
  
  const habitCards = habitGrid.querySelectorAll('[class*="habitCard"]');
  // Count cards per row (approximate based on width)
  if (habitCards.length < 2) return true;
  
  const firstCard = habitCards[0] as HTMLElement;
  const cardWidth = firstCard.offsetWidth;
  const containerWidth = habitGrid.clientWidth;
  const cardsPerRow = Math.floor(containerWidth / cardWidth);
  
  return cardsPerRow >= 2 && cardsPerRow <= 3; // Tablet should show 2-3 cards per row
}

function validateDesktopLayout(): boolean {
  const habitGrid = document.querySelector('[class*="habitGrid"]');
  if (!habitGrid) return true;
  
  const habitCards = habitGrid.querySelectorAll('[class*="habitCard"]');
  if (habitCards.length < 3) return true;
  
  const firstCard = habitCards[0] as HTMLElement;
  const cardWidth = firstCard.offsetWidth;
  const containerWidth = habitGrid.clientWidth;
  const cardsPerRow = Math.floor(containerWidth / cardWidth);
  
  return cardsPerRow >= 3; // Desktop should show 3+ cards per row
}

export default {
  figmaTokens,
  validateColorCompliance,
  validateSpacingCompliance,
  validateTypographyCompliance,
  validateResponsiveBreakpoints,
  validateDashboardDesign,
};