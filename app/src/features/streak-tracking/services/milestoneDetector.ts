import type { MilestoneAchievement, CelebrationType, BadgeType } from '../types/streak.types';

export class MilestoneDetector {
  private static readonly MILESTONE_CONFIG: Record<
    number,
    {
      message: string;
      celebrationType: CelebrationType;
      badgeType: BadgeType;
      isSpecial: boolean;
    }
  > = {
    7: {
      message: "One week streak! You're building momentum!",
      celebrationType: 'confetti',
      badgeType: 'bronze',
      isSpecial: false,
    },
    14: {
      message: 'Two weeks strong! Keep it up!',
      celebrationType: 'sparkle',
      badgeType: 'bronze',
      isSpecial: false,
    },
    21: {
      message: 'Three weeks! They say it takes 21 days to form a habit!',
      celebrationType: 'pulse',
      badgeType: 'silver',
      isSpecial: true,
    },
    30: {
      message: "One month milestone! You're unstoppable!",
      celebrationType: 'confetti',
      badgeType: 'silver',
      isSpecial: true,
    },
    50: {
      message: '50 days! Half way to a century!',
      celebrationType: 'glow',
      badgeType: 'gold',
      isSpecial: false,
    },
    75: {
      message: '75 days! Three quarters of the way to 100!',
      celebrationType: 'bounce',
      badgeType: 'gold',
      isSpecial: false,
    },
    100: {
      message: 'Century streak! 100 days of consistency!',
      celebrationType: 'confetti',
      badgeType: 'platinum',
      isSpecial: true,
    },
    150: {
      message: "150 days! You're a habit master!",
      celebrationType: 'sparkle',
      badgeType: 'platinum',
      isSpecial: false,
    },
    200: {
      message: '200 days! Double century achieved!',
      celebrationType: 'confetti',
      badgeType: 'diamond',
      isSpecial: true,
    },
    365: {
      message: 'One year! 365 days of dedication!',
      celebrationType: 'confetti',
      badgeType: 'diamond',
      isSpecial: true,
    },
    500: {
      message: '500 days! Half way to 1000!',
      celebrationType: 'confetti',
      badgeType: 'legendary',
      isSpecial: true,
    },
    1000: {
      message: "1000 days! You're a legend!",
      celebrationType: 'confetti',
      badgeType: 'legendary',
      isSpecial: true,
    },
  };

  static detectMilestones(
    habitId: number,
    habitName: string,
    currentStreak: number,
    previousStreak: number
  ): MilestoneAchievement[] {
    const achievements: MilestoneAchievement[] = [];
    const milestoneValues = Object.keys(this.MILESTONE_CONFIG).map(Number);

    // Find new milestones reached
    const newMilestones = milestoneValues.filter(
      milestone => milestone > previousStreak && milestone <= currentStreak
    );

    for (const milestone of newMilestones) {
      const config = this.MILESTONE_CONFIG[milestone];
      if (config) {
        achievements.push({
          habitId,
          habitName,
          milestoneValue: milestone,
          achievedAt: new Date().toISOString(),
          celebrationType: config.celebrationType,
          message: config.message,
          isNew: true,
          badgeType: config.badgeType,
        });
      }
    }

    return achievements;
  }

  static getMilestoneConfig(milestone: number) {
    return (
      this.MILESTONE_CONFIG[milestone] || {
        message: `Amazing! ${milestone} day streak!`,
        celebrationType: 'confetti' as CelebrationType,
        badgeType: 'bronze' as BadgeType,
        isSpecial: false,
      }
    );
  }

  static isMilestone(streak: number): boolean {
    return streak in this.MILESTONE_CONFIG;
  }

  static getNextMilestone(currentStreak: number): number {
    const milestones = Object.keys(this.MILESTONE_CONFIG)
      .map(Number)
      .sort((a, b) => a - b);
    return milestones.find(m => m > currentStreak) || 1000;
  }

  static getMilestoneValues(): number[] {
    return Object.keys(this.MILESTONE_CONFIG)
      .map(Number)
      .sort((a, b) => a - b);
  }

  static getAchievedMilestones(currentStreak: number): number[] {
    return this.getMilestoneValues().filter(m => m <= currentStreak);
  }

  static getMilestoneMessage(milestone: number): string {
    return this.getMilestoneConfig(milestone).message;
  }

  static getCelebrationType(milestone: number): CelebrationType {
    return this.getMilestoneConfig(milestone).celebrationType;
  }

  static getBadgeType(milestone: number): BadgeType {
    return this.getMilestoneConfig(milestone).badgeType;
  }

