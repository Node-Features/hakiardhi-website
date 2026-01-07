import { authApi } from '../interceptors';
import { PaginatedResponse } from '@/types/api';

export interface CategoryType {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTypeRequest {
  name: string;
  description?: string;
}

export interface UpdateTypeRequest {
  name?: string;
  description?: string;
}

/**
 * Category Types API Service
 * All endpoints for category type management
 */
export const typesService = {
  /**
   * Get all types with pagination
   * GET /api/admin/types
   */
  getAll: async (params?: {
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          const strValue = String(value);
          if (strValue !== '') {
            searchParams.append(key, strValue);
          }
        }
      });
    }

    const queryString = searchParams.toString();
    const url = `/api/admin/types${queryString ? `?${queryString}` : ''}`;

    return authApi.get<PaginatedResponse<CategoryType>>(url);
  },

  /**
   * Get single type by ID
   * GET /api/admin/types/:id
   */
  getById: async (id: string) => {
    return authApi.get<CategoryType>(`/api/admin/types/${id}`);
  },

  /**
   * Create new type
   * POST /api/admin/types
   */
  create: async (data: CreateTypeRequest) => {
    return authApi.post<CategoryType>('/api/admin/types', data);
  },

  /**
   * Update type
   * PUT /api/admin/types/:id
   */
  update: async (id: string, data: UpdateTypeRequest) => {
    return authApi.put<CategoryType>(`/api/admin/types/${id}`, data);
  },

  /**
   * Delete type
   * DELETE /api/admin/types/:id
   */
  delete: async (id: string) => {
    return authApi.delete(`/api/admin/types/${id}`);
  },
};
