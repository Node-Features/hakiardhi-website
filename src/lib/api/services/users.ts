import { authApi } from '../interceptors';
import {
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  PaginatedResponse,
} from '@/types/api';
import { fileToBase64 } from '@/lib/utils/file';

/**
 * Users API Service
 * All endpoints for user management and authentication
 */
export const usersService = {
  /**
   * Get all users with pagination and filters
   * GET /api/admin/users
   */
  getAll: async (params?: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
  }) => {
    const searchParams = new URLSearchParams(
      params as Record<string, string>
    ).toString();

    return authApi.get<PaginatedResponse<UserResponse>>(
      `/api/admin/users${searchParams ? `?${searchParams}` : ''}`
    );
  },

  /**
   * Get single user by ID
   * GET /api/admin/users/:id
   */
  getById: async (id: string) => {
    return authApi.get<UserResponse>(`/api/admin/users/${id}`);
  },

  /**
   * Create new user
   * POST /api/admin/users
   */
  create: async (data: CreateUserRequest) => {
    return authApi.post<UserResponse>('/api/admin/users', data);
  },

  /**
   * Update user
   * PUT /api/admin/users/:id
   */
  update: async (id: string, data: UpdateUserRequest) => {
    return authApi.put<UserResponse>(`/api/admin/users/${id}`, data);
  },

  /**
   * Delete user
   * DELETE /api/admin/users/:id
   */
  delete: async (id: string) => {
    return authApi.delete(`/api/admin/users/${id}`);
  },

  /**
   * Get current user profile
   * GET /api/admin/users/me
   */
  getProfile: async () => {
    return authApi.get<UserResponse>('/api/admin/users/me');
  },

  /**
   * Update current user profile
   * PUT /api/admin/users/me
   */
  updateProfile: async (data: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
  }) => {
    return authApi.put<UserResponse>('/api/admin/users/me', data);
  },

  /**
   * Change password
   * POST /api/admin/users/me/password
   */
  changePassword: async (data: {
    current_password: string;
    new_password: string;
  }) => {
    return authApi.post('/api/admin/users/me/password', data);
  },

  /**
   * Assign role to user
   * POST /api/admin/users/:id/roles
   */
  assignRole: async (userId: string, roleId: string) => {
    return authApi.post<UserResponse>(`/api/admin/users/${userId}/roles`, {
      role_id: roleId,
    });
  },

  /**
   * Remove role from user
   * DELETE /api/admin/users/:id/roles/:roleId
   */
  removeRole: async (userId: string, roleId: string) => {
    return authApi.delete(`/api/admin/users/${userId}/roles/${roleId}`);
  },

  /**
   * Activate user account
   * POST /api/admin/users/:id/activate
   */
  activate: async (userId: string) => {
    return authApi.post<UserResponse>(`/api/admin/users/${userId}/activate`);
  },

  /**
   * Deactivate user account
   * POST /api/admin/users/:id/deactivate
   */
  deactivate: async (userId: string) => {
    return authApi.post<UserResponse>(`/api/admin/users/${userId}/deactivate`);
  },

  /**
   * Get user statistics
   * GET /api/admin/users/stats
   */
  getStats: async () => {
    return authApi.get<{
      total: number;
      active: number;
      inactive: number;
      suspended: number;
      byRole: Record<string, number>;
      recentlyAdded: number;
    }>('/api/admin/users/stats');
  },

  /**
   * Search users
   * GET /api/admin/users/search
   */
  search: async (query: string) => {
    return authApi.get<UserResponse[]>(
      `/api/admin/users/search?q=${encodeURIComponent(query)}`
    );
  },

  /**
   * Get user activity log
   * GET /api/admin/users/:id/activity
   */
  getActivityLog: async (userId: string) => {
    return authApi.get(`/api/admin/users/${userId}/activity`);
  },

  /**
   * Get user permissions
   * GET /api/admin/users/:id/permissions
   */
  getPermissions: async (userId: string) => {
    return authApi.get<string[]>(`/api/admin/users/${userId}/permissions`);
  },

  /**
   * Get user with full details (role + permissions)
   * GET /api/admin/users/:id/full
   */
  getUserWithDetails: async (id: string) => {
    return authApi.get(`/api/admin/users/${id}/full`);
  },

  /**
   * Bulk update user status
   * POST /api/admin/users/bulk/status
   */
  bulkUpdateStatus: async (userIds: string[], status: string) => {
    return authApi.post('/api/admin/users/bulk/status', {
      user_ids: userIds,
      status,
    });
  },

  /**
   * Reset user password (admin action)
   * POST /api/admin/users/:id/reset-password
   */
  resetPassword: async (userId: string, newPassword: string) => {
    return authApi.post(`/api/admin/users/${userId}/reset-password`, {
      new_password: newPassword,
    });
  },

  /**
   * Upload user profile picture
   * POST /api/admin/users/:id/profile-picture
   */
  uploadProfilePicture: async (userId: string, file: File) => {
    const base64 = await fileToBase64(file);
    const mimeType = file.type;

    // Format image as data URL if not already
    const image = base64.includes('data:') ? base64 : `data:${mimeType};base64,${base64}`;

    return authApi.post<{
      message: string;
      image_url: string;
      user: UserResponse;
    }>(`/api/admin/users/${userId}/profile-picture`, {
      image,
      mime_type: mimeType,
    });
  },

  /**
   * Delete user profile picture
   * DELETE /api/admin/users/:id/profile-picture
   */
  deleteProfilePicture: async (userId: string) => {
    return authApi.delete<{
      message: string;
    }>(`/api/admin/users/${userId}/profile-picture`);
  },

  /**
   * Upload current user's profile picture
   * POST /api/admin/users/me/profile-picture
   */
  uploadMyProfilePicture: async (file: File) => {
    const base64 = await fileToBase64(file);
    const mimeType = file.type;

    // Format image as data URL if not already
    const image = base64.includes('data:') ? base64 : `data:${mimeType};base64,${base64}`;

    return authApi.post<{
      message: string;
      image_url: string;
      user: UserResponse;
    }>('/api/admin/users/me/profile-picture', {
      image,
      mime_type: mimeType,
    });
  },

  /**
   * Delete current user's profile picture
   * DELETE /api/admin/users/me/profile-picture
   */
  deleteMyProfilePicture: async () => {
    return authApi.delete<{
      message: string;
    }>('/api/admin/users/me/profile-picture');
  },
};

/**
 * Roles API Service
 * All endpoints for role management
 */
export const rolesService = {
  /**
   * Get all roles
   * GET /api/admin/roles
   */
  getAll: async () => {
    return authApi.get('/api/admin/roles');
  },

  /**
   * Get single role by ID
   * GET /api/admin/roles/:id
   */
  getById: async (id: string) => {
    return authApi.get(`/api/admin/roles/${id}`);
  },

  /**
   * Create new role
   * POST /api/admin/roles
   */
  create: async (data: {
    name: string;
    description?: string;
    permissions: string[];
  }) => {
    return authApi.post('/api/admin/roles', data);
  },

  /**
   * Update role
   * PUT /api/admin/roles/:id
   */
  update: async (
    id: string,
    data: {
      name?: string;
      description?: string;
      permissions?: string[];
    }
  ) => {
    return authApi.put(`/api/admin/roles/${id}`, data);
  },

  /**
   * Delete role
   * DELETE /api/admin/roles/:id
   */
  delete: async (id: string) => {
    return authApi.delete(`/api/admin/roles/${id}`);
  },

  /**
   * Get role permissions
   * GET /api/admin/roles/:id/permissions
   */
  getPermissions: async (roleId: string) => {
    return authApi.get<string[]>(`/api/admin/roles/${roleId}/permissions`);
  },

  /**
   * Get all available permissions
   * GET /api/admin/permissions
   */
  getAllPermissions: async () => {
    return authApi.get<Array<{ name: string; description: string }>>(
      '/api/admin/permissions'
    );
  },
};
