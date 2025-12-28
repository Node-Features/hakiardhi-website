import { api } from '../client';
import { setSession, clearSession } from '@/lib/auth/session';

/**
 * Authentication API Service
 * All endpoints for authentication (login, signup, logout, etc.)
 */
export const authService = {
  /**
   * Sign up new user
   * POST /api/admin/auth/signup
   */
  signup: async (data: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    phone_number: string;
    sex: string;
    age_group: string;
    photo_consent: boolean;
    role_id: string;
  }) => {
    const response = await api.post<{
      user: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        phone_number: string;
        sex: string;
        age_group: string;
        role: string;
      };
      access_token: string;
      refresh_token: string;
    }>('/api/admin/auth/register', data);

    // Store tokens and user info
    if (response.access_token && response.refresh_token) {
      setSession(response.access_token, response.refresh_token, response.user);
    }

    return response;
  },

  /**
   * Sign in user
   * POST /api/admin/auth/login
   */
  signin: async (data: { email: string; password: string }) => {
    console.log('🔐 authService.signin: Calling login API');

    const response = await api.post<{
      success: boolean;
      message: string;
      session: {
        access_token: string;
        refresh_token: string;
        token_type: string;
        expires_at: number;
      };
      user: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        phone_number?: string;
        sex?: string;
        age_group?: string;
        role?: string;
        role_id?: string;
        roles?: string[]; // All user roles
        permissions?: string[]; // All user permissions
      };
    }>('/api/admin/auth/login', data);

    console.log('  - Login response:', response);
    console.log('  - User data:', response.user);

    // Store tokens and user info
    if (response.session?.access_token && response.session?.refresh_token) {
      console.log('  - Storing session...');
      setSession(response.session.access_token, response.session.refresh_token, response.user);
    } else {
      console.warn('  - ⚠️ No session tokens in response!');
    }

    return {
      user: response.user,
      access_token: response.session.access_token,
      refresh_token: response.session.refresh_token,
    };
  },

  /**
   * Sign out user
   * POST /api/admin/auth/signout
   */
  signout: async () => {
    try {
      await api.post('/api/admin/auth/signout');
    } finally {
      // Clear session regardless of API response
      clearSession();
    }
  },

  /**
   * Request password reset
   * POST /api/admin/auth/forgot-password
   */
  forgotPassword: async (email: string) => {
    return api.post<{ message: string }>('/api/admin/auth/forget_password', {
      email,
    });
  },

  /**
   * Reset password with token
   * POST /api/admin/auth/reset-password
   */
  resetPassword: async (data: { token: string; password: string }) => {
    return api.post<{ message: string }>('/api/admin/auth/reset_password', data);
  },

  /**
   * Verify email with token
   * POST /api/admin/auth/verify-email
   */
  verifyEmail: async (token: string) => {
    return api.post<{ message: string }>('/api/admin/auth/verify_email', {
      token,
    });
  },

  /**
   * Resend verification email
   * POST /api/admin/auth/resend-verification
   */
  resendVerification: async (email: string) => {
    return api.post<{ message: string }>(
      '/api/admin/auth/resend_verification',
      { email }
    );
  },

  /**
   * Check if email is available
   * GET /api/admin/auth/check-email
   */
  checkEmail: async (email: string) => {
    return api.get<{ available: boolean }>(
      `/api/admin/auth/check_email?email=${encodeURIComponent(email)}`
    );
  },

  /**
   * Get available roles for signup (public endpoint)
   * GET /api/admin/auth/roles
   */
  getPublicRoles: async () => {
    return api.get<Array<{ id: string; name: string; description?: string }>>(
      '/api/admin/roles'
    );
  },
};
