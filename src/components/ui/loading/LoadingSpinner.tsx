'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'brand' | 'white' | 'gray';
  text?: string;
  fullScreen?: boolean;
  className?: string;
  /**
   * Enable/disable fade-in animation
   * @default true
   */
  animated?: boolean;
  /**
   * Animation duration in seconds
   * @default 0.3
   */
  animationDuration?: number;
}

const sizeClasses = {
  sm: 'h-6 w-6 border-2',
  md: 'h-10 w-10 border-3',
  lg: 'h-12 w-12 border-4',
  xl: 'h-16 w-16 border-4',
};

const colorClasses = {
  brand: 'border-gray-200 border-t-brand-600 dark:border-gray-700 dark:border-t-brand-500',
  white: 'border-gray-300 border-t-white dark:border-gray-600 dark:border-t-white',
  gray: 'border-gray-200 border-t-gray-600 dark:border-gray-700 dark:border-t-gray-400',
};

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'brand',
  text,
  fullScreen = false,
  className = '',
  animated = true,
  animationDuration = 0.3,
}) => {
  const fadeInVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: animationDuration }
    },
  };

  const content = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin rounded-full`}
        role="status"
        aria-label="Loading"
        variants={animated ? fadeInVariants : undefined}
        initial={animated ? 'hidden' : undefined}
        animate={animated ? 'visible' : undefined}
      />
      {text && (
        <motion.p
          className={`mt-4 ${textSizeClasses[size]} text-gray-600 dark:text-gray-400`}
          variants={animated ? fadeInVariants : undefined}
          initial={animated ? 'hidden' : undefined}
          animate={animated ? 'visible' : undefined}
          transition={{ delay: 0.1 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <motion.div
        className="flex min-h-screen items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
        variants={animated ? fadeInVariants : undefined}
        initial={animated ? 'hidden' : undefined}
        animate={animated ? 'visible' : undefined}
      >
        {content}
      </motion.div>
    );
  }

  return content;
};

export default LoadingSpinner;
