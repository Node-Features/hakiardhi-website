import { SWRConfiguration } from 'swr';
import { authApi } from './interceptors';

/**
 * Exponential backoff function for retry delays
 * Formula: baseDelay * 2^(retryCount - 1) + jitter
 */
function exponentialBackoff(retryCount: number): number {
  const baseDelay = 1000; // 1 second
  const maxDelay = 30000; // 30 seconds maximum

  // Calculate exponential delay
  const exponentialDelay = baseDelay * Math.pow(2, retryCount - 1);

  // Add random jitter (0-1000ms) to prevent thundering herd
  const jitter = Math.random() * 1000;

  // Cap at maximum delay
  return Math.min(exponentialDelay + jitter, maxDelay);
}

/**
 * Global SWR configuration for LARRRI Admin Portal
 */
export const swrConfig: SWRConfiguration = {
  // Default fetcher using authenticated API client
  fetcher: (url: string) => authApi.get(url),

  // Don't revalidate on focus by default (can be overridden per-hook)
  revalidateOnFocus: false,

  // Revalidate when network reconnects
  revalidateOnReconnect: true,

  // Retry on error (but with exponential backoff)
  shouldRetryOnError: true,

  // Dedupe requests within 2 seconds
  dedupingInterval: 2000,

  // Retry failed requests up to 3 times
  errorRetryCount: 3,

  // Use exponential backoff for retry delays
  // Delays: ~1s, ~2s, ~4s (with jitter)
  onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
    // Never retry for 404s
    if (error?.status === 404) return;

    // Never retry for 403 (forbidden)
    if (error?.status === 403) return;

    // Stop after max retries
    if (retryCount >= 3) return;

    // Calculate delay with exponential backoff
    const delay = exponentialBackoff(retryCount);

    if (process.env.NODE_ENV === 'development') {
      console.log(`Retrying request (attempt ${retryCount + 1}/3) after ${Math.round(delay)}ms:`, key);
    }

    // Retry after delay
    setTimeout(() => revalidate({ retryCount }), delay);
  },

  // Cache data for 5 minutes
  focusThrottleInterval: 5000,

  // Global error handler
  onError: (error, key) => {
    // Only log non-404 errors
    if (error?.status !== 404 && process.env.NODE_ENV === 'development') {
      console.error('SWR Error:', {
        key,
        error: error?.message || error,
        status: error?.status,
      });
    }

    // Optional: Add toast notification here
    // toast.error('Failed to fetch data. Please try again.');
  },

  // Global success handler
  onSuccess: (data, key) => {
    // Optional: Add analytics or logging here
    if (process.env.NODE_ENV === 'development') {
      console.log('SWR Success:', { key });
    }
  },
};

/**
 * SWR configuration for real-time data (polls every 30 seconds)
 */
export const swrRealtimeConfig: SWRConfiguration = {
  ...swrConfig,
  refreshInterval: 30000, // 30 seconds
  revalidateOnFocus: true,
};

/**
 * SWR configuration for static data (rarely changes)
 */
export const swrStaticConfig: SWRConfiguration = {
  ...swrConfig,
  revalidateOnMount: false,
  revalidateOnReconnect: false,
  dedupingInterval: 60000, // 1 minute
};
