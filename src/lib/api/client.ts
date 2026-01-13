/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/api/client.ts
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { generateCorrelationId } from './utils';
import { ERROR_MESSAGES, getErrorMessageByStatus, formatErrorMessage } from '@/lib/utils/errorMessages';

/**
 * API Configuration
 * Empty baseURL uses Next.js proxy (configured in next.config.ts)
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const API_TIMEOUT = 30000; // 30 seconds

/**
 * Simple API Error class
 */
export class APIError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly data?: unknown,
    public readonly endpoint?: string,
    public readonly correlationId?: string
  ) {
    super(message);
    this.name = 'APIError';
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

/**
 * Create axios instance with default config
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // CORS TEMPORARILY DISABLED - Uncomment when needed
  // withCredentials: true, // Enable this for cookies/auth with CORS
});

/**
 * Request interceptor - add auth token and correlation ID
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Add correlation ID
    config.headers['X-Request-ID'] = generateCorrelationId();
    
    // Add auth token if exists
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('access_token') 
      : null;
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Simple logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - handle errors globally
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Success - return data directly
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    }
    return response.data;
  },
  (error: AxiosError) => {
    // Extract error details
    const status = error.response?.status || 0;
    const endpoint = error.config?.url || '';
    const correlationId = error.config?.headers?.['X-Request-ID'] as string | undefined;

    let errorMessage: string = ERROR_MESSAGES.GENERIC_ERROR;
    let errorData: unknown = undefined;
    let serverMessage: string | undefined;

    if (error.response) {
      // Server responded with error
      errorData = error?.response?.data;

      // Extract server's error message
      if (typeof errorData === 'object' && errorData !== null) {
        const data = errorData as any;
        serverMessage = data.message || data.error;
      } else if (typeof errorData === 'string') {
        serverMessage = errorData;
      }

      // Use server message if it's user-friendly, otherwise use status-based message
      errorMessage = serverMessage && serverMessage.length < 200 && !serverMessage.includes('Error:')
        ? formatErrorMessage(serverMessage)
        : getErrorMessageByStatus(status);

    } else if (error.request) {
      // Request made but no response - Network error
      errorMessage = ERROR_MESSAGES.NETWORK_ERROR;

      // More helpful error message for development
      if (process.env.NODE_ENV === 'development') {
        console.error('🔴 Connection Error:', {
          baseURL: API_BASE_URL,
          endpoint,
          message: 'No response from server',
          tips: [
            '1. Check if backend is running',
            '2. Verify the port number (should be 3001)',
            '3. Check if API_BASE_URL is correct',
          ]
        });
      }
    } else {
      // Request setup error
      errorMessage = formatErrorMessage(error.message);
    }

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      // Don't log 401 errors for auth endpoints (expected when session expires)
      const isAuthEndpoint = endpoint.includes('/auth/session') || endpoint.includes('/auth/refresh');
      const shouldSkipLog = (status === 401 || status === 403) && isAuthEndpoint;

      if (!shouldSkipLog) {
        // Use console.warn for 404s (often expected behavior)
        const logFn = status === 404 ? console.warn : console.error;
        const emoji = status === 404 ? '⚠️' : '❌';

        logFn(`${emoji} ${error.config?.method?.toUpperCase()} ${endpoint} - ${status}`, {
          userMessage: errorMessage,
          serverMessage: serverMessage,
          data: errorData,
          requestData: error.config?.data,
        });
      }
    }

    // Throw standardized error with user-friendly message
    throw new APIError(status, errorMessage, errorData, endpoint, correlationId);
  }
);

/**
 * Generic request function
 */
async function request<T = any>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await axiosInstance.request<any, T>(config);
    return response;
  } catch (error) {
    // Re-throw APIError or wrap unknown errors
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(0, formatErrorMessage(error), error, config.url);
  }
}

/**
 * API methods
 */
export const api = {
  get: <T = any>(endpoint: string, config?: AxiosRequestConfig): Promise<T> => 
    request<T>({ ...config, method: 'GET', url: endpoint }),

  post: <T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    request<T>({ ...config, method: 'POST', url: endpoint, data }),

  put: <T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    request<T>({ ...config, method: 'PUT', url: endpoint, data }),

  patch: <T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    request<T>({ ...config, method: 'PATCH', url: endpoint, data }),

  delete: <T = any>(endpoint: string, config?: AxiosRequestConfig): Promise<T> =>
    request<T>({ ...config, method: 'DELETE', url: endpoint }),
};

/**
 * Generic fetch function for SWR and other data fetching libraries
 */
export const apiFetch = <T = any>(url: string): Promise<T> => api.get<T>(url);

/**
 * Helper functions
 */
export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

export function getErrorMessage(error: unknown): string {
  if (isAPIError(error)) {
    return error.message;
  }
  return formatErrorMessage(error);
}

// Export axios instance for advanced usage
export { axiosInstance };

// Re-export error messages for convenience
export { ERROR_MESSAGES, SUCCESS_MESSAGES, WARNING_MESSAGES, INFO_MESSAGES } from '@/lib/utils/errorMessages';