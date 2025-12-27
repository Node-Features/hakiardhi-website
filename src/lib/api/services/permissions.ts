import { authApi } from '../interceptors';
import {
  PermissionResponse,
  CreatePermissionRequest,
  UpdatePermissionRequest,
  PermissionWithRoles,
  PaginatedResponse,
} from '@/types/api';

/**
 * Permissions API Service
 * All endpoints for permission management
 */
export const permissionsService = {
  /**
   * Get all permissions with pagination
   * GET /api/admin/permissions
   */
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
  }) => {
    const searchParams = new URLSearchParams(
      params as Record<string, string>
    ).toString();

    return authApi.get<PaginatedResponse<PermissionResponse>>(
      `/api/admin/permissions${searchParams ? `?${searchParams}` : ''}`
    );
  },

  /**
   * Get single permission by ID
   * GET /api/admin/permissions/:id
   */
  getById: async (id: string) => {
    return authApi.get<PermissionResponse>(`/api/admin/permissions/${id}`);
  },

  /**
   * Get permission with roles that have it
   * GET /api/admin/permissions/:id/roles
   */
  getPermissionWithRoles: async (id: string) => {
    return authApi.get<PermissionWithRoles>(`/api/admin/permissions/${id}/roles`);
  },

  /**
   * Create new permission
   * POST /api/admin/permissions
   */
  create: async (data: CreatePermissionRequest) => {
    return authApi.post<PermissionResponse>('/api/admin/permissions', data);
  },

  /**
   * Update permission
   * PUT /api/admin/permissions/:id
   */
  update: async (id: string, data: UpdatePermissionRequest) => {
    return authApi.put<PermissionResponse>(`/api/admin/permissions/${id}`, data);
  },

  /**
   * Delete permission
   * DELETE /api/admin/permissions/:id
   */
  delete: async (id: string) => {
    return authApi.delete(`/api/admin/permissions/${id}`);
  },

  /**
   * Get permission statistics
   * GET /api/admin/permissions/stats
   */
  getStats: async () => {
    return authApi.get<{
      total: number;
      assigned: number;
      unassigned: number;
    }>('/api/admin/permissions/stats');
  },

  /**
   * Get all permission categories
   * GET /api/admin/permissions/categories
   */
  getCategories: async () => {
    return authApi.get<string[]>('/api/admin/permissions/categories');
  },
};
