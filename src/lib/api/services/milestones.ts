import { authApi } from '../interceptors';

export interface Milestone {
  id: string;
  year: string;
  title: string;
  description: string;
  icon_name?: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateMilestoneRequest {
  year: string;
  title: string;
  description: string;
  icon_name?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface UpdateMilestoneRequest extends Partial<CreateMilestoneRequest> {}

/**
 * Organization Milestones API Service
 */
export const milestoneService = {
  /**
   * Get all milestones
   * GET /api/admin/milestones
   */
  getAll: async () => {
    return authApi.get<Milestone[]>('/api/admin/milestones');
  },

  /**
   * Get single milestone by ID
   * GET /api/admin/milestones/:id
   */
  getById: async (id: string) => {
    return authApi.get<Milestone>(`/api/admin/milestones/${id}`);
  },

  /**
   * Create new milestone
   * POST /api/admin/milestones
   */
  create: async (data: CreateMilestoneRequest) => {
    return authApi.post<Milestone>('/api/admin/milestones', data);
  },

  /**
   * Update milestone
   * PUT /api/admin/milestones/:id
   */
  update: async (id: string, data: UpdateMilestoneRequest) => {
    return authApi.put<Milestone>(`/api/admin/milestones/${id}`, data);
  },

  /**
   * Delete milestone
   * DELETE /api/admin/milestones/:id
   */
  delete: async (id: string) => {
    return authApi.delete(`/api/admin/milestones/${id}`);
  },
};
