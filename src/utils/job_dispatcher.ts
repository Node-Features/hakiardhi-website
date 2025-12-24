/**
 * Job Dispatcher
 *
 * Routes incoming QStash webhook payloads to the appropriate service
 * based on taskType field. This is the central router for all background jobs.
 */

import { messageJobService } from '@/lib/services/message-job.service';
import { uploadJobService } from '@/lib/services/upload-job.service';
import type { JobProcessingContext, JobProcessingResult } from '@/lib/types/job.types';

export type TaskType = 'message' | 'upload' | 'email' | 'report';

interface BaseJobPayload {
  jobId: string;
  taskType: TaskType;
  entityType: string;
  entityId: string;
}

/**
 * Dispatch job to appropriate service based on taskType
 */
export async function dispatchJob(
  payload: BaseJobPayload & Record<string, any>,
  context: JobProcessingContext
): Promise<JobProcessingResult> {
  const { taskType, jobId } = payload;

  console.log(`🎯 Dispatching ${taskType} job ${jobId}`);

  switch (taskType) {
    case 'message':
      return await messageJobService.processJob(payload, context);

    case 'upload':
      return await uploadJobService.processJob(payload, context);

    // Add more job types here as you expand
    // case 'email':
    //   return await emailJobService.processJob(payload, context);
    
    // case 'report':
      // return await reportJobService.processJob(payload, context);

    default:
      throw new Error(`Unknown task type: ${taskType}`);
  }
}

/**
 * Validate payload has required fields
 */
export function validateJobPayload(payload: any): payload is BaseJobPayload {
  return (
    payload &&
    typeof payload.jobId === 'string' &&
    typeof payload.taskType === 'string' &&
    typeof payload.entityType === 'string' &&
    typeof payload.entityId === 'string'
  );
}
