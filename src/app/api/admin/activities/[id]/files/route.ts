import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { ActivityFileValidation, ActivityMultipleFilesValidation } from "@/lib/activities/validation";
import { formatZodError } from "@/utils/error_formatter";
import { uploadFile, StorageBuckets } from "@/lib/services/storage.service";
import { log } from "@/utils/logger";
import { createJobResponse, offloadUploadJob } from "@/utils/task-offloader";

const db = supabase(true);

/**
 * @swagger
 * /api/admin/activities/{id}/files:
 *   get:
 *     tags:
 *       - Admin - Activities
 *     summary: Get activity files
 *     description: Retrieve all files associated with an activity
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Activity ID
 *     responses:
 *       200:
 *         description: Activity files retrieved successfully
 *       400:
 *         description: Request error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
// GET ACTIVITY FILES
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const startTime = Date.now();
    const { id } = await context.params;

    log.request('GET', `/api/admin/activities/${id}/files`, { activity_id: id });

    try {
        // Add timeout wrapper to prevent hanging
        const queryPromise = db
            .from("activity_files")
            .select("id, activity_id, file_name, file_url, file_type, description, created_at")
            .eq("activity_id", id);

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Query timeout after 15s')), 15000)
        );

        const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

        if (error) {
            log.error('Failed to fetch activity files', error, 'ACTIVITY_FILES');
            const duration = Date.now() - startTime;
            log.response('GET', `/api/admin/activities/${id}/files`, 400, duration);
            return NextResponse.json({ message: error.message }, { status: 400 });
        }

        const filesCount = data?.length || 0;

        log.info(`Retrieved ${filesCount} files for activity`, { activity_id: id, count: filesCount }, 'ACTIVITY_FILES');

        const duration = Date.now() - startTime;
    
        log.response('GET', `/api/admin/activities/${id}/files`, 200, duration);

        return NextResponse.json({
            success: true,
            data: data?.map((f: { file_name: any; created_at: any; }) => ({
                ...f,
                name: f.file_name, // Map file_name to name for frontend compatibility
                uploaded_at: f.created_at
            })) || []
        });

    } catch (error) {
        log.error('Unexpected error fetching activity files', error, 'ACTIVITY_FILES');
        const duration = Date.now() - startTime;
        log.response('GET', `/api/admin/activities/${id}/files`, 500, duration);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}


/**
 * @swagger
 * /api/admin/activities/{id}/files:
 *   post:
 *     tags:
 *       - Admin - Activities
 *     summary: Upload activity file
 *     description: Upload a new file to an activity using base64-encoded data
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Activity ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - file_data
 *               - file_type
 *             properties:
 *               name:
 *                 type: string
 *                 example: Training Materials.pdf
 *               file_data:
 *                 type: string
 *                 example: iVBORw0KGgoAAAANSUhEUgAAAAUA...
 *                 description: Base64-encoded file content (with or without data URL prefix)
 *               file_type:
 *                 type: string
 *                 example: application/pdf
 *                 description: MIME type of the file (e.g., image/png, application/pdf, image/jpeg)
 *               description:
 *                 type: string
 *                 example: Activity training materials for participants
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
// UPLOAD ACTIVITY FILE(S)
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {

    const startTime = Date.now();

    const { id: activity_id } = await context.params;

    log.request('POST', `/api/admin/activities/${activity_id}/files`, { activity_id });

    try {
        
        const body = await req.json();

        // Check if multiple files (array) or single file (object)
        const isMultiple = Array.isArray(body);

        if (isMultiple) {
            // Handle multiple files with background job
            const multiParsed = ActivityMultipleFilesValidation.safeParse({ files: body });

            if (!multiParsed.success) {
                const errors = formatZodError(multiParsed.error);
                log.validation('Multiple files validation failed', errors);
                const duration = Date.now() - startTime;
                log.response('POST', `/api/admin/activities/${activity_id}/files`, 400, duration);
                return NextResponse.json({ errors }, { status: 400 });
            }

            const { files } = multiParsed.data;

            // Fetch activity to get project_id
            const { data: activity, error: activityError } = await db
                .from("activities")
                .select("project_id")
                .eq("id", activity_id)
                .single();

            if (activityError || !activity) {
                log.error('Activity not found', activityError, 'ACTIVITY_FILES');
                const duration = Date.now() - startTime;
                log.response('POST', `/api/admin/activities/${activity_id}/files`, 404, duration);
                return NextResponse.json({
                    message: 'Activity not found',
                    error: activityError?.message
                }, { status: 404 });
            }

            log.info('Processing multiple files upload', {
                activity_id,
                project_id: activity.project_id,
                fileCount: files.length
            }, 'ACTIVITY_FILES');

            // Calculate file sizes and prepare for job queue
            const filesWithSize = files.map(file => {
                const base64Data = file.file_data.replace(/^data:.*?;base64,/, '');
                const fileSize = Math.ceil((base64Data.length * 3) / 4);
                return {
                    name: file.name,
                    file_data: base64Data,
                    file_type: file.file_type,
                    description: file.description || '',
                    size: fileSize
                };
            });

            // Offload to background job queue with project_id
            const upload_job = await offloadUploadJob({
                entityType: 'activity_files',
                entityId: activity_id,
                jobType: 'file_upload',
                files: { files: filesWithSize },
                additionalPayload: { project_id: activity.project_id }
            });

            const result = createJobResponse(upload_job);

            if (!result.success) {
                log.error('Failed to create upload job', result.error, 'ACTIVITY_FILES');
                const duration = Date.now() - startTime;
                log.response('POST', `/api/admin/activities/${activity_id}/files`, 500, duration);
                return NextResponse.json({
                    message: 'Failed to queue file upload',
                    error: result.error,
                    details: result.details
                }, { status: 500 });
            }

            const duration = Date.now() - startTime;
            log.info('✅ Multiple files upload job queued successfully', {
                activity_id,
                jobId: result.jobId,
                fileCount: files.length,
                duration: `${duration}ms`
            }, 'ACTIVITY_FILES');

            log.response('POST', `/api/admin/activities/${activity_id}/files`, 202, duration);

            return NextResponse.json({
                success: true,
                message: `${files.length} file(s) queued for upload`,
                jobId: result.jobId,
                status: result.status,
                itemCount: result.itemCount,
                warning: result.warning
            }, { status: 202 });
        }

        // Handle single file (direct upload)
        const parsed = ActivityFileValidation.safeParse(body);

        if (!parsed.success) {
            const errors = formatZodError(parsed.error);
            log.validation('File validation failed', errors);
            const duration = Date.now() - startTime;
            log.response('POST', `/api/admin/activities/${activity_id}/files`, 400, duration);
            return NextResponse.json({ errors }, { status: 400 });
        }

        const { file_data, file_type, name, description } = parsed.data;

        // Fetch activity to get project_id
        const { data: activity, error: activityError } = await db
            .from("activities")
            .select("project_id")
            .eq("id", activity_id)
            .single();

        if (activityError || !activity) {
            log.error('Activity not found', activityError, 'ACTIVITY_FILES');
            const duration = Date.now() - startTime;
            log.response('POST', `/api/admin/activities/${activity_id}/files`, 404, duration);
            return NextResponse.json({
                message: 'Activity not found',
                error: activityError?.message
            }, { status: 404 });
        }

        log.info('Processing file upload', {
            activity_id,
            project_id: activity.project_id,
            fileName: name,
            fileType: file_type,
            hasDescription: !!description,
            dataLength: file_data.length
        }, 'ACTIVITY_FILES');

        // Upload base64 file to Supabase Storage directly
        const uploadResult = await uploadFile(
            file_data,
            file_type,
            {
                bucket: StorageBuckets.ACTIVITIES,
                folder: `activity_${activity_id}`,
                fileName: `${Date.now()}_${name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
                makePublic: true
            }
        );

        if (!uploadResult.success || !uploadResult.url) {
            log.error('Storage upload failed', uploadResult.error, 'ACTIVITY_FILES');

            // Check if it's an RLS policy error
            const isRLSError = uploadResult.error?.includes('row-level security') ||
                               uploadResult.error?.includes('policy');

            const duration = Date.now() - startTime;
            log.response('POST', `/api/admin/activities/${activity_id}/files`, 500, duration);

            if (isRLSError) {
                log.warn('RLS policy error detected - policies need to be configured', { success: false }, 'ACTIVITY_FILES');
                return NextResponse.json({
                    message: 'File upload failed due to storage permissions',
                    error: uploadResult.error,
                    hint: 'Row-Level Security policies need to be configured for the storage bucket. See STORAGE_RLS_SETUP.md for detailed instructions.',
                    quickFix: 'Run this SQL in Supabase Dashboard: CREATE POLICY "Allow uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = \'activities\');'
                }, { status: 500 });
            }

            return NextResponse.json({
                message: 'File upload failed',
                error: uploadResult.error
            }, { status: 500 });
        }

        log.info('File uploaded to storage, saving metadata', {
            activity_id,
            fileName: name,
            fileUrl: uploadResult.url,
            filePath: uploadResult.path
        }, 'ACTIVITY_FILES');

        // Save file metadata with URL to database
        const { data, error } = await db
            .from("activity_files")
            .insert([{
                activity_id,
                project_id: activity.project_id,
                file_name: name,
                file_url: uploadResult.url,
                storage_path: uploadResult.path,
                mime_type: file_type,
                file_type: file_type.split('/')[0], // e.g., 'image', 'application'
                description: description || '',
                status: 'completed'
            }])
            .select()
            .single();

        if (error) {
            log.error('Failed to save file metadata to database', error, 'ACTIVITY_FILES');
            const duration = Date.now() - startTime;
            log.response('POST', `/api/admin/activities/${activity_id}/files`, 400, duration);
            return NextResponse.json({ message: error.message }, { status: 400 });
        }

        const duration = Date.now() - startTime;
        log.info('✅ File upload completed successfully', {
            activity_id,
            file_id: data.id,
            fileName: name,
            fileUrl: uploadResult.url,
            duration: `${duration}ms`
        }, 'ACTIVITY_FILES');

        log.response('POST', `/api/admin/activities/${activity_id}/files`, 201, duration);

        return NextResponse.json({
            success: true,
            message: 'File uploaded successfully',
            data: {
                ...data,
                name: data.file_name, // Map file_name to name for frontend compatibility
                uploaded_at: data.created_at
            }
        }, { status: 201 });
    } catch (error) {
        log.error('Unexpected error during file upload', error, 'ACTIVITY_FILES');
        const duration = Date.now() - startTime;
        log.response('POST', `/api/admin/activities/${activity_id}/files`, 500, duration);
        return NextResponse.json({
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
