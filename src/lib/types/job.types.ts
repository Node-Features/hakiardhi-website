/**
 * Type definitions for Background Job Processing System
 * Based on actual database schema
 */

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

// ============================================================================
// Message Jobs (matches actual schema)
// ============================================================================

export interface MessageJob {
  id: string;
  entity_type: string; // 'activity', 'project', 'case'
  entity_id: string;
  job_type: string;
  total_recipients: number;
  success_count: number;
  failed_count: number;
  status: JobStatus;
  created_at: string;
  updated_at: string;
}

export interface MessageJobRecipient {
  id: string;
  job_id: string;
  recipient_id: string | null;
  phone_number: string;
  message: string;
  status: JobStatus;
  attempts: number;
  last_attempt_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Upload Jobs (matches actual schema)
// ============================================================================

export interface UploadJob {
  id: string;
  entity_type: string; // 'activity', 'beneficiary', 'project'
  entity_id: string;
  job_type: string;
  total_files: number;
  success_count: number;
  failed_count: number;
  status: JobStatus;
  created_at: string;
  updated_at: string;
}

export interface UploadJobFile {
  id: string;
  job_id: string;
  original_filename: string;
  file_path: string | null;
  mime_type: string;
  size: number;
  status: JobStatus;
  attempts: number;
  last_attempt_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// QStash Payload Types
// ============================================================================

export interface MessageJobPayload {
  jobId: string;
  entityType: string;
  entityId: string;
  recipients: Array<{
    id: string;
    recipientId: string | null;
    phoneNumber: string;
    message: string;
  }>;
}

export interface UploadJobPayload {
  jobId: string;
  entityType: string;
  entityId: string;
  files: Array<{
    id: string;
    originalFilename: string;
    mimeType: string;
    size: number;
    tempPath: string; // temporary storage location
  }>;
}

// ============================================================================
// Job Processing Types
// ============================================================================

export interface JobProcessingContext {
  jobId: string;
  attemptNumber: number;
  isFinalAttempt: boolean;
  maxRetries: number;
  metadata: {
    messageId: string | null;
    publishedAt: string | null;
    scheduleId: string | null;
  };
}

export interface JobProcessingResult {
  success: boolean;
  processedCount: number;
  failedCount: number;
  errors: Array<{
    itemId: string;
    error: string;
  }>;
}

// ============================================================================
// Dispatcher Types
// ============================================================================

export type JobTaskType = 'message' | 'upload';

export interface JobDispatcherConfig {
  maxRetries: number;
  enableIdempotency: boolean;
}

export const DEFAULT_JOB_CONFIG: JobDispatcherConfig = {
  maxRetries: 3,
  enableIdempotency: true,
};
