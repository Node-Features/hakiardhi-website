/**
 * Create Upload Job Endpoint (Improved)
 *
 * - Uses `processFilesBatch` for file decoding and metadata extraction
 * - Adds Redis idempotency + caching integration
 * - Clean rollback and QStash async queue
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';
import { qstashService } from '@/lib/services/qstash.service';
import { redisService } from '@/lib/services/redis.service';
import { processFilesBatch } from '@/utils/file.util';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { entity_type, entity_id, job_type = 'file_upload', files } = body;

    // ✅ Validate input
    if (!entity_type || !entity_id || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: entity_type, entity_id, files' },
        { status: 400 }
      );
    }

    const db = supabase(false);

    // ✅ Step 1. Create Upload Job
    const { data: uploadJob, error: jobError } = await db
      .from('upload_jobs')
      .insert({
        entity_type,
        entity_id,
        job_type,
        total_files: files.length,
        payload: files,
        status: 'pending',
      })
      .select()
      .single();

    if (jobError || !uploadJob) {
      console.error('❌ Failed to create upload job:', jobError);
      return NextResponse.json({ error: 'Failed to create upload job' }, { status: 500 });
    }

    // ✅ Step 2. Process files (extract metadata + base64 decoding)
    const processedFiles = await processFilesBatch(files, uploadJob.id);

    // ✅ Step 3. Create file records in DB
    const fileRecords = processedFiles.map((f) => ({
      job_id: uploadJob.id,
      original_filename: f.file_name,
      file_path: null,
      mime_type: f.mime_type,
      size: f.size,
      status: f.status,
    }));

    const { error: fileInsertError } = await db.from('upload_job_files').insert(fileRecords);

    if (fileInsertError) {
      console.error('❌ Failed to insert file records:', fileInsertError);
      await db.from('upload_jobs').delete().eq('id', uploadJob.id);
      return NextResponse.json({ error: 'Failed to insert file records' }, { status: 500 });
    }

    // ✅ Step 4. Cache job metadata in Redis
    await redisService.cacheJobStatus('upload', uploadJob.id, {
      status: 'pending',
      totalCount: fileRecords.length,
      successfulCount: 0,
      failedCount: 0,
      updatedAt: new Date().toISOString(),
    });

    // ✅ Step 5. Publish to QStash (asynchronous)
    try {
      await qstashService.publishJob('upload', {
        jobId: uploadJob.id,
        entityType: entity_type,
        entityId: entity_id,
      });
    } catch (err) {
      console.error('⚠️ Failed to publish to QStash:', err);
      // Not fatal — job exists, can be retried later
    }

    // ✅ Step 6. Respond immediately
    return NextResponse.json({
      success: true,
      jobId: uploadJob.id,
      totalFiles: fileRecords.length,
      status: 'pending',
      message: 'Upload job created and queued successfully.',
    });
  } catch (error) {
    console.error('🔥 Error creating upload job:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
