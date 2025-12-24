import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { ProjectFileValidation } from "@/lib/projects/validations";
import { formatZodError } from "@/utils/error_formatter";
import { uploadFile, StorageBuckets } from "@/lib/services/storage.service";
import { log } from "@/utils/logger";

const db = supabase(true);

/**
 * @swagger
 * /api/admin/projects/{id}/files:
 *   get:
 *     tags:
 *       - Admin - Projects
 *     summary: Get project files
 *     description: Retrieve all files associated with a project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project files retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       project_id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       file_url:
 *                         type: string
 *                       description:
 *                         type: string
 *                       uploaded_at:
 *                         type: string
 *       400:
 *         description: Request error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   post:
 *     tags:
 *       - Admin - Projects
 *     summary: Upload project file
 *     description: Upload a new file to a project using base64-encoded data
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID
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
 *                 example: Project Report Q1 2025
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
 *                 example: Quarterly progress report
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
// GET PROJECT FILES
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const startTime = Date.now();
    const { id } = await context.params;

    log.request('GET', `/api/admin/projects/${id}/files`, { project_id: id });

    try {
        const { data, error } = await db
            .from("project_files")
            .select("id, project_id, name, file_url, description, created_at")
            .eq("project_id", id);

        if (error) {
            log.error('Failed to fetch project files', error, 'PROJECT_FILES');
            const duration = Date.now() - startTime;
            log.response('GET', `/api/admin/projects/${id}/files`, 400, duration);
            return NextResponse.json({ message: error.message }, { status: 400 });
        }

        const filesCount = data?.length || 0;
        log.info(`Retrieved ${filesCount} files for project`, { project_id: id, count: filesCount }, 'PROJECT_FILES');

        const duration = Date.now() - startTime;
        log.response('GET', `/api/admin/projects/${id}/files`, 200, duration);

        return NextResponse.json({
            success: true,
            data: data?.map(f => ({
                ...f,
                uploaded_at: f.created_at
            })) || []
        });
    } catch (error) {
        log.error('Unexpected error fetching project files', error, 'PROJECT_FILES');
        const duration = Date.now() - startTime;
        log.response('GET', `/api/admin/projects/${id}/files`, 500, duration);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const startTime = Date.now();
    const { id: project_id } = await context.params;

    log.request('POST', `/api/admin/projects/${project_id}/files`, { project_id });

    try {
        const body = await req.json();
        const parsed = ProjectFileValidation.safeParse(body);

        if (!parsed.success) {
            const errors = formatZodError(parsed.error);
            log.validation('File validation failed', errors);
            const duration = Date.now() - startTime;
            log.response('POST', `/api/admin/projects/${project_id}/files`, 400, duration);
            return NextResponse.json({ errors }, { status: 400 });
        }

        const { file_data, file_type, name, description } = parsed.data;

        log.info('Processing file upload', {
            project_id,
            fileName: name,
            fileType: file_type,
            hasDescription: !!description,
            dataLength: file_data.length
        }, 'PROJECT_FILES');

        // Upload base64 file to Supabase Storage
        const uploadResult = await uploadFile(
            file_data,
            file_type,
            {
                bucket: StorageBuckets.PROJECTS,
                folder: `project_${project_id}`,
                fileName: `${Date.now()}_${name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
                makePublic: true
            }
        );

        if (!uploadResult.success || !uploadResult.url) {
            log.error('Storage upload failed', uploadResult.error, 'PROJECT_FILES');

            // Check if it's an RLS policy error
            const isRLSError = uploadResult.error?.includes('row-level security') ||
                               uploadResult.error?.includes('policy');

            const duration = Date.now() - startTime;
            log.response('POST', `/api/admin/projects/${project_id}/files`, 500, duration);

            if (isRLSError) {
                log.warn('RLS policy error detected - policies need to be configured', { success: false }, 'PROJECT_FILES');
                return NextResponse.json({
                    message: 'File upload failed due to storage permissions',
                    error: uploadResult.error,
                    hint: 'Row-Level Security policies need to be configured for the storage bucket. See STORAGE_RLS_SETUP.md for detailed instructions.',
                    quickFix: 'Run this SQL in Supabase Dashboard: CREATE POLICY "Allow uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = \'projects\');'
                }, { status: 500 });
            }

            return NextResponse.json({
                message: 'File upload failed',
                error: uploadResult.error
            }, { status: 500 });
        }

        log.info('File uploaded to storage, saving metadata', {
            project_id,
            fileName: name,
            fileUrl: uploadResult.url,
            filePath: uploadResult.path
        }, 'PROJECT_FILES');

        // Save file metadata with URL to database
        const { data, error } = await db
            .from("project_files")
            .insert([{
                project_id,
                name,
                file_url: uploadResult.url,
                file_type,
                description: description || ''
            }])
            .select()
            .single();

        if (error) {
            log.error('Failed to save file metadata to database', error, 'PROJECT_FILES');
            const duration = Date.now() - startTime;
            log.response('POST', `/api/admin/projects/${project_id}/files`, 400, duration);
            return NextResponse.json({ message: error.message }, { status: 400 });
        }

        const duration = Date.now() - startTime;
        log.info('✅ File upload completed successfully', {
            project_id,
            file_id: data.id,
            fileName: name,
            fileUrl: uploadResult.url,
            duration: `${duration}ms`
        }, 'PROJECT_FILES');

        log.response('POST', `/api/admin/projects/${project_id}/files`, 201, duration);

        return NextResponse.json({
            success: true,
            message: 'File uploaded successfully',
            data: {
                ...data,
                uploaded_at: data.created_at
            }
        }, { status: 201 });
    } catch (error) {
        log.error('Unexpected error during file upload', error, 'PROJECT_FILES');
        const duration = Date.now() - startTime;
        log.response('POST', `/api/admin/projects/${project_id}/files`, 500, duration);
        return NextResponse.json({
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
