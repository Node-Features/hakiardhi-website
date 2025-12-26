import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { StageAttachmentValidation } from "@/lib/cases/validation";
import { formatZodError } from "@/utils/error_formatter";
import { uploadFile, StorageBuckets } from "@/lib/services/storage.service";
import { log } from "@/utils/logger";

const db = supabase(true);

/**
 * @swagger
 * /api/admin/cases/{id}/stages/{stageId}/attachments:
 *   get:
 *     tags:
 *       - Admin - Cases
 *     summary: List stage attachments
 *     description: Retrieve all attachments for a specific case stage
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Case ID
 *       - name: stageId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Stage ID
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Attachments retrieved successfully
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
 *                 meta:
 *                   type: object
 *       400:
 *         description: Request error
 *       401:
 *         description: Unauthorized
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; stageId: string }> }
) {
    const { id: case_id, stageId: stage_id } = await params;
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await db
        .from("stage_attachments")
        .select("id, file_name, file_url, description, file_type, size, status, created_at, updated_at", { count: "exact" })
        .eq("case_id", case_id)
        .eq("stage_id", stage_id)
        .order("created_at", { ascending: false })
        .range(from, to);

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({
        success: true,
        data,
        meta: {
            page,
            limit,
            total: count,
            total_pages: Math.ceil((count || 0) / limit),
        },
    });
}

/**
 * @swagger
 * /api/admin/cases/{id}/stages/{stageId}/attachments:
 *   post:
 *     tags:
 *       - Admin - Cases
 *     summary: Upload stage attachment
 *     description: Upload a file attachment to a case stage (base64 encoded)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Case ID
 *       - name: stageId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Stage ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - file_data
 *               - file_type
 *               - file_name
 *             properties:
 *               file_data:
 *                 type: string
 *                 description: Base64 encoded file data
 *                 example: "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MK..."
 *               file_type:
 *                 type: string
 *                 description: MIME type of the file
 *                 example: "application/pdf"
 *               file_name:
 *                 type: string
 *                 description: File name
 *                 example: "evidence_document.pdf"
 *               description:
 *                 type: string
 *                 description: Optional file description
 *                 example: "Evidence document for the case"
 *     responses:
 *       201:
 *         description: Attachment uploaded successfully
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
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     file_url:
 *                       type: string
 *                     file_name:
 *                       type: string
 *                     file_type:
 *                       type: string
 *                     size:
 *                       type: integer
 *                     description:
 *                       type: string
 *                     status:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Upload failed
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; stageId: string }> }
) {
    const startTime = Date.now();
    const { id: case_id, stageId: stage_id } = await params;

    log.request('POST', `/api/admin/cases/${case_id}/stages/${stage_id}/attachments`, { case_id, stage_id });

    try {
        const body = await req.json();

        // Add case_id and stage_id to the body
        body.case_id = case_id;
        body.stage_id = stage_id;

        const parsed = StageAttachmentValidation.safeParse(body);

        if (!parsed.success) {
            const errors = formatZodError(parsed.error);
            log.validation('Attachment validation failed', errors);
            const duration = Date.now() - startTime;
            log.response('POST', `/api/admin/cases/${case_id}/stages/${stage_id}/attachments`, 400, duration);
            return NextResponse.json({ errors }, { status: 400 });
        }

        const { file_data, file_type, file_name, description } = parsed.data;

        log.info('Processing attachment upload', {
            case_id,
            stage_id,
            fileName: file_name,
            fileType: file_type,
            hasDescription: !!description,
            dataLength: file_data.length
        }, 'STAGE_ATTACHMENTS');

        // Upload base64 file to Supabase Storage using centralized service
        const uploadResult = await uploadFile(
            file_data,
            file_type,
            {
                bucket: StorageBuckets.CASES,
                folder: `cases/${case_id}/stages/${stage_id}`,
                fileName: `${Date.now()}_${file_name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
                makePublic: true
            }
        );

        if (!uploadResult.success || !uploadResult.url) {
            log.error('Storage upload failed', uploadResult.error, 'STAGE_ATTACHMENTS');

            // Check if it's an RLS policy error
            const isRLSError = uploadResult.error?.includes('row-level security') ||
                               uploadResult.error?.includes('policy');

            const duration = Date.now() - startTime;
            log.response('POST', `/api/admin/cases/${case_id}/stages/${stage_id}/attachments`, 500, duration);

            if (isRLSError) {
                log.warn('RLS policy error detected - policies need to be configured', { success: false }, 'STAGE_ATTACHMENTS');
                return NextResponse.json({
                    message: 'File upload failed due to storage permissions',
                    error: uploadResult.error,
                    hint: 'Row-Level Security policies need to be configured for the storage bucket.',
                    quickFix: 'Run this SQL in Supabase Dashboard: CREATE POLICY "Allow uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = \'cases\');'
                }, { status: 500 });
            }

            return NextResponse.json({
                message: 'File upload failed',
                error: uploadResult.error
            }, { status: 500 });
        }

        log.info('File uploaded to storage, saving metadata', {
            case_id,
            stage_id,
            fileName: file_name,
            fileUrl: uploadResult.url,
            filePath: uploadResult.path
        }, 'STAGE_ATTACHMENTS');

        // Calculate file size from base64 data
        const base64Data = file_data.replace(/^data:.*?;base64,/, '');
        const fileSize = Buffer.from(base64Data, 'base64').length;

        // Save attachment metadata with URL to database
        const { data: attachment, error: dbError } = await db
            .from('stage_attachments')
            .insert({
                case_id,
                stage_id,
                file_url: uploadResult.url,
                file_name,
                file_type,
                size: fileSize,
                description: description || null,
                status: 'completed',
            })
            .select()
            .single();

        if (dbError) {
            log.error('Failed to create attachment record', dbError, 'STAGE_ATTACHMENTS');
            const duration = Date.now() - startTime;
            log.response('POST', `/api/admin/cases/${case_id}/stages/${stage_id}/attachments`, 400, duration);
            return NextResponse.json({
                message: 'Failed to create attachment record',
                error: dbError.message
            }, { status: 400 });
        }

        const duration = Date.now() - startTime;
        log.info('✅ Attachment upload completed successfully', {
            case_id,
            stage_id,
            attachment_id: attachment.id,
            fileName: file_name,
            fileUrl: uploadResult.url,
            duration: `${duration}ms`
        }, 'STAGE_ATTACHMENTS');

        log.response('POST', `/api/admin/cases/${case_id}/stages/${stage_id}/attachments`, 201, duration);

        return NextResponse.json({
            success: true,
            message: 'Attachment uploaded successfully',
            data: attachment
        }, { status: 201 });

    } catch (error: any) {
        log.error('Unexpected error uploading attachment', error, 'STAGE_ATTACHMENTS');
        const duration = Date.now() - startTime;
        log.response('POST', `/api/admin/cases/${case_id}/stages/${stage_id}/attachments`, 500, duration);
        return NextResponse.json({
            message: 'Failed to upload attachment',
            error: error.message || 'Unknown error'
        }, { status: 500 });
    }
}
