import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { StageAttachmentValidation } from "@/lib/cases/validation";
import { formatZodError } from "@/utils/error_formatter";
import { createJobResponse, offloadUploadJob } from "@/utils/task-offloader";
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
        .select("id, name, file_url, description, file_type, created_at, updated_at", { count: "exact" })
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
 *               - name
 *             properties:
 *               file_data:
 *                 type: string
 *                 description: Base64 encoded file data
 *                 example: "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MK..."
 *               file_type:
 *                 type: string
 *                 description: MIME type of the file
 *                 example: "application/pdf"
 *               name:
 *                 type: string
 *                 description: File name
 *                 example: "evidence_document.pdf"
 *               description:
 *                 type: string
 *                 description: Optional file description
 *                 example: "Evidence document for the case"
 *     responses:
 *       202:
 *         description: File upload job created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 job_id:
 *                   type: string
 *                   format: uuid
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
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

    const { file_data, file_type, name, description } = parsed.data;

    // Fetch case and stage context for the upload job
    const { data: caseData, error: caseError } = await db
        .from("cases")
        .select(`
            id, title, reference_number,
            case_stages!inner(id, name, description)
        `)
        .eq("id", case_id)
        .eq("case_stages.id", stage_id)
        .single();

    if (caseError) {
        log.warn('Failed to fetch case context, proceeding without context', caseError, 'STAGE_ATTACHMENTS');
    }

    // Extract stage data from array
    const stageData = Array.isArray(caseData?.case_stages)
        ? caseData.case_stages[0]
        : caseData?.case_stages;

    // Prepare payload with full context data
    const payload = {
        files: [{
            name,
            file_data,
            file_type,
            description,
            size: file_data.length
        }],
        case: {
            id: caseData?.id,
            title: caseData?.title,
            reference_number: caseData?.reference_number
        },
        stage: stageData,
        metadata: {
            case_id,
            stage_id,
            entity_type: 'stage_attachment'
        }
    };

    // Offload upload job with context payload
    const upload_job = await offloadUploadJob({
        entityType: 'stage_attachment',
        entityId: case_id,
        stageId: stage_id,
        jobType: 'file_upload',
        title: `Case Stage Attachment: ${name}`,
        files: payload
    });

    const result = createJobResponse(upload_job);

    if (!result.success) {
        log.error('Failed to create upload job', result.error, 'STAGE_ATTACHMENTS');
        return NextResponse.json({
            message: 'Failed to create file upload job',
            error: result.error
        }, { status: 500 });
    }

    return NextResponse.json({
        success: true,
        message: 'File upload job created successfully. Upload is being processed in the background.',
        job_id: result.jobId,
        status: result.status
    }, { status: 202 });
}
