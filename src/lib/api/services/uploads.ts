import { authApi } from '../interceptors';
import { UploadJobResponse, PaginatedResponse } from '@/types/api';
import { fileToBase64 } from '@/lib/utils/file';

/**
 * Upload Jobs API Service
 * All endpoints for bulk data upload management
 */
export const uploadsService = {
  /**
   * Get all upload jobs with pagination and filters
   * GET /api/admin/uploads
   */
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    upload_type?: string;
  }) => {
    const searchParams = new URLSearchParams(
      params as Record<string, string>
    ).toString();

    return authApi.get<PaginatedResponse<UploadJobResponse>>(
      `/api/admin/uploads${searchParams ? `?${searchParams}` : ''}`
    );
  },

  /**
   * Get single upload job by ID
   * GET /api/admin/uploads/:id
   */
  getById: async (id: string) => {
    return authApi.get<UploadJobResponse>(`/api/admin/uploads/${id}`);
  },

  /**
   * Upload CSV file for bulk import (base64 encoded)
   * POST /api/admin/uploads
   *
   * Note: API accepts files in base64 format
   */
  uploadFile: async (
    file: File,
    uploadType: 'beneficiaries' | 'activities' | 'projects' | 'incidents'
  ) => {
    const base64 = await fileToBase64(file);

    return authApi.post<UploadJobResponse>('/api/admin/uploads', {
      name: file.name,
      file_type: file.type,
      file_data: base64,
      upload_type: uploadType,
    });
  },

  /**
   * Get upload job status
   * GET /api/admin/uploads/:id/status
   */
  getStatus: async (id: string) => {
    return authApi.get<{
      status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
      progress: number;
      total_rows: number;
      processed_rows: number;
      failed_rows: number;
      error_message?: string;
    }>(`/api/admin/uploads/${id}/status`);
  },

  /**
   * Cancel upload job
   * POST /api/admin/uploads/:id/cancel
   */
  cancel: async (id: string) => {
    return authApi.post<UploadJobResponse>(`/api/admin/uploads/${id}/cancel`);
  },

  /**
   * Retry failed upload job
   * POST /api/admin/uploads/:id/retry
   */
  retry: async (id: string) => {
    return authApi.post<UploadJobResponse>(`/api/admin/uploads/${id}/retry`);
  },

  /**
   * Delete upload job
   * DELETE /api/admin/uploads/:id
   */
  delete: async (id: string) => {
    return authApi.delete(`/api/admin/uploads/${id}`);
  },

  /**
   * Get upload job errors
   * GET /api/admin/uploads/:id/errors
   */
  getErrors: async (id: string) => {
    return authApi.get<
      Array<{
        row_number: number;
        error_message: string;
        row_data: Record<string, unknown>;
      }>
    >(`/api/admin/uploads/${id}/errors`);
  },

  /**
   * Download upload template
   * GET /api/admin/uploads/template/:type
   */
  downloadTemplate: async (
    uploadType: 'beneficiaries' | 'activities' | 'projects' | 'incidents'
  ) => {
    return authApi.get<{ file_url: string }>(
      `/api/admin/uploads/template/${uploadType}`
    );
  },

  /**
   * Get upload statistics
   * GET /api/admin/uploads/stats
   */
  getStats: async () => {
    return authApi.get<{
      total: number;
      pending: number;
      processing: number;
      completed: number;
      failed: number;
      totalRowsProcessed: number;
      totalRowsFailed: number;
    }>('/api/admin/uploads/stats');
  },

  /**
   * Validate CSV file before upload (base64 encoded)
   * POST /api/admin/uploads/validate
   *
   * Note: API accepts files in base64 format
   */
  validateFile: async (
    file: File,
    uploadType: 'beneficiaries' | 'activities' | 'projects' | 'incidents'
  ) => {
    const base64 = await fileToBase64(file);

    return authApi.post<{
      is_valid: boolean;
      errors: Array<{
        row_number: number;
        column: string;
        error_message: string;
      }>;
      total_rows: number;
      valid_rows: number;
    }>('/api/admin/uploads/validate', {
      name: file.name,
      file_type: file.type,
      file_data: base64,
      upload_type: uploadType,
    });
  },

  /**
   * Download error report for failed upload
   * GET /api/admin/uploads/:id/error-report
   */
  downloadErrorReport: async (id: string) => {
    return authApi.get<{ file_url: string }>(
      `/api/admin/uploads/${id}/error-report`
    );
  },
};
