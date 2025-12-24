import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { log } from "@/utils/logger";

const db = supabase(true);

/**
 * @swagger
 * /api/jobs/uploads/{jobId}:
 *   get:
 *     tags:
 *       - Jobs
 *     summary: Get upload job status
 *     description: Check the status of a file upload job
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Upload Job ID
 *     responses:
 *       200:
 *         description: Job status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [pending, processing, completed, failed]
 *                     job_type:
 *                       type: string
 *                     entity_type:
 *                       type: string
 *                     entity_id:
 *                       type: string
 *                     total_files:
 *                       type: integer
 *                     success_count:
 *                       type: integer
 *                     failed_count:
 *                       type: integer
 *                     created_at:
 *                       type: string
 *                     completed_at:
 *                       type: string
 *                     error:
 *                       type: string
 *                     files:
 *                       type: array
 *                       items:
 *                         type: object
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ jobId: string }> }
) {
    const startTime = Date.now();
    const { jobId } = await context.params;

    log.request('GET', `/api/jobs/uploads/${jobId}`, { jobId });

    try {
        // Fetch job with files
        const { data: job, error: jobError } = await db
            .from("upload_jobs")
            .select(`
                id,
                job_type,
                entity_type,
                entity_id,
                status,
                total_files,
                success_count,
                failed_count,
                attempts,
                error,
                created_at,
                completed_at,
                last_attempt_at,
                updated_at
            `)
            .eq("id", jobId)
            .single();

        if (jobError || !job) {
            log.error('Job not found', { jobId, error: jobError }, 'UPLOAD_JOB');
            const duration = Date.now() - startTime;
            log.response('GET', `/api/jobs/uploads/${jobId}`, 404, duration);
            return NextResponse.json(
                { success: false, message: 'Job not found' },
                { status: 404 }
            );
        }

        // Fetch associated files
        const { data: files, error: filesError } = await db
            .from("upload_job_files")
            .select(`
                id,
                original_filename,
                file_path,
                mime_type,
                size,
                status,
                attempts,
                error_message,
                created_at,
                last_attempt_at,
                updated_at
            `)
            .eq("job_id", jobId);

        if (filesError) {
            log.error('Failed to fetch job files', { jobId, error: filesError }, 'UPLOAD_JOB');
        }

        const duration = Date.now() - startTime;
        log.info('Job status retrieved', {
            jobId,
            status: job.status,
            successCount: job.success_count,
            failedCount: job.failed_count,
            duration: `${duration}ms`
        }, 'UPLOAD_JOB');

        log.response('GET', `/api/jobs/uploads/${jobId}`, 200, duration);

        return NextResponse.json({
            success: true,
            data: {
                ...job,
                files: files || []
            }
        });
    } catch (error) {
        log.error('Unexpected error fetching job status', error, 'UPLOAD_JOB');
        const duration = Date.now() - startTime;
        log.response('GET', `/api/jobs/uploads/${jobId}`, 500, duration);
        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
