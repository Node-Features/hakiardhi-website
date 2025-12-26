/**
 * Reusable Alert Component
 * Following COMPONENT_REUSABILITY_GUIDE.md
 */

import { ReactNode } from 'react';
import Icon from './Icon';
import { SPACING } from '@/constants/design-tokens';

interface AlertProps {
  variant: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  icon?: boolean;
}

const variantConfig = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-500',
    titleColor: 'text-green-900',
    messageColor: 'text-green-700',
    iconColor: 'text-green-600',
    iconName: 'check-circle' as const,
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-500',
    titleColor: 'text-red-900',
    messageColor: 'text-red-700',
    iconColor: 'text-red-600',
    iconName: 'x-circle' as const,
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-500',
    titleColor: 'text-yellow-900',
    messageColor: 'text-yellow-700',
    iconColor: 'text-yellow-600',
    iconName: 'exclamation-triangle' as const,
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-500',
    titleColor: 'text-blue-900',
    messageColor: 'text-blue-700',
    iconColor: 'text-blue-600',
    iconName: 'information-circle' as const,
  },
};

export default function Alert({ variant, title, message, icon = true }: AlertProps) {
  const config = variantConfig[variant];

  return (
    <div className={`${SPACING.padding.md} ${config.bg} border-l-4 ${config.border} rounded-lg`}>
      <div className="flex items-start gap-3">
        {icon && (
          <Icon name={config.iconName} size="md" className={`${config.iconColor} flex-shrink-0 mt-0.5`} />
        )}
        <div>
          <h4 className={`font-semibold ${config.titleColor} mb-1`}>{title}</h4>
          <p className={`text-sm ${config.messageColor}`}>{message}</p>
        </div>
      </div>
    </div>
  );
}
