import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimation } from '../hooks/useAnimation';
import type { CelebrationConfig } from '../types/animation.types';
import clsx from 'clsx';
import styles from './CompletionCelebration.module.css';

interface CompletionCelebrationProps {
  active: boolean;
  type?: CelebrationConfig['type'];
  intensity?: CelebrationConfig['intensity'];
  duration?: number;
  colors?: string[];
  message?: string;
  milestone?: number;
  onComplete?: () => void;
  className?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  velocity: number;
  color: string;
  size: number;
  rotation: number;
}

export const CompletionCelebration: React.FC<CompletionCelebrationProps> = ({
  active,
  type = 'confetti',
  intensity = 'normal',
  duration = 3000,
  colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
  message = 'Great job!',
  milestone,
  onComplete,
  className,
}) => {
  const { shouldAnimate } = useAnimation();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (active && shouldAnimate()) {
      setIsVisible(true);
      generateParticles();

      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onComplete) onComplete();
      }, duration);

      return () => clearTimeout(timer);
    } else if (active && !shouldAnimate()) {
      if (onComplete) onComplete();
    }
  }, [active, duration, onComplete, shouldAnimate]);

  const generateParticles = () => {
    const particleCount = getParticleCount();
    const newParticles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: 100 + Math.random() * 20,
        angle: Math.random() * 360,
        velocity: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 4,
        rotation: Math.random() * 360,
      });
    }

    setParticles(newParticles);
  };

  const getParticleCount = () => {
    const counts = {
      subtle: 15,
      normal: 30,
      intense: 50,
    };
    return counts[intensity || 'normal'];
  };

  const getAnimationVariants = () => {
    switch (type) {
      case 'confetti':
        return confettiVariants;
      case 'sparkle':
        return sparkleVariants;
      case 'pulse':
        return pulseVariants;
      case 'bounce':
        return bounceVariants;
      case 'glow':
        return glowVariants;
      default:
        return confettiVariants;
    }
  };

  const confettiVariants = {
    initial: {
      y: 0,
      opacity: 1,
      scale: 0,
    },
    animate: (particle: Particle) => ({
      y: [-100, -200 - Math.random() * 100],
      x: [
        particle.x,
        particle.x + (Math.random() - 0.5) * 100,
      ],
      opacity: [1, 1, 0],
      scale: [0, 1, 1],
      rotate: [0, particle.rotation * 3],
      transition: {
        duration: duration / 1000,
        ease: 'easeOut' as const,
        times: [0, 0.2, 1],
      },
    }),
  };

  const sparkleVariants = {
    initial: {
      scale: 0,
      opacity: 0,
      rotate: 0,
    },
    animate: {
      scale: [0, 1.5, 0],
      opacity: [0, 1, 0],
      rotate: [0, 180, 360],
      transition: {
        duration: duration / 1000,
        ease: 'easeInOut' as const,
        times: [0, 0.5, 1],
      },
    },
  };

  const pulseVariants = {
    initial: {
      scale: 0.8,
      opacity: 0,
    },
    animate: {
      scale: [0.8, 1.2, 1],
      opacity: [0, 1, 0],
      transition: {
        duration: duration / 1000,
        ease: 'easeInOut',
        times: [0, 0.3, 1],
      },
    },
  };

  const bounceVariants = {
    initial: {
      y: 0,
      scale: 0,
    },
    animate: {
      y: [0, -30, 0],
      scale: [0, 1.1, 1],
      transition: {
        duration: duration / 1000,
        ease: 'easeOut',
        times: [0, 0.4, 1],
      },
    },
  };

  const glowVariants = {
    initial: {
      scale: 0,
      opacity: 0,
      filter: 'blur(0px)',
    },
    animate: {
      scale: [0, 1.5, 2],
      opacity: [0, 0.8, 0],
      filter: ['blur(0px)', 'blur(4px)', 'blur(8px)'],
      transition: {
        duration: duration / 1000,
        ease: 'easeOut' as const,
      },
    },
  };

  const messageVariants = {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.8,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut' as const,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.8,
      transition: {
        duration: 0.3,
        ease: 'easeIn' as const,
      },
    },
  };

  if (!shouldAnimate()) {
    return null;
  }

  const variants = getAnimationVariants();

  return (
    <AnimatePresence>
      {isVisible && (
        <div className={clsx(styles.container, className)} aria-live="polite">
          {type === 'confetti' && (
            <div className={styles.particleContainer}>
              {particles.map((particle) => (
                <motion.div
                  key={particle.id}
                  className={styles.confetti}
                  initial="initial"
                  animate="animate"
                  custom={particle}
                  variants={variants}
                  style={{
                    left: `${particle.x}%`,
                    backgroundColor: particle.color,
                    width: particle.size,
                    height: particle.size,
                  }}
                />
              ))}
            </div>
          )}

          {type === 'sparkle' && (
            <div className={styles.sparkleContainer}>
              {particles.map((particle) => (
                <motion.div
                  key={particle.id}
                  className={styles.sparkle}
                  initial="initial"
                  animate="animate"
                  variants={variants}
                  style={{
                    left: `${particle.x}%`,
                    top: `${particle.y}%`,
                  }}
                >
                  ✨
                </motion.div>
              ))}
            </div>
          )}

          {(type === 'pulse' || type === 'glow') && (
            <motion.div
              className={clsx(
                styles.pulseGlow,
                type === 'glow' && styles.glow
              )}
              initial="initial"
              animate="animate"
              variants={variants}
              style={{
                backgroundColor: colors[0],
              }}
            />
          )}

          {message && (
            <motion.div
              className={styles.messageContainer}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={messageVariants}
            >
              <div className={styles.message}>
                {milestone && (
                  <span className={styles.milestone}>
                    🎉 {milestone} Day Streak!
                  </span>
                )}
                <span className={styles.messageText}>{message}</span>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
};