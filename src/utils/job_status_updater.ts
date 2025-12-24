/**
 * Job Status Updater Utility
 *
 * Handles updating job statuses in both Postgres and Redis cache
 * Ensures consistency between database and cache
 */


import { supabase } from '@/lib/database/supabase_client';
import { redisService } from '@/lib/services/redis.service';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

interface MessageJobUpdate {
  jobId: string;
  status?: JobStatus;
  successCount?: number;
  failedCount?: number;
}

interface MessageRecipientUpdate {
  recipientId: string;
  jobId: string;
  status: JobStatus;
  errorMessage?: string;
  attemptCount?: number;
}

interface UploadJobUpdate {
  jobId: string;
  status?: JobStatus;
  successCount?: number;
  failedCount?: number;
}

interface UploadFileUpdate {
  fileId: string;
  jobId: string;
  status: JobStatus;
  filePath?: string;
  errorMessage?: string;
  attemptCount?: number;
}

/**
 * Update message job status in Postgres and Redis
 */
export async function updateMessageJobStatus(
  update: MessageJobUpdate
): Promise<void> {
 const db = supabase(false);
  const { jobId, status, successCount, failedCount } = update;

  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (status) updateData.status = status;
    if (successCount !== undefined) updateData.success_count = successCount;
    if (failedCount !== undefined) updateData.failed_count = failedCount;

    // Update Postgres
    const { data, error } = await db
      .from('message_jobs')
      .update(updateData)
      .eq('id', jobId)
      .select()
      .single();

    if (error) {
      console.error(`Failed to update message job ${jobId}:`, error);
      throw error;
    }

    // Update Redis cache
    if (data) {
      await redisService.cacheJobStatus('message', jobId, {
        status: data.status,
        totalCount: data.total_recipients,
        successfulCount: data.success_count,
        failedCount: data.failed_count,
        updatedAt: data.updated_at,
      });
    }

    console.log(`✅ Updated message job ${jobId}: status=${status}`);
  } catch (error) {
    console.error(`❌ Error updating message job ${jobId}:`, error);
    throw error;
  }
}

/**
 * Update message recipient status in Postgres
 */
export async function updateMessageRecipientStatus(
  update: MessageRecipientUpdate
): Promise<void> {
  const db = supabase(false);
  const { recipientId, status, errorMessage, attemptCount } = update;

  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
      last_attempt_at: new Date().toISOString(),
    };

    if (errorMessage) updateData.error_message = errorMessage;
    if (attemptCount !== undefined) updateData.attempts = attemptCount;

    const { error } = await db
      .from('message_job_recipients')
      .update(updateData)
      .eq('id', recipientId);

    if (error) {
      console.error(`Failed to update recipient ${recipientId}:`, error);
      throw error;
    }

    console.log(`✅ Updated recipient ${recipientId}: status=${status}`);

    // Update aggregate job counts
    await updateMessageJobCounts(update.jobId);
  } catch (error) {
    console.error(`❌ Error updating recipient ${recipientId}:`, error);
    throw error;
  }
}

/**
 * Update message job counts based on recipient statuses
 */
async function updateMessageJobCounts(jobId: string): Promise<void> {

  const db = supabase(false);
  try {
    // Get counts by status
    const { data: recipients, error } = await db
      .from('message_job_recipients')
      .select('status')
      .eq('job_id', jobId);

    if (error) throw error;

    const successfulCount = recipients?.filter((r) => r.status === 'completed').length || 0;
    const failedCount = recipients?.filter((r) => r.status === 'failed').length || 0;
    const totalCount = recipients?.length || 0;
    const processingCount = recipients?.filter((r) => r.status === 'processing').length || 0;

    // Determine overall job status
    let jobStatus: JobStatus = 'processing';
    if (successfulCount + failedCount === totalCount) {
      jobStatus = 'completed';
    } else if (processingCount === 0 && failedCount > 0) {
      jobStatus = 'failed';
    }

    // Update job
    await updateMessageJobStatus({
      jobId,
      status: jobStatus,
      successCount: successfulCount,
      failedCount,
    });
  } catch (error) {
    console.error(`❌ Error updating job counts for ${jobId}:`, error);
  }
}

/**
 * Update upload job status in Postgres and Redis
 */
