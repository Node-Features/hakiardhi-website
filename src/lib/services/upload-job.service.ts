import { redisService } from './redis.service';
import { processFile } from '@/utils/file_processor';
import {
  updateUploadFileStatus,
  updateUploadJobStatus,
  recordJobStatistics,
} from '@/utils/job_status_updater';
import { dispatchFiles, FileEntityType, FileRecordInput } from '@/utils/entity_dispacher';
import type { JobProcessingContext, JobProcessingResult } from '@/lib/types/job.types';
import { supabase } from '../database/supabase_client';

const db = supabase(false);

export class UploadJobService {
  async processJob(
    payload: any,
    context: JobProcessingContext
  ): Promise<JobProcessingResult> {
    const { jobId, entityType, entityId, stageId, project_id } = payload;
    const { attemptNumber, isFinalAttempt } = context;

    console.log(`📦 Processing upload job: ${jobId}`, { entityType, entityId, project_id });

    const { data: files, error } = await db
      .from('upload_job_files')
      .select('*')
      .eq('job_id', jobId)
      .eq('status', 'pending');

    if (error || !files || files.length === 0) {
      console.log(`⚠️  No pending files found for job ${jobId}`);
      return { success: true, processedCount: 0, failedCount: 0, errors: [] };
    }

    await updateUploadJobStatus({ jobId, status: 'processing' });

    // Process all files in parallel
    const results = await Promise.allSettled(
      files.map(file =>
        this.processFile(file, entityType, entityId, stageId, attemptNumber, isFinalAttempt)
      )
    );

    let successCount = 0;
    let failCount = 0;
    const errors: Array<{ itemId: string; error: string }> = [];
    const processedRecords: FileRecordInput[] = [];

    results.forEach((result, idx) => {
      const file = files[idx];
      if (result.status === 'fulfilled') {
        successCount++;
        const processedFile = result.value;
        processedRecords.push({
          file_url: processedFile.processedUrl,
          file_name: processedFile.fileName,
          file_type: processedFile.fileType,
          size: processedFile.fileSize,
          description: file.description || null,
          status: 'processed',
        });
      } else {
        failCount++;
        const errorMessage = result.reason instanceof Error ? result.reason.message : 'Unknown error';
        errors.push({ itemId: file.id, error: errorMessage });
      }
    });

    // Dispatch processed files to their respective entity table
    if (processedRecords.length > 0) {
      try {
        await dispatchFiles({
          entityType: entityType as FileEntityType,
          entityId,
          stageId,
          project_id,
          files: processedRecords,
        });
      } catch (dispatchError) {
        console.error('Failed to dispatch processed files:', dispatchError);
      }
    }

    if (successCount > 0) await recordJobStatistics('upload', 'success');
    if (failCount > 0 && isFinalAttempt) await recordJobStatistics('upload', 'failed');

    console.log(`📊 Job ${jobId} complete: ${successCount} uploaded, ${failCount} failed`);

    return {
      success: failCount === 0,
      processedCount: successCount,
      failedCount: failCount,
      errors,
    };
  }

  private async processFile(
    file: any,
    entityType: string,
    entityId: string,
    stageId: string | undefined,
    attemptNumber: number,
    isFinalAttempt: boolean
  ): Promise<{ processedUrl: string; fileName: string; fileType: string; fileSize: number }> {
    const { id: fileId, job_id: jobId, original_filename, mime_type, size, file_path } = file;

    if (await redisService.checkIdempotency(jobId, fileId, attemptNumber)) {
      console.log(`⏭️ Skipping duplicate file ${fileId}`);
      return { processedUrl: '', fileName: original_filename, fileType: mime_type, fileSize: size };
    }

    await updateUploadFileStatus({ fileId, jobId, status: 'processing' });

    try {
      const fileBuffer = await this.readTempFile(file_path);

      const processed = await processFile(fileBuffer, original_filename, mime_type, {
        entityType,
        entityId,
        resizeImages: true,
        scanViruses: false,
      });

      await updateUploadFileStatus({
        fileId,
        jobId,
        status: 'completed',
        filePath: processed.storagePath,
        attemptCount: attemptNumber,
      });

      console.log(`✅ Uploaded ${original_filename} to ${processed.storagePath}`);

      return {
      processedUrl: processed.processedUrl || '',
      fileName: processed.fileName,
      fileType: processed.fileType,
      fileSize: processed.fileSize
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Failed to upload ${original_filename}:`, errorMessage);

      const status = isFinalAttempt ? 'failed' : 'pending';
      await updateUploadFileStatus({
        fileId,
        jobId,
        status,
        errorMessage,
        attemptCount: attemptNumber,
      });

      throw error;
    }
  }

  private async readTempFile(tempPath: string): Promise<Buffer> {
    if (tempPath.startsWith('data:')) {
      const match = tempPath.match(/^data:([^;]+);base64,(.+)$/);
      if (match) return Buffer.from(match[2], 'base64');
    }

    if (tempPath.length > 100 && /^[A-Za-z0-9+/=]+$/.test(tempPath)) {
      return Buffer.from(tempPath, 'base64');
    }

    const { data, error } = await db.storage.from('temp-uploads').download(tempPath);
    if (!error && data) return Buffer.from(await data.arrayBuffer());

    throw new Error(`Failed to read file from: ${tempPath.substring(0, 50)}...`);
  }
}

export const uploadJobService = new UploadJobService();
