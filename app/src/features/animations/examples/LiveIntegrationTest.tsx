import React, { useState } from 'react';
import { AnimatedCheckbox, CompletionCelebration, SkeletonHabitCard } from '../index';
import { HoverScale, PressAnimation } from '../components/MicroInteraction';
import { SwipeHandler } from '@shared/components/interactions/SwipeHandler';
import styles from './LiveIntegrationTest.module.css';

// Mock habit data
const mockHabits = [
  { id: 1, name: 'Morning Exercise', color: '#10b981', completed: false },
  { id: 2, name: 'Drink Water', color: '#3b82f6', completed: true },
  { id: 3, name: 'Read Books', color: '#f59e0b', completed: false },
  { id: 4, name: 'Meditate', color: '#8b5cf6', completed: false },
];

const LiveIntegrationTest: React.FC = () => {
  const [habits, setHabits] = useState(mockHabits);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationHabit, setCelebrationHabit] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleHabitToggle = (habitId: number, checked: boolean) => {
    setHabits(prev => 
      prev.map(habit => 
        habit.id === habitId 
          ? { ...habit, completed: checked }
          : habit
      )
    );

    if (checked) {
      const habit = habits.find(h => h.id === habitId);
      if (habit) {
        setCelebrationHabit(habit.name);
        setShowCelebration(true);
      }
    }
  };

  const handleSwipeLeft = (habitId: number) => {
    console.log(`Swiped left on habit ${habitId} - would delete`);
  };

  const handleSwipeRight = (habitId: number) => {
    const habit = habits.find(h => h.id === habitId);
    if (habit && !habit.completed) {
      handleHabitToggle(habitId, true);
    }
  };

  const toggleLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Live Animation Integration Test</h1>
        <p>These are the actual animation components integrated into a real habit tracking interface</p>
        
        <div className={styles.controls}>
          <button onClick={toggleLoading} className={styles.button}>
            {loading ? 'Loading...' : 'Test Loading States'}
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <h2>Today's Habits</h2>
        
        {loading ? (
          <div className={styles.habitList}>
            {[1, 2, 3, 4].map(i => (
              <SkeletonHabitCard key={i} />
            ))}
          </div>
        ) : (
          <div className={styles.habitList}>
            {habits.map(habit => (
              <SwipeHandler
                key={habit.id}
                onSwipeLeft={() => handleSwipeLeft(habit.id)}
                onSwipeRight={() => handleSwipeRight(habit.id)}
                enableHaptic
              >
                <HoverScale scale={1.02}>
                  <div className={styles.habitCard}>
                    <div className={styles.habitHeader}>
                      <div className={styles.habitInfo}>
                        <div 
                          className={styles.habitIcon}
                          style={{ backgroundColor: habit.color }}
                        />
                        <h3 className={styles.habitName}>{habit.name}</h3>
                      </div>
                      
                      <AnimatedCheckbox
                        checked={habit.completed}
                        onChange={(checked) => handleHabitToggle(habit.id, checked)}
                        color={habit.color}
                        size="large"
                        celebrateOnComplete
                        hapticFeedback
                        onAnimationComplete={() => {
                          if (!habit.completed) {
                            setCelebrationHabit(habit.name);
                            setShowCelebration(true);
                          }
                        }}
                      />
                    </div>
                    
                    <div className={styles.habitActions}>
                      <PressAnimation scale={0.95}>
                        <button className={styles.actionButton}>
                          Edit
                        </button>
                      </PressAnimation>
                      
                      <PressAnimation scale={0.95}>
                        <button className={styles.actionButton}>
                          Stats
                        </button>
                      </PressAnimation>
                    </div>
                    
                    <div className={styles.swipeHint}>
                      ← Swipe left to delete • Swipe right to complete →
                    </div>
                  </div>
                </HoverScale>
              </SwipeHandler>
            ))}
          </div>
        )}
        
        <div className={styles.stats}>
          <HoverScale scale={1.05}>
            <div className={styles.statCard}>
              <h4>Completed Today</h4>
              <div className={styles.statNumber}>
                {habits.filter(h => h.completed).length}/{habits.length}
              </div>
            </div>
          </HoverScale>
          
          <HoverScale scale={1.05}>
            <div className={styles.statCard}>
              <h4>Current Streak</h4>
              <div className={styles.statNumber}>7 days</div>
            </div>
          </HoverScale>
        </div>
      </div>

      <CompletionCelebration
        active={showCelebration}
        type="confetti"
        intensity="normal"
        message={`Great job completing ${celebrationHabit}!`}
        onComplete={() => setShowCelebration(false)}
      />
    </div>
  );
};

export default LiveIntegrationTest;