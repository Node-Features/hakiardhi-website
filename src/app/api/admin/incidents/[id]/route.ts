import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { IncidentUpdateValidation } from "@/lib/incidents/validation";
import { formatZodError } from "@/utils/error_formatter";

const db = supabase(true);

/**
 * @swagger
 * /api/admin/incidents/{id}:
 *   get:
 *     tags:
 *       - Admin - Incidents
 *     summary: Get a single incident
 *     description: Retrieve detailed information about a specific incident including location, reporter, and files
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
 *         description: Incident retrieved successfully
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
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                     regions:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                     districts:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                     villages:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                     categories:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         type:
 *                           type: string
 *                         description:
 *                           type: string
 *                     users:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         first_name:
 *                           type: string
 *                         last_name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         phone_number:
 *                           type: string
 *                     incident_files:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           file_url:
 *                             type: string
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *       404:
 *         description: Incident not found
 *       401:
 *         description: Unauthorized
 */
export async function GET(
      req: NextRequest,
      { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const { data, error } = await db
        .from("incidents")
        .select(`
            id, name, description, status, priority,
            region_id, district_id, village_id, category_id, reported_by,
            created_at, updated_at,
            regions(id, name),
            districts(id, name),
            villages(id, name),
            categories(id, name, type, description),
            users!incidents_reported_by_fkey(id, first_name, last_name, email, phone_number),
            incident_files(id, file_url, name:file_name, description, created_at)
        `)
        .eq("id", id)
        .single();

    if (error) {
        // Log the actual error for debugging
        console.error(`[Incidents API] Error fetching incident ${id}:`, error);

        // Return 404 only for "not found" errors, 500 for others
        const status = error.code === 'PGRST116' ? 404 : 500;
        return NextResponse.json({
            message: error.code === 'PGRST116'
                ? 'Incident not found'
                : 'Failed to fetch incident',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status });
    }

    return NextResponse.json({ success: true, data });
}

/**
 * @swagger
 * /api/admin/incidents/{id}:
 *   put:
 *     tags:
 *       - Admin - Incidents
 *     summary: Update an incident
 *     description: Update an existing incident
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               region_id:
 *                 type: string
 *                 format: uuid
 *               district_id:
 *                 type: string
 *                 format: uuid
 *               village_id:
 *                 type: string
 *                 format: uuid
 *               category_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Incident updated successfully
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
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     region_id:
 *                       type: string
 *                     district_id:
 *                       type: string
 *                     village_id:
 *                       type: string
 *                     category_id:
 *                       type: string
 *                     reported_by:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error or update failed
 *       404:
 *         description: Incident not found
 *       401:
 *         description: Unauthorized
 */
export async function PUT(
      req: NextRequest,
      { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await req.json();
    const parsed = IncidentUpdateValidation.safeParse(body);

    if (!parsed.success) {
        const errors = formatZodError(parsed.error);
        return NextResponse.json({ errors }, { status: 400 });
    }

    const { data, error } = await db
        .from("incidents")
        .update(parsed.data)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({
        success: true,
        message: 'Incident updated successfully',
        data
    });
}

/**
 * @swagger
 * /api/admin/incidents/{id}:
 *   delete:
 *     tags:
 *       - Admin - Incidents
 *     summary: Delete an incident
 *     description: Delete an existing incident (only if not linked to a case)
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
 *         description: Incident deleted successfully
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
 *         description: Delete failed
 *       404:
 *         description: Incident not found
 *       409:
 *         description: Cannot delete incident that is linked to a case
 *       401:
 *         description: Unauthorized
 */
export async function DELETE(
      req: NextRequest,
      { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    // Check if incident is linked to a case
    const { data: linkedCase } = await db
        .from("cases")
        .select("id")
        .eq("incident_id", id)
        .single();

    if (linkedCase) {
        return NextResponse.json({
            message: "Cannot delete incident that is linked to a case"
        }, { status: 409 });
    }

    const { error } = await db
        .from("incidents")
        .delete()
        .eq("id", id);

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({
        success: true,
        message: 'Incident deleted successfully'
    });
}