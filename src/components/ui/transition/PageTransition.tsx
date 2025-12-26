'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  /**
   * Custom animation duration in seconds
   * @default 0.3
   */
  duration?: number;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * PageTransition Component
 *
 * Wraps page content to provide smooth fade-in animations on page load.
 * Automatically applies elegant entrance animations for better UX.
 *
 * @example
 * ```tsx
 * export default function MyPage() {
 *   return (
 *     <PageTransition>
 *       <div>Your page content</div>
 *     </PageTransition>
 *   );
 * }
 * ```
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  duration = 0.3,
  className = '',
}) => {
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        ease: [0, 0, 0.2, 1] as const, // easeOut cubic-bezier
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: duration * 0.7,
        ease: [0.4, 0, 1, 1] as const, // easeIn cubic-bezier
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
