/**
 * Site Configuration
 * Central configuration for site-wide settings
 */

export const siteConfig = {
  /**
   * Pages temporarily disabled - shows "Coming Soon" popup when clicked
   * Add or remove paths to enable/disable pages
   *
   * Example paths: '/portfolio', '/work-with-us', '/lrm-network', '/gallery'
   */
  disabledPages: [
    '/portfolio',
    '/work-with-us',
    '/lrm-network',
    '/gallery',
  ],

  /**
   * Global maintenance mode
   * When true, shows maintenance message on all pages
   */
  maintenanceMode: false,

  /**
   * Maintenance message shown when maintenanceMode is true
   */
  maintenanceMessage: 'We are currently performing scheduled maintenance. Please check back soon.',

  /**
   * Feature flags for enabling/disabling specific features
   */
  features: {
    newsletter: true,
    donations: true,
    legalAid: true,
    contactForm: true,
  },
};

/**
 * Check if a page is disabled
 */
export function isPageDisabled(path: string): boolean {
  return siteConfig.disabledPages.includes(path);
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof siteConfig.features): boolean {
  return siteConfig.features[feature];
}
