import { authApi } from '@/lib/api/interceptors';

// Project Types
export interface ProjectLocation {
  id: string;
  region_id: string;
  district_id: string;
  village_id: string;
  regions?: { id: string; name: string };
  districts?: { id: string; name: string };
  villages?: { id: string; name: string };
}

export interface Project {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date?: string | null;
  status: 'Pending' | 'Active' | 'Completed' | 'On Hold';
  created_at: string;
  updated_at: string;
  locations?: ProjectLocation[];
  total_activities?: number;
  completed_activities?: number;
  total_beneficiaries?: number;
}

export interface ProjectDetails extends Project {
  activities?: Activity[];
  statistics?: {
    total_activities: number;
    completed_activities: number;
    ongoing_activities: number;
    pending_activities: number;
    total_beneficiaries: number;
    total_files: number;
  };
  files?: ProjectFile[];
}

export interface Activity {
  id: string;
  name: string;
  status: string;
  start_date: string;
  end_date?: string | null;
  beneficiaries_count: number;
}

export interface ProjectFile {
  id: string;
  name: string;
  file_url: string;
  description?: string;
  uploaded_at?: string;
  created_at?: string;
}

export interface CreateProjectData {
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  status?: 'Pending' | 'Active' | 'Completed' | 'On Hold';
  locations: {
    region_id: string;
    district_id: string;
    village_id: string;
  }[];
}

export interface UpdateProjectData {
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: 'Pending' | 'Active' | 'Completed' | 'On Hold';
  locations?: {
    region_id: string;
    district_id: string;
    village_id: string;
  }[];
}

export interface ProjectsListParams {
  page?: number;
  limit?: number;
  status?: string;
  region_id?: string;
  district_id?: string;
  village_id?: string;
  start_date_from?: string;
  start_date_to?: string;
}

export interface ProjectsListResponse {
  success: boolean;
  data: Project[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface ProjectResponse {
  success: boolean;
  message?: string;
  data: ProjectDetails;
}

/**
 * Projects API Service
 * All endpoints for project management
 */
export const projectsService = {
  /**
   * Get paginated list of projects with filters
   * GET /api/admin/projects
   */
  getAll: async (params?: ProjectsListParams): Promise<ProjectsListResponse> => {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    const url = `/api/admin/projects${queryString ? `?${queryString}` : ''}`;

    return authApi.get<ProjectsListResponse>(url);
  },

  /**
   * Get single project by ID with full details
   * GET /api/admin/projects/:id
   */
  getById: async (id: string): Promise<ProjectResponse> => {
    return authApi.get<ProjectResponse>(`/api/admin/projects/${id}`);
  },

  /**
   * Create new project
   * POST /api/admin/projects
   */
  create: async (data: CreateProjectData): Promise<ProjectResponse> => {
    console.log('🌐 API: POST /api/admin/projects', data);
    const response = await authApi.post<ProjectResponse>('/api/admin/projects', data);
    console.log('🌐 API Response:', response);
    return response;
  },

  /**
   * Update existing project
   * PUT /api/admin/projects/:id
   */
  update: async (id: string, data: UpdateProjectData): Promise<ProjectResponse> => {
    console.log('🌐 API: PUT /api/admin/projects/' + id, data);
    const response = await authApi.put<ProjectResponse>(`/api/admin/projects/${id}`, data);
    console.log('🌐 API Response:', response);
    return response;
  },

  /**
   * Delete project
   * DELETE /api/admin/projects/:id
   */
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    return authApi.delete<{ success: boolean; message: string }>(`/api/admin/projects/${id}`);
  },

  /**
   * Get project locations
   * GET /api/admin/projects/:id/locations
   */
  getLocations: async (projectId: string) => {
    return authApi.get(`/api/admin/projects/${projectId}/locations`);
  },

  /**
   * Get project files
   * GET /api/admin/projects/:id/files
   */
  getFiles: async (projectId: string) => {
    return authApi.get(`/api/admin/projects/${projectId}/files`);
  },

  /**
   * Get project beneficiaries count
   * GET /api/admin/projects/:id/beneficiaries/count
   */
  getBeneficiariesCount: async (id: string): Promise<{ success: boolean; count: number }> => {
    return authApi.get<{ success: boolean; count: number }>(`/api/admin/projects/${id}/beneficiaries/count`);
  },
};
