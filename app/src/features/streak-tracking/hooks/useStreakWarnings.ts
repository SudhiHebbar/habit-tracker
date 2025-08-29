import { useQuery } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import { streakApi, streakQueryKeys } from '../services/streakApi';
import { StreakCalculator } from '../services/streakCalculator';
import type { StreakResponse, StreakRisk, StreakCalculationOptions } from '../types/streak.types';
import { useEventBus } from '@shared/hooks/useEventBus';

export function useStreakWarnings(trackerId?: number, warningDays: number = 1) {
  const { emit } = useEventBus();

  // Get streaks at risk
  const {
    data: streaksAtRisk,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: trackerId 
      ? streakQueryKeys.atRisk(trackerId, warningDays)
      : ['warnings', 'empty'],
    queryFn: () => trackerId 
      ? streakApi.getStreaksAtRisk(trackerId, warningDays) 
      : Promise.resolve([]),
    enabled: trackerId !== undefined,
    staleTime: 2 * 60 * 1000, // 2 minutes (frequent updates for warnings)
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });

  // Calculate detailed risk assessments
  const riskAssessments = useMemo(() => {
    if (!streaksAtRisk) return [];

    return streaksAtRisk.map(streak => {
      // Default calculation options - in a real app, these would come from habit settings
      const options: StreakCalculationOptions = {
        frequency: 'Daily', // This should come from the habit's actual frequency
        targetCount: 1,
        warningDays
      };

      return StreakCalculator.calculateRisk(streak, options);
    });
  }, [streaksAtRisk, warningDays]);

  // Group risks by severity
  const risksByLevel = useMemo(() => {
    const grouped = {
      high: [] as StreakRisk[],
      medium: [] as StreakRisk[],
      low: [] as StreakRisk[]
    };

    riskAssessments.forEach(risk => {
      grouped[risk.riskLevel].push(risk);
    });

    return grouped;
  }, [riskAssessments]);

  // Warning statistics
  const warningStats = useMemo(() => {
    const totalAtRisk = streaksAtRisk?.length || 0;
    const highRisk = risksByLevel.high.length;
    const mediumRisk = risksByLevel.medium.length;
    const lowRisk = risksByLevel.low.length;

    return {
      totalAtRisk,
      highRisk,
      mediumRisk,
      lowRisk,
      hasAnyRisks: totalAtRisk > 0,
      hasCriticalRisks: highRisk > 0,
      riskScore: (highRisk * 3 + mediumRisk * 2 + lowRisk) / Math.max(1, totalAtRisk),
    };
  }, [risksByLevel, streaksAtRisk]);

  // Get warning message for a specific streak
  const getWarningMessage = useCallback((streak: StreakResponse): string => {
    const options: StreakCalculationOptions = {
      frequency: 'Daily',
      targetCount: 1,
      warningDays
    };
    
    const risk = StreakCalculator.calculateRisk(streak, options);
    return risk.message;
  }, [warningDays]);

  // Get urgency level for a streak
  const getUrgencyLevel = useCallback((streak: StreakResponse): 'critical' | 'warning' | 'info' => {
    if (!streak.daysSinceLastCompletion) return 'info';
    
    if (streak.daysSinceLastCompletion >= 2) return 'critical';
    if (streak.daysSinceLastCompletion >= 1) return 'warning';
    return 'info';
  }, []);

  // Emit warning events when risks are detected
  const emitWarningEvents = useCallback(() => {
    if (risksByLevel.high.length > 0) {
      emit('streaks:critical-risk', {
        count: risksByLevel.high.length,
        risks: risksByLevel.high
      });
    }

    if (warningStats.totalAtRisk > 0) {
      emit('streaks:warnings-updated', {
        total: warningStats.totalAtRisk,
        byLevel: {
          high: risksByLevel.high.length,
          medium: risksByLevel.medium.length,
          low: risksByLevel.low.length
        }
      });
    }
  }, [emit, risksByLevel, warningStats]);

  // Auto-emit events when warnings change
  useMemo(() => {
    if (!isLoading && streaksAtRisk) {
      emitWarningEvents();
    }
  }, [streaksAtRisk, isLoading, emitWarningEvents]);

  return {
    // Data
    streaksAtRisk: streaksAtRisk || [],
    riskAssessments,
    risksByLevel,
    warningStats,
    
    // State
    isLoading,
    error,
    hasWarnings: warningStats.hasAnyRisks,
    hasCriticalWarnings: warningStats.hasCriticalRisks,
    
    // Actions
    refetch,
    getWarningMessage,
    getUrgencyLevel,
    emitWarningEvents,
  };
}

