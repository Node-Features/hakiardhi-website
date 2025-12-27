import { authApi } from '../interceptors';
import {
  RoleResponse,
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleWithPermissions,
  RoleWithUsers,
  PaginatedResponse,
  PermissionResponse,
} from '@/types/api';

/**
 * Roles API Service
 * All endpoints for role management and permissions assignment
 */
export const rolesService = {
  /**
   * Get all roles with pagination
   * GET /api/admin/roles
   */
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const searchParams = new URLSearchParams(
      params as Record<string, string>
    ).toString();

    return authApi.get<PaginatedResponse<RoleResponse>>(
      `/api/admin/roles${searchParams ? `?${searchParams}` : ''}`
    );
  },

  /**
   * Get single role by ID
   * GET /api/admin/roles/:id
   */
  getById: async (id: string) => {
    return authApi.get<RoleResponse>(`/api/admin/roles/${id}`);
  },

  /**
   * Get role with permissions
   * GET /api/admin/roles/:id/full
   */
  getRoleWithPermissions: async (id: string) => {
    return authApi.get<RoleWithPermissions>(`/api/admin/roles/${id}/full`);
  },

  /**
   * Get role with users
   * GET /api/admin/roles/:id/users
   */
  getRoleWithUsers: async (id: string) => {
    return authApi.get<RoleWithUsers>(`/api/admin/roles/${id}/users`);
  },

  /**
   * Create new role
   * POST /api/admin/roles
   */
  create: async (data: CreateRoleRequest) => {
    return authApi.post<RoleResponse>('/api/admin/roles', data);
  },

  /**
   * Update role
   * PUT /api/admin/roles/:id
   */
  update: async (id: string, data: UpdateRoleRequest) => {
    return authApi.put<RoleResponse>(`/api/admin/roles/${id}`, data);
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
    return authApi.get<PermissionResponse[]>(`/api/admin/roles/${roleId}/permissions`);
  },

  /**
   * Assign permissions to role
   * POST /api/admin/roles/:id/permissions
   */
  assignPermissions: async (roleId: string, permissionIds: string[]) => {
    return authApi.post(`/api/admin/roles/${roleId}/permissions`, {
      permission_ids: permissionIds,
    });
  },

  /**
   * Remove permission from role
   * DELETE /api/admin/roles/:roleId/permissions/:permissionId
   */
  removePermission: async (roleId: string, permissionId: string) => {
    return authApi.delete(`/api/admin/roles/${roleId}/permissions/${permissionId}`);
  },

  /**
   * Get role statistics
   * GET /api/admin/roles/stats
   */
  getStats: async () => {
    return authApi.get<{
      total: number;
      totalPermissions: number;
      activeAssignments: number;
    }>('/api/admin/roles/stats');
  },
};
