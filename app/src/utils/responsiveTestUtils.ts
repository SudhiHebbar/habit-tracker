// Responsive design testing utilities

export interface Breakpoint {
  name: string;
  width: number;
  height: number;
  description: string;
}

export const testBreakpoints: Breakpoint[] = [
  // Mobile devices
  { name: 'iPhone SE', width: 375, height: 667, description: 'Small mobile device' },
  { name: 'iPhone 12', width: 390, height: 844, description: 'Standard mobile device' },
  { name: 'iPhone 12 Pro Max', width: 428, height: 926, description: 'Large mobile device' },
  { name: 'Samsung Galaxy S20', width: 360, height: 800, description: 'Android mobile device' },
  
  // Tablet devices
  { name: 'iPad Mini', width: 768, height: 1024, description: 'Small tablet device' },
  { name: 'iPad Air', width: 820, height: 1180, description: 'Standard tablet device' },
  { name: 'iPad Pro 11"', width: 834, height: 1194, description: 'Pro tablet device' },
  { name: 'iPad Pro 12.9"', width: 1024, height: 1366, description: 'Large tablet device' },
  
  // Desktop devices
  { name: 'MacBook Air', width: 1280, height: 832, description: 'Small laptop screen' },
  { name: 'MacBook Pro 14"', width: 1512, height: 982, description: 'Standard laptop screen' },
  { name: '1080p Monitor', width: 1920, height: 1080, description: 'Full HD desktop monitor' },
  { name: '4K Monitor', width: 3840, height: 2160, description: 'Ultra HD desktop monitor' },
];

export interface ResponsiveTestResult {
  breakpoint: Breakpoint;
  layout: {
    headerVisible: boolean;
    navigationAccessible: boolean;
    contentFitsScreen: boolean;
    noHorizontalScroll: boolean;
  };
  typography: {
    textReadable: boolean;
    headingsAppropriateSize: boolean;
    lineHeightAdequate: boolean;
  };
  interactions: {
    touchTargetsAdequate: boolean;
    buttonsClickable: boolean;
    formsUsable: boolean;
  };
  performance: {
    renderTime: number;
    layoutStable: boolean;
  };
  overall: boolean;
}

export class ResponsiveTestRunner {
  private originalViewport: { width: number; height: number };
  private testResults: ResponsiveTestResult[] = [];

