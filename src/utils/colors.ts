/**
 * Color Utilities
 *
 * Centralized color mapping and theming utilities
 */

export type ThemeColor = 'brand' | 'blue' | 'orange' | 'success' | 'error' | 'purple';

export const colorClasses = {
  background: {
    brand: 'bg-brand-50',
    blue: 'bg-blue-light-50',
    orange: 'bg-orange-50',
    success: 'bg-success-50',
    error: 'bg-error-50',
    purple: 'bg-purple-50',
  },
  text: {
    brand: 'text-brand-600',
    blue: 'text-blue-light-600',
    orange: 'text-orange-600',
    success: 'text-success-600',
    error: 'text-error-600',
    purple: 'text-purple-600',
  },
  border: {
    brand: 'border-brand-200',
    blue: 'border-blue-light-200',
    orange: 'border-orange-200',
    success: 'border-success-200',
    error: 'border-error-200',
    purple: 'border-purple-200',
  },
  hover: {
    background: {
      brand: 'hover:bg-brand-100',
      blue: 'hover:bg-blue-light-100',
      orange: 'hover:bg-orange-100',
      success: 'hover:bg-success-100',
      error: 'hover:bg-error-100',
      purple: 'hover:bg-purple-100',
    },
    text: {
      brand: 'hover:text-brand-700',
      blue: 'hover:text-blue-light-700',
      orange: 'hover:text-orange-700',
      success: 'hover:text-success-700',
      error: 'hover:text-error-700',
      purple: 'hover:text-purple-700',
    },
    border: {
      brand: 'hover:border-brand-300',
      blue: 'hover:border-blue-light-300',
      orange: 'hover:border-orange-300',
      success: 'hover:border-success-300',
      error: 'hover:border-error-300',
      purple: 'hover:border-purple-300',
    },
  },
} as const;

/**
 * Get combined color classes for a theme color
 */
export function getColorClasses(color: ThemeColor) {
  return `${colorClasses.background[color]} ${colorClasses.text[color]}`;
}

/**
 * Get border color class for a theme color
 */
export function getBorderColor(color: ThemeColor) {
  return colorClasses.border[color];
}

/**
 * Get hover border color class for a theme color
 */
export function getHoverBorderColor(color: ThemeColor) {
  return colorClasses.hover.border[color];
}
