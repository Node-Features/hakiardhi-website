/**
 * Grid Component
 *
 * Responsive grid layout with consistent breakpoints
 * Standardizes grid patterns across the application
 * Supports layout presets from GRID_LAYOUTS design tokens
 */

import { ReactNode } from 'react';
import { SPACING, GRID_LAYOUTS } from '@/constants/design-tokens';

export interface GridProps {
  children: ReactNode;
  layout?: 'half' | 'thirds' | 'quarters' | 'cards' | 'features' | 'testimonials';
  cols?: {
    base?: 1 | 2 | 3 | 4 | 5 | 6;
    sm?: 1 | 2 | 3 | 4 | 5 | 6;
    md?: 1 | 2 | 3 | 4 | 5 | 6;
    lg?: 1 | 2 | 3 | 4 | 5 | 6;
    xl?: 1 | 2 | 3 | 4 | 5 | 6;
  };
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const colClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
};

const responsiveColClasses = {
  sm: {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
    5: 'sm:grid-cols-5',
    6: 'sm:grid-cols-6',
  },
  md: {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
    5: 'md:grid-cols-5',
    6: 'md:grid-cols-6',
  },
  lg: {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
    6: 'lg:grid-cols-6',
  },
  xl: {
    1: 'xl:grid-cols-1',
    2: 'xl:grid-cols-2',
    3: 'xl:grid-cols-3',
    4: 'xl:grid-cols-4',
    5: 'xl:grid-cols-5',
    6: 'xl:grid-cols-6',
  },
};

const gapClasses = {
  none: 'gap-0',
  xs: SPACING.gap.xs,
  sm: SPACING.gap.sm,
  md: SPACING.gap.md,
  lg: SPACING.gap.lg,
  xl: SPACING.gap.xl,
  '2xl': SPACING.gap['2xl'],
};

export default function Grid({
  children,
  layout,
  cols = { base: 1, md: 2, lg: 4 },
  gap = 'lg',
  className = '',
}: GridProps) {
  // If layout preset is provided, use it
  if (layout) {
    let layoutClass = '';
    let layoutGap = '';

    switch (layout) {
      case 'half':
        layoutClass = GRID_LAYOUTS.half.cols;
        layoutGap = GRID_LAYOUTS.half.gap;
        break;
      case 'thirds':
        layoutClass = GRID_LAYOUTS.thirds.cols;
        layoutGap = GRID_LAYOUTS.thirds.gap;
        break;
      case 'quarters':
        layoutClass = GRID_LAYOUTS.quarters.cols;
        layoutGap = GRID_LAYOUTS.quarters.gap;
        break;
      case 'cards':
        layoutClass = GRID_LAYOUTS.cards;
        layoutGap = '';
        break;
      case 'features':
        layoutClass = GRID_LAYOUTS.features;
        layoutGap = '';
        break;
      case 'testimonials':
        layoutClass = GRID_LAYOUTS.testimonials;
        layoutGap = '';
        break;
    }

    return <div className={`grid ${layoutClass} ${layoutGap} ${className}`}>{children}</div>;
  }

  // Otherwise use cols prop
  const baseCol = cols.base || 1;
  const colClassNames = [
    colClasses[baseCol],
    cols.sm && responsiveColClasses.sm[cols.sm],
    cols.md && responsiveColClasses.md[cols.md],
    cols.lg && responsiveColClasses.lg[cols.lg],
    cols.xl && responsiveColClasses.xl[cols.xl],
    gapClasses[gap],
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={`grid ${colClassNames} ${className}`}>{children}</div>;
}
