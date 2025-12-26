import { ReactNode } from 'react';
import { SPACING } from '@/constants/design-tokens';

export interface SectionRootProps {
  children: ReactNode;
  variant?: 'white' | 'light' | 'dark' | 'gradient-dark' | 'gradient-brand' | 'zinc-light' | 'zinc-medium' | 'image-overlay' | 'none';
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'responsive';
  className?: string;
  id?: string;
  showDecorations?: boolean;
}

export default function SectionRoot({
  children,
  variant = 'white',
  spacing = 'responsive',
  className = '',
  id,
  showDecorations = false,
}: SectionRootProps) {
  const variantClasses = {
    white: 'bg-white',
    light: 'bg-gray-50',
    dark: 'bg-gray-900 text-white',
    'gradient-dark': '',
    'gradient-brand': '',
    'zinc-light': 'bg-zinc-50',
    'zinc-medium': 'bg-zinc-100',
    'image-overlay': 'bg-zinc-900 text-white',
    none: '',
  };

  const spacingClasses = {
    xs: SPACING.section.xs,
    sm: SPACING.section.sm,
    md: SPACING.section.md,
    lg: SPACING.section.lg,
    xl: SPACING.section.xl,
    responsive: SPACING.section.responsive,
  };

  const variantStyles =
    variant === 'gradient-dark'
      ? { background: 'linear-gradient(to bottom, #000000 0%, #1a1a1a 50%, #000000 100%)' }
      : variant === 'gradient-brand'
      ? { background: 'linear-gradient(to bottom, #0d0d0d 0%, #1a1a1a 25%, #2d0a0a 50%, #1a1a1a 75%, #0d0d0d 100%)' }
      : undefined;

  return (
    <section
      id={id}
      className={`relative overflow-hidden ${spacingClasses[spacing]} ${variantClasses[variant]} ${className}`}
      style={variantStyles}
    >
      {children}
    </section>
  );
}
