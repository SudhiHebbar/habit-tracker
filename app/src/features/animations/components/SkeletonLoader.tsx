import React from 'react';
import { motion } from 'framer-motion';
import { useAnimation } from '../hooks/useAnimation';
import type { SkeletonConfig } from '../types/animation.types';
import clsx from 'clsx';
import styles from './SkeletonLoader.module.css';

interface SkeletonLoaderProps extends SkeletonConfig {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  lines?: number;
  className?: string;
  animate?: boolean;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = '1rem',
  variant = 'text',
  lines = 1,
  shimmer = true,
  shimmerDuration = 2,
  backgroundColor = '#e5e7eb',
  highlightColor = '#f3f4f6',
  borderRadius,
  className,
  animate = true,
}) => {
  const { shouldAnimate } = useAnimation();

  const getVariantStyles = () => {
    switch (variant) {
      case 'circular':
        return {
          borderRadius: '50%',
          width: typeof width === 'number' ? width : parseInt(width),
          height: typeof height === 'number' ? height : parseInt(height),
        };
      case 'rounded':
        return {
          borderRadius: borderRadius || '0.5rem',
        };
      case 'rectangular':
        return {
          borderRadius: borderRadius || '0',
        };
      case 'text':
      default:
        return {
          borderRadius: borderRadius || '0.25rem',
        };
    }
  };

  const shimmerAnimation = {
    animate: {
      backgroundPosition: ['200% 0', '-200% 0'],
      transition: {
        duration: shimmerDuration,
        ease: 'easeInOut' as const,
        repeat: Infinity,
      },
    },
  };

  const renderSkeleton = () => {
    const variantStyles = getVariantStyles();
    const shouldShowShimmer = shimmer && shouldAnimate() && animate;

    return (
      <motion.div
        className={clsx(
          styles.skeleton,
          shouldShowShimmer && styles.shimmer,
          className
        )}
        style={{
          width,
          height,
          backgroundColor,
          ...variantStyles,
          backgroundImage: shouldShowShimmer
            ? `linear-gradient(90deg, ${backgroundColor} 25%, ${highlightColor} 50%, ${backgroundColor} 75%)`
            : undefined,
          backgroundSize: shouldShowShimmer ? '200% 100%' : undefined,
        }}
        animate={shouldShowShimmer ? 'animate' : undefined}
        variants={shouldShowShimmer ? shimmerAnimation : undefined}
        aria-hidden="true"
      />
    );
  };

  if (lines > 1 && variant === 'text') {
    return (
      <div className={styles.textContainer}>
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            style={{
              width: index === lines - 1 ? '80%' : '100%',
            }}
          >
            {renderSkeleton()}
          </div>
        ))}
      </div>
    );
  }

  return renderSkeleton();
};

interface SkeletonCardProps {
  showAvatar?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  descriptionLines?: number;
  showActions?: boolean;
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  showAvatar = true,
  showTitle = true,
  showDescription = true,
  descriptionLines = 3,
  showActions = false,
  className,
}) => {
  return (
    <div className={clsx(styles.card, className)}>
      {showAvatar && (
        <div className={styles.cardHeader}>
          <SkeletonLoader variant="circular" width={40} height={40} />
          {showTitle && (
            <div className={styles.cardTitleGroup}>
              <SkeletonLoader width="60%" height="1.25rem" />
              <SkeletonLoader width="40%" height="0.875rem" />
            </div>
          )}
        </div>
      )}
      
      {!showAvatar && showTitle && (
        <div className={styles.cardTitle}>
          <SkeletonLoader width="70%" height="1.5rem" />
        </div>
      )}

      {showDescription && (
        <div className={styles.cardContent}>
          <SkeletonLoader variant="text" lines={descriptionLines} />
        </div>
      )}

      {showActions && (
        <div className={styles.cardActions}>
          <SkeletonLoader variant="rounded" width={80} height={32} />
          <SkeletonLoader variant="rounded" width={80} height={32} />
        </div>
      )}
    </div>
  );
};

interface SkeletonListProps {
  items?: number;
  showAvatar?: boolean;
  className?: string;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  items = 5,
  showAvatar = false,
  className,
}) => {
  return (
    <div className={clsx(styles.list, className)}>
      {Array.from({ length: items }, (_, index) => (
        <div key={index} className={styles.listItem}>
          {showAvatar && (
            <SkeletonLoader variant="circular" width={32} height={32} />
          )}
          <div className={styles.listContent}>
            <SkeletonLoader width="70%" height="1rem" />
            <SkeletonLoader width="40%" height="0.875rem" />
          </div>
        </div>
      ))}
    </div>
  );
};

interface SkeletonHabitCardProps {
  className?: string;
}

export const SkeletonHabitCard: React.FC<SkeletonHabitCardProps> = ({ className }) => {
  return (
    <div className={clsx(styles.habitCard, className)}>
      <div className={styles.habitCardHeader}>
        <SkeletonLoader variant="circular" width={24} height={24} />
        <SkeletonLoader width="60%" height="1.25rem" />
      </div>
      
      <div className={styles.habitCardContent}>
        <SkeletonLoader width="100%" height="0.875rem" />
        <SkeletonLoader width="80%" height="0.875rem" />
      </div>
      
      <div className={styles.habitCardFooter}>
        <SkeletonLoader variant="rounded" width={60} height={24} />
        <SkeletonLoader variant="rectangular" width={40} height={40} />
      </div>
    </div>
  );
};