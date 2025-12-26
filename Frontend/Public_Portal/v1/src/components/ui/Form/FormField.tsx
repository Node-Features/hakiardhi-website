/**
 * Reusable Form Field Component
 * Following COMPONENT_REUSABILITY_GUIDE.md
 */

import { ReactNode } from 'react';
import Icon from '../Icon';
import { SPACING, TYPOGRAPHY } from '@/constants/design-tokens';

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  children: ReactNode;
}

export default function FormField({ id, label, required, error, helpText, children }: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className={`block ${TYPOGRAPHY.body.default.size} font-semibold text-gray-700 ${SPACING.margin.element.xs}`}
      >
        {label} {required && <span className="text-hakiardhi-red">*</span>}
      </label>

      {children}

      {error && (
        <div className="mt-2 p-3 bg-red-50 border-l-4 border-red-500 rounded-r">
          <p className="text-sm text-red-700 flex items-start gap-2">
            <Icon name="exclamation-circle" size="sm" className="flex-shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </p>
        </div>
      )}

      {helpText && !error && <p className="mt-1 text-sm text-gray-500">{helpText}</p>}
    </div>
  );
}