  constructor() {
    this.originalViewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  async runAllTests(): Promise<ResponsiveTestResult[]> {
    console.log('Starting responsive design tests...');
    
    for (const breakpoint of testBreakpoints) {
      const result = await this.testBreakpoint(breakpoint);
      this.testResults.push(result);
      console.log(`✓ Tested ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`);
    }

    // Restore original viewport
    await this.setViewportSize(this.originalViewport.width, this.originalViewport.height);
    
    console.log('Responsive tests completed:', this.testResults);
    return this.testResults;
  }

  async testBreakpoint(breakpoint: Breakpoint): Promise<ResponsiveTestResult> {
    // Set viewport size
    await this.setViewportSize(breakpoint.width, breakpoint.height);
    
    // Wait for layout to settle
    await this.waitForLayoutStable();
    
    const startTime = performance.now();
    
    // Run tests
    const layout = await this.testLayout(breakpoint);
    const typography = await this.testTypography(breakpoint);
    const interactions = await this.testInteractions(breakpoint);
    const performance = await this.testPerformance(breakpoint);
    
    const renderTime = performance.now() - startTime;
    performance.renderTime = renderTime;

    // Calculate overall score
    const scores = [
      ...Object.values(layout),
      ...Object.values(typography),
      ...Object.values(interactions),
      performance.layoutStable,
    ];
    const overall = scores.filter(Boolean).length / scores.length >= 0.8;

    return {
      breakpoint,
      layout,
      typography,
      interactions,
      performance,
      overall,
    };
  }

  private async setViewportSize(width: number, height: number): Promise<void> {
    // For testing purposes, we'll simulate viewport changes
    // In a real browser environment, you might use tools like Playwright or Puppeteer
    Object.defineProperty(window, 'innerWidth', { value: width, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: height, writable: true });
    
    // Trigger resize event
    window.dispatchEvent(new Event('resize'));
    
    // Wait for any responsive changes to take effect
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async waitForLayoutStable(): Promise<void> {
    return new Promise(resolve => {
      let lastHeight = document.body.scrollHeight;
      let stableCount = 0;
      
      const checkStability = () => {
        const currentHeight = document.body.scrollHeight;
        if (currentHeight === lastHeight) {
          stableCount++;
          if (stableCount >= 3) {
            resolve();
            return;
          }
        } else {
          stableCount = 0;
          lastHeight = currentHeight;
        }
        setTimeout(checkStability, 16); // ~60fps
      };
      
      checkStability();
    });
  }

  private async testLayout(breakpoint: Breakpoint) {
    const { width, height } = breakpoint;
    
    // Test header visibility
    const header = document.querySelector('header');
    const headerVisible = header ? header.offsetHeight > 0 : false;
    
    // Test navigation accessibility
    const navigation = document.querySelector('nav') || document.querySelector('[class*="navigation"]');
    const navigationAccessible = navigation ? navigation.offsetHeight > 0 : false;
    
    // Test content fits screen
    const content = document.querySelector('main') || document.querySelector('[class*="content"]');
    const contentFitsScreen = content ? content.scrollWidth <= width : false;
    
    // Test no horizontal scroll
    const noHorizontalScroll = document.documentElement.scrollWidth <= width;
    
    return {
      headerVisible,
      navigationAccessible,
      contentFitsScreen,
      noHorizontalScroll,
    };
  }

  private async testTypography(breakpoint: Breakpoint) {
    const { width } = breakpoint;
    const isMobile = width < 768;
    
    // Test text readability
    const textElements = document.querySelectorAll('p, span, div[class*="text"]');
    let textReadable = true;
    
    textElements.forEach(element => {
      const computedStyle = window.getComputedStyle(element as HTMLElement);
      const fontSize = parseFloat(computedStyle.fontSize);
      const minSize = isMobile ? 14 : 12; // Minimum readable size
      
      if (fontSize < minSize) {
        textReadable = false;
      }
    });
    
    // Test heading sizes
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let headingsAppropriateSize = true;
    
    headings.forEach(heading => {
      const computedStyle = window.getComputedStyle(heading as HTMLElement);
      const fontSize = parseFloat(computedStyle.fontSize);
      const minSize = isMobile ? 18 : 16; // Minimum heading size
      
      if (fontSize < minSize) {
        headingsAppropriateSize = false;
      }
    });
    
    // Test line height
    const paragraphs = document.querySelectorAll('p');
    let lineHeightAdequate = true;
    
    paragraphs.forEach(p => {
      const computedStyle = window.getComputedStyle(p as HTMLElement);
      const lineHeight = parseFloat(computedStyle.lineHeight);
      const fontSize = parseFloat(computedStyle.fontSize);
      const ratio = lineHeight / fontSize;
      
      if (ratio < 1.2) { // Minimum line height ratio
        lineHeightAdequate = false;
      }
    });
    
    return {
      textReadable,
      headingsAppropriateSize,
      lineHeightAdequate,
    };
  }

  private async testInteractions(breakpoint: Breakpoint) {
    const { width } = breakpoint;
    const isMobile = width < 768;
    const minTouchTarget = isMobile ? 44 : 32; // iOS HIG minimum touch target
    
    // Test touch targets
    const interactiveElements = document.querySelectorAll('button, a, input, [role="button"]');
    let touchTargetsAdequate = true;
    
    interactiveElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      if (rect.width < minTouchTarget || rect.height < minTouchTarget) {
        touchTargetsAdequate = false;
      }
    });
    
    // Test button clickability
    const buttons = document.querySelectorAll('button');
    let buttonsClickable = true;
    
    buttons.forEach(button => {
      const computedStyle = window.getComputedStyle(button as HTMLElement);
      const pointerEvents = computedStyle.pointerEvents;
      const display = computedStyle.display;
      
      if (pointerEvents === 'none' || display === 'none') {
        buttonsClickable = false;
      }
    });
    
    // Test form usability
    const inputs = document.querySelectorAll('input, textarea, select');
    let formsUsable = true;
    
    inputs.forEach(input => {
      const rect = input.getBoundingClientRect();
      if (isMobile && rect.height < 44) { // Minimum touch-friendly input height
        formsUsable = false;
      }
    });
    
    return {
      touchTargetsAdequate,
      buttonsClickable,
      formsUsable,
    };
  }