export async function updateUploadJobStatus(
  update: UploadJobUpdate
): Promise<void> {
 const db = supabase(false);
  const { jobId, status, successCount, failedCount } = update;

  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (status) updateData.status = status;
    if (successCount !== undefined) updateData.success_count = successCount;
    if (failedCount !== undefined) updateData.failed_count = failedCount;

    // Update Postgres
    const { data, error } = await db
      .from('upload_jobs')
      .update(updateData)
      .eq('id', jobId)
      .select()
      .single();

    if (error) {
      console.error(`Failed to update upload job ${jobId}:`, error);
      throw error;
    }

    // Update Redis cache
    if (data) {
      await redisService.cacheJobStatus('upload', jobId, {
        status: data.status,
        totalCount: data.total_files,
        successfulCount: data.success_count,
        failedCount: data.failed_count,
        updatedAt: data.updated_at,
      });
    }

    console.log(`✅ Updated upload job ${jobId}: status=${status}`);
  } catch (error) {
    console.error(`❌ Error updating upload job ${jobId}:`, error);
    throw error;
  }
}

/**
 * Update upload file status in Postgres
 */
export async function updateUploadFileStatus(
  update: UploadFileUpdate
): Promise<void> {
  const db = supabase(false);
  const { fileId, status, filePath, errorMessage, attemptCount } = update;

  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
      last_attempt_at: new Date().toISOString(),
    };

    if (filePath) updateData.file_path = filePath;
    if (errorMessage) updateData.error_message = errorMessage;
    if (attemptCount !== undefined) updateData.attempts = attemptCount;

    const { error } = await db
      .from('upload_job_files')
      .update(updateData)
      .eq('id', fileId);

    if (error) {
      console.error(`Failed to update file ${fileId}:`, error);
      throw error;
    }

    console.log(`✅ Updated file ${fileId}: status=${status}`);

    // Update aggregate job counts
    await updateUploadJobCounts(update.jobId);
  } catch (error) {
    console.error(`❌ Error updating file ${fileId}:`, error);
    throw error;
  }
}

/**
 * Update upload job counts based on file statuses
 */
async function updateUploadJobCounts(jobId: string): Promise<void> {
  const db = supabase(false);

  try {
    // Get counts by status
    const { data: files, error } = await db
      .from('upload_job_files')
      .select('status')
      .eq('job_id', jobId);

    if (error) throw error;

    const successfulCount = files?.filter((f) => f.status === 'completed').length || 0;
    const failedCount = files?.filter((f) => f.status === 'failed').length || 0;
    const totalCount = files?.length || 0;
    const processingCount = files?.filter((f) => f.status === 'processing').length || 0;

    // Determine overall job status
    let jobStatus: JobStatus = 'processing';
    if (successfulCount + failedCount === totalCount) {
      jobStatus = 'completed';
    } else if (processingCount === 0 && failedCount > 0) {
      jobStatus = 'failed';
    }

    // Update job
    await updateUploadJobStatus({
      jobId,
      status: jobStatus,
      successCount: successfulCount,
      failedCount,
    });
  } catch (error) {
    console.error(`❌ Error updating job counts for ${jobId}:`, error);
  }
}

/**
 * Record daily job statistics in Redis
 */
export async function recordJobStatistics(
  jobType: 'message' | 'upload',
  status: 'success' | 'failed'
): Promise<void> {
  try {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    await redisService.incrementDailyJobStats(date, jobType, status);
  } catch (error) {
    console.error('Error recording job statistics:', error);
  }
}

/**
 * Get job status from cache or database
 */
export async function getJobStatus(
  jobType: 'message' | 'upload',
  jobId: string
): Promise<any> {
  try {
    // Try cache first
    const cached = await redisService.getCachedJobStatus(jobType, jobId);
    if (cached) {
      return cached;
    }

    // Fallback to database
    const db = supabase(false);
    const tableName = jobType === 'message' ? 'message_jobs' : 'upload_jobs';

    const { data, error } = await db
      .from(tableName)
      .select('*')
      .eq('id', jobId)
      .single();

    if (error || !data) {
      return null;
    }

    // Cache for future requests
    await redisService.cacheJobStatus(jobType, jobId, {
      status: data.status,
      totalCount:
        jobType === 'message' ? data.total_recipients : data.total_files,
      successfulCount: data.successful_count,
      failedCount: data.failed_count,
      updatedAt: data.updated_at,
    });

    return data;
  } catch (error) {
    console.error(`Error getting job status for ${jobId}:`, error);
    return null;
  }
}
