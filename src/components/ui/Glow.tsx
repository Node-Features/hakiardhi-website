/**
 * Glow Component
 *
 * Wrapper component that adds a glow effect behind elements
 * Replaces duplicated glow effect patterns
 */

import { ReactNode } from 'react';

export interface GlowProps {
  children: ReactNode;
  color?: 'brand' | 'blue' | 'orange' | 'success' | 'purple';
  intensity?: 'low' | 'medium' | 'high';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colorClasses = {
  brand: 'bg-brand-500/20',
  blue: 'bg-blue-light-500/20',
  orange: 'bg-orange-500/20',
  success: 'bg-success-500/20',
  purple: 'bg-purple-500/20',
};

const intensityClasses = {
  low: 'blur-lg',
  medium: 'blur-xl',
  high: 'blur-2xl',
};

const sizeClasses = {
  sm: 'scale-125',
  md: 'scale-150',
  lg: 'scale-[2]',
};

export default function Glow({
  children,
  color = 'brand',
  intensity = 'medium',
  size = 'md',
  className = '',
}: GlowProps) {
  return (
    <div className={`inline-block relative ${className}`}>
      {/* Glow effect behind */}
      <div
        className={`
          absolute inset-0 rounded-full
          ${colorClasses[color]}
          ${intensityClasses[intensity]}
          ${sizeClasses[size]}
        `.trim().replace(/\s+/g, ' ')}
      ></div>

      {/* Content */}
      <div className="relative">{children}</div>
    </div>
  );
}
