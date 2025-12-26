/**
 * Reusable Select Component
 * Following COMPONENT_REUSABILITY_GUIDE.md
 */

import { SelectHTMLAttributes } from 'react';
import { SPACING } from '@/constants/design-tokens';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
  options: Array<{ value: string; label: string }>;
}

export default function Select({ hasError, options, className = '', ...props }: SelectProps) {
  return (
    <select
      className={`w-full min-h-[44px] ${SPACING.padding.sm} bg-white border ${
        hasError ? 'border-red-500' : 'border-gray-300'
      } rounded-lg text-gray-900 focus:outline-none focus:border-hakiardhi-red focus:ring-2 focus:ring-hakiardhi-red/20 transition-all cursor-pointer ${className}`}
      {...props}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
