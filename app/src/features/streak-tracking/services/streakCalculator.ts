import type { StreakResponse, StreakRisk, StreakCalculationOptions } from '../types/streak.types';

export class StreakCalculator {
  static readonly MILESTONE_VALUES = [7, 14, 21, 30, 50, 75, 100, 150, 200, 365, 500, 1000];

  static isMilestone(streakValue: number): boolean {
    return this.MILESTONE_VALUES.includes(streakValue);
  }

  static getNextMilestone(currentStreak: number): number {
    const next = this.MILESTONE_VALUES.find(m => m > currentStreak);
    return next || 1000;
  }

  static getAchievedMilestones(currentStreak: number): number[] {
    return this.MILESTONE_VALUES.filter(m => m <= currentStreak);
  }

  static getMilestoneProgress(currentStreak: number): number {
    const nextMilestone = this.getNextMilestone(currentStreak);
    const previousMilestone = this.MILESTONE_VALUES
      .filter(m => m < nextMilestone)
      .pop() || 0;
    
    if (currentStreak === 0) return 0;
    if (previousMilestone === 0) return (currentStreak / nextMilestone) * 100;
    
    const progress = ((currentStreak - previousMilestone) / (nextMilestone - previousMilestone)) * 100;
    return Math.min(100, Math.max(0, progress));
  }

  static calculateRisk(
    streak: StreakResponse,
    options: StreakCalculationOptions
  ): StreakRisk {
    if (!streak.lastCompletionDate || streak.currentStreak === 0) {
      return {
        habitId: streak.habitId,
        isAtRisk: false,
        daysSinceLastCompletion: streak.daysSinceLastCompletion || 0,
        riskLevel: 'low',
        message: 'No active streak to maintain'
      };
    }

    const daysSinceCompletion = streak.daysSinceLastCompletion || 0;
    const warningDays = options.warningDays || 1;
    
    let riskThreshold: number;
    switch (options.frequency) {
      case 'Daily':
        riskThreshold = 1;
        break;
      case 'Weekly':
        riskThreshold = 7;
        break;
      case 'Custom':
        riskThreshold = options.targetCount;
        break;
      default:
        riskThreshold = 1;
    }

    const isAtRisk = daysSinceCompletion >= riskThreshold;
    let riskLevel: StreakRisk['riskLevel'] = 'low';
    let message = '';

    if (isAtRisk) {
      if (daysSinceCompletion >= riskThreshold * 2) {
        riskLevel = 'high';
        message = `Your ${streak.currentStreak}-day streak is in danger! Complete today to save it.`;
      } else if (daysSinceCompletion >= riskThreshold) {
        riskLevel = 'medium';
        message = `Your ${streak.currentStreak}-day streak is at risk. Complete soon to maintain it.`;
      }
    } else if (daysSinceCompletion >= riskThreshold - warningDays) {
      riskLevel = 'low';
      message = `Your ${streak.currentStreak}-day streak continues! Keep it up.`;
    } else {
      message = `Great job maintaining your ${streak.currentStreak}-day streak!`;
    }

    return {
      habitId: streak.habitId,
      isAtRisk,
      daysSinceLastCompletion: daysSinceCompletion,
      riskLevel,
      message
    };
  }

  static formatStreakDisplay(streak: number, showUnit = true): string {
    if (streak === 0) return '0' + (showUnit ? ' days' : '');
    if (streak === 1) return '1' + (showUnit ? ' day' : '');
    return `${streak}` + (showUnit ? ' days' : '');
  }

  static getStreakColor(streak: number): string {
    if (streak >= 365) return '#FFD700'; // Gold
    if (streak >= 100) return '#C0C0C0'; // Silver
    if (streak >= 30) return '#CD7F32'; // Bronze
    if (streak >= 7) return '#90EE90'; // Light green
    if (streak > 0) return '#87CEEB'; // Light blue
    return '#D3D3D3'; // Light gray
  }

