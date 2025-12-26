/**
 * Reusable Input Component
 * Following COMPONENT_REUSABILITY_GUIDE.md
 */

import { InputHTMLAttributes } from 'react';
import { SPACING } from '@/constants/design-tokens';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export default function Input({ hasError, className = '', ...props }: InputProps) {
  return (
    <input
      className={`w-full min-h-[44px] ${SPACING.padding.sm} bg-white border ${
        hasError ? 'border-red-500' : 'border-gray-300'
      } rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-hakiardhi-red focus:ring-2 focus:ring-hakiardhi-red/20 transition-all ${className}`}
      {...props}
    />
  );
}
