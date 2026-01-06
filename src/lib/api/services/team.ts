import { authApi } from '../interceptors';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  member_type: 'leadership' | 'board' | 'staff' | 'advisor';
  department?: string | null;
  bio?: string | null;
  image_url?: string | null;
  email?: string | null;
  phone?: string | null;
  linkedin_url?: string | null;
  twitter_url?: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTeamMemberRequest {
  name: string;
  role: string;
  member_type: 'leadership' | 'board' | 'staff' | 'advisor';
  department?: string;
  bio?: string;
  image_url?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  twitter_url?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface UpdateTeamMemberRequest extends Partial<CreateTeamMemberRequest> {}

/**
 * Team Members API Service
 */
export const teamService = {
  /**
   * Get all team members
   * GET /api/admin/team
   */
  getAll: async () => {
    return authApi.get<TeamMember[]>('/api/admin/team');
  },

  /**
   * Get single team member by ID
   * GET /api/admin/team/:id
   */
  getById: async (id: string) => {
    return authApi.get<TeamMember>(`/api/admin/team/${id}`);
  },

  /**
   * Create new team member
   * POST /api/admin/team
   */
  create: async (data: CreateTeamMemberRequest) => {
    return authApi.post<TeamMember>('/api/admin/team', data);
  },

  /**
   * Update team member
   * PUT /api/admin/team/:id
   */
  update: async (id: string, data: UpdateTeamMemberRequest) => {
    return authApi.put<TeamMember>(`/api/admin/team/${id}`, data);
  },

  /**
   * Delete team member
   * DELETE /api/admin/team/:id
   */
  delete: async (id: string) => {
    return authApi.delete(`/api/admin/team/${id}`);
  },
};
