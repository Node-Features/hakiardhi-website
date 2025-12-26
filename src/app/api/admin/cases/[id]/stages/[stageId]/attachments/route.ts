import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { StageAttachmentValidation } from "@/lib/cases/validation";
import { formatZodError } from "@/utils/error_formatter";
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
    const { id: case_id, stageId: stage_id } = await params;
    const body = await req.json();

    // Add case_id and stage_id to the body
    body.case_id = case_id;
    body.stage_id = stage_id;

    const parsed = StageAttachmentValidation.safeParse(body);

    if (!parsed.success) {
        const errors = formatZodError(parsed.error);
        return NextResponse.json({ errors }, { status: 400 });
    }

    const { file_data, file_type, file_name, description } = parsed.data;

    try {
        // 1. Decode base64 file data
        let fileBuffer: Buffer;
        const base64Match = file_data.match(/^data:([^;]+);base64,(.+)$/);

        if (base64Match) {
            // Data URL format
            fileBuffer = Buffer.from(base64Match[2], 'base64');
        } else if (/^[A-Za-z0-9+/=]+$/.test(file_data)) {
            // Plain base64 string
            fileBuffer = Buffer.from(file_data, 'base64');
        } else {
            return NextResponse.json({
                message: 'Invalid file data format'
            }, { status: 400 });
        }

        // 2. Generate unique file path
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(7);
        const fileExtension = file_name.split('.').pop();
        const storagePath = `cases/${case_id}/stages/${stage_id}/${timestamp}-${randomString}.${fileExtension}`;

        // 3. Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await db.storage
            .from('case-attachments')
            .upload(storagePath, fileBuffer, {
                contentType: file_type,
                upsert: false
            });

        if (uploadError) {
            log.error('Failed to upload file to storage', uploadError, 'STAGE_ATTACHMENTS');
            return NextResponse.json({
                message: 'Failed to upload file to storage',
                error: uploadError.message
            }, { status: 500 });
        }

        // 4. Get public URL
        const { data: urlData } = db.storage
            .from('case-attachments')
            .getPublicUrl(storagePath);

        // 5. Insert attachment record into database
        const { data: attachment, error: dbError } = await db
            .from('stage_attachments')
            .insert({
                case_id,
                stage_id,
                file_url: urlData.publicUrl,
                file_name,
                file_type,
                size: fileBuffer.length,
                description: description || null,
                status: 'processed',
            })
            .select()
            .single();

        if (dbError) {
            // Rollback: Delete uploaded file
            await db.storage.from('case-attachments').remove([storagePath]);

            log.error('Failed to create attachment record', dbError, 'STAGE_ATTACHMENTS');
            return NextResponse.json({
                message: 'Failed to create attachment record',
                error: dbError.message
            }, { status: 500 });
        }

        log.info('Stage attachment created successfully', {
            attachment_id: attachment.id,
            file_name,
            case_id,
            stage_id
        }, 'STAGE_ATTACHMENTS');

        return NextResponse.json({
            success: true,
            message: 'Attachment uploaded successfully',
            data: attachment
        }, { status: 201 });

    } catch (error: any) {
        log.error('Unexpected error uploading attachment', error, 'STAGE_ATTACHMENTS');
        return NextResponse.json({
            message: 'Failed to upload attachment',
            error: error.message || 'Unknown error'
        }, { status: 500 });
    }
}
