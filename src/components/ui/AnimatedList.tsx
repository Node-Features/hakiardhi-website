/**
 * AnimatedList Component
 *
 * Provides staggered animations for list items
 * Standardizes animation delays across the application
 */

import { ReactNode, Children, cloneElement, isValidElement } from 'react';

export interface AnimatedListProps {
  children: ReactNode;
  animation?: 'fadeUp' | 'fadeIn' | 'slideIn' | 'scaleIn';
  staggerDelay?: number;
  className?: string;
}

const animationClasses = {
  fadeUp: 'opacity-0 translate-y-10 animate-fade-in',
  fadeIn: 'opacity-0 animate-fade-in',
  slideIn: 'opacity-0 translate-x-10 animate-slide-in',
  scaleIn: 'opacity-0 scale-95 animate-fade-in',
};

export default function AnimatedList({
  children,
  animation = 'fadeUp',
  staggerDelay = 100,
  className = '',
}: AnimatedListProps) {
  const animationClass = animationClasses[animation];

  return (
    <>
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child;

        return (
          <div
            className={`${animationClass} ${className}`}
            style={{
              animationDelay: `${index * staggerDelay}ms`,
              animationFillMode: 'forwards',
            }}
          >
            {child}
          </div>
        );
      })}
    </>
  );
}
