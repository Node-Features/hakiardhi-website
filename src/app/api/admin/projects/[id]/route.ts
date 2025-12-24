import { supabase } from "@/lib/database/supabase_client";
import { ProjectUpdateValidation } from "@/lib/projects/validations";
import { formatZodError } from "@/utils/error_formatter";
import { toEAT } from "@/utils/utilities";
import { NextRequest, NextResponse } from "next/server";

const db = supabase(true);

/**
 * @swagger
 * /api/admin/projects/{id}:
 *   get:
 *     tags:
 *       - Admin - Projects
 *     summary: Get project by ID
 *     description: Retrieve detailed information about a specific project
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
 *         description: Project details retrieved successfully
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
 *         description: Project not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   put:
 *     tags:
 *       - Admin - Projects
 *     summary: Update project
 *     description: Update project information
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
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [Planning, Active, Completed, On Hold]
 *     responses:
 *       200:
 *         description: Project updated successfully
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
 *   delete:
 *     tags:
 *       - Admin - Projects
 *     summary: Delete project
 *     description: Delete a project (only if it has no active dependencies)
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
 *         description: Project deleted successfully
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
 *         description: Delete error
 *       409:
 *         description: Cannot delete project with active dependencies
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
// GET SINGLE PROJECT
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    
    if (!id) {
        return NextResponse.json({ message: "Project ID required" }, { status: 400 });
    }

    const { data: project, error } = await db
        .from("projects")
        .select(`id, title, description, start_date, end_date, status, created_at, updated_at`)
        .eq("id", id)
        .single();

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 404 });
    }

    // Get locations
    const { data: locations } = await db
        .from("project_locations")
        .select(`
            id,
            region_id,
            district_id,
            village_id,
            regions(id, name),
            districts(id, name),
            villages(id, name)
        `)
        .eq("project_id", id);

    // Get activities
    const { data: activities } = await db
        .from("activities")
        .select(`
            id, name, status, start_date, end_date
        `)
        .eq("project_id", id);

    // Get activity counts
    const { count: total_activities } = await db
        .from("activities")
        .select("id", { count: "exact", head: true })
        .eq("project_id", id);

    const { count: completed_activities } = await db
        .from("activities")
        .select("id", { count: "exact", head: true })
        .eq("project_id", id)
        .eq("status", "Completed");

    const { count: ongoing_activities } = await db
        .from("activities")
        .select("id", { count: "exact", head: true })
        .eq("project_id", id)
        .eq("status", "Ongoing");

    const { count: pending_activities } = await db
        .from("activities")
        .select("id", { count: "exact", head: true })
        .eq("project_id", id)
        .eq("status", "Pending");

    // Get beneficiaries count
    const activityIds = activities?.map(a => a.id) || [];
    let total_beneficiaries = 0;
    if (activityIds.length > 0) {
        const { count } = await db
            .from("activity_beneficiaries")
            .select("beneficiary_id", { count: "exact", head: true })
            .in("activity_id", activityIds);
        total_beneficiaries = count || 0;
    }

    // Add beneficiaries_count to each activity
    const enrichedActivities = await Promise.all((activities || []).map(async (activity) => {
        const { count: beneficiaries_count } = await db
            .from("activity_beneficiaries")
            .select("id", { count: "exact", head: true })
            .eq("activity_id", activity.id);

        return {
            ...activity,
            beneficiaries_count: beneficiaries_count || 0
        };
    }));

    // Get files
    const { data: files, count: total_files } = await db
        .from("project_files")
        .select("id, name, file_url, description, created_at", { count: "exact" })
        .eq("project_id", id);

    return NextResponse.json({
        success: true,
        data: {
            ...project,
            locations: locations || [],
            activities: enrichedActivities,
            statistics: {
                total_activities: total_activities || 0,
                completed_activities: completed_activities || 0,
                ongoing_activities: ongoing_activities || 0,
                pending_activities: pending_activities || 0,
                total_beneficiaries,
                total_files: total_files || 0
            },
            files: files?.map(f => ({
                ...f,
                uploaded_at: f.created_at
            })) || []
        }
    });
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    if (!id) {
        return NextResponse.json({ message: "Project ID required" }, { status: 400 });
    }

    const body = await req.json();

    // Separate locations from other fields
    const { locations, ...projectData } = body;

    const parsed = ProjectUpdateValidation.safeParse(projectData);

    if (!parsed.success) {
        const errors = formatZodError(parsed.error);
        return NextResponse.json({ errors }, { status: 400 });
    }

    // Validate end_date >= start_date if both provided
    if (parsed.data.end_date && parsed.data.start_date && parsed.data.end_date < parsed.data.start_date) {
        return NextResponse.json({
            message: "End date must be greater than or equal to start date"
        }, { status: 400 });
    }

    // Update project basic info
    const { data, error } = await db
        .from("projects")
        .update({ ...parsed.data, updated_at: toEAT() })
        .eq("id", id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    // Update locations if provided
    if (locations && Array.isArray(locations) && locations.length > 0) {
        // Delete existing locations
        await db.from("project_locations").delete().eq("project_id", id);

        // Insert new locations
        const locationRecords = locations.map(loc => ({
            project_id: id,
            region_id: loc.region_id,
            district_id: loc.district_id,
            village_id: loc.village_id
        }));

        const { error: locationsError } = await db
            .from("project_locations")
            .insert(locationRecords);

        if (locationsError) {
            return NextResponse.json({ message: locationsError.message }, { status: 400 });
        }
    }

    // Fetch complete updated project with locations
    const { data: updatedProject } = await db
        .from("projects")
        .select(`
            id, title, description, start_date, end_date, status, created_at, updated_at,
            project_locations(
                id,
                region_id,
                district_id,
                village_id,
                regions(id, name),
                districts(id, name),
                villages(id, name)
            )
        `)
        .eq("id", id)
        .single();

    return NextResponse.json({ success: true, message: 'Project updated successfully', data: updatedProject }, { status: 200 });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    if (!id) {
        return NextResponse.json({ message: "Project ID required" }, { status: 400 });
    }

    // Check for active dependencies
    const { count: activities_count } = await db
        .from("activities")
        .select("id", { count: "exact", head: true })
        .eq("project_id", id);

    if (activities_count && activities_count > 0) {
        return NextResponse.json({
            message: "Cannot delete project with active dependencies. Please delete all activities first."
        }, { status: 409 });
    }

    const { error } = await db
        .from("projects")
        .delete()
        .eq("id", id);

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({
        success: true,
        message: 'Project deleted successfully'
    });
}