  static isSpecialMilestone(milestone: number): boolean {
    return this.getMilestoneConfig(milestone).isSpecial;
  }

  static getMilestonesByBadgeType(badgeType: BadgeType): number[] {
    return Object.entries(this.MILESTONE_CONFIG)
      .filter(([_, config]) => config.badgeType === badgeType)
      .map(([milestone]) => Number(milestone))
      .sort((a, b) => a - b);
  }

  static getSpecialMilestones(): number[] {
    return Object.entries(this.MILESTONE_CONFIG)
      .filter(([_, config]) => config.isSpecial)
      .map(([milestone]) => Number(milestone))
      .sort((a, b) => a - b);
  }

  static calculateMilestoneProgress(currentStreak: number): {
    nextMilestone: number;
    progressPercentage: number;
    remainingDays: number;
    previousMilestone: number;
  } {
    const nextMilestone = this.getNextMilestone(currentStreak);
    const achievedMilestones = this.getAchievedMilestones(currentStreak);
    const previousMilestone = achievedMilestones.length > 0 ? Math.max(...achievedMilestones) : 0;

    const totalDistance = nextMilestone - previousMilestone;
    const currentDistance = currentStreak - previousMilestone;
    const progressPercentage =
      totalDistance > 0 ? Math.min(100, (currentDistance / totalDistance) * 100) : 0;

    return {
      nextMilestone,
      progressPercentage,
      remainingDays: nextMilestone - currentStreak,
      previousMilestone,
    };
  }

  static getMilestoneReward(milestone: number): {
    title: string;
    description: string;
    icon: string;
    color: string;
  } {
    const config = this.getMilestoneConfig(milestone);

    const rewards = {
      7: {
        title: '7-Day Warrior',
        description: 'First week completed!',
        icon: '🎯',
        color: '#CD7F32',
      },
      14: {
        title: 'Two-Week Champion',
        description: 'Building consistency!',
        icon: '💪',
        color: '#CD7F32',
      },
      21: { title: 'Habit Former', description: 'The magic number!', icon: '🌟', color: '#C0C0C0' },
      30: {
        title: 'Monthly Master',
        description: 'A full month achieved!',
        icon: '🏅',
        color: '#C0C0C0',
      },
      50: {
        title: 'Half-Century Hero',
        description: 'Halfway to 100!',
        icon: '🔥',
        color: '#FFD700',
      },
      75: {
        title: 'Diamond Dedication',
        description: 'Three-quarters strong!',
        icon: '💎',
        color: '#FFD700',
      },
      100: {
        title: 'Century Superstar',
        description: '100 days of excellence!',
        icon: '🏆',
        color: '#E5E4E2',
      },
      150: {
        title: 'Habit Maestro',
        description: 'Master of consistency!',
        icon: '👑',
        color: '#E5E4E2',
      },
      200: {
        title: 'Double Century Legend',
        description: '200 days unstoppable!',
        icon: '💎',
        color: '#B9F2FF',
      },
      365: {
        title: 'Year-Long Champion',
        description: 'A full year of dedication!',
        icon: '🏆',
        color: '#B9F2FF',
      },
      500: {
        title: 'Legendary Achiever',
        description: 'Halfway to infinity!',
        icon: '⚡',
        color: '#FF69B4',
      },
      1000: {
        title: 'Mythical Master',
        description: 'You are a legend!',
        icon: '🌟',
        color: '#FF69B4',
      },
    };

    return (
      rewards[milestone as keyof typeof rewards] || {
        title: `${milestone}-Day Champion`,
        description: `${milestone} days of amazing consistency!`,
        icon: '🎉',
        color: '#4CAF50',
      }
    );
  }

  static shouldTriggerCelebration(
    milestone: number,
    isFirstTime: boolean = true,
    userPreferences: { enableCelebrations?: boolean } = {}
  ): boolean {
    if (userPreferences.enableCelebrations === false) return false;
    if (!isFirstTime) return false;
    return this.isMilestone(milestone);
  }

  static getUpcomingMilestones(
    currentStreak: number,
    limit: number = 3
  ): Array<{
    milestone: number;
    daysAway: number;
    config: ReturnType<typeof this.getMilestoneConfig>;
  }> {
    const allMilestones = this.getMilestoneValues();
    const upcoming = allMilestones
      .filter(m => m > currentStreak)
      .slice(0, limit)
      .map(milestone => ({
        milestone,
        daysAway: milestone - currentStreak,
        config: this.getMilestoneConfig(milestone),
      }));

    return upcoming;
  }
}
