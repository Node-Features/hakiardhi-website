'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export interface BreadcrumbItem {
  /**
   * Display label for the breadcrumb item
   */
  label: string;
  /**
   * URL to navigate to (optional for last item)
   */
  href?: string;
  /**
   * Icon to display before the label (optional)
   */
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  /**
   * Array of breadcrumb items
   */
  items: BreadcrumbItem[];
  /**
   * Custom separator between breadcrumb items
   * @default '/'
   */
  separator?: React.ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = (
    <svg
      className="h-4 w-4 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  ),
  className = '',
}) => {
  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (index: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: index * 0.05,
        duration: 0.2,
      },
    }),
  };

  return (
    <nav
      className={`flex items-center space-x-2 text-sm ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <motion.li
              key={`${item.label}-${index}`}
              className="flex items-center"
              custom={index}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              {index > 0 && (
                <span className="mx-2 flex items-center">{separator}</span>
              )}

              {!isLast && item.href ? (
                <Link
                  href={item.href}
                  className="flex items-center gap-1.5 rounded-md px-2 py-1 font-medium text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-brand-400"
                >
                  {item.icon && (
                    <span className="flex items-center">{item.icon}</span>
                  )}
                  {item.label}
                </Link>
              ) : (
                <span
                  className="flex items-center gap-1.5 px-2 py-1 font-semibold text-gray-900 dark:text-white"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.icon && (
                    <span className="flex items-center">{item.icon}</span>
                  )}
                  {item.label}
                </span>
              )}
            </motion.li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
