/**
 * Badge Component
 *
 * Reusable badge/pill component for labels, tags, and status indicators
 */

import { ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const variantClasses = {
  primary: 'bg-brand-500 text-white',
  secondary: 'bg-gray-500 text-white',
  success: 'bg-success-500 text-white',
  warning: 'bg-warning-500 text-white',
  error: 'bg-error-500 text-white',
  info: 'bg-blue-light-500 text-white',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-xs',
  lg: 'px-4 py-1.5 text-sm',
};

export default function Badge({ children, variant = 'primary', size = 'md', className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-block font-bold rounded-full
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {children}
    </span>
  );
}
