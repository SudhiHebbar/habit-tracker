import { motion } from 'framer-motion';
import { format, subDays, startOfDay, isAfter, isBefore } from 'date-fns';
import styles from './StreakHistory.module.css';
import { StreakData, HabitCompletionData } from '../types/streak.types';
import { useAnimation } from '@features/animations/hooks/useAnimation';

interface StreakHistoryProps {
  habitId: number;
  streakData: StreakData;
  completions: HabitCompletionData[];
  timeRange?: 30 | 60 | 90 | 365;
  showMilestones?: boolean;
  showBreaks?: boolean;
  className?: string;
}

export default function StreakHistory({
  habitId,
  streakData,
  completions,
  timeRange = 30,
  showMilestones = true,
  showBreaks = true,
  className,
}: StreakHistoryProps) {
  const { shouldAnimate } = useAnimation();
  
  // Calculate date range
  const endDate = startOfDay(new Date());
  const startDate = startOfDay(subDays(endDate, timeRange));
  
  // Process completions into timeline data
  const timelineData = Array.from({ length: timeRange }, (_, index) => {
    const date = subDays(endDate, timeRange - 1 - index);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    const completion = completions.find(c => 
      format(new Date(c.completionDate), 'yyyy-MM-dd') === dateStr
    );
    
    return {
      date,
      dateStr,
      isCompleted: !!completion,
      dayOfWeek: format(date, 'E'),
      dayOfMonth: format(date, 'd'),
      month: format(date, 'MMM'),
      isToday: format(date, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd'),
      isMilestone: showMilestones && completion && [7, 14, 21, 30, 50, 100].includes(completion.currentStreak || 0),
      isBreak: false, // Will be calculated below
    };
  });
  
  // Identify streak breaks
  if (showBreaks) {
    let inStreak = false;
    for (let i = timelineData.length - 1; i >= 0; i--) {
      if (timelineData[i].isCompleted) {
        inStreak = true;
      } else if (inStreak && !timelineData[i].isCompleted) {
        // Check if next day is completed (streak break)
        if (i < timelineData.length - 1 && timelineData[i + 1].isCompleted) {
          timelineData[i].isBreak = true;
          inStreak = false;
        }
      }
    }
  }
  
  // Calculate statistics
  const totalDays = timelineData.length;
  const completedDays = timelineData.filter(d => d.isCompleted).length;
  const completionRate = Math.round((completedDays / totalDays) * 100);
  const longestStreakInRange = calculateLongestStreakInRange(timelineData);
  
  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.02,
      }
    },
  };
  
  const dayVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 20,
      }
    },
    hover: shouldAnimate() ? {
      scale: 1.1,
      transition: { type: "spring" as const, stiffness: 400, damping: 10 }
    } : {},
  };
  
  return (
    <motion.div
      className={`${styles.container} ${className || ''}`}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <div className={styles.header}>
        <h3 className={styles.title}>Streak History</h3>
        <div className={styles.timeRangeSelector}>
          <button className={timeRange === 30 ? styles.active : ''}>30 Days</button>
          <button className={timeRange === 60 ? styles.active : ''}>60 Days</button>
          <button className={timeRange === 90 ? styles.active : ''}>90 Days</button>
          <button className={timeRange === 365 ? styles.active : ''}>1 Year</button>
        </div>
      </div>
      
      <div className={styles.statistics}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Completion Rate</span>
          <span className={styles.statValue}>{completionRate}%</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Completed Days</span>
          <span className={styles.statValue}>{completedDays}/{totalDays}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Best Streak</span>
          <span className={styles.statValue}>{longestStreakInRange} days</span>
        </div>
      </div>
      
      <div className={styles.timeline}>
        <div className={styles.monthLabels}>
          {getMonthLabels(timelineData).map((month, index) => (
            <div key={index} className={styles.monthLabel}>
              {month}
            </div>
          ))}
        </div>
        
        <div className={styles.calendar}>
          {getWeekdayLabels().map(day => (
            <div key={day} className={styles.weekdayLabel}>
              {day}
            </div>
          ))}
          
          {timelineData.map((day, index) => (
            <motion.div
              key={index}
              className={`
                ${styles.day}
                ${day.isCompleted ? styles.completed : styles.missed}
                ${day.isToday ? styles.today : ''}
                ${day.isMilestone ? styles.milestone : ''}
                ${day.isBreak ? styles.break : ''}
              `}
              variants={dayVariants}
              whileHover="hover"
              title={`${format(day.date, 'MMM d, yyyy')}${day.isCompleted ? ' - Completed' : ' - Missed'}${day.isMilestone ? ' - Milestone!' : ''}`}
            >
              {day.isMilestone && (
                <span className={styles.milestoneIcon}>⭐</span>
              )}
              {day.isBreak && (
                <span className={styles.breakIcon}>💔</span>
              )}
              <span className={styles.dayNumber}>{day.dayOfMonth}</span>
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={`${styles.legendDot} ${styles.completed}`} />
          <span>Completed</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendDot} ${styles.missed}`} />
          <span>Missed</span>
        </div>
        {showMilestones && (
          <div className={styles.legendItem}>
            <div className={`${styles.legendDot} ${styles.milestone}`}>⭐</div>
            <span>Milestone</span>
          </div>
        )}
        {showBreaks && (
          <div className={styles.legendItem}>
            <div className={`${styles.legendDot} ${styles.break}`}>💔</div>
            <span>Streak Break</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Helper functions
function calculateLongestStreakInRange(timelineData: any[]): number {
  let maxStreak = 0;
  let currentStreak = 0;
  
  for (const day of timelineData) {
    if (day.isCompleted) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  
  return maxStreak;
}

function getMonthLabels(timelineData: any[]): string[] {
  const months: string[] = [];
  let lastMonth = '';
  
  for (const day of timelineData) {
    if (day.month !== lastMonth) {
      months.push(day.month);
      lastMonth = day.month;
    }
  }
  
  return months;
}

function getWeekdayLabels(): string[] {
  return ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
}