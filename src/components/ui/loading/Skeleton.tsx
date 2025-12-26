'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  /**
   * Width of the skeleton
   * @default 'full'
   */
  width?: string | 'full' | 'half' | '3/4' | '1/4';
  /**
   * Height of the skeleton
   * @default 'h-4'
   */
  height?: string;
  /**
   * Border radius variant
   * @default 'md'
   */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Enable shimmer animation
   * @default true
   */
  animated?: boolean;
}

const widthClasses = {
  full: 'w-full',
  half: 'w-1/2',
  '3/4': 'w-3/4',
  '1/4': 'w-1/4',
};

const roundedClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

export const Skeleton: React.FC<SkeletonProps> = ({
  width = 'full',
  height = 'h-4',
  rounded = 'md',
  className = '',
  animated = true,
}) => {
  const widthClass = typeof width === 'string' && width in widthClasses
    ? widthClasses[width as keyof typeof widthClasses]
    : width;

  const pulseAnimation = {
    initial: { opacity: 0.6 },
    animate: {
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: [0.42, 0, 0.58, 1] as const, // easeInOut cubic-bezier
      },
    },
  };

  if (animated) {
    return (
      <motion.div
        className={`bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 ${widthClass} ${height} ${roundedClasses[rounded]} ${className}`}
        {...pulseAnimation}
      />
    );
  }

  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${widthClass} ${height} ${roundedClasses[rounded]} ${className}`}
    />
  );
};

/**
 * Skeleton for table rows
 */
export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} width="full" height="h-8" />
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton for cards
 */
export const SkeletonCard: React.FC<{
  /**
   * Show avatar/image placeholder
   */
  showImage?: boolean;
  /**
   * Number of text lines
   */
  lines?: number;
}> = ({ showImage = false, lines = 3 }) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
      {showImage && (
        <Skeleton width="full" height="h-48" rounded="lg" className="mb-4" />
      )}
      <Skeleton width="3/4" height="h-6" className="mb-3" />
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? 'half' : 'full'}
          height="h-4"
          className="mb-2"
        />
      ))}
    </div>
  );
};

/**
 * Skeleton for stats cards
 */
export const SkeletonStatsCard: React.FC = () => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <Skeleton width="half" height="h-4" className="mb-3" />
      <Skeleton width="3/4" height="h-8" />
    </div>
  );
};

/**
 * Grid of skeleton cards
 */
export const SkeletonGrid: React.FC<{
  count?: number;
  columns?: 2 | 3 | 4;
}> = ({ count = 4, columns = 4 }) => {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid gap-4 ${gridCols[columns]}`}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonStatsCard key={index} />
      ))}
    </div>
  );
};

export default Skeleton;
