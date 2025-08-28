import React, { useState } from 'react';
import {
  AnimatedCheckbox,
  CompletionCelebration,
  PageTransition,
  SkeletonCard,
  SkeletonHabitCard,
  MicroInteraction,
  HoverScale,
  PressAnimation,
} from '../index';
import { FadeIn } from '@shared/components/transitions/FadeIn';
import { SlideIn } from '@shared/components/transitions/SlideIn';
import { ScaleIn } from '@shared/components/transitions/ScaleIn';
import styles from './AnimationDemo.module.css';

export const AnimationDemo: React.FC = () => {
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const pages = ['Home', 'Dashboard', 'Settings'];

  return (
    <div className={styles.container}>
      <h1>Animation System Demo</h1>

      {/* Animated Checkbox Examples */}
      <section className={styles.section}>
        <h2>Animated Checkboxes</h2>
        <div className={styles.checkboxGroup}>
          <AnimatedCheckbox
            checked={checked1}
            onChange={setChecked1}
            label="Daily Exercise"
            color="#10b981"
            size="large"
          />
          <AnimatedCheckbox
            checked={checked2}
            onChange={(checked) => {
              setChecked2(checked);
              if (checked) {
                setShowCelebration(true);
              }
            }}
            label="Drink Water"
            color="#3b82f6"
            size="medium"
            celebrateOnComplete
          />
        </div>
      </section>

      {/* Completion Celebration */}
      <section className={styles.section}>
        <h2>Celebration Effects</h2>
        <div className={styles.buttonGroup}>
          <button
            onClick={() => setShowCelebration(true)}
            className={styles.button}
          >
            Trigger Confetti
          </button>
        </div>
        <CompletionCelebration
          active={showCelebration}
          type="confetti"
          intensity="normal"
          message="Great job!"
          milestone={7}
          onComplete={() => setShowCelebration(false)}
        />
      </section>

      {/* Page Transitions */}
      <section className={styles.section}>
        <h2>Page Transitions</h2>
        <div className={styles.buttonGroup}>
          {pages.map((page, index) => (
            <button
              key={page}
              onClick={() => setCurrentPage(index)}
              className={`${styles.button} ${currentPage === index ? styles.active : ''}`}
            >
              {page}
            </button>
          ))}
        </div>
        <PageTransition type="slide" direction="right">
          <div className={styles.pageContent}>
            <h3>{pages[currentPage]}</h3>
            <p>This is the {pages[currentPage]} page content.</p>
          </div>
        </PageTransition>
      </section>

      {/* Loading States */}
      <section className={styles.section}>
        <h2>Skeleton Loaders</h2>
        <button
          onClick={() => setLoading(!loading)}
          className={styles.button}
        >
          Toggle Loading
        </button>
        <div className={styles.skeletonGroup}>
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonHabitCard />
            </>
          ) : (
            <>
              <div className={styles.card}>
                <h3>Loaded Content</h3>
                <p>This is the actual content that appears after loading.</p>
              </div>
              <div className={styles.habitCard}>
                <h4>Habit Card</h4>
                <p>Morning Meditation</p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Micro-interactions */}
      <section className={styles.section}>
        <h2>Micro-interactions</h2>
        <div className={styles.interactionGroup}>
          <MicroInteraction
            config={{ hover: true, press: true, ripple: true }}
            className={styles.interactiveCard}
          >
            <div className={styles.cardContent}>
              <h4>Ripple Effect</h4>
              <p>Click me for ripple effect</p>
            </div>
          </MicroInteraction>

          <HoverScale scale={1.05}>
            <div className={styles.hoverCard}>
              <h4>Hover Scale</h4>
              <p>Hover to scale up</p>
            </div>
          </HoverScale>

          <PressAnimation scale={0.95}>
            <div className={styles.pressCard}>
              <h4>Press Animation</h4>
              <p>Press and hold</p>
            </div>
          </PressAnimation>
        </div>
      </section>

      {/* Transition Components */}
      <section className={styles.section}>
        <h2>Transition Effects</h2>
        <div className={styles.transitionGroup}>
          <FadeIn duration={500}>
            <div className={styles.transitionCard}>
              <h4>Fade In</h4>
              <p>This content fades in</p>
            </div>
          </FadeIn>

          <SlideIn direction="up" distance={30}>
            <div className={styles.transitionCard}>
              <h4>Slide In</h4>
              <p>This content slides in</p>
            </div>
          </SlideIn>

          <ScaleIn initialScale={0.8}>
            <div className={styles.transitionCard}>
              <h4>Scale In</h4>
              <p>This content scales in</p>
            </div>
          </ScaleIn>
        </div>
      </section>
    </div>
  );
};

export default AnimationDemo;