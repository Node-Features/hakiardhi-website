/**
 * Centralized Error Messages
 * User-friendly error messages for the application
 */

export const ERROR_MESSAGES = {
  // Network Errors
  NETWORK_ERROR: "Sorry, we're having trouble connecting. Please check your internet connection and try again.",
  SERVER_UNAVAILABLE: "Sorry, we're experiencing technical difficulties. Please try again in a few moments.",
  REQUEST_TIMEOUT: "The request took too long. Please try again.",

  // Authentication Errors
  UNAUTHORIZED: "Your session has expired. Please log in again.",
  FORBIDDEN: "You don't have permission to perform this action.",
  INVALID_CREDENTIALS: "Invalid email or password. Please try again.",

  // Data Errors
  NOT_FOUND: "The requested information could not be found.",
  VALIDATION_ERROR: "Please check your input and try again.",
  DUPLICATE_ENTRY: "This entry already exists in the system.",

  // Generic Errors
  GENERIC_ERROR: "Sorry, something went wrong. Please try again.",
  UNEXPECTED_ERROR: "An unexpected error occurred. Please try again or contact support if the problem persists.",

  // Operation Errors
  CREATE_FAILED: "Failed to create. Please try again.",
  UPDATE_FAILED: "Failed to update. Please try again.",
  DELETE_FAILED: "Failed to delete. Please try again.",
  LOAD_FAILED: "Failed to load data. Please refresh the page and try again.",

  // File Errors
  FILE_TOO_LARGE: "The file is too large. Please choose a smaller file.",
  INVALID_FILE_TYPE: "Invalid file type. Please choose a different file.",
  UPLOAD_FAILED: "File upload failed. Please try again.",

  // Form Errors
  REQUIRED_FIELD: "This field is required.",
  INVALID_EMAIL: "Please enter a valid email address.",
  INVALID_PHONE: "Please enter a valid phone number.",
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters long.",
  PASSWORDS_DONT_MATCH: "Passwords do not match.",
} as const;

/**
 * Get user-friendly error message based on status code
 */
export function getErrorMessageByStatus(status: number): string {
  switch (status) {
    case 400:
      return ERROR_MESSAGES.VALIDATION_ERROR;
    case 401:
      return ERROR_MESSAGES.UNAUTHORIZED;
    case 403:
      return ERROR_MESSAGES.FORBIDDEN;
    case 404:
      return ERROR_MESSAGES.NOT_FOUND;
    case 408:
      return ERROR_MESSAGES.REQUEST_TIMEOUT;
    case 409:
      return ERROR_MESSAGES.DUPLICATE_ENTRY;
    case 500:
    case 502:
    case 503:
    case 504:
      return ERROR_MESSAGES.SERVER_UNAVAILABLE;
    default:
      return ERROR_MESSAGES.GENERIC_ERROR;
  }
}

/**
 * Format error message for display
 * Ensures error messages are user-friendly
 */
export function formatErrorMessage(error: unknown, defaultMessage?: string): string {
  // If it's a string, check if it's a technical error message
  if (typeof error === 'string') {
    // Replace technical messages with user-friendly ones
    const technicalPatterns = [
      /cannot connect/i,
      /network error/i,
      /econnrefused/i,
      /timeout/i,
      /backend.*running/i,
      /server.*not.*responding/i,
    ];

    for (const pattern of technicalPatterns) {
      if (pattern.test(error)) {
        return ERROR_MESSAGES.NETWORK_ERROR;
      }
    }

    // If it looks like a user-friendly message, return it
    if (error.length < 200 && !error.includes('Error:') && !error.includes('Exception')) {
      return error;
    }
  }

  // If it's an Error object
  if (error instanceof Error) {
    return formatErrorMessage(error.message, defaultMessage);
  }

  // If it's an object with a message property
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return formatErrorMessage((error as { message: string }).message, defaultMessage);
  }

  // Return default or generic message
  return defaultMessage || ERROR_MESSAGES.UNEXPECTED_ERROR;
}

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  // CRUD Operations
  CREATED: "Created successfully!",
  UPDATED: "Updated successfully!",
  DELETED: "Deleted successfully!",
  SAVED: "Saved successfully!",

  // Specific Operations
  LOGIN_SUCCESS: "Welcome back!",
  LOGOUT_SUCCESS: "You have been logged out successfully.",
  PASSWORD_CHANGED: "Password changed successfully.",
  EMAIL_SENT: "Email sent successfully.",
  FILE_UPLOADED: "File uploaded successfully.",
  IMPORT_SUCCESS: "Import completed successfully!",

  // Generic
  OPERATION_SUCCESS: "Operation completed successfully!",
} as const;

/**
 * Warning Messages
 */
export const WARNING_MESSAGES = {
  UNSAVED_CHANGES: "You have unsaved changes. Are you sure you want to leave?",
  DELETE_CONFIRM: "Are you sure you want to delete this item? This action cannot be undone.",
  IRREVERSIBLE_ACTION: "This action cannot be undone. Do you want to continue?",
  SESSION_EXPIRING: "Your session will expire soon. Please save your work.",
} as const;

/**
 * Info Messages
 */
export const INFO_MESSAGES = {
  LOADING: "Loading...",
  SAVING: "Saving...",
  DELETING: "Deleting...",
  PROCESSING: "Processing...",
  NO_DATA: "No data available.",
  NO_RESULTS: "No results found.",
  EMPTY_STATE: "Nothing to show yet.",
} as const;
