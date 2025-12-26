// src/lib/api/auth-wrapper.ts
import { api, isAPIError } from './client';
import { refreshToken, clearSession } from '@/lib/auth/session';
import { AxiosRequestConfig } from 'axios';

/**
 * Enhanced API client with token refresh interceptor
 */
export async function apiWithAuth<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  data?: unknown,
  config?: AxiosRequestConfig,
  retryCount = 0
): Promise<T> {
  try {
    // Call the appropriate method based on the HTTP verb
    switch (method) {
      case 'GET':
        return await api.get<T>(endpoint, config);
      case 'POST':
        return await api.post<T>(endpoint, data, config);
      case 'PUT':
        return await api.put<T>(endpoint, data, config);
      case 'PATCH':
        return await api.patch<T>(endpoint, data, config);
      case 'DELETE':
        return await api.delete<T>(endpoint, config);
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  } catch (error) {
    if (isAPIError(error) && error.status === 401 && retryCount === 0) {
      // Check if this is actually an auth error that needs token refresh
      const errorMessage = error.message?.toLowerCase() || '';
      const isAuthError = errorMessage.includes('token') ||
                         errorMessage.includes('session') ||
                         errorMessage.includes('expired') ||
                         errorMessage.includes('unauthorized');

      if (isAuthError) {
        // Attempt token refresh only for auth-related errors
        const newToken = await refreshToken();

        if (newToken) {
          // Update token in localStorage (the interceptor will pick it up)
          localStorage.setItem('access_token', newToken);
          
          // Retry request with new token
          return apiWithAuth<T>(endpoint, method, data, config, retryCount + 1);
        } else {
          // Refresh failed, clear session and redirect
          clearSession();
          if (typeof window !== 'undefined') {
            window.location.href = '/signin';
          }
          throw error;
        }
      }
    }
    throw error;
  }
}

/**
 * Use this for all authenticated API calls
 */
export const authApi = {
  get: <T = unknown>(endpoint: string, config?: AxiosRequestConfig): Promise<T> =>
    apiWithAuth<T>(endpoint, 'GET', undefined, config),

  post: <T = unknown>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    apiWithAuth<T>(endpoint, 'POST', data, config),

  put: <T = unknown>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    apiWithAuth<T>(endpoint, 'PUT', data, config),

  patch: <T = unknown>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    apiWithAuth<T>(endpoint, 'PATCH', data, config),

  delete: <T = unknown>(endpoint: string, config?: AxiosRequestConfig): Promise<T> =>
    apiWithAuth<T>(endpoint, 'DELETE', undefined, config),
};

/**
 * Generic fetch function for SWR with authentication and token refresh
 * Use this instead of apiFetch from client.ts for authenticated endpoints
 */
export const authApiFetch = <T = unknown>(url: string): Promise<T> => authApi.get<T>(url);