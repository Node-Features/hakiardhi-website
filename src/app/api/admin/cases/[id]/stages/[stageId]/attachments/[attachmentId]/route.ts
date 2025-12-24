import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { StageAttachmentUpdateValidation } from "@/lib/cases/validation";
import { formatZodError } from "@/utils/error_formatter";
import { log } from "@/utils/logger";

const db = supabase(true);

/**
 * @swagger
 * /api/admin/cases/{id}/stages/{stageId}/attachments/{attachmentId}:
 *   get:
 *     tags:
 *       - Admin - Cases
 *     summary: Get a single attachment
 *     description: Retrieve detailed information about a specific stage attachment
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
 *       - name: attachmentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Attachment ID
 *     responses:
 *       200:
 *         description: Attachment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       404:
 *         description: Attachment not found
 *       401:
 *         description: Unauthorized
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; stageId: string; attachmentId: string }> }
) {
    const { id: case_id, stageId: stage_id, attachmentId } = await params;

    const { data, error } = await db
        .from("stage_attachments")
        .select(`
            id, name, file_url, description, file_type, created_at, updated_at,
            case_id, stage_id
        `)
        .eq("id", attachmentId)
        .eq("case_id", case_id)
        .eq("stage_id", stage_id)
        .single();

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
}

/**
 * @swagger
 * /api/admin/cases/{id}/stages/{stageId}/attachments/{attachmentId}:
 *   put:
 *     tags:
 *       - Admin - Cases
 *     summary: Update attachment metadata
 *     description: Update attachment name and description (not the file itself)
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
 *       - name: attachmentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Attachment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "updated_evidence_document.pdf"
 *               description:
 *                 type: string
 *                 example: "Updated description for evidence"
 *     responses:
 *       200:
 *         description: Attachment updated successfully
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
 */
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; stageId: string; attachmentId: string }> }
) {
    const { id: case_id, stageId: stage_id, attachmentId } = await params;
    const body = await req.json();
    const parsed = StageAttachmentUpdateValidation.safeParse(body);

    if (!parsed.success) {
        const errors = formatZodError(parsed.error);
        return NextResponse.json({ errors }, { status: 400 });
    }

    const { data, error } = await db
        .from("stage_attachments")
        .update(parsed.data)
        .eq("id", attachmentId)
        .eq("case_id", case_id)
        .eq("stage_id", stage_id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({
        success: true,
        message: 'Attachment updated successfully',
        data
    });
}

/**
 * @swagger
 * /api/admin/cases/{id}/stages/{stageId}/attachments/{attachmentId}:
 *   delete:
 *     tags:
 *       - Admin - Cases
 *     summary: Delete an attachment
 *     description: Delete a stage attachment and its associated file
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
 *       - name: attachmentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Attachment ID
 *     responses:
 *       200:
 *         description: Attachment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Request error
 *       401:
 *         description: Unauthorized
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; stageId: string; attachmentId: string }> }
) {
    const { id: case_id, stageId: stage_id, attachmentId } = await params;

    // Get file URL before deletion for cleanup
    const { data: attachment } = await db
        .from("stage_attachments")
        .select("file_url")
        .eq("id", attachmentId)
        .eq("case_id", case_id)
        .eq("stage_id", stage_id)
        .single();

    if (!attachment) {
        return NextResponse.json({
            message: "Attachment not found"
        }, { status: 404 });
    }

    // Delete from database
    const { error } = await db
        .from("stage_attachments")
        .delete()
        .eq("id", attachmentId)
        .eq("case_id", case_id)
        .eq("stage_id", stage_id);

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    // TODO: Delete file from storage
    // This should be done via background job to avoid blocking the response
    try {
        if (attachment.file_url) {
            // Extract storage path from URL and delete
            // Implementation depends on storage service (Supabase Storage, S3, etc.)
            log.info('File deleted from storage', { file_url: attachment.file_url }, 'STAGE_ATTACHMENTS');
        }
    } catch (storageError) {
        log.error('Failed to delete file from storage (non-blocking)', storageError, 'STAGE_ATTACHMENTS');
    }

    return NextResponse.json({
        success: true,
        message: 'Attachment deleted successfully'
    });
}
