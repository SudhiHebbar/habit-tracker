import React from 'react';
import { motion } from 'framer-motion';
import { useAnimation } from '@features/animations/hooks/useAnimation';

interface SlideInProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  duration?: number;
  delay?: number;
  className?: string;
}

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  direction = 'up',
  distance = 50,
  duration = 500,
  delay = 0,
  className,
}) => {
  const { shouldAnimate } = useAnimation();

  if (!shouldAnimate()) {
    return <div className={className}>{children}</div>;
  }

  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { y: distance };
      case 'down':
        return { y: -distance };
      case 'left':
        return { x: distance };
      case 'right':
        return { x: -distance };
      default:
        return {};
    }
  };

  return (
    <motion.div
      initial={{ ...getInitialPosition(), opacity: 0 }}
      animate={{ x: 0, y: 0, opacity: 1 }}
      transition={{
        duration: duration / 1000,
        delay: delay / 1000,
        ease: [0.43, 0.13, 0.23, 0.96],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