// Hook for individual streak warnings
export function useStreakWarning(streak?: StreakResponse, options?: StreakCalculationOptions) {
  const riskAssessment = useMemo(() => {
    if (!streak) return null;

    const defaultOptions: StreakCalculationOptions = {
      frequency: 'Daily',
      targetCount: 1,
      warningDays: 1,
      ...options
    };

    return StreakCalculator.calculateRisk(streak, defaultOptions);
  }, [streak, options]);

  const warningLevel = useMemo(() => {
    if (!riskAssessment) return 'none';
    return riskAssessment.riskLevel;
  }, [riskAssessment]);

  const shouldShowWarning = useMemo(() => {
    return riskAssessment?.isAtRisk || false;
  }, [riskAssessment]);

  const warningColor = useMemo(() => {
    if (!riskAssessment) return '#gray';
    
    switch (riskAssessment.riskLevel) {
      case 'high': return '#ef4444'; // red-500
      case 'medium': return '#f59e0b'; // amber-500
      case 'low': return '#10b981'; // emerald-500
      default: return '#6b7280'; // gray-500
    }
  }, [riskAssessment]);

  const warningIcon = useMemo(() => {
    if (!riskAssessment) return '✅';
    
    switch (riskAssessment.riskLevel) {
      case 'high': return '🚨';
      case 'medium': return '⚠️';
      case 'low': return '💡';
      default: return '✅';
    }
  }, [riskAssessment]);

  return {
    riskAssessment,
    warningLevel,
    shouldShowWarning,
    warningColor,
    warningIcon,
    message: riskAssessment?.message || '',
    daysSinceLastCompletion: riskAssessment?.daysSinceLastCompletion || 0,
    isAtRisk: riskAssessment?.isAtRisk || false,
  };
}

// Hook for warning preferences and settings
export function useWarningPreferences() {
  // This would typically connect to user preferences storage
  // For now, we'll use localStorage with defaults
  
  const getPreference = useCallback(<T>(key: string, defaultValue: T): T => {
    try {
      const stored = localStorage.getItem(`streakWarnings.${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  }, []);

  const setPreference = useCallback(<T>(key: string, value: T) => {
    try {
      localStorage.setItem(`streakWarnings.${key}`, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save warning preference:', error);
    }
  }, []);

  const preferences = {
    enableWarnings: getPreference('enableWarnings', true),
    warningDays: getPreference('warningDays', 1),
    enableCriticalAlerts: getPreference('enableCriticalAlerts', true),
    enableSounds: getPreference('enableSounds', false),
    enableDesktopNotifications: getPreference('enableDesktopNotifications', false),
    quietHours: getPreference('quietHours', { start: 22, end: 8 }),
    warningFrequency: getPreference('warningFrequency', 'daily'), // daily, twice-daily, hourly
  };

  const updatePreferences = useCallback((updates: Partial<typeof preferences>) => {
    Object.entries(updates).forEach(([key, value]) => {
      setPreference(key, value);
    });
  }, [setPreference]);

  const isQuietTime = useCallback(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const { start, end } = preferences.quietHours;
    
    if (start > end) {
      // Quiet hours cross midnight (e.g., 22:00 to 8:00)
      return currentHour >= start || currentHour < end;
    } else {
      // Quiet hours within same day
      return currentHour >= start && currentHour < end;
    }
  }, [preferences.quietHours]);

  const shouldShowWarning = useCallback((riskLevel: 'high' | 'medium' | 'low') => {
    if (!preferences.enableWarnings) return false;
    if (riskLevel === 'high' && !preferences.enableCriticalAlerts) return false;
    if (isQuietTime() && riskLevel !== 'high') return false;
    
    return true;
  }, [preferences, isQuietTime]);

  return {
    preferences,
    updatePreferences,
    isQuietTime,
    shouldShowWarning,
  };
}