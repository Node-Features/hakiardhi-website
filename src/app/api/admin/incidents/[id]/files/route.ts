import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { IncidentFileValidation } from "@/lib/incidents/validation";
import { formatZodError } from "@/utils/error_formatter";
import { uploadFile, StorageBuckets } from "@/lib/services/storage.service";
import { log } from "@/utils/logger";

const db = supabase(true);

/**
 * @swagger
 * /api/admin/incidents/{id}/files:
 *   get:
 *     tags:
 *       - Admin - Incidents
 *     summary: Get incident evidence files
 *     description: Retrieve all files/evidence associated with an incident
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Incident ID
 *     responses:
 *       200:
 *         description: Incident files retrieved successfully
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
 *                       incident_id:
 *                         type: string
 *                       file_name:
 *                         type: string
 *                       file_url:
 *                         type: string
 *                       file_type:
 *                         type: string
 *                       description:
 *                         type: string
 *                       created_at:
 *                         type: string
 *       400:
 *         description: Request error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   post:
 *     tags:
 *       - Admin - Incidents
 *     summary: Upload incident evidence file
 *     description: Upload a new evidence file to an incident using base64-encoded data
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Incident ID
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
 *                 example: Evidence Photo 1
 *               file_data:
 *                 type: string
 *                 example: iVBORw0KGgoAAAANSUhEUgAAAAUA...
 *                 description: Base64-encoded file content (with or without data URL prefix)
 *               file_type:
 *                 type: string
 *                 example: image/jpeg
 *                 description: MIME type of the file (e.g., image/png, application/pdf, image/jpeg)
 *               description:
 *                 type: string
 *                 example: Photo of damaged property
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

// GET INCIDENT FILES
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const startTime = Date.now();
    const { id } = await context.params;

    log.request('GET', `/api/admin/incidents/${id}/files`, { incident_id: id });

    try {
        const { data, error } = await db
            .from("incident_files")
            .select("id, incident_id, file_name, file_url, file_type, description, created_at")
            .eq("incident_id", id)
            .order("created_at", { ascending: false });

        if (error) {
            log.error('Failed to fetch incident files', error, 'INCIDENT_FILES');
            const duration = Date.now() - startTime;
            log.response('GET', `/api/admin/incidents/${id}/files`, 400, duration);
            return NextResponse.json({ message: error.message }, { status: 400 });
        }

        const filesCount = data?.length || 0;
        log.info(`Retrieved ${filesCount} files for incident`, { incident_id: id, count: filesCount }, 'INCIDENT_FILES');

        const duration = Date.now() - startTime;
        log.response('GET', `/api/admin/incidents/${id}/files`, 200, duration);

        return NextResponse.json({
            success: true,
            data: data || []
        });
    } catch (error) {
        log.error('Unexpected error fetching incident files', error, 'INCIDENT_FILES');
        const duration = Date.now() - startTime;
        log.response('GET', `/api/admin/incidents/${id}/files`, 500, duration);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

// POST INCIDENT FILE
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const startTime = Date.now();
    const { id: incident_id } = await context.params;

    log.request('POST', `/api/admin/incidents/${incident_id}/files`, { incident_id });

    try {
        const body = await req.json();
        const parsed = IncidentFileValidation.safeParse(body);

        if (!parsed.success) {
            const errors = formatZodError(parsed.error);
            log.validation('File validation failed', errors);
            const duration = Date.now() - startTime;
            log.response('POST', `/api/admin/incidents/${incident_id}/files`, 400, duration);
            return NextResponse.json({ errors }, { status: 400 });
        }

        const { file_data, file_type, name, description } = parsed.data;

        log.info('Processing evidence file upload', {
            incident_id,
            fileName: name,
            fileType: file_type,
            hasDescription: !!description,
            dataLength: file_data.length
        }, 'INCIDENT_FILES');

        // Upload base64 file to Supabase Storage
        const uploadResult = await uploadFile(
            file_data,
            file_type,
            {
                bucket: StorageBuckets.INCIDENTS,
                folder: `incident_${incident_id}`,
                fileName: `${Date.now()}_${name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
                makePublic: true
            }
        );

        if (!uploadResult.success || !uploadResult.url) {
            log.error('Storage upload failed', uploadResult.error, 'INCIDENT_FILES');

            // Check if it's an RLS policy error
            const isRLSError = uploadResult.error?.includes('row-level security') ||
                               uploadResult.error?.includes('policy');

            const duration = Date.now() - startTime;
            log.response('POST', `/api/admin/incidents/${incident_id}/files`, 500, duration);

            if (isRLSError) {
                log.warn('RLS policy error detected - policies need to be configured', { success: false }, 'INCIDENT_FILES');
                return NextResponse.json({
                    message: 'File upload failed due to storage permissions',
                    error: uploadResult.error,
                    hint: 'Row-Level Security policies need to be configured for the storage bucket. See STORAGE_RLS_SETUP.md for detailed instructions.',
                    quickFix: 'Run this SQL in Supabase Dashboard: CREATE POLICY "Allow uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = \'incidents\');'
                }, { status: 500 });
            }

            return NextResponse.json({
                message: 'File upload failed',
                error: uploadResult.error
            }, { status: 500 });
        }

        log.info('File uploaded to storage, saving metadata', {
            incident_id,
            fileName: name,
            fileUrl: uploadResult.url,
            filePath: uploadResult.path
        }, 'INCIDENT_FILES');

        // Save file metadata with URL to database
        const { data, error } = await db
            .from("incident_files")
            .insert([{
                incident_id,
                file_name: name,
                file_url: uploadResult.url,
                file_type,
                description: description || ''
            }])
            .select()
            .single();

        if (error) {
            log.error('Failed to save file metadata to database', error, 'INCIDENT_FILES');
            const duration = Date.now() - startTime;
            log.response('POST', `/api/admin/incidents/${incident_id}/files`, 400, duration);
            return NextResponse.json({ message: error.message }, { status: 400 });
        }

        const duration = Date.now() - startTime;
        log.info('✅ Evidence file upload completed successfully', {
            incident_id,
            file_id: data.id,
            fileName: name,
            fileUrl: uploadResult.url,
            duration: `${duration}ms`
        }, 'INCIDENT_FILES');

        log.response('POST', `/api/admin/incidents/${incident_id}/files`, 201, duration);

        return NextResponse.json({
            success: true,
            message: 'Evidence file uploaded successfully',
            data
        }, { status: 201 });
    } catch (error) {
        log.error('Unexpected error during file upload', error, 'INCIDENT_FILES');
        const duration = Date.now() - startTime;
        log.response('POST', `/api/admin/incidents/${incident_id}/files`, 500, duration);
        return NextResponse.json({
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
