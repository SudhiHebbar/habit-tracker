export type AnimationTiming = 'instant' | 'fast' | 'normal' | 'slow' | 'glacial';
export type AnimationEasing = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'spring' | 'bounce';
export type AnimationType = 'fade' | 'slide' | 'scale' | 'rotate' | 'flip' | 'bounce';

export interface AnimationDuration {
  instant: 0;
  fast: 150;
  normal: 300;
  slow: 500;
  glacial: 1000;
}

export interface AnimationConfig {
  duration?: number;
  delay?: number;
  easing?: AnimationEasing;
  stiffness?: number;
  damping?: number;
  mass?: number;
  disabled?: boolean;
}

export interface TransitionConfig extends AnimationConfig {
  type?: AnimationType;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
}

export interface GestureConfig {
  swipeThreshold?: number;
  swipeVelocity?: number;
  tapDuration?: number;
  longPressDuration?: number;
}

export interface PerformanceMetrics {
  fps: number;
  frameDrops: number;
  renderTime: number;
  animationTime: number;
}

export interface MotionPreferences {
  reducedMotion: boolean;
  prefersContrast: boolean;
  prefersTransparency: boolean;
}

export interface CelebrationConfig {
  type: 'confetti' | 'sparkle' | 'pulse' | 'bounce' | 'glow';
  intensity?: 'subtle' | 'normal' | 'intense';
  duration?: number;
  colors?: string[];
}

export interface SkeletonConfig {
  shimmer?: boolean;
  shimmerDuration?: number;
  backgroundColor?: string;
  highlightColor?: string;
  borderRadius?: number | string;
}

export interface MicroInteractionConfig {
  hover?: boolean;
  press?: boolean;
  focus?: boolean;
  ripple?: boolean;
  haptic?: boolean;
  sound?: boolean;
}

export const ANIMATION_DURATIONS: AnimationDuration = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  glacial: 1000,
};

export const SPRING_CONFIGS = {
  default: { stiffness: 100, damping: 10 },
  wobbly: { stiffness: 180, damping: 12 },
  stiff: { stiffness: 400, damping: 40 },
  slow: { stiffness: 280, damping: 60 },
  molasses: { stiffness: 280, damping: 120 },
} as const;

export const EASING_FUNCTIONS = {
  linear: [0, 0, 1, 1],
  easeIn: [0.42, 0, 1, 1],
  easeOut: [0, 0, 0.58, 1],
  easeInOut: [0.42, 0, 0.58, 1],
  easeInQuad: [0.55, 0.085, 0.68, 0.53],
  easeInCubic: [0.55, 0.055, 0.675, 0.19],
  easeOutCubic: [0.215, 0.61, 0.355, 1],
  easeInOutCubic: [0.645, 0.045, 0.355, 1],
  easeInQuart: [0.895, 0.03, 0.685, 0.22],
  easeOutQuart: [0.165, 0.84, 0.44, 1],
  easeInOutQuart: [0.77, 0, 0.175, 1],
  easeInQuint: [0.755, 0.05, 0.855, 0.06],
  easeOutQuint: [0.23, 1, 0.32, 1],
  easeInOutQuint: [0.86, 0, 0.07, 1],
  easeInExpo: [0.95, 0.05, 0.795, 0.035],
  easeOutExpo: [0.19, 1, 0.22, 1],
  easeInOutExpo: [1, 0, 0, 1],
  easeInCirc: [0.6, 0.04, 0.98, 0.335],
  easeOutCirc: [0.075, 0.82, 0.165, 1],
  easeInOutCirc: [0.785, 0.135, 0.15, 0.86],
} as const;
