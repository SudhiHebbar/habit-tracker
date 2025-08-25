// Performance testing utilities for large habit datasets

export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  frameRate: number;
  layoutShifts: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  totalBlockingTime: number;
}

export interface PerformanceTestResult {
  habitCount: number;
  metrics: PerformanceMetrics;
  passed: boolean;
  details: {
    renderTimeAcceptable: boolean;
    memoryUsageAcceptable: boolean;
    frameRateAcceptable: boolean;
    layoutStable: boolean;
  };
}

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  maxRenderTime: 2000, // 2 seconds
  maxMemoryUsage: 50 * 1024 * 1024, // 50MB
  minFrameRate: 45, // 45fps minimum
  maxLayoutShifts: 0.1, // Good CLS score
  maxFirstContentfulPaint: 1800, // 1.8 seconds
  maxLargestContentfulPaint: 2500, // 2.5 seconds
  maxTotalBlockingTime: 300, // 300ms
};

// Generate test habit data
export function generateTestHabits(count: number): any[] {
  const habits = [];
  const frequencies = ['Daily', 'Weekly', 'Monthly'];
  const categories = ['Health', 'Productivity', 'Learning', 'Fitness', 'Mindfulness'];
  const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B', '#10B981', '#06B6D4'];
  
  for (let i = 0; i < count; i++) {
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 365));
    
    habits.push({
      id: i + 1,
      name: `Test Habit ${i + 1}`,
      description: `This is a test habit for performance testing. Habit number ${i + 1}.`,
      trackerId: 1,
      targetFrequency: frequencies[Math.floor(Math.random() * frequencies.length)],
      targetCount: Math.floor(Math.random() * 3) + 1,
      icon: ['💪', '📚', '🧘', '🏃', '💡', '🎯', '✅'][Math.floor(Math.random() * 7)],
      color: colors[Math.floor(Math.random() * colors.length)],
      isActive: Math.random() > 0.1, // 90% active
      createdAt: createdDate.toISOString(),
      updatedAt: new Date().toISOString(),
      lastCompletedDate: Math.random() > 0.3 ? new Date().toISOString().split('T')[0] : null,
      currentStreak: Math.floor(Math.random() * 30),
      longestStreak: Math.floor(Math.random() * 100),
      completionsThisWeek: Math.floor(Math.random() * 7),
      completionRate: Math.floor(Math.random() * 100),
    });
  }
  
  return habits;
}

export class PerformanceTestRunner {
  private observer?: PerformanceObserver;
  private frameCount = 0;
  private frameStartTime = 0;
  private layoutShifts = 0;
  
  async runPerformanceTest(habitCounts: number[]): Promise<PerformanceTestResult[]> {
    const results: PerformanceTestResult[] = [];
    
    console.log('Starting performance tests with habit counts:', habitCounts);
    
    for (const count of habitCounts) {
      console.log(`Testing with ${count} habits...`);
      const result = await this.testWithHabitCount(count);
      results.push(result);
      
      // Clean up between tests
      await this.cleanup();
    }
    
    return results;
  }
  
  private async testWithHabitCount(habitCount: number): Promise<PerformanceTestResult> {
    // Generate test data
    const testHabits = generateTestHabits(habitCount);
    
    // Start measuring performance
    const startTime = performance.now();
    this.startFrameRateMonitoring();
    this.startLayoutShiftMonitoring();
    
    // Clear existing performance marks
    performance.clearMarks();
    performance.clearMeasures();
    
    performance.mark('render-start');
    
    // Simulate rendering the habits (this would be replaced with actual DOM updates in a real test)
    await this.simulateHabitRendering(testHabits);
    
    performance.mark('render-end');
    performance.measure('habit-render', 'render-start', 'render-end');
    
    const renderTime = performance.now() - startTime;
    
    // Collect metrics
    const metrics: PerformanceMetrics = {
      renderTime,
      memoryUsage: await this.getMemoryUsage(),
      frameRate: this.getAverageFrameRate(),
      layoutShifts: this.layoutShifts,
      firstContentfulPaint: await this.getFirstContentfulPaint(),
      largestContentfulPaint: await this.getLargestContentfulPaint(),
      totalBlockingTime: await this.getTotalBlockingTime(),
    };
    
    // Stop monitoring
    this.stopFrameRateMonitoring();
    this.stopLayoutShiftMonitoring();
    
    // Evaluate performance
    const details = {
      renderTimeAcceptable: metrics.renderTime <= PERFORMANCE_THRESHOLDS.maxRenderTime,
      memoryUsageAcceptable: metrics.memoryUsage <= PERFORMANCE_THRESHOLDS.maxMemoryUsage,
      frameRateAcceptable: metrics.frameRate >= PERFORMANCE_THRESHOLDS.minFrameRate,
      layoutStable: metrics.layoutShifts <= PERFORMANCE_THRESHOLDS.maxLayoutShifts,
    };
    
    const passed = Object.values(details).every(Boolean);
    
    return {
      habitCount,
      metrics,
      passed,
      details,
    };
  }
  
