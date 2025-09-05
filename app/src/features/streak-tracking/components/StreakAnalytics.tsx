import { motion } from 'framer-motion';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import styles from './StreakAnalytics.module.css';
import { StreakAnalyticsData, StreakTrend, HabitCompletionData } from '../types/streak.types';
import { useAnimation } from '@features/animations/hooks/useAnimation';

interface StreakAnalyticsProps {
  trackerId: number;
  analyticsData: StreakAnalyticsData;
  trends: StreakTrend[];
  timeframe?: 'week' | 'month' | 'quarter' | 'year';
  showComparison?: boolean;
  className?: string;
}

export default function StreakAnalytics({
  trackerId,
  analyticsData,
  trends,
  timeframe = 'month',
  showComparison = true,
  className,
}: StreakAnalyticsProps) {
  const { shouldAnimate } = useAnimation();

  // Calculate insights based on analytics data
  const insights = calculateInsights(analyticsData, trends);
  const chartData = prepareChartData(trends, timeframe);

  const containerVariants = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <motion.div
      className={`${styles.container} ${className || ''}`}
      variants={containerVariants}
      initial='initial'
      animate='animate'
    >
      <div className={styles.header}>
        <h2 className={styles.title}>Streak Analytics</h2>
        <div className={styles.timeframeSelector}>
          <button className={timeframe === 'week' ? styles.active : ''}>Week</button>
          <button className={timeframe === 'month' ? styles.active : ''}>Month</button>
          <button className={timeframe === 'quarter' ? styles.active : ''}>Quarter</button>
          <button className={timeframe === 'year' ? styles.active : ''}>Year</button>
        </div>
      </div>

      {/* Key Metrics */}
      <motion.section className={styles.metrics} variants={cardVariants}>
        <h3 className={styles.sectionTitle}>Key Metrics</h3>
        <div className={styles.metricsGrid}>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Average Streak</span>
            <span className={styles.metricValue}>
              {analyticsData.averageStreak.toFixed(1)} days
            </span>
            <div className={styles.metricChange}>
              <span className={analyticsData.streakGrowth > 0 ? styles.positive : styles.negative}>
                {analyticsData.streakGrowth > 0 ? '↗' : '↘'}{' '}
                {Math.abs(analyticsData.streakGrowth)}%
              </span>
            </div>
          </div>

          <div className={styles.metric}>
            <span className={styles.metricLabel}>Success Rate</span>
            <span className={styles.metricValue}>
              {Math.round(analyticsData.completionRate * 100)}%
            </span>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${analyticsData.completionRate * 100}%` }}
              />
            </div>
          </div>

          <div className={styles.metric}>
            <span className={styles.metricLabel}>Active Streaks</span>
            <span className={styles.metricValue}>{analyticsData.activeStreaks}</span>
            <span className={styles.metricSubtext}>out of {analyticsData.totalHabits} habits</span>
          </div>

          <div className={styles.metric}>
            <span className={styles.metricLabel}>Milestones Hit</span>
            <span className={styles.metricValue}>{analyticsData.totalMilestones}</span>
            <div className={styles.milestoneIcons}>
              {Array.from({ length: Math.min(analyticsData.totalMilestones, 5) }).map((_, i) => (
                <span key={i} className={styles.milestoneIcon}>
                  🏆
                </span>
              ))}
              {analyticsData.totalMilestones > 5 && (
                <span className={styles.milestoneOverflow}>
                  +{analyticsData.totalMilestones - 5}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Trend Chart */}
      <motion.section className={styles.chart} variants={cardVariants}>
        <h3 className={styles.sectionTitle}>Streak Trends</h3>
        <div className={styles.chartContainer}>
          <svg className={styles.svg} viewBox='0 0 400 200'>
            <defs>
              <linearGradient id='streakGradient' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stopColor='var(--color-primary)' stopOpacity='0.8' />
                <stop offset='100%' stopColor='var(--color-primary)' stopOpacity='0.1' />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {Array.from({ length: 5 }).map((_, i) => (
              <line
                key={i}
                x1='0'
                y1={i * 40}
                x2='400'
                y2={i * 40}
                stroke='var(--color-border)'
                strokeWidth='1'
                opacity='0.3'
              />
            ))}

            {/* Trend line */}
            <motion.polyline
              fill='none'
              stroke='var(--color-primary)'
              strokeWidth='3'
              strokeLinecap='round'
              strokeLinejoin='round'
              points={chartData.points}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: shouldAnimate() ? 1 : 1 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            />

            {/* Area fill */}
            <motion.polygon
              fill='url(#streakGradient)'
              points={`${chartData.points},400,200,0,200`}
              initial={{ opacity: 0 }}
              animate={{ opacity: shouldAnimate() ? 1 : 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            />

            {/* Data points */}
            {chartData.dataPoints.map((point, index) => (
              <motion.circle
                key={index}
                cx={point.x}
                cy={point.y}
                r='4'
                fill='var(--color-primary)'
                stroke='white'
                strokeWidth='2'
                initial={{ scale: 0 }}
                animate={{ scale: shouldAnimate() ? 1 : 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 + 1 }}
                className={styles.dataPoint}
              />
            ))}
          </svg>

          <div className={styles.chartLabels}>
            {chartData.labels.map((label, index) => (
              <span key={index} className={styles.chartLabel}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Insights */}
      <motion.section className={styles.insights} variants={cardVariants}>
        <h3 className={styles.sectionTitle}>Insights & Recommendations</h3>
        <div className={styles.insightsList}>
          {insights.map((insight, index) => (
            <motion.div
              key={index}
              className={`${styles.insight} ${styles[insight.type]}`}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={styles.insightIcon}>{getInsightIcon(insight.type)}</div>
              <div className={styles.insightContent}>
                <h4 className={styles.insightTitle}>{insight.title}</h4>
                <p className={styles.insightDescription}>{insight.description}</p>
                {insight.action && (
                  <button className={styles.insightAction}>{insight.action}</button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Comparison */}
      {showComparison && (
        <motion.section className={styles.comparison} variants={cardVariants}>
          <h3 className={styles.sectionTitle}>Habit Comparison</h3>
          <div className={styles.comparisonChart}>
            {analyticsData.habitComparisons?.map((habit, index) => (
              <div key={habit.habitId} className={styles.habitBar}>
                <div className={styles.habitName}>{habit.habitName}</div>
                <div className={styles.barContainer}>
                  <motion.div
                    className={styles.bar}
                    initial={{ width: 0 }}
                    animate={{ width: `${habit.successRate * 100}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    style={{
                      backgroundColor: getHabitColor(habit.successRate),
                    }}
                  />
                  <span className={styles.barLabel}>{Math.round(habit.successRate * 100)}%</span>
                </div>
                <div className={styles.habitStreak}>{habit.currentStreak} days</div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Performance Breakdown */}
      <motion.section className={styles.breakdown} variants={cardVariants}>
        <h3 className={styles.sectionTitle}>Performance Breakdown</h3>
        <div className={styles.performanceGrid}>
          <div className={styles.performanceCard}>
            <h4>Best Days</h4>
            <div className={styles.daysList}>
              {analyticsData.bestPerformanceDays?.map((day, index) => (
                <div key={index} className={styles.dayItem}>
                  <span className={styles.dayName}>{day.dayName}</span>
                  <span className={styles.dayRate}>{Math.round(day.successRate * 100)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.performanceCard}>
            <h4>Streak Patterns</h4>
            <div className={styles.patternsList}>
              {analyticsData.streakPatterns?.map((pattern, index) => (
                <div key={index} className={styles.patternItem}>
                  <span className={styles.patternName}>{pattern.name}</span>
                  <span className={styles.patternFreq}>{pattern.frequency}x</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}

// Helper functions
function calculateInsights(analyticsData: StreakAnalyticsData, trends: StreakTrend[]) {
  const insights = [];

  // High performance insight
  if (analyticsData.completionRate > 0.8) {
    insights.push({
      type: 'success',
      title: 'Excellent Performance!',
      description: `You're maintaining an ${Math.round(analyticsData.completionRate * 100)}% success rate. Keep up the momentum!`,
    });
  }

  // Improvement opportunity
  if (analyticsData.streakGrowth < 0) {
    insights.push({
      type: 'warning',
      title: 'Streaks Declining',
      description:
        'Your average streak length has decreased. Consider reviewing your habit schedule.',
      action: 'Adjust Schedule',
    });
  }

  // Milestone achievement
  if (analyticsData.totalMilestones > 0) {
    insights.push({
      type: 'info',
      title: 'Milestone Achievement',
      description: `You've hit ${analyticsData.totalMilestones} milestones this period. Great consistency!`,
    });
  }

  return insights;
}

function prepareChartData(trends: StreakTrend[], timeframe: string) {
  const chartWidth = 400;
  const chartHeight = 200;
  const padding = 20;

  const maxValue = Math.max(...trends.map(t => t.averageStreak));
  const dataPoints = trends.map((trend, index) => {
    const x = (index / (trends.length - 1)) * (chartWidth - 2 * padding) + padding;
    const y =
      chartHeight - padding - (trend.averageStreak / maxValue) * (chartHeight - 2 * padding);
    return { x, y, value: trend.averageStreak };
  });

  const points = dataPoints.map(p => `${p.x},${p.y}`).join(' ');
  const labels = trends.map(t => format(new Date(t.date), 'MMM d'));

  return { points, dataPoints, labels };
}

function getInsightIcon(type: string) {
  switch (type) {
    case 'success':
      return '🎉';
    case 'warning':
      return '⚠️';
    case 'info':
      return '💡';
    default:
      return '📊';
  }
}

function getHabitColor(successRate: number) {
  if (successRate >= 0.8) return 'var(--color-success)';
  if (successRate >= 0.6) return 'var(--color-warning)';
  return 'var(--color-error)';
}
