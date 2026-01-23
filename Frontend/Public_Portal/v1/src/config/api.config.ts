/**
 * API Configuration
 * Single source of truth for API base URL
 */

/**
 * Get the API base URL from environment variable
 * Throws error if not configured in production
 */
export function getApiBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    // In development, warn but allow fallback
    if (process.env.NODE_ENV === 'development') {
      console.warn('NEXT_PUBLIC_API_URL not set, using default');
      return 'http://localhost:3001';
    }
    // In production, use the deployed API
    return 'https://hakiardhi-api.vercel.app';
  }

  return apiUrl;
}

/**
 * API Base URL - use this constant in all API routes
 */
export const API_BASE_URL = getApiBaseUrl();
