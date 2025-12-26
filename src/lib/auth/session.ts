import { api } from '@/lib/api/client';
import type { User } from '@/context/AuthContext';

/**
 * Check if user is authenticated and fetch current session data
 * @param skipClearOnError - If true, won't clear session on error (useful for ProtectedRoute)
 */
export async function getSession(skipClearOnError = false): Promise<User | null> {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('access_token')
    : null;

  if (!token) return null;

  try {
    const data = await api.get<{ success: boolean; user: User }>('/api/admin/auth/session');

    if (data.success && data.user) {
      // Update localStorage with fresh user data
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data.user;
    }

    return null;
  } catch (error: unknown) {
    // Only log errors in development mode
    if (process.env.NODE_ENV === 'development') {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn('Session fetch failed:', errorMessage);
    }

    // Clear session if it's an auth error (401 or 403)
    // Don't clear for network errors or other issues
    const errorStatus = (error as { status?: number }).status;
    if (!skipClearOnError && (errorStatus === 401 || errorStatus === 403)) {
      clearSession();
    }

    return null;
  }
}

/**
 * Clear session data
 */
export function clearSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
}

/**
 * Refresh access token
 */
export async function refreshToken() {
  const refreshTokenValue = typeof window !== 'undefined'
    ? localStorage.getItem('refresh_token')
    : null;

  if (!refreshTokenValue) return null;

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

  try {
    // Use relative URL if API_BASE_URL is empty (Next.js proxy), otherwise use full URL
    const refreshUrl = API_BASE_URL
      ? `${API_BASE_URL}/api/admin/auth/refresh`
      : '/api/admin/auth/refresh';

    const response = await fetch(refreshUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshTokenValue }),
    });

    if (response.ok) {
      const data = await response.json();
      if (typeof window !== 'undefined' && data.access_token) {
        localStorage.setItem('access_token', data.access_token);
      }
      return data.access_token || null;
    }

    // If refresh fails with 401, it means refresh token is invalid
    if (response.status === 401) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Refresh token is invalid or expired');
      }
      return null;
    }

    return null;
  } catch (error) {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Token refresh failed:', error);
    }
    return null;
  }
}

/**
 * Store session data
 */
export function setSession(accessToken: string, refreshToken: string, user: User) {
  console.log('💾 setSession: Storing user data');
  console.log('  - user:', user);

  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    console.log('  - Stored in localStorage successfully');
    console.log('  - Verification:', localStorage.getItem('user'));
  }
}
