/**
 * Reusable Textarea Component
 * Following COMPONENT_REUSABILITY_GUIDE.md
 */

import { TextareaHTMLAttributes } from 'react';
import { SPACING } from '@/constants/design-tokens';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export default function Textarea({ hasError, className = '', ...props }: TextareaProps) {
  return (
    <textarea
      className={`w-full min-h-[120px] ${SPACING.padding.sm} bg-white border ${
        hasError ? 'border-red-500' : 'border-gray-300'
      } rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-hakiardhi-red focus:ring-2 focus:ring-hakiardhi-red/20 transition-all resize-vertical ${className}`}
      {...props}
    />
  );
}
