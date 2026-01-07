import { authApi } from '../interceptors';
import { PaginatedResponse } from '@/types/api';

export interface Category {
  id: string;
  name: string;
  type: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryRequest {
  name: string;
  type: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  type?: string;
  description?: string;
}

/**
 * Categories API Service
 * All endpoints for category management
 */
export const categoriesService = {
  /**
   * Get all categories with pagination and filters
   * GET /api/admin/categories
   */
  getAll: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
  }) => {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const url = `/api/admin/categories${queryString ? `?${queryString}` : ''}`;

    return authApi.get<PaginatedResponse<Category>>(url);
  },

  /**
   * Get single category by ID
   * GET /api/admin/categories/:id
   */
  getById: async (id: string) => {
    return authApi.get<Category>(`/api/admin/categories/${id}`);
  },

  /**
   * Create new category
   * POST /api/admin/categories
   */
  create: async (data: CreateCategoryRequest) => {
    return authApi.post<Category>('/api/admin/categories', data);
  },

  /**
   * Update category
   * PUT /api/admin/categories/:id
   */
  update: async (id: string, data: UpdateCategoryRequest) => {
    return authApi.put<Category>(`/api/admin/categories/${id}`, data);
  },

  /**
   * Delete category
   * DELETE /api/admin/categories/:id
   */
  delete: async (id: string) => {
    return authApi.delete(`/api/admin/categories/${id}`);
  },

  /**
   * Get categories by type
   * GET /api/admin/categories?type=:type
   */
  getByType: async (type: string) => {
    return authApi.get<PaginatedResponse<Category>>(
      `/api/admin/categories?type=${type}&limit=1000`
    );
  },
};
