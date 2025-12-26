import { supabase } from '@/lib/database/supabase_client';
import { qstashService } from '@/lib/services/qstash.service';
import { redisService } from '@/lib/services/redis.service';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface BackgroundTaskConfig<TJobData = any, TItemData = any> {
  jobTable: string;
  itemsTable: string;
  taskType: string;
  entityType: string;
  entityId?: string;
  jobType: string;
  title?: string;
  jobData?: TJobData;
  items: TItemData[];
  mapItemToRecord: (item: TItemData, jobId: string) => Record<string, any>;
  qstashOptions?: { retries?: number; delaySeconds?: number };
  additionalPayload?: Record<string, any>;
  supabaseClient?: SupabaseClient;
  enableInitialCaching?: boolean;
  onError?: (error: Error, phase: 'job_creation' | 'items_creation' | 'qstash_publish') => void | Promise<void>;
  onSuccess?: (result: BackgroundTaskResult) => void | Promise<void>;
}

export interface BackgroundTaskResult {
  success: boolean;
  job?: any;
  jobId?: string;
  itemCount?: number;
  error?: string;
  errorDetails?: any;
  errorPhase?: 'job_creation' | 'items_creation' | 'qstash_publish';
  warning?: string;
}

export async function offloadBackgroundTask<TJobData = any, TItemData = any>(
  config: BackgroundTaskConfig<TJobData, TItemData>
): Promise<BackgroundTaskResult> {
  const {
    jobTable, itemsTable, taskType, entityType, entityId, jobType,
    title, jobData, items, mapItemToRecord, qstashOptions = {},
    additionalPayload = {}, enableInitialCaching = false, onError, onSuccess
  } = config;

  if (!items || items.length === 0) return { success: false, error: 'No items provided', errorPhase: 'job_creation' };

  const db = supabase(false);

  try {
    // Build the job record without title for upload_jobs table
    const jobRecord: Record<string, any> = {
      entity_type: entityType,
      job_type: jobType,
      status: 'pending',
      success_count: 0,
      failed_count: 0,
      ...jobData,
      entity_id: entityId,
      payload: items
    };

    // Only add title if it's provided and not for upload_jobs
    if (title && jobTable !== 'upload_jobs') {
      jobRecord.title = title;
    }

    const { data: job, error: jobError } = await db
      .from(jobTable)
      .insert(jobRecord)
      .select()
      .single();

    if (jobError) {
      onError && await onError(new Error(jobError.message), 'job_creation');
      return { success: false, error: 'Failed to create job', errorDetails: jobError, errorPhase: 'job_creation' };
    }

    const { error: itemsError } = await db.from(itemsTable).insert(items.map(item => mapItemToRecord(item, job.id)));
    if (itemsError) {
      await db.from(jobTable).delete().eq('id', job.id);
      onError && await onError(new Error(itemsError.message), 'items_creation');
      return { success: false, error: 'Failed to create item records', errorDetails: itemsError, errorPhase: 'items_creation' };
    }

    if (enableInitialCaching) {
      try {
        await redisService.cacheJobStatus(taskType as 'message' | 'upload', job.id, {
          status: job.status, totalCount: items.length, successfulCount: 0, failedCount: 0, updatedAt: job.created_at
        });
      } catch {}
    }

    try {
      await qstashService.publishJob(taskType, { jobId: job.id, entityType, entityId: entityId || '', ...additionalPayload }, qstashOptions);
    } catch (publishError: any) {
      onError && await onError(publishError, 'qstash_publish');
      return { success: true, job, jobId: job.id, itemCount: items.length, warning: 'Job created but not queued', errorDetails: publishError, errorPhase: 'qstash_publish' };
    }

    const result: BackgroundTaskResult = { success: true, job, jobId: job.id, itemCount: items.length };
    onSuccess && await onSuccess(result);
    return result;

  } catch (error: any) {
    return { success: false, error: error.message || 'Unexpected error', errorDetails: error };
  }
}

// Convenience wrapper for message jobs
export const offloadMessageJob = (params: { entityType: string; entityId?: string; jobType: string; title?: string; recipients: any; qstashOptions?: any; supabaseClient?: SupabaseClient; onError?: any; onSuccess?: any; }) => {
  const recipientsArray = Array.isArray(params.recipients) ? params.recipients :
    params.recipients?.users?.map((u: any) => ({ recipient_id: u.id, dest_addr: u.phone_number, message: `You have a task.` })) || [];

  return offloadBackgroundTask({
    jobTable: 'message_jobs',
    itemsTable: 'message_job_recipients',
    taskType: 'message',
    entityType: params.entityType,
    entityId: params.entityId,
    jobType: params.jobType,
    title: params.title,
    items: recipientsArray,
    mapItemToRecord: (r, jobId) => ({ job_id: jobId, recipient_id: r.recipient_id, phone_number: r.dest_addr, message: r.message, status: 'pending' }),
    qstashOptions: params.qstashOptions,
    supabaseClient: params.supabaseClient,
    enableInitialCaching: true,
    onError: params.onError,
    onSuccess: params.onSuccess
  });
};

// Convenience wrapper for upload jobs
export const offloadUploadJob = (params: {
  entityType: string;
  entityId?: string;
  jobType: string;
  title?: string;
  files: any;
  stageId?: string;
  additionalPayload?: Record<string, any>;
  qstashOptions?: any;
  supabaseClient?: SupabaseClient;
  onError?: any;
  onSuccess?: any;
}) => {
  const filesArray = Array.isArray(params.files) ? params.files :
    params.files?.files?.map((f: any) => ({
      file_name: f.file_name,
      file_data: f.file_data,
      mime_type: f.file_type,
      size: f.size,
      description: f.description,
      status: 'pending'
    })) || [];

  // Merge additionalPayload with stageId if present
  const mergedPayload = {
    ...(params.stageId ? { stageId: params.stageId } : {}),
    ...(params.additionalPayload || {})
  };

  return offloadBackgroundTask({
    jobTable: 'upload_jobs',
    itemsTable: 'upload_job_files',
    taskType: 'upload',
    entityType: params.entityType,
    entityId: params.entityId,
    jobType: params.jobType,
    title: params.title,
    jobData: { total_files: filesArray.length },
    items: filesArray,
    mapItemToRecord: (f, jobId) => ({
      job_id: jobId,
      original_filename: f.file_name,
      file_path: f.file_data,
      mime_type: f.mime_type,
      size: f.size,
      status: 'pending'
    }),
    additionalPayload: mergedPayload,
    qstashOptions: params.qstashOptions,
    supabaseClient: params.supabaseClient,
    enableInitialCaching: true,
    onError: params.onError,
    onSuccess: params.onSuccess
  });
};

export function createJobResponse(result: BackgroundTaskResult) {
  if (!result.success) return { success: false, error: result.error, details: result.errorDetails };
  return { success: true, jobId: result.jobId, itemCount: result.itemCount, warning: result.warning, status: 'pending' };
}