  private async testPerformance(breakpoint: Breakpoint) {
    const startTime = performance.now();
    
    // Force a reflow to measure layout performance
    document.body.offsetHeight;
    
    const renderTime = performance.now() - startTime;
    
    // Test layout stability (CLS - Cumulative Layout Shift)
    let layoutShifts = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
          layoutShifts += (entry as any).value;
        }
      }
    });
    
    observer.observe({ entryTypes: ['layout-shift'] });
    
    // Wait a moment to collect any layout shifts
    await new Promise(resolve => setTimeout(resolve, 100));
    observer.disconnect();
    
    const layoutStable = layoutShifts < 0.1; // Good CLS score
    
    return {
      renderTime,
      layoutStable,
    };
  }

  getTestSummary(): {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    passRate: number;
    failedBreakpoints: string[];
  } {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(result => result.overall).length;
    const failedTests = totalTests - passedTests;
    const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    const failedBreakpoints = this.testResults
      .filter(result => !result.overall)
      .map(result => result.breakpoint.name);

    return {
      totalTests,
      passedTests,
      failedTests,
      passRate,
      failedBreakpoints,
    };
  }

  exportResults(): string {
    const summary = this.getTestSummary();
    
    let report = `# Responsive Design Test Report\n\n`;
    report += `## Summary\n`;
    report += `- Total Breakpoints Tested: ${summary.totalTests}\n`;
    report += `- Passed: ${summary.passedTests}\n`;
    report += `- Failed: ${summary.failedTests}\n`;
    report += `- Pass Rate: ${summary.passRate.toFixed(1)}%\n\n`;
    
    if (summary.failedBreakpoints.length > 0) {
      report += `## Failed Breakpoints\n`;
      summary.failedBreakpoints.forEach(name => {
        report += `- ${name}\n`;
      });
      report += `\n`;
    }
    
    report += `## Detailed Results\n\n`;
    
    this.testResults.forEach(result => {
      const { breakpoint, layout, typography, interactions, performance, overall } = result;
      
      report += `### ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})\n`;
      report += `**Overall Result:** ${overall ? '✅ PASS' : '❌ FAIL'}\n\n`;
      
      report += `**Layout Tests:**\n`;
      report += `- Header Visible: ${layout.headerVisible ? '✅' : '❌'}\n`;
      report += `- Navigation Accessible: ${layout.navigationAccessible ? '✅' : '❌'}\n`;
      report += `- Content Fits Screen: ${layout.contentFitsScreen ? '✅' : '❌'}\n`;
      report += `- No Horizontal Scroll: ${layout.noHorizontalScroll ? '✅' : '❌'}\n\n`;
      
      report += `**Typography Tests:**\n`;
      report += `- Text Readable: ${typography.textReadable ? '✅' : '❌'}\n`;
      report += `- Headings Appropriate Size: ${typography.headingsAppropriateSize ? '✅' : '❌'}\n`;
      report += `- Line Height Adequate: ${typography.lineHeightAdequate ? '✅' : '❌'}\n\n`;
      
      report += `**Interaction Tests:**\n`;
      report += `- Touch Targets Adequate: ${interactions.touchTargetsAdequate ? '✅' : '❌'}\n`;
      report += `- Buttons Clickable: ${interactions.buttonsClickable ? '✅' : '❌'}\n`;
      report += `- Forms Usable: ${interactions.formsUsable ? '✅' : '❌'}\n\n`;
      
      report += `**Performance:**\n`;
      report += `- Render Time: ${performance.renderTime.toFixed(2)}ms\n`;
      report += `- Layout Stable: ${performance.layoutStable ? '✅' : '❌'}\n\n`;
      
      report += `---\n\n`;
    });
    
    return report;
  }
}

// Helper function to run responsive tests
export async function runResponsiveTests(): Promise<ResponsiveTestResult[]> {
  const testRunner = new ResponsiveTestRunner();
  return await testRunner.runAllTests();
}

export default ResponsiveTestRunner;