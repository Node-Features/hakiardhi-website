import { authApi } from '../interceptors';
import {
  LegalAidResponse,
  CreateLegalAidRequest,
  UpdateLegalAidRequest,
  PaginatedResponse,
} from '@/types/api';
import { fileToBase64 } from '@/lib/utils/file';

/**
 * Legal Aid API Service
 * All endpoints for legal aid request management
 */
export const legalAidService = {
  /**
   * Get all legal aid requests with pagination and filters
   * GET /api/admin/legal-aid
   */
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    lawyer_id?: string;
  }) => {
    const searchParams = new URLSearchParams(
      params as Record<string, string>
    ).toString();

    return authApi.get<PaginatedResponse<LegalAidResponse>>(
      `/api/admin/legal-aid${searchParams ? `?${searchParams}` : ''}`
    );
  },

  /**
   * Get single legal aid request by ID
   * GET /api/admin/legal-aid/:id
   */
  getById: async (id: string) => {
    return authApi.get<LegalAidResponse>(`/api/admin/legal-aid/${id}`);
  },

  /**
   * Create new legal aid request
   * POST /api/admin/legal-aid
   */
  create: async (data: CreateLegalAidRequest) => {
    return authApi.post<LegalAidResponse>('/api/admin/legal-aid', data);
  },

  /**
   * Update legal aid request
   * PUT /api/admin/legal-aid/:id
   */
  update: async (id: string, data: UpdateLegalAidRequest) => {
    return authApi.put<LegalAidResponse>(`/api/admin/legal-aid/${id}`, data);
  },

  /**
   * Delete legal aid request
   * DELETE /api/admin/legal-aid/:id
   */
  delete: async (id: string) => {
    return authApi.delete(`/api/admin/legal-aid/${id}`);
  },

  /**
   * Assign lawyer to legal aid request
   * POST /api/admin/legal-aid/:id/assign
   */
  assignLawyer: async (requestId: string, lawyerId: string) => {
    return authApi.post<LegalAidResponse>(`/api/admin/legal-aid/${requestId}/assign`, {
      lawyer_id: lawyerId,
    });
  },

  /**
   * Unassign lawyer from legal aid request
   * DELETE /api/admin/legal-aid/:id/assign
   */
  unassignLawyer: async (requestId: string) => {
    return authApi.delete(`/api/admin/legal-aid/${requestId}/assign`);
  },

  /**
   * Update legal aid request status
   * PATCH /api/admin/legal-aid/:id/status
   */
  updateStatus: async (
    requestId: string,
    status: 'Pending' | 'Assigned' | 'In Progress' | 'Completed' | 'Closed'
  ) => {
    return authApi.patch<LegalAidResponse>(`/api/admin/legal-aid/${requestId}/status`, {
      status,
    });
  },

  /**
   * Update legal aid request priority
   * PATCH /api/admin/legal-aid/:id/priority
   */
  updatePriority: async (requestId: string, priority: 'Low' | 'Medium' | 'High' | 'Urgent') => {
    return authApi.patch<LegalAidResponse>(`/api/admin/legal-aid/${requestId}/priority`, {
      priority,
    });
  },

  /**
   * Get legal aid queue (unassigned requests)
   * GET /api/admin/legal-aid/queue
   */
  getQueue: async () => {
    return authApi.get<LegalAidResponse[]>('/api/admin/legal-aid/queue');
  },

  /**
   * Get legal aid statistics
   * GET /api/admin/legal-aid/statistics
   */
  getStatistics: async () => {
    return authApi.get<{
      total: number;
      pending: number;
      assigned: number;
      inProgress: number;
      completed: number;
      closed: number;
      byPriority: {
        low: number;
        medium: number;
        high: number;
        urgent: number;
      };
    }>('/api/admin/legal-aid/statistics');
  },

  /**
   * Get lawyer workload
   * GET /api/admin/legal-aid/workload
   */
  getWorkload: async () => {
    return authApi.get<
      Array<{
        lawyer_id: string;
        lawyer_name: string;
        active_cases: number;
        completed_cases: number;
        pending_cases: number;
      }>
    >('/api/admin/legal-aid/workload');
  },

  /**
   * Get legal aid request files
   * GET /api/admin/legal-aid/:id/files
   */
  getFiles: async (requestId: string) => {
    return authApi.get(`/api/admin/legal-aid/${requestId}/files`);
  },

  /**
   * Upload legal aid request file (base64 encoded)
   * POST /api/admin/legal-aid/:id/files
   */
  uploadFile: async (requestId: string, file: File, description?: string) => {
    // Convert file to base64
    const base64 = await fileToBase64(file);

    return authApi.post(`/api/admin/legal-aid/${requestId}/files`, {
      name: file.name,
      file_type: file.type,
      file_data: base64,
      description: description || '',
    });
  },

  /**
   * Delete legal aid request file
   * DELETE /api/admin/legal-aid/:id/files/:fileId
   */
  deleteFile: async (requestId: string, fileId: string) => {
    return authApi.delete(`/api/admin/legal-aid/${requestId}/files/${fileId}`);
  },

  /**
   * Add note to legal aid request
   * POST /api/admin/legal-aid/:id/notes
   */
  addNote: async (requestId: string, note: string) => {
    return authApi.post(`/api/admin/legal-aid/${requestId}/notes`, {
      note,
    });
  },

  /**
   * Get legal aid request notes
   * GET /api/admin/legal-aid/:id/notes
   */
  getNotes: async (requestId: string) => {
    return authApi.get(`/api/admin/legal-aid/${requestId}/notes`);
  },
};
