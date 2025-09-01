import React from 'react';
import { motion } from 'framer-motion';
import { useAnimation } from '@features/animations/hooks/useAnimation';

interface FadeInProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  className?: string;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  duration = 500,
  delay = 0,
  className,
}) => {
  const { shouldAnimate } = useAnimation();

  if (!shouldAnimate()) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: duration / 1000, delay: delay / 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
