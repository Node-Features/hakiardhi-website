/**
 * HakiArdhi Design Tokens (Improved)
 *
 * Comprehensive design system based on 8px spacing scale
 * Following industry best practices for consistency and scalability
 */

// ========================================
// SPACING SYSTEM (8px Base)
// ========================================

export const SPACING = {
  // Component Internal Spacing
  component: {
    tight: 'space-y-2',      // 8px - tight lists
    default: 'space-y-4',    // 16px - standard spacing
    relaxed: 'space-y-6',    // 24px - breathing room
    loose: 'space-y-8',      // 32px - major sections
  },

  // Padding Scales
  padding: {
    xs: 'p-2',               // 8px
    sm: 'p-4',               // 16px
    md: 'p-6',               // 24px
    lg: 'p-8',               // 32px
    xl: 'p-12',              // 48px
    '2xl': 'p-16',           // 64px
    // Vertical padding
    y: {
      xs: 'py-2',            // 8px
      sm: 'py-4',            // 16px
      md: 'py-6',            // 24px
      lg: 'py-8',            // 32px
    },
    // Horizontal padding
    x: {
      xs: 'px-2',            // 8px
      sm: 'px-4',            // 16px
      md: 'px-6',            // 24px
      lg: 'px-8',            // 32px
      xl: 'px-12',           // 48px
    },
  },

  // Section Spacing (Vertical)
  section: {
    xs: 'py-12',             // 48px - small sections
    sm: 'py-16',             // 64px - mobile default
    md: 'py-20',             // 80px - tablet
    lg: 'py-24',             // 96px - desktop default
    xl: 'py-32',             // 128px - hero/major sections
    responsive: 'py-12 sm:py-16 lg:py-24 xl:py-32',
  },

  // Container Horizontal Padding
  container: {
    mobile: 'px-4',          // 16px - mobile
    tablet: 'px-6',          // 24px - tablet
    desktop: 'px-8',         // 32px - desktop
    wide: 'px-12',           // 48px - wide screens
    responsive: 'px-4 sm:px-6 lg:px-8 xl:px-12',
    responsiveCompact: 'px-4 sm:px-6 lg:px-8', // Without xl breakpoint
  },

  // Header Specific Spacing
  header: {
    padding: 'px-3 sm:px-4 lg:px-6 py-1',
    verticalPadding: 'py-1',
    horizontalPadding: 'px-3 sm:px-4 lg:px-6',
  },

  // Gaps (Flexbox/Grid)
  gap: {
    xs: 'gap-2',             // 8px
    sm: 'gap-4',             // 16px
    md: 'gap-6',             // 24px
    lg: 'gap-8',             // 32px
    xl: 'gap-12',            // 48px
    '2xl': 'gap-16',         // 64px
    // Responsive variants
    responsive: {
      sm: 'gap-4 md:gap-6',
      md: 'gap-4 md:gap-6 lg:gap-8',
      lg: 'gap-6 md:gap-8 lg:gap-12',
    },
  },

  // Margins
  margin: {
    // Element margins
    element: {
      xs: 'mb-2',            // 8px
      sm: 'mb-4',            // 16px
      md: 'mb-6',            // 24px
      lg: 'mb-8',            // 32px
      xl: 'mb-12',           // 48px
    },
    // Section margins
    section: {
      sm: 'mb-12',           // 48px
      md: 'mb-16',           // 64px
      lg: 'mb-20',           // 80px
      xl: 'mb-24',           // 96px
    },
    // Responsive variants
    responsive: {
      heading: 'mb-4 sm:mb-6 lg:mb-8',
      section: 'mb-12 lg:mb-16',
    },
  },
} as const;

// ========================================
// GRID LAYOUTS
// ========================================

