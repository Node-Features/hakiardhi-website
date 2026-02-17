import { authApi } from '../interceptors';
import { PaginatedResponse } from '@/types/api';
import { fileToBase64 } from '@/lib/utils/file';

export interface TeamMemberResponse {
  id: string;
  name: string;
  role: string;
  department: string | null;
  bio: string | null;
  image_url: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  member_type: 'leadership' | 'board' | 'staff' | 'advisor';
  display_order: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTeamMemberRequest {
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
  display_order?: number | null;
  is_active?: boolean;
}

export interface UpdateTeamMemberRequest {
  name?: string;
  role?: string;
  member_type?: 'leadership' | 'board' | 'staff' | 'advisor';
  department?: string | null;
  bio?: string | null;
  image_url?: string | null;
  email?: string | null;
  phone?: string | null;
  linkedin_url?: string | null;
  twitter_url?: string | null;
  display_order?: number | null;
  is_active?: boolean;
}

/**
 * Team Members API Service
 * Manages team member profiles displayed on the public website
 */
export const teamMembersService = {
  /**
   * Get all team members with pagination and filters
   * GET /api/admin/users/team-members
   */
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    member_type?: string;
    status?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.set(key, String(value));
        }
      });
    }
    const queryString = searchParams.toString();

    return authApi.get<PaginatedResponse<TeamMemberResponse>>(
      `/api/admin/users/team-members${queryString ? `?${queryString}` : ''}`
    );
  },

  /**
   * Get single team member by ID
   * GET /api/admin/users/team-members/:id
   */
  getById: async (id: string) => {
    return authApi.get<{ data: TeamMemberResponse }>(
      `/api/admin/users/team-members/${id}`
    );
  },

  /**
   * Create a new team member
   * POST /api/admin/users/team-members
   */
  create: async (data: CreateTeamMemberRequest) => {
    return authApi.post<{ message: string; data: TeamMemberResponse }>(
      '/api/admin/users/team-members',
      data
    );
  },

  /**
   * Update team member
   * PUT /api/admin/users/team-members/:id
   */
  update: async (id: string, data: UpdateTeamMemberRequest) => {
    return authApi.put<{ message: string; data: TeamMemberResponse }>(
      `/api/admin/users/team-members/${id}`,
      data
    );
  },

  /**
   * Delete team member
   * DELETE /api/admin/users/team-members/:id
   */
  delete: async (id: string) => {
    return authApi.delete<{ message: string }>(
      `/api/admin/users/team-members/${id}`
    );
  },

  /**
   * Upload team member image
   * POST /api/admin/users/team-members/:id/image
   */
  uploadImage: async (id: string, file: File) => {
    const base64 = await fileToBase64(file);
    const mimeType = file.type;
    const image = base64.includes('data:') ? base64 : `data:${mimeType};base64,${base64}`;

    return authApi.post<{ message: string; image_url: string; data: TeamMemberResponse }>(
      `/api/admin/users/team-members/${id}/image`,
      { image, mime_type: mimeType }
    );
  },

  /**
   * Delete team member image
   * DELETE /api/admin/users/team-members/:id/image
   */
  deleteImage: async (id: string) => {
    return authApi.delete<{ message: string }>(
      `/api/admin/users/team-members/${id}/image`
    );
  },
};
