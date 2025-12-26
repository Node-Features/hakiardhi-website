import { authApi } from '../interceptors';
import {
  BeneficiaryResponse,
  CreateBeneficiaryRequest,
  UpdateBeneficiaryRequest,
  PaginatedResponse,
} from '@/types/api';
import { fileToBase64 } from '@/lib/utils/file';

/**
 * Beneficiaries API Service
 * All endpoints for beneficiary management
 */
export const beneficiariesService = {
  /**
   * Get all beneficiaries with pagination and filters
   * GET /api/admin/beneficiaries
   */
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sex?: string;
    age_group?: string;
    is_pwd?: string;
    status?: string;
    photo_consent?: string;
  }) => {
    const searchParams = new URLSearchParams(
      params as Record<string, string>
    ).toString();

    return authApi.get<PaginatedResponse<BeneficiaryResponse>>(
      `/api/admin/beneficiaries${searchParams ? `?${searchParams}` : ''}`
    );
  },

  /**
   * Get single beneficiary by ID
   * GET /api/admin/beneficiaries/:id
   */
  getById: async (id: string) => {
    return authApi.get<BeneficiaryResponse>(`/api/admin/beneficiaries/${id}`);
  },

  /**
   * Create new beneficiary
   * POST /api/admin/beneficiaries
   */
  create: async (data: CreateBeneficiaryRequest) => {
    return authApi.post<BeneficiaryResponse>('/api/admin/beneficiaries', data);
  },

  /**
   * Update beneficiary
   * PUT /api/admin/beneficiaries/:id
   */
  update: async (id: string, data: UpdateBeneficiaryRequest) => {
    return authApi.put<BeneficiaryResponse>(`/api/admin/beneficiaries/${id}`, data);
  },

  /**
   * Delete beneficiary
   * DELETE /api/admin/beneficiaries/:id
   */
  delete: async (id: string) => {
    return authApi.delete(`/api/admin/beneficiaries/${id}`);
  },

  /**
   * Get beneficiary statistics
   * GET /api/admin/beneficiaries/statistics
   */
  getStatistics: async () => {
    return authApi.get('/api/admin/beneficiaries/statistics');
  },

  /**
   * Get beneficiary activities
   * GET /api/admin/beneficiaries/:id/activities
   */
  getActivities: async (beneficiaryId: string) => {
    return authApi.get<PaginatedResponse<any>>(`/api/admin/beneficiaries/${beneficiaryId}/activities`);
  },

  /**
   * Get beneficiary files
   * GET /api/admin/beneficiaries/:id/files
   */
  getFiles: async (beneficiaryId: string) => {
    return authApi.get(`/api/admin/beneficiaries/${beneficiaryId}/files`);
  },

  /**
   * Upload beneficiary file (base64 encoded)
   * POST /api/admin/beneficiaries/:id/files
   */
  uploadFile: async (beneficiaryId: string, file: File, description?: string) => {
    const base64 = await fileToBase64(file);

    return authApi.post(`/api/admin/beneficiaries/${beneficiaryId}/files`, {
      name: file.name,
      file_type: file.type,
      file_data: base64,
      description: description || '',
    });
  },

  /**
   * Delete beneficiary file
   * DELETE /api/admin/beneficiaries/:id/files/:fileId
   */
  deleteFile: async (beneficiaryId: string, fileId: string) => {
    return authApi.delete(`/api/admin/beneficiaries/${beneficiaryId}/files/${fileId}`);
  },

  /**
   * Upload beneficiary photo (base64 encoded)
   * POST /api/admin/beneficiaries/:id/photo
   */
  uploadPhoto: async (beneficiaryId: string, file: File) => {
    const base64 = await fileToBase64(file);

    return authApi.post(`/api/admin/beneficiaries/${beneficiaryId}/photo`, {
      name: file.name,
      file_type: file.type,
      file_data: base64,
    });
  },

  /**
   * Delete beneficiary photo
   * DELETE /api/admin/beneficiaries/:id/photo
   */
  deletePhoto: async (beneficiaryId: string) => {
    return authApi.delete(`/api/admin/beneficiaries/${beneficiaryId}/photo`);
  },

  /**
   * Search beneficiaries
   * GET /api/admin/beneficiaries/search
   */
  search: async (query: string) => {
    return authApi.get<BeneficiaryResponse[]>(
      `/api/admin/beneficiaries/search?q=${encodeURIComponent(query)}`
    );
  },

  /**
   * Export beneficiaries to CSV
   * GET /api/admin/beneficiaries/export
   */
  export: async (params?: {
    sex?: string;
    age_group?: string;
    region_id?: string;
    district_id?: string;
    village_id?: string;
  }) => {
    const searchParams = new URLSearchParams(
      params as Record<string, string>
    ).toString();

    return authApi.get<{ file_url: string }>(
      `/api/admin/beneficiaries/export${searchParams ? `?${searchParams}` : ''}`
    );
  },

  /**
   * Get beneficiary location details
   * GET /api/admin/beneficiaries/:id/location
   */
  getLocation: async (beneficiaryId: string) => {
    return authApi.get(`/api/admin/beneficiaries/${beneficiaryId}/location`);
  },
};