export const GRID_LAYOUTS = {
  // 2-column layouts
  half: {
    cols: 'grid-cols-1 lg:grid-cols-2',
    gap: 'gap-6 lg:gap-8',
  },

  // 3-column layouts
  thirds: {
    cols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    gap: 'gap-6 lg:gap-8',
  },

  // 4-column layouts (cards, features)
  quarters: {
    cols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    gap: 'gap-4 md:gap-6 lg:gap-8',
  },

  // Auto-fit responsive
  autoFit: {
    cols: 'grid-cols-[repeat(auto-fit,minmax(280px,1fr))]',
    gap: 'gap-6',
  },

  // Common patterns
  features: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8',
  cards: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8',
  testimonials: 'grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12',
} as const;

// ========================================
// TYPOGRAPHY SCALE
// ========================================

export const TYPOGRAPHY = {
  // Display (Hero sections) - Optimized for small-screen laptops (1024-1366px)
  display: {
    lg: {
      size: 'text-2xl sm:text-3xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl',
      lineHeight: 'leading-[1.1]',
      spacing: 'mb-4 sm:mb-6 md:mb-6 lg:mb-8',
      weight: 'font-black',
    },
    md: {
      size: 'text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl',
      lineHeight: 'leading-tight',
      spacing: 'mb-4 md:mb-6',
      weight: 'font-bold',
    },
    sm: {
      size: 'text-lg sm:text-xl md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl',
      lineHeight: 'leading-tight',
      spacing: 'mb-3 md:mb-4 lg:mb-6',
      weight: 'font-bold',
    },
  },

  // Headings - Optimized for small-screen laptops (1024-1366px)
  heading: {
    h1: {
      size: 'text-2xl sm:text-3xl md:text-3xl lg:text-4xl xl:text-5xl',
      lineHeight: 'leading-tight',
      spacing: 'mb-4 md:mb-6',
      weight: 'font-bold',
    },
    h2: {
      size: 'text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-4xl',
      lineHeight: 'leading-tight',
      spacing: 'mb-4 md:mb-4 lg:mb-6',
      weight: 'font-bold',
    },
    h3: {
      size: 'text-lg sm:text-xl md:text-xl lg:text-2xl xl:text-3xl',
      lineHeight: 'leading-snug',
      spacing: 'mb-3 md:mb-4',
      weight: 'font-semibold',
    },
    h4: {
      size: 'text-base sm:text-lg md:text-lg lg:text-xl xl:text-2xl',
      lineHeight: 'leading-snug',
      spacing: 'mb-3',
      weight: 'font-semibold',
    },
  },

  // Body text - Optimized for small-screen laptops (1024-1366px)
  body: {
    lg: {
      size: 'text-base sm:text-lg md:text-lg lg:text-lg xl:text-xl',
      lineHeight: 'leading-relaxed',
      spacing: 'mb-4 md:mb-6',
    },
    default: {
      size: 'text-sm sm:text-base md:text-base lg:text-base xl:text-lg',
      lineHeight: 'leading-relaxed',
      spacing: 'mb-3 md:mb-4',
    },
    sm: {
      size: 'text-xs sm:text-sm md:text-sm lg:text-sm xl:text-base',
      lineHeight: 'leading-normal',
      spacing: 'mb-2 md:mb-3',
    },
  },
} as const;

// ========================================
// CONTENT WIDTHS
// ========================================

export const CONTENT_WIDTHS = {
  // Text content
  text: {
    narrow: 'max-w-prose',      // ~65ch (optimal reading)
    body: 'max-w-2xl',           // 672px
    wide: 'max-w-4xl',           // 896px
    full: 'max-w-7xl',           // 1280px
  },

  // Container widths
  container: {
    sm: 'max-w-screen-sm',       // 640px
    md: 'max-w-screen-md',       // 768px
    lg: 'max-w-screen-lg',       // 1024px
    xl: 'max-w-screen-xl',       // 1280px
    '2xl': 'max-w-screen-2xl',   // 1536px
  },
} as const;

// ========================================
// TIMING & ANIMATIONS
// ========================================