  static getStreakEmoji(streak: number): string {
    if (streak >= 365) return '👑';
    if (streak >= 100) return '🏆';
    if (streak >= 50) return '🔥';
    if (streak >= 30) return '⭐';
    if (streak >= 14) return '💪';
    if (streak >= 7) return '🎯';
    if (streak > 0) return '✅';
    return '⭕';
  }

  static calculateCompletionRate(
    totalCompletions: number,
    createdAt: string,
    frequency: 'Daily' | 'Weekly' | 'Custom',
    targetCount?: number
  ): number {
    const daysSinceCreation = Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    let expectedCompletions: number;
    switch (frequency) {
      case 'Daily':
        expectedCompletions = daysSinceCreation;
        break;
      case 'Weekly':
        expectedCompletions = daysSinceCreation / 7;
        break;
      case 'Custom':
        expectedCompletions = daysSinceCreation / (targetCount || 1);
        break;
      default:
        expectedCompletions = daysSinceCreation;
    }

    return expectedCompletions > 0 ? (totalCompletions / expectedCompletions) * 100 : 0;
  }

  static getMotivationalMessage(streak: number): string {
    if (streak >= 365) return "Incredible! You've built a year-long habit!";
    if (streak >= 100) return "Amazing! You've hit triple digits!";
    if (streak >= 50) return "Fantastic! You're halfway to 100!";
    if (streak >= 30) return "Great job! A month of consistency!";
    if (streak >= 21) return "Awesome! They say 21 days makes a habit!";
    if (streak >= 14) return "Two weeks strong! Keep it up!";
    if (streak >= 7) return "One week streak! You're building momentum!";
    if (streak >= 3) return "Nice! Three days in a row!";
    if (streak >= 1) return "Great start! Keep going!";
    return "Ready to start your streak?";
  }

  static estimateNextMilestoneDate(
    currentStreak: number,
    frequency: 'Daily' | 'Weekly' | 'Custom',
    targetCount?: number
  ): Date {
    const nextMilestone = this.getNextMilestone(currentStreak);
    const daysToMilestone = nextMilestone - currentStreak;
    
    let daysMultiplier: number;
    switch (frequency) {
      case 'Daily':
        daysMultiplier = 1;
        break;
      case 'Weekly':
        daysMultiplier = 7;
        break;
      case 'Custom':
        daysMultiplier = targetCount || 1;
        break;
      default:
        daysMultiplier = 1;
    }

    const estimatedDays = daysToMilestone * daysMultiplier;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + estimatedDays);
    
    return futureDate;
  }

  static getStreakTrendDirection(
    currentStreak: number,
    previousStreak?: number
  ): 'up' | 'down' | 'stable' {
    if (previousStreak === undefined) return 'stable';
    if (currentStreak > previousStreak) return 'up';
    if (currentStreak < previousStreak) return 'down';
    return 'stable';
  }

  static calculateStreakScore(streak: StreakResponse): number {
    // Calculate a composite score based on multiple factors
    const currentStreakScore = Math.min(streak.currentStreak * 10, 1000); // Cap at 1000
    const longestStreakBonus = Math.min(streak.longestStreak * 2, 200); // Cap at 200
    const completionRateScore = streak.completionRate * 5; // Max 500
    const milestoneBonus = streak.achievedMilestones.length * 50; // 50 per milestone
    
    return currentStreakScore + longestStreakBonus + completionRateScore + milestoneBonus;
  }

  static isStreakImpressive(streak: number): boolean {
    return streak >= 30; // 30+ days is considered impressive
  }

  static getStreakCategory(streak: number): string {
    if (streak >= 365) return 'Legendary';
    if (streak >= 100) return 'Master';
    if (streak >= 50) return 'Expert';
    if (streak >= 30) return 'Pro';
    if (streak >= 14) return 'Intermediate';
    if (streak >= 7) return 'Beginner';
    if (streak > 0) return 'Starter';
    return 'New';
  }
}