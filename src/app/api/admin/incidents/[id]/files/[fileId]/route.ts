import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { log } from "@/utils/logger";

const db = supabase(true);

/**
 * @swagger
 * /api/admin/incidents/{id}/files/{fileId}:
 *   delete:
 *     tags:
 *       - Admin - Incidents
 *     summary: Delete incident evidence file
 *     description: Delete a specific evidence file from an incident
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
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: File ID to delete
 *     responses:
 *       200:
 *         description: File deleted successfully
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
 *       404:
 *         description: File not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string; fileId: string }> }
) {
    const startTime = Date.now();
    const { id: incident_id, fileId } = await context.params;

    log.request('DELETE', `/api/admin/incidents/${incident_id}/files/${fileId}`, { incident_id, fileId });

    try {
        // First, verify the file exists and belongs to this incident
        const { data: fileData, error: fetchError } = await db
            .from("incident_files")
            .select("id, file_url, file_name")
            .eq("id", fileId)
            .eq("incident_id", incident_id)
            .single();

        if (fetchError || !fileData) {
            log.warn('File not found or does not belong to incident', { incident_id, fileId }, 'INCIDENT_FILES');
            const duration = Date.now() - startTime;
            log.response('DELETE', `/api/admin/incidents/${incident_id}/files/${fileId}`, 404, duration);
            return NextResponse.json({
                message: 'File not found or does not belong to this incident'
            }, { status: 404 });
        }

        log.info('Deleting incident evidence file', {
            incident_id,
            fileId,
            fileName: fileData.file_name,
            fileUrl: fileData.file_url
        }, 'INCIDENT_FILES');

        // Delete the file record from database
        const { error: deleteError } = await db
            .from("incident_files")
            .delete()
            .eq("id", fileId)
            .eq("incident_id", incident_id);

        if (deleteError) {
            log.error('Failed to delete file from database', deleteError, 'INCIDENT_FILES');
            const duration = Date.now() - startTime;
            log.response('DELETE', `/api/admin/incidents/${incident_id}/files/${fileId}`, 400, duration);
            return NextResponse.json({
                message: deleteError.message
            }, { status: 400 });
        }

        // Optionally delete from storage (extract path from URL)
        // This is optional because Supabase storage RLS policies might handle cleanup
        // You can also keep files in storage for audit purposes
        try {
            const urlParts = fileData.file_url.split('/');
            const bucketIndex = urlParts.findIndex((part: string) => part === 'incidents');
            if (bucketIndex !== -1) {
                const storagePath = urlParts.slice(bucketIndex + 1).join('/');
                const storageClient = supabase(false);
                await storageClient.storage
                    .from('incidents')
                    .remove([storagePath]);
                log.info('File removed from storage', { storagePath }, 'INCIDENT_FILES');
            }
        } catch (storageError) {
            // Log but don't fail - database record is already deleted
            log.warn('Failed to delete file from storage (non-critical)', { error: storageError }, 'INCIDENT_FILES');
        }

        const duration = Date.now() - startTime;
        log.info('✅ Evidence file deleted successfully', {
            incident_id,
            fileId,
            fileName: fileData.file_name,
            duration: `${duration}ms`
        }, 'INCIDENT_FILES');

        log.response('DELETE', `/api/admin/incidents/${incident_id}/files/${fileId}`, 200, duration);

        return NextResponse.json({
            success: true,
            message: 'Evidence file deleted successfully'
        });
    } catch (error) {
        log.error('Unexpected error during file deletion', error, 'INCIDENT_FILES');
        const duration = Date.now() - startTime;
        log.response('DELETE', `/api/admin/incidents/${incident_id}/files/${fileId}`, 500, duration);
        return NextResponse.json({
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
