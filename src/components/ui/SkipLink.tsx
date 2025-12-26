/**
 * Skip Link Component
 *
 * Accessibility feature that allows keyboard users to skip navigation
 * and jump directly to main content. The link is visually hidden until
 * focused via keyboard navigation (Tab key).
 */

'use client';

export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[99999] focus:px-6 focus:py-3 focus:bg-hakiardhi-red focus:text-white focus:rounded-lg focus:font-semibold focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-hakiardhi-red transition-all"
    >
      Skip to main content
    </a>
  );
}
