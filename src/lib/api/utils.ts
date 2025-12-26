/**
 * API Utility Functions
 *
 * Centralized utility functions for API operations including
 * query string building, request correlation, and common transformations.
 */

/**
 * Builds a URL-encoded query string from an object of parameters
 * Filters out undefined, null, and empty string values
 *
 * @param params - Object containing query parameters
 * @returns URL-encoded query string with leading '?' or empty string
 *
 * @example
 * buildQueryString({ page: 1, limit: 10, search: 'test' })
 * // Returns: '?page=1&limit=10&search=test'
 *
 * buildQueryString({ page: 1, search: '' })
 * // Returns: '?page=1'
 *
 * buildQueryString({})
 * // Returns: ''
 */
export function buildQueryString(params?: Record<string, unknown>): string {
  if (!params) return '';

  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    // Only include defined, non-null, and non-empty values
    if (value !== undefined && value !== null && value !== '') {
      // Convert arrays to comma-separated strings
      if (Array.isArray(value)) {
        queryParams.append(key, value.join(','));
      } else {
        queryParams.append(key, String(value));
      }
    }
  });

  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Generates a unique correlation ID for request tracing
 * Format: timestamp-randomhex (e.g., 1234567890-a1b2c3d4)
 *
 * @returns A unique correlation ID string
 */
export function generateCorrelationId(): string {
  const timestamp = Date.now();
  const randomHex = Math.random().toString(16).substring(2, 10);
  return `${timestamp}-${randomHex}`;
}

/**
 * Extracts file extension from a filename
 *
 * @param filename - The filename to extract extension from
 * @returns The file extension (lowercase) or empty string
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
}

/**
 * Formats file size from bytes to human-readable format
 *
 * @param bytes - File size in bytes
 * @returns Formatted file size string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Validates if a string is a valid UUID
 *
 * @param uuid - String to validate
 * @returns True if valid UUID, false otherwise
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Safely parses JSON with fallback value
 *
 * @param jsonString - JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed object or fallback value
 */
export function safeJSONParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return fallback;
  }
}

/**
 * Debounces a function call
 *
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Retries an async function with exponential backoff
 *
 * @param fn - Async function to retry
 * @param maxRetries - Maximum number of retries
 * @param baseDelay - Base delay in milliseconds (doubles each retry)
 * @returns Promise resolving to function result
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Calculate exponential backoff delay
      const delay = baseDelay * Math.pow(2, attempt);

      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 1000;

      await new Promise(resolve => setTimeout(resolve, delay + jitter));
    }
  }

  throw lastError!;
}
