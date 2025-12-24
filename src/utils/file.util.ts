/**
 * File Utility Service
 *
 * Handles:
 *  - Base64 file decoding and metadata extraction
 *  - Temporary file creation
 *  - Redis-based idempotency and caching
 */

import { redisService } from '@/lib/services/redis.service';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

interface RawFileInput {
  original_filename?: string;
  file_name?: string;
  file_path?: string;
  temp_path?: string;
  mime_type?: string;
  size?: number;
  base64_data?: string;
}

interface ProcessedFile {
  id: string;
  file_name: string;
  file_path: string;
  mime_type: string;
  size: number;
  status: 'pending' | 'processed' | 'failed';
}

/**
 * Extracts and processes base64 or regular file input.
 * Adds Redis idempotency + caching support.
 */
export async function processFileInput(
  f: RawFileInput,
  jobId?: string,
  attempt: number = 1
): Promise<ProcessedFile> {
  const id = crypto.randomUUID();

  // ----------------------------
  // 1. Check for duplicate via Redis idempotency
  // ----------------------------
  if (jobId) {
    const duplicate = await redisService.checkIdempotency(jobId, id, attempt);
    if (duplicate) {
      console.warn(`Duplicate file detected — skipping: ${id}`);
      return {
        id,
        file_name: f.file_name || f.original_filename || 'unknown',
        file_path: f.file_path || '',
        mime_type: f.mime_type || 'application/octet-stream',
        size: f.size || 0,
        status: 'failed',
      };
    }
  }

  // ----------------------------
  // 2. Handle Base64 file
  // ----------------------------
  let file_name = f.file_name || f.original_filename || `upload_${Date.now()}`;
  let file_path = f.file_path || f.temp_path;
  let mime_type = f.mime_type || 'application/octet-stream';
  let size = f.size || 0;

  if (f.base64_data) {
    const match = f.base64_data.match(/^data:(.+);base64,(.*)$/);
    if (!match) throw new Error('Invalid base64 format');

    mime_type = match[1];
    const base64Content = match[2];
    size = Buffer.from(base64Content, 'base64').length;

    const ext = mime_type.split('/')[1] || 'bin';
    if (!file_name.includes('.')) file_name += `.${ext}`;

    // Create temp directory if not exists
    const tmpDir = path.join(process.cwd(), 'tmp_uploads');
    await fs.mkdir(tmpDir, { recursive: true });

    // Generate local temporary path
    file_path = path.join(tmpDir, file_name);

    // Write base64 file content
    await fs.writeFile(file_path, Buffer.from(base64Content, 'base64'));
  }

  // ----------------------------
  // 3. Cache metadata in Redis (optional)
  // ----------------------------
  const cacheKey = `upload:file:${id}`;
  const fileMeta = { id, file_name, mime_type, size, jobId, status: 'pending' };
  await redisService.getClient().setex(cacheKey, 3600, JSON.stringify(fileMeta));

  return {
    id,
    file_name,
    file_path: file_path || '',
    mime_type,
    size,
    status: 'pending',
  };
}

/**
 * Batch process files with Redis lock
 */
export async function processFilesBatch(
  files: RawFileInput[],
  jobId?: string
): Promise<ProcessedFile[]> {
  const lockKey = `upload_job_lock:${jobId}`;
  const { acquired, lockId } = await redisService.acquireLock(lockKey, 10, 3, 150);

  if (!acquired) throw new Error('Could not acquire upload job lock');

  try {
    const processed = [];
    for (const [i, f] of files.entries()) {
      const file = await processFileInput(f, jobId, i + 1);
      processed.push(file);
    }

    // Cache job summary
    if (jobId) {
      await redisService.cacheJobStatus('upload', jobId, {
        status: 'pending',
        totalCount: processed.length,
        successfulCount: 0,
        failedCount: 0,
        updatedAt: new Date().toISOString(),
      });
    }

    return processed;
  } finally {
    if (lockId) await redisService.releaseLock(lockKey, lockId);
  }
}
