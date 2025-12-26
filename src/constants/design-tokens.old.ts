/**
 * Design Tokens for HakiArdhi
 *
 * Centralized constants for spacing, timing, and other design values
 * to ensure consistency across the application.
 */

export const SPACING = {
  section: {
    base: 'py-16',
    sm: 'sm:py-20',
    lg: 'lg:py-24',
    full: 'py-16 sm:py-20 lg:py-24',
  },
  container: {
    base: 'px-6',
    lg: 'lg:px-12',
    full: 'px-6 lg:px-12',
  },
  gap: {
    xs: 'gap-2',
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12',
  },
  margin: {
    section: {
      sm: 'mb-12',
      md: 'mb-16',
      lg: 'mb-20',
    },
  },
} as const;

export const TIMING = {
  carousel: {
    interval: 6000,
    transitionDelay: 700,
  },
  animation: {
    fast: 300,
    normal: 500,
    slow: 700,
  },
  fadeIn: {
    initial: 100,
  },
} as const;

export const THRESHOLDS = {
  intersection: {
    default: 0.2,
    low: 0.1,
    high: 0.5,
  },
} as const;

export const BREAKPOINTS = {
  '2xsm': '375px',
  xsm: '425px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  '3xl': '2000px',
} as const;

export const Z_INDEX = {
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
} as const;

export const COLORS = {
  brand: {
    primary: '#D62828',
    primaryDark: '#b71c1c',
    primaryLight: '#FBEAEA',
  },
  neutral: {
    black: '#000000',
    white: '#FFFFFF',
  },
} as const;
