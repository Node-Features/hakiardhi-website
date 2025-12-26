import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { log } from "@/utils/logger";
import { z } from "zod";
import { formatZodError } from "@/utils/error_formatter";

const db = supabase(true);

const StatusUpdateSchema = z.object({
    status: z.string().min(1, { message: "Status is required." }),
});

/**
 * @swagger
 * /api/admin/incidents/{id}/status:
 *   patch:
 *     tags:
 *       - Admin - Incidents
 *     summary: Update incident status
 *     description: Update the status of a specific incident
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 example: Verified
 *                 description: New status for the incident
 *     responses:
 *       200:
 *         description: Status updated successfully
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
 *       404:
 *         description: Incident not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const startTime = Date.now();
    const { id } = await context.params;

    log.request('PATCH', `/api/admin/incidents/${id}/status`, { incident_id: id });

    try {
        const body = await req.json();
        const parsed = StatusUpdateSchema.safeParse(body);

        if (!parsed.success) {
            const errors = formatZodError(parsed.error);
            log.validation('Status validation failed', errors);
            const duration = Date.now() - startTime;
            log.response('PATCH', `/api/admin/incidents/${id}/status`, 400, duration);
            return NextResponse.json({ errors }, { status: 400 });
        }

        const { status } = parsed.data;

        log.info('Updating incident status', {
            incident_id: id,
            new_status: status
        }, 'INCIDENTS');

        // Update the incident status
        const { data, error } = await db
            .from("incidents")
            .update({ status, updated_at: new Date().toISOString() })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                log.warn('Incident not found for status update', { incident_id: id }, 'INCIDENTS');
                const duration = Date.now() - startTime;
                log.response('PATCH', `/api/admin/incidents/${id}/status`, 404, duration);
                return NextResponse.json({
                    message: 'Incident not found'
                }, { status: 404 });
            }

            log.error('Failed to update incident status', error, 'INCIDENTS');
            const duration = Date.now() - startTime;
            log.response('PATCH', `/api/admin/incidents/${id}/status`, 400, duration);
            return NextResponse.json({ message: error.message }, { status: 400 });
        }

        const duration = Date.now() - startTime;
        log.info('✅ Incident status updated successfully', {
            incident_id: id,
            new_status: status,
            duration: `${duration}ms`
        }, 'INCIDENTS');

        log.response('PATCH', `/api/admin/incidents/${id}/status`, 200, duration);

        return NextResponse.json({
            success: true,
            message: 'Status updated successfully',
            data
        });
    } catch (error) {
        log.error('Unexpected error during status update', error, 'INCIDENTS');
        const duration = Date.now() - startTime;
        log.response('PATCH', `/api/admin/incidents/${id}/status`, 500, duration);
        return NextResponse.json({
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