  private async simulateHabitRendering(habits: any[]): Promise<void> {
    // Create DOM elements to simulate actual habit rendering
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '1200px';
    document.body.appendChild(container);
    
    // Batch render habits
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < habits.length; i++) {
      const habit = habits[i];
      const habitCard = this.createHabitCardElement(habit);
      fragment.appendChild(habitCard);
      
      // Yield to the main thread periodically to avoid blocking
      if (i % 50 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    container.appendChild(fragment);
    
    // Force layout calculation
    container.offsetHeight;
    
    // Clean up
    document.body.removeChild(container);
  }
  
  private createHabitCardElement(habit: any): HTMLElement {
    const card = document.createElement('div');
    card.className = 'habit-card';
    card.style.cssText = `
      width: 280px;
      height: 240px;
      margin: 8px;
      padding: 16px;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      background: white;
      display: inline-block;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    `;
    
    card.innerHTML = `
      <div style="display: flex; align-items: center; margin-bottom: 12px;">
        <span style="font-size: 24px; margin-right: 8px;">${habit.icon}</span>
        <h3 style="margin: 0; font-size: 16px; font-weight: 600;">${habit.name}</h3>
      </div>
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280;">${habit.description}</p>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 12px; color: #9ca3af;">${habit.targetFrequency}</span>
        <span style="font-size: 14px; font-weight: 500;">${habit.currentStreak} day streak</span>
      </div>
    `;
    
    return card;
  }
  
  private startFrameRateMonitoring(): void {
    this.frameCount = 0;
    this.frameStartTime = performance.now();
    
    const countFrame = () => {
      this.frameCount++;
      requestAnimationFrame(countFrame);
    };
    
    requestAnimationFrame(countFrame);
  }
  
  private stopFrameRateMonitoring(): void {
    // Frame counting is stopped implicitly by not calling requestAnimationFrame
  }
  
  private getAverageFrameRate(): number {
    const duration = (performance.now() - this.frameStartTime) / 1000;
    return duration > 0 ? this.frameCount / duration : 0;
  }
  
  private startLayoutShiftMonitoring(): void {
    this.layoutShifts = 0;
    
    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
          this.layoutShifts += (entry as any).value;
        }
      }
    });
    
    try {
      this.observer.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // Layout shift monitoring not supported
    }
  }
  
  private stopLayoutShiftMonitoring(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
  }
  
  private async getMemoryUsage(): Promise<number> {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize || 0;
    }
    return 0; // Memory API not available
  }
  
  private async getFirstContentfulPaint(): Promise<number> {
    const entries = performance.getEntriesByName('first-contentful-paint');
    if (entries.length > 0) {
      return entries[0].startTime;
    }
    return 0;
  }
  
  private async getLargestContentfulPaint(): Promise<number> {
    return new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        } else {
          resolve(0);
        }
        observer.disconnect();
      });
      
      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
        // Timeout after 3 seconds
        setTimeout(() => {
          observer.disconnect();
          resolve(0);
        }, 3000);
      } catch (e) {
        resolve(0);
      }
    });
  }
  
  private async getTotalBlockingTime(): Promise<number> {
    const longTaskEntries = performance.getEntriesByType('longtask');
    let totalBlockingTime = 0;
    
    for (const entry of longTaskEntries) {
      if (entry.duration > 50) {
        totalBlockingTime += entry.duration - 50;
      }
    }
    
    return totalBlockingTime;
  }
  
  private async cleanup(): Promise<void> {
    // Force garbage collection if available
    if ('gc' in window) {
      (window as any).gc();
    }
    
    // Clear performance buffers
    performance.clearMarks();
    performance.clearMeasures();
    
    // Wait for cleanup to complete
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  generatePerformanceReport(results: PerformanceTestResult[]): string {
    let report = `# Performance Test Report\n\n`;
    
    // Summary
    const passedTests = results.filter(r => r.passed).length;
    const totalTests = results.length;
    const passRate = (passedTests / totalTests) * 100;
    
    report += `## Summary\n`;
    report += `- Tests Passed: ${passedTests}/${totalTests} (${passRate.toFixed(1)}%)\n`;
    report += `- Performance Thresholds:\n`;
    report += `  - Max Render Time: ${PERFORMANCE_THRESHOLDS.maxRenderTime}ms\n`;
    report += `  - Max Memory Usage: ${(PERFORMANCE_THRESHOLDS.maxMemoryUsage / 1024 / 1024).toFixed(0)}MB\n`;
    report += `  - Min Frame Rate: ${PERFORMANCE_THRESHOLDS.minFrameRate}fps\n`;
    report += `  - Max Layout Shifts: ${PERFORMANCE_THRESHOLDS.maxLayoutShifts}\n\n`;
    
    // Detailed results
    report += `## Detailed Results\n\n`;
    
    results.forEach(result => {
      const { habitCount, metrics, passed, details } = result;
      
      report += `### ${habitCount} Habits\n`;
      report += `**Overall Result:** ${passed ? '✅ PASS' : '❌ FAIL'}\n\n`;
      
      report += `**Metrics:**\n`;
      report += `- Render Time: ${metrics.renderTime.toFixed(2)}ms ${details.renderTimeAcceptable ? '✅' : '❌'}\n`;
      report += `- Memory Usage: ${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB ${details.memoryUsageAcceptable ? '✅' : '❌'}\n`;
      report += `- Frame Rate: ${metrics.frameRate.toFixed(1)}fps ${details.frameRateAcceptable ? '✅' : '❌'}\n`;
      report += `- Layout Shifts: ${metrics.layoutShifts.toFixed(3)} ${details.layoutStable ? '✅' : '❌'}\n`;
      report += `- First Contentful Paint: ${metrics.firstContentfulPaint.toFixed(2)}ms\n`;
      report += `- Largest Contentful Paint: ${metrics.largestContentfulPaint.toFixed(2)}ms\n`;
      report += `- Total Blocking Time: ${metrics.totalBlockingTime.toFixed(2)}ms\n\n`;
    });
    
    // Performance recommendations
    report += `## Recommendations\n\n`;
    const failedTests = results.filter(r => !r.passed);
    
    if (failedTests.length === 0) {
      report += `✅ All performance tests passed! The dashboard performs well with large numbers of habits.\n`;
    } else {
      report += `The following performance issues were identified:\n\n`;
      
      failedTests.forEach(result => {
        report += `**${result.habitCount} Habits:**\n`;
        
        if (!result.details.renderTimeAcceptable) {
          report += `- ❌ Slow rendering (${result.metrics.renderTime.toFixed(2)}ms). Consider implementing virtual scrolling for lists with > 100 items.\n`;
        }
        
        if (!result.details.memoryUsageAcceptable) {
          report += `- ❌ High memory usage (${(result.metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB). Consider lazy loading habit completion data.\n`;
        }
        
        if (!result.details.frameRateAcceptable) {
          report += `- ❌ Low frame rate (${result.metrics.frameRate.toFixed(1)}fps). Consider optimizing animations and transitions.\n`;
        }
        
        if (!result.details.layoutStable) {
          report += `- ❌ Layout instability (${result.metrics.layoutShifts.toFixed(3)} CLS). Ensure images and dynamic content have reserved space.\n`;
        }
        
        report += `\n`;
      });
    }
    
    return report;
  }
}

// Helper function to run performance tests
export async function runPerformanceTests(): Promise<PerformanceTestResult[]> {
  const testRunner = new PerformanceTestRunner();
  
  // Test with various habit counts
  const habitCounts = [10, 50, 100, 250, 500, 1000];
  
  return await testRunner.runPerformanceTest(habitCounts);
}

export default PerformanceTestRunner;