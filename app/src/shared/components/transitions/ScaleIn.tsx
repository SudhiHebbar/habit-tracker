import React from 'react';
import { motion } from 'framer-motion';
import { useAnimation } from '@features/animations/hooks/useAnimation';

interface ScaleInProps {
  children: React.ReactNode;
  initialScale?: number;
  duration?: number;
  delay?: number;
  className?: string;
}

export const ScaleIn: React.FC<ScaleInProps> = ({
  children,
  initialScale = 0.8,
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
      initial={{ scale: initialScale, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        duration: duration / 1000, 
        delay: delay / 1000,
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};