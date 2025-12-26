import { authApi } from '../interceptors';
import {
  ActivityResponse,
  CreateActivityRequest,
  UpdateActivityRequest,
  PaginatedResponse,
} from '@/types/api';
import { fileToBase64 } from '@/lib/utils/file';

/**
 * Activities API Service
 * All endpoints for activity management
 */
export const activitiesService = {
  /**
   * Get all activities with pagination and filters
   * GET /api/admin/activities
   */
  getAll: async (params?: {
    page?: number;
    limit?: number;
    project_id?: string;
    status?: string;
    activity_type?: string;
  }) => {
    const searchParams = new URLSearchParams(
      params as Record<string, string>
    ).toString();

    return authApi.get<PaginatedResponse<ActivityResponse>>(
      `/api/admin/activities${searchParams ? `?${searchParams}` : ''}`
    );
  },

  /**
   * Get single activity by ID
   * GET /api/admin/activities/:id
   */
  getById: async (id: string) => {
    return authApi.get<ActivityResponse>(`/api/admin/activities/${id}`);
  },

  /**
   * Create new activity
   * POST /api/admin/activities
   */
  create: async (data: CreateActivityRequest) => {
    return authApi.post<ActivityResponse>('/api/admin/activities', data);
  },

  /**
   * Update activity
   * PUT /api/admin/activities/:id
   */
  update: async (id: string, data: UpdateActivityRequest) => {
    return authApi.put<ActivityResponse>(`/api/admin/activities/${id}`, data);
  },

  /**
   * Reschedule activity
   * PUT /api/admin/activities/:id
   */
  reschedule: async (id: string, data: { start_date: string; end_date?: string }) => {
    return authApi.put<ActivityResponse>(`/api/admin/activities/${id}`, {
      ...data,
      status: 'Rescheduled',
    });
  },

  /**
   * Assign staff to activity
   * POST /api/admin/activities/:id/assign
   */
  assignStaff: async (activityId: string, staffIds: string[]) => {
    return authApi.post(`/api/admin/activities/${activityId}/assign`, {
      staff_ids: staffIds,
    });
  },

  /**
   * Add beneficiaries to activity
   * POST /api/admin/activities/:id/beneficiaries
   */
  addBeneficiaries: async (activityId: string, beneficiaryIds: string[]) => {
    return authApi.post(`/api/admin/activities/${activityId}/beneficiaries`, {
      beneficiary_ids: beneficiaryIds,
    });
  },

  /**
   * Add single beneficiary to activity
   * POST /api/admin/activities/:id/beneficiaries
   */
  addBeneficiary: async (
    activityId: string,
    data: {
      beneficiary_id: string;
      role_in_activity?: string;
    }
  ) => {
    return authApi.post(`/api/admin/activities/${activityId}/beneficiaries`, data);
  },

  /**
   * Update beneficiary in activity
   * PUT /api/admin/activities/:id/beneficiaries
   */
  updateBeneficiary: async (
    activityId: string,
    data: {
      beneficiary_id: string;
      attended?: boolean;
      role_in_activity?: string;
      feedback?: string;
    }
  ) => {
    return authApi.put(`/api/admin/activities/${activityId}/beneficiaries`, data);
  },

  /**
   * Remove beneficiary from activity
   * DELETE /api/admin/activities/:id/beneficiaries/:beneficiaryId
   */
  removeBeneficiary: async (activityId: string, beneficiaryId: string) => {
    return authApi.delete(`/api/admin/activities/${activityId}/beneficiaries/${beneficiaryId}`);
  },

  /**
   * Update activity outcome
   * PATCH /api/admin/activities/:id
   */
  updateOutcome: async (
    activityId: string,
    outcome: {
      actual_outcome?: string;
      status?: 'Planned' | 'Ongoing' | 'Completed' | 'Cancelled';
    }
  ) => {
    return authApi.patch<ActivityResponse>(`/api/admin/activities/${activityId}`, outcome);
  },

  /**
   * Get activity locations
   * GET /api/admin/activities/:id/locations
   */
  getLocations: async (activityId: string) => {
    return authApi.get(`/api/admin/activities/${activityId}/locations`);
  },

  /**
   * Add location to activity
   * POST /api/admin/activities/:id/locations
   */
  addLocation: async (
    activityId: string,
    location: {
      region_id: string;
      district_id: string;
      village_id: string;
      start_date: string;
      end_date: string;
    }
  ) => {
    return authApi.post(`/api/admin/activities/${activityId}/locations`, location);
  },

  /**
   * Remove location from activity
   * DELETE /api/admin/activities/:id/locations/:locationId
   */
  removeLocation: async (activityId: string, locationId: string) => {
    return authApi.delete(`/api/admin/activities/${activityId}/locations/${locationId}`);
  },

  /**
   * Get activity files
   * GET /api/admin/activities/:id/files
   */
  getFiles: async (activityId: string) => {
    return authApi.get(`/api/admin/activities/${activityId}/files`);
  },

  /**
   * Upload activity file (base64 encoded)
   * POST /api/admin/activities/:id/files
   */
  uploadFile: async (activityId: string, file: File, description?: string) => {
    // Convert file to base64
    const base64 = await fileToBase64(file);

    return authApi.post(`/api/admin/activities/${activityId}/files`, {
      name: file.name,
      file_type: file.type,
      file_data: base64,
      description: description || '',
    });
  },

  /**
   * Delete activity file
   * DELETE /api/admin/activities/:id/files/:fileId
   */
  deleteFile: async (activityId: string, fileId: string) => {
    return authApi.delete(`/api/admin/activities/${activityId}/files/${fileId}`);
  },

  /**
   * Get activity staff assignments
   * GET /api/admin/activities/:id/staff
   */
  getStaff: async (activityId: string) => {
    return authApi.get(`/api/admin/activities/${activityId}/staff`);
  },

  /**
   * Get activity beneficiaries
   * GET /api/admin/activities/:id/beneficiaries
   */
  getBeneficiaries: async (activityId: string) => {
    return authApi.get(`/api/admin/activities/${activityId}/beneficiaries`);
  },

  /**
   * Get activity assignments
   * GET /api/admin/activities/:id/assignments
   */
  getAssignments: async (activityId: string) => {
    return authApi.get(`/api/admin/activities/${activityId}/assignments`);
  },

  /**
   * Create activity assignment
   * POST /api/admin/activities/:id/assignments
   */
  createAssignment: async (
    activityId: string,
    data: {
      assigned_to: string;
      due_date: string;
      project_location_id?: string;
      status?: 'Pending' | 'In progress' | 'Completed';
    }
  ) => {
    return authApi.post(`/api/admin/activities/${activityId}/assignments`, {
      ...data,
      status: data.status || 'Pending',
    });
  },

  /**
   * Update activity assignment status
   * PUT /api/admin/activities/:id/assignments
   */
  updateAssignment: async (
    activityId: string,
    data: {
      assignment_id: string;
      status: 'Pending' | 'In progress' | 'Completed';
    }
  ) => {
    return authApi.put(`/api/admin/activities/${activityId}/assignments`, data);
  },
};
