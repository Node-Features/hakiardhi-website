import { APIError } from './client';
import { captureError } from '../monitoring/sentry';

/**
 * Global error handler for API errors
 */
export function handleAPIError(error: unknown, context?: string): string {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', {
      error,
      context,
      isAPIError: error instanceof APIError,
    });
  }

  if (error instanceof APIError) {
    const errorMessage = getErrorMessage(error);

    // Log detailed error info in development
    if (process.env.NODE_ENV === 'development') {
      console.error('APIError details:', {
        status: error.status,
        message: error.message,
        data: error.data,
        correlationId: error.correlationId,
        context,
      });
    }

    // Send to error tracking service (Sentry)
    // Only track server errors and critical errors, not client errors
    if (error.status >= 500 || error.status === 0 || error.status === 408) {
      captureError(error, {
        context,
        status: error.status,
        correlationId: error.correlationId,
        errorData: error.data,
      });
    }

    return errorMessage;
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    console.error('Standard Error:', error.message, error);
    return error.message || 'An unexpected error occurred';
  }

  // Handle string errors
  if (typeof error === 'string') {
    console.error('String error:', error);
    return error;
  }

  // Unknown error type
  const message = 'An unexpected error occurred';
  console.error('Unknown error type:', error);
  return message;
}

/**
 * Map API error codes to user-friendly messages
 */
function getErrorMessage(error: APIError): string {
  const errorMap: Record<number, string> = {
    400: 'Invalid request. Please check your input.',
    401: 'You are not authenticated. Please sign in.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    409: 'This resource already exists.',
    422: 'Validation failed. Please check your input.',
    429: 'Too many requests. Please try again later.',
    500: 'Server error. Please try again later.',
    503: 'Service temporarily unavailable. Please try again later.',
  };

  // Type guard for error data
  const errorData = error.data as { message?: string } | undefined;
  return errorData?.message || errorMap[error.status] || error.message;
}

/**
 * Extract field-specific validation errors
 */
export function getValidationErrors(error: APIError): Record<string, string> | null {
  // Type guard for validation error data
  const errorData = error.data as { details?: Record<string, string[]> } | undefined;

  if (error.status === 422 && errorData?.details) {
    // Convert array of errors to single string per field
    const fieldErrors: Record<string, string> = {};

    for (const [field, messages] of Object.entries(errorData.details)) {
      fieldErrors[field] = messages.join(', ');
    }

    return fieldErrors;
  }

  return null;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  return error instanceof APIError && error.status === 0;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  return error instanceof APIError && (error.status === 401 || error.status === 403);
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  return error instanceof APIError && error.status === 422;
}
