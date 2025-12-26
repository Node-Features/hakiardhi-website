/**
 * Animation Utilities
 *
 * Centralized animation classes and helper functions
 */

import { TIMING } from '@/constants/design-tokens';

export type AnimationType = 'fadeUp' | 'fadeIn' | 'slideIn' | 'scaleIn' | 'fadeLeft' | 'fadeRight';

export const animationClasses = {
  fadeUp: 'opacity-0 translate-y-10',
  fadeIn: 'opacity-0',
  slideIn: 'opacity-0 translate-x-10',
  scaleIn: 'opacity-0 scale-95',
  fadeLeft: 'opacity-0 -translate-x-10',
  fadeRight: 'opacity-0 translate-x-10',
} as const;

export const animatedClasses = {
  fadeUp: 'opacity-100 translate-y-0',
  fadeIn: 'opacity-100',
  slideIn: 'opacity-100 translate-x-0',
  scaleIn: 'opacity-100 scale-100',
  fadeLeft: 'opacity-100 translate-x-0',
  fadeRight: 'opacity-100 translate-x-0',
} as const;

/**
 * Generate transition classes with custom duration
 */
export function getTransitionClasses(duration: number = TIMING.animation.normal) {
  return `transition-all duration-${duration}`;
}

/**
 * Generate animation classes based on visibility state
 */
export function getAnimationClasses(
  isVisible: boolean,
  animation: AnimationType = 'fadeUp',
  duration: number = 1000
): string {
  const baseClass = isVisible ? animatedClasses[animation] : animationClasses[animation];
  return `${baseClass} transition-all duration-${duration}`;
}

/**
 * Calculate staggered animation delay
 */
export function getStaggerDelay(index: number, delayIncrement: number = 100, initialDelay: number = 0): string {
  return `${index * delayIncrement + initialDelay}ms`;
}

/**
 * Generate inline style for animation delay
 */
export function getAnimationDelayStyle(index: number, delayIncrement: number = 100, initialDelay: number = 0) {
  return { animationDelay: getStaggerDelay(index, delayIncrement, initialDelay) };
}

/**
 * Generate inline style for transition delay
 */
export function getTransitionDelayStyle(index: number, delayIncrement: number = 100, initialDelay: number = 0) {
  return { transitionDelay: getStaggerDelay(index, delayIncrement, initialDelay) };
}
