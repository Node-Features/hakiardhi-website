import { authApi } from '../interceptors';
import {
  CaseResponse,
  CreateCaseRequest,
  UpdateCaseRequest,
  PaginatedResponse,
} from '@/types/api';
import { fileToBase64 } from '@/lib/utils/file';

/**
 * Cases API Service
 * All endpoints for court case management
 */
export const casesService = {
  /**
   * Get all cases with pagination and filters
   * GET /api/admin/cases
   */
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    case_type?: string;
    lawyer_id?: string;
    submitted_by?: string;
  }) => {
    const searchParams = new URLSearchParams(
      params as Record<string, string>
    ).toString();

    return authApi.get<PaginatedResponse<CaseResponse>>(
      `/api/admin/cases${searchParams ? `?${searchParams}` : ''}`
    );
  },

  /**
   * Get single case by ID
   * GET /api/admin/cases/:id
   */
  getById: async (id: string) => {
    return authApi.get<CaseResponse>(`/api/admin/cases/${id}`);
  },

  /**
   * Create new case
   * POST /api/admin/cases
   */
  create: async (data: CreateCaseRequest) => {
    return authApi.post<CaseResponse>('/api/admin/cases', data);
  },

  /**
   * Update case
   * PUT /api/admin/cases/:id
   */
  update: async (id: string, data: UpdateCaseRequest) => {
    return authApi.put<CaseResponse>(`/api/admin/cases/${id}`, data);
  },

  /**
   * Delete case
   * DELETE /api/admin/cases/:id
   */
  delete: async (id: string) => {
    return authApi.delete(`/api/admin/cases/${id}`);
  },

  /**
   * Assign lawyer to case
   * POST /api/admin/cases/:id/assign
   */
  assignLawyer: async (caseId: string, lawyerId: string) => {
    return authApi.post<CaseResponse>(`/api/admin/cases/${caseId}/assign`, {
      lawyer_id: lawyerId,
    });
  },

  /**
   * Unassign lawyer from case
   * DELETE /api/admin/cases/:id/assign
   */
  unassignLawyer: async (caseId: string) => {
    return authApi.delete(`/api/admin/cases/${caseId}/assign`);
  },

  /**
   * Update case status
   * PATCH /api/admin/cases/:id/status
   */
  updateStatus: async (
    caseId: string,
    status: 'Open' | 'In Progress' | 'Pending' | 'Resolved' | 'Closed'
  ) => {
    return authApi.patch<CaseResponse>(`/api/admin/cases/${caseId}/status`, {
      status,
    });
  },

  /**
   * Update case outcome
   * PATCH /api/admin/cases/:id/outcome
   */
  updateOutcome: async (caseId: string, outcome: string) => {
    return authApi.patch<CaseResponse>(`/api/admin/cases/${caseId}/outcome`, {
      outcome,
    });
  },

  /**
   * Get case statistics
   * GET /api/admin/cases/stats
   */
  getStats: async () => {
    return authApi.get<{
      totalCases: number;
      openCases: number;
      closedCases: number;
      averageResolutionTime: string;
    }>('/api/admin/cases/stats');
  },

  /**
   * Get case files
   * GET /api/admin/cases/:id/files
   */
  getFiles: async (caseId: string): Promise<{ data: any[] }> => {
    return authApi.get(`/api/admin/cases/${caseId}/files`);
  },

  /**
   * Upload case file (base64 encoded)
   * POST /api/admin/cases/:id/files
   */
  uploadFile: async (caseId: string, file: File, description?: string) => {
    // Convert file to base64
    const base64 = await fileToBase64(file);

    return authApi.post(`/api/admin/cases/${caseId}/files`, {
      name: file.name,
      file_type: file.type,
      file_data: base64,
      description: description || '',
    });
  },

  /**
   * Delete case file
   * DELETE /api/admin/cases/:id/files/:fileId
   */
  deleteFile: async (caseId: string, fileId: string) => {
    return authApi.delete(`/api/admin/cases/${caseId}/files/${fileId}`);
  },

  /**
   * Add note to case
   * POST /api/admin/cases/:id/notes
   */
  addNote: async (caseId: string, note: string) => {
    return authApi.post(`/api/admin/cases/${caseId}/notes`, {
      note,
    });
  },

  /**
   * Get case notes
   * GET /api/admin/cases/:id/notes
   */
  getNotes: async (caseId: string): Promise<{ data: any[] }> => {
    return authApi.get(`/api/admin/cases/${caseId}/notes`);
  },

  /**
   * Get case parties (plaintiffs, defendants)
   * GET /api/admin/cases/:id/parties
   */
  getParties: async (caseId: string): Promise<{ data: any[] }> => {
    return authApi.get(`/api/admin/cases/${caseId}/parties`);
  },

  /**
   * Add party to case
   * POST /api/admin/cases/:id/parties
   */
  addParty: async (
    caseId: string,
    party: {
      name: string;
      role: 'Plaintiff' | 'Defendant' | 'Witness' | 'Other';
      contact_info?: string;
    }
  ) => {
    return authApi.post(`/api/admin/cases/${caseId}/parties`, party);
  },

  /**
   * Remove party from case
   * DELETE /api/admin/cases/:id/parties/:partyId
   */
  removeParty: async (caseId: string, partyId: string) => {
    return authApi.delete(`/api/admin/cases/${caseId}/parties/${partyId}`);
  },

  /**
   * Get case stages
   * GET /api/admin/cases/:id/stages
   */
  getStages: async (caseId: string): Promise<{ data: any[] }> => {
    return authApi.get(`/api/admin/cases/${caseId}/stages`);
  },

  /**
   * Create case stage (for referrals, status updates, etc.)
   * POST /api/admin/cases/:id/stages
   */
  createStage: async (
    caseId: string,
    stage: {
      name: string;
      description: string;
      status: 'Ongoing' | 'Resolved' | 'Blocked';
      next_stage?: string;
    }
  ): Promise<{ data: any }> => {
    console.log('📤 API Service - Creating stage:', {
      endpoint: `/api/admin/cases/${caseId}/stages`,
      payload: stage,
    });
    return authApi.post(`/api/admin/cases/${caseId}/stages`, stage);
  },

  /**
   * Refer case to another entity (creates a referral stage)
   * POST /api/admin/cases/:id/stages
   */
  referCase: async (
    caseId: string,
    referralData: {
      referred_to: string;
      reason: string;
      notes?: string;
    }
  ) => {
    return authApi.post(`/api/admin/cases/${caseId}/stages`, {
      name: `Referred to ${referralData.referred_to}`,
      description: `Case referred to ${referralData.referred_to}. Reason: ${referralData.reason}${referralData.notes ? `\n\nAdditional Notes: ${referralData.notes}` : ''}`,
      status: 'Ongoing',
      next_stage: referralData.referred_to,
    });
  },

  /**
   * Get single stage details
   * GET /api/admin/cases/:id/stages/:stageId
   */
  getStageById: async (caseId: string, stageId: string) => {
    return authApi.get(`/api/admin/cases/${caseId}/stages/${stageId}`);
  },

  /**
   * Update case stage
   * PUT /api/admin/cases/:id/stages/:stageId
   */
  updateStage: async (
    caseId: string,
    stageId: string,
    data: {
      name?: string;
      description?: string;
      status?: 'Ongoing' | 'Resolved' | 'Blocked';
      next_stage?: string;
    }
  ) => {
    return authApi.put(`/api/admin/cases/${caseId}/stages/${stageId}`, data);
  },

  /**
   * Delete case stage
   * DELETE /api/admin/cases/:id/stages/:stageId
   */
  deleteStage: async (caseId: string, stageId: string) => {
    return authApi.delete(`/api/admin/cases/${caseId}/stages/${stageId}`);
  },

  /**
   * Upload stage attachment
   * POST /api/admin/cases/:id/stages/:stageId/attachments
   */
  uploadStageAttachment: async (
    caseId: string,
    stageId: string,
    file: File,
    description?: string
  ) => {
    // Convert file to base64
    const base64 = await fileToBase64(file);

    return authApi.post(`/api/admin/cases/${caseId}/stages/${stageId}/attachments`, {
      file_name: file.name,
      file_type: file.type,
      file_data: base64,
      description: description || '',
    });
  },
};
