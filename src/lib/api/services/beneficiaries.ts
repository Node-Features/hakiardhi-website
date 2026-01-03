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
   * Lookup beneficiary by phone number
   * GET /api/admin/beneficiaries/lookup?phone_number={phone}
   */
  lookupByPhone: async (phoneNumber: string): Promise<{ exists: boolean; data: BeneficiaryResponse | null; message: string }> => {
    const response = await authApi.get<any>(
      `/api/admin/beneficiaries/lookup?phone_number=${encodeURIComponent(phoneNumber)}`
    );

    console.log('🔍 Raw API response type:', typeof response);
    console.log('🔍 Raw API response:', response);
    console.log('🔍 Has exists field:', 'exists' in response);
    console.log('🔍 Has id field:', 'id' in response);

    // Handle two possible response formats from backend:
    // 1. Wrapped: { success: true, exists: true, data: {...beneficiary...}, message: "..." }
    // 2. Direct: {...beneficiary...} (when found) or null/error (when not found)

    if (response && typeof response === 'object') {
      // Check if response has the wrapped format
      if ('exists' in response && 'data' in response) {
        // Format 1: Wrapped response
        return {
          exists: response.exists,
          data: response.data,
          message: response.message || ''
        };
      } else if ('id' in response && 'phone_number' in response) {
        // Format 2: Direct beneficiary object (found)
        return {
          exists: true,
          data: response,
          message: 'Beneficiary found'
        };
      }
    }

    // Not found or invalid response
    return {
      exists: false,
      data: null,
      message: 'Beneficiary not found'
    };
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
   * Upload beneficiary profile picture
   * POST /api/admin/beneficiaries/:id/profile-picture
   */
  uploadProfilePicture: async (beneficiaryId: string, file: File) => {
    const base64 = await fileToBase64(file);
    const mimeType = file.type;

    // Format image as data URL if not already
    const image = base64.includes('data:') ? base64 : `data:${mimeType};base64,${base64}`;

    return authApi.post<{
      success: boolean;
      message: string;
      image_url: string;
      data: BeneficiaryResponse;
    }>(`/api/admin/beneficiaries/${beneficiaryId}/profile-picture`, {
      image,
      mime_type: mimeType,
    });
  },

  /**
   * Delete beneficiary profile picture
   * DELETE /api/admin/beneficiaries/:id/profile-picture
   */
  deleteProfilePicture: async (beneficiaryId: string) => {
    return authApi.delete<{
      success: boolean;
      message: string;
    }>(`/api/admin/beneficiaries/${beneficiaryId}/profile-picture`);
  },

  /**
   * Check if beneficiary has photo consent
   */
  hasPhotoConsent: async (beneficiaryId: string): Promise<boolean> => {
    try {
      const beneficiary = await beneficiariesService.getById(beneficiaryId);
      return beneficiary.photo_consent || false;
    } catch {
      return false;
    }
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