export const TIMING = {
  // Transitions
  transition: {
    fast: '150ms',
    default: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  // Animations
  animation: {
    fast: 300,
    normal: 500,
    slow: 700,
    verySlow: 1000,
  },

  // Carousel
  carousel: {
    interval: 6000,
    transitionDelay: 700,
  },

  // Fade-in
  fadeIn: {
    initial: 100,
    stagger: 150,
  },
} as const;

// ========================================
// BREAKPOINTS
// ========================================

export const BREAKPOINTS = {
  '2xsm': '375px',
  xsm: '425px',
  sm: '640px',      // Tablet
  md: '768px',      // Small desktop
  lg: '1024px',     // Desktop
  xl: '1280px',     // Large desktop
  '2xl': '1536px',  // Extra large
  '3xl': '2000px',  // Ultra wide
} as const;

// ========================================
// Z-INDEX LAYERS
// ========================================

export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
} as const;

// ========================================
// INTERSECTION OBSERVER
// ========================================

export const THRESHOLDS = {
  intersection: {
    default: 0.2,
    low: 0.1,
    high: 0.5,
    full: 1.0,
  },
} as const;

// ========================================
// COLORS (Reference)
// ========================================

export const COLORS = {
  brand: {
    primary: '#D62828',
    primaryDark: '#b71c1c',
    primaryLight: '#FBEAEA',
  },
  neutral: {
    black: '#000000',
    white: '#FFFFFF',
    zinc: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b',
    },
  },
} as const;

// ========================================
// BORDER RADIUS (8px scale)
// ========================================

export const RADIUS = {
  none: '0',
  sm: '0.25rem',      // 4px - buttons, inputs
  default: '0.5rem',  // 8px - cards
  md: '0.75rem',      // 12px - larger cards
  lg: '1rem',         // 16px - sections
  xl: '1.5rem',       // 24px - major elements
  '2xl': '2rem',      // 32px - hero elements
  full: '9999px',     // pills, avatars
} as const;

// ========================================
// SHADOWS (8px increments)
// ========================================

export const SHADOWS = {
  xs: '0 1px 2px rgba(0,0,0,0.05)',
  sm: '0 2px 4px rgba(0,0,0,0.06)',
  default: '0 4px 8px rgba(0,0,0,0.08)',
  md: '0 6px 12px rgba(0,0,0,0.10)',
  lg: '0 12px 24px rgba(0,0,0,0.12)',
  xl: '0 20px 40px rgba(0,0,0,0.15)',
  '2xl': '0 32px 64px rgba(0,0,0,0.20)',
  brand: '0 8px 16px rgba(214,40,40,0.20)',
} as const;

// ========================================
// RESPONSIVE UTILITIES
// ========================================

export const RESPONSIVE = {
  // Common responsive patterns
  section: 'py-12 sm:py-16 lg:py-24 xl:py-32',
  container: 'px-4 sm:px-6 lg:px-8 xl:px-12',
  gap: 'gap-4 md:gap-6 lg:gap-8',
  heading: 'mb-4 sm:mb-6 lg:mb-8',

  // Hide/Show
  hide: {
    mobile: 'hidden sm:block',
    tablet: 'hidden md:block',
    desktop: 'hidden lg:block',
  },
  show: {
    mobileOnly: 'block sm:hidden',
    tabletOnly: 'hidden sm:block lg:hidden',
    desktopOnly: 'hidden lg:block',
  },
} as const;

// ========================================
// EXPORT ALL
// ========================================

export const DESIGN_TOKENS = {
  spacing: SPACING,
  grid: GRID_LAYOUTS,
  typography: TYPOGRAPHY,
  content: CONTENT_WIDTHS,
  timing: TIMING,
  breakpoints: BREAKPOINTS,
  zIndex: Z_INDEX,
  thresholds: THRESHOLDS,
  colors: COLORS,
  radius: RADIUS,
  shadows: SHADOWS,
  responsive: RESPONSIVE,
} as const;

// Type exports for TypeScript
export type SpacingKey = keyof typeof SPACING;
export type GridLayoutKey = keyof typeof GRID_LAYOUTS;
export type TypographyKey = keyof typeof TYPOGRAPHY;
export type BreakpointKey = keyof typeof BREAKPOINTS;
