import { authApi } from '../interceptors';
import {
  IncidentResponse,
  CreateIncidentRequest,
  UpdateIncidentRequest,
  PaginatedResponse,
} from '@/types/api';
import { fileToBase64 } from '@/lib/utils/file';

/**
 * Incidents API Service
 * All endpoints for incident reporting and management
 */
export const incidentsService = {
  /**
   * Get all incidents with pagination and filters
   * GET /api/admin/incidents
   */
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    incident_type?: string;
    assigned_to?: string;
    reported_by?: string;
  }) => {
    const searchParams = new URLSearchParams(
      params as Record<string, string>
    ).toString();

    return authApi.get<PaginatedResponse<IncidentResponse>>(
      `/api/admin/incidents${searchParams ? `?${searchParams}` : ''}`
    );
  },

  /**
   * Get single incident by ID
   * GET /api/admin/incidents/:id
   */
  getById: async (id: string) => {
    return authApi.get<IncidentResponse>(`/api/admin/incidents/${id}`);
  },

  /**
   * Create new incident
   * POST /api/admin/incidents
   */
  create: async (data: CreateIncidentRequest) => {
    return authApi.post<IncidentResponse>('/api/admin/incidents', data);
  },

  /**
   * Update incident
   * PUT /api/admin/incidents/:id
   */
  update: async (id: string, data: UpdateIncidentRequest) => {
    return authApi.put<IncidentResponse>(`/api/admin/incidents/${id}`, data);
  },

  /**
   * Delete incident
   * DELETE /api/admin/incidents/:id
   */
  delete: async (id: string) => {
    return authApi.delete(`/api/admin/incidents/${id}`);
  },

  /**
   * Assign staff to incident
   * POST /api/admin/incidents/:id/assign
   */
  assignStaff: async (incidentId: string, staffId: string) => {
    return authApi.post<IncidentResponse>(`/api/admin/incidents/${incidentId}/assign`, {
      staff_id: staffId,
    });
  },

  /**
   * Unassign staff from incident
   * DELETE /api/admin/incidents/:id/assign
   */
  unassignStaff: async (incidentId: string) => {
    return authApi.delete(`/api/admin/incidents/${incidentId}/assign`);
  },

  /**
   * Update incident status
   * PATCH /api/admin/incidents/:id/status
   */
  updateStatus: async (
    incidentId: string,
    status: 'Reported' | 'Under Investigation' | 'Resolved' | 'Closed'
  ) => {
    return authApi.patch<IncidentResponse>(`/api/admin/incidents/${incidentId}/status`, {
      status,
    });
  },

  /**
   * Update incident priority
   * PATCH /api/admin/incidents/:id/priority
   */
  updatePriority: async (incidentId: string, priority: 'Low' | 'Medium' | 'High' | 'Critical') => {
    return authApi.patch<IncidentResponse>(`/api/admin/incidents/${incidentId}/priority`, {
      priority,
    });
  },

  /**
   * Update incident resolution
   * PATCH /api/admin/incidents/:id/resolution
   */
  updateResolution: async (incidentId: string, resolution: string) => {
    return authApi.patch<IncidentResponse>(`/api/admin/incidents/${incidentId}/resolution`, {
      resolution,
    });
  },

  /**
   * Get incident statistics
   * GET /api/admin/incidents/stats
   */
  getStats: async () => {
    return authApi.get<{
      totalIncidents: number;
      openIncidents: number;
      closedIncidents: number;
      averageResolutionTime: string;
    }>('/api/admin/incidents/stats');
  },

  /**
   * Get incident files
   * GET /api/admin/incidents/:id/files
   */
  getFiles: async (incidentId: string): Promise<{ data: any[] }> => {
    return authApi.get(`/api/admin/incidents/${incidentId}/files`);
  },

  /**
   * Upload incident file (base64 encoded)
   * POST /api/admin/incidents/:id/files
   */
  uploadFile: async (incidentId: string, file: File, description?: string) => {
    const base64 = await fileToBase64(file);

    return authApi.post(`/api/admin/incidents/${incidentId}/files`, {
      name: file.name,
      file_type: file.type,
      file_data: base64,
      description: description || '',
    });
  },

  /**
   * Delete incident file
   * DELETE /api/admin/incidents/:id/files/:fileId
   */
  deleteFile: async (incidentId: string, fileId: string) => {
    return authApi.delete(`/api/admin/incidents/${incidentId}/files/${fileId}`);
  },

  /**
   * Add note to incident
   * POST /api/admin/incidents/:id/notes
   */
  addNote: async (incidentId: string, note: string) => {
    return authApi.post(`/api/admin/incidents/${incidentId}/notes`, {
      note,
    });
  },

  /**
   * Get incident notes
   * GET /api/admin/incidents/:id/notes
   */
  getNotes: async (incidentId: string): Promise<{ data: any[] }> => {
    return authApi.get(`/api/admin/incidents/${incidentId}/notes`);
  },

  /**
   * Get incident location details
   * GET /api/admin/incidents/:id/location
   */
  getLocation: async (incidentId: string) => {
    return authApi.get(`/api/admin/incidents/${incidentId}/location`);
  },

  /**
   * Add witness to incident
   * POST /api/admin/incidents/:id/witnesses
   */
  addWitness: async (
    incidentId: string,
    witness: {
      name: string;
      contact_info?: string;
      statement?: string;
    }
  ) => {
    return authApi.post(`/api/admin/incidents/${incidentId}/witnesses`, witness);
  },

  /**
   * Get incident witnesses
   * GET /api/admin/incidents/:id/witnesses
   */
  getWitnesses: async (incidentId: string) => {
    return authApi.get(`/api/admin/incidents/${incidentId}/witnesses`);
  },

  /**
   * Remove witness from incident
   * DELETE /api/admin/incidents/:id/witnesses/:witnessId
   */
  removeWitness: async (incidentId: string, witnessId: string) => {
    return authApi.delete(`/api/admin/incidents/${incidentId}/witnesses/${witnessId}`);
  },

  /**
   * Get related incidents
   * GET /api/admin/incidents/:id/related
   */
  getRelated: async (incidentId: string) => {
    return authApi.get<IncidentResponse[]>(`/api/admin/incidents/${incidentId}/related`);
  },

  /**
   * Get incident investigations
   * GET /api/admin/incidents/:id/investigations
   */
  getInvestigations: async (incidentId: string): Promise<{ data: any[] }> => {
    return authApi.get(`/api/admin/incidents/${incidentId}/investigations`);
  },
};
