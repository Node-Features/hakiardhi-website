import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { ProjectValidation } from "@/lib/projects/validations";
import { formatZodError } from "@/utils/error_formatter";

const db = supabase(true);

/**
 * @swagger
 * /api/admin/projects:
 *   post:
 *     tags:
 *       - Admin - Projects
 *     summary: Create a new project
 *     description: Create a new project with locations
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - start_date
 *               - locations
 *             properties:
 *               title:
 *                 type: string
 *                 example: Land Rights Education Project
 *               description:
 *                 type: string
 *                 example: Community education on land rights and ownership
 *               start_date:
 *                 type: string
 *                 format: date
 *                 example: 2025-01-01
 *               end_date:
 *                 type: string
 *                 format: date
 *                 example: 2025-12-31
 *               status:
 *                 type: string
 *                 enum: [Planning, Active, Completed, On Hold]
 *                 default: Planning
 *               locations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - region_id
 *                     - district_id
 *                     - village_id
 *                   properties:
 *                     region_id:
 *                       type: string
 *                       format: uuid
 *                     district_id:
 *                       type: string
 *                       format: uuid
 *                     village_id:
 *                       type: string
 *                       format: uuid
 *     responses:
 *       201:
 *         description: Project created successfully
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
 *         description: Validation error or project already exists
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   get:
 *     tags:
 *       - Admin - Projects
 *     summary: List all projects
 *     description: Get paginated list of projects with optional filters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Planning, Active, Completed, On Hold]
 *         description: Filter by project status
 *       - in: query
 *         name: region_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by region
 *       - in: query
 *         name: district_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by district
 *       - in: query
 *         name: village_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by village
 *       - in: query
 *         name: start_date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter projects starting from this date
 *       - in: query
 *         name: start_date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter projects starting up to this date
 *     responses:
 *       200:
 *         description: List of projects retrieved successfully
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
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     total_pages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
// CREATE PROJECT
export async function POST(req: NextRequest) {
    const body = await req.json();
    const parsed = ProjectValidation.safeParse(body);

    if (!parsed.success) {
        const errors = formatZodError(parsed.error);
        return NextResponse.json({ errors }, { status: 400 });
    }

    const { locations, ...projectData } = parsed.data;

    // Validate end_date >= start_date
    if (projectData.end_date && projectData.end_date < projectData.start_date) {
        return NextResponse.json({
            message: "End date must be greater than or equal to start date"
        }, { status: 400 });
    }

    const isExisting = await db
        .from("projects")
        .select("id")
        .eq("title", projectData.title)
        .single();

    if (isExisting.data) {
        return NextResponse.json({ message: "Project with this title already exists" }, { status: 400 });
    }

    // Create project
    const { data: project, error: projectError } = await db
        .from("projects")
        .insert([projectData])
        .select()
        .single();

    if (projectError) {
        return NextResponse.json({ message: projectError.message }, { status: 400 });
    }

    // Insert project locations
    const locationRecords = locations.map(loc => ({
        project_id: project.id,
        ...loc
    }));

    const { error: locationsError } = await db
        .from("project_locations")
        .insert(locationRecords);

    if (locationsError) {
        // Rollback: delete the project
        await db.from("projects").delete().eq("id", project.id);
        return NextResponse.json({ message: locationsError.message }, { status: 400 });
    }

    // Fetch complete project with locations
    const { data: completeProject } = await db
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
        .eq("id", project.id)
        .single();

    return NextResponse.json({
        success: true,
        message: 'Project created successfully',
        data: completeProject
    }, { status: 201 });
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const status = searchParams.get("status");
    const region_id = searchParams.get("region_id");
    const district_id = searchParams.get("district_id");
    const village_id = searchParams.get("village_id");
    const start_date_from = searchParams.get("start_date_from");
    const start_date_to = searchParams.get("start_date_to");
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = db
        .from("projects")
        .select(`
            id, title, description, start_date, end_date, status, created_at, updated_at
        `, { count: "exact" });

    // Apply filters
    if (status) {
        query = query.eq("status", status);
    }
    if (start_date_from) {
        query = query.gte("start_date", start_date_from);
    }
    if (start_date_to) {
        query = query.lte("start_date", start_date_to);
    }

    const { data: projects, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    // Filter by location if specified
    let filteredProjects = projects || [];
    if (region_id || district_id || village_id) {
        const projectIds = filteredProjects.map(p => p.id);
        if (projectIds.length > 0) {
            let locationQuery = db
                .from("project_locations")
                .select("project_id")
                .in("project_id", projectIds);

            if (region_id) locationQuery = locationQuery.eq("region_id", region_id);
            if (district_id) locationQuery = locationQuery.eq("district_id", district_id);
            if (village_id) locationQuery = locationQuery.eq("village_id", village_id);

            const { data: locationMatches } = await locationQuery;
            const matchingIds = locationMatches?.map(l => l.project_id) || [];
            filteredProjects = filteredProjects.filter(p => matchingIds.includes(p.id));
        }
    }

    // Enrich with locations and stats
    const enrichedProjects = await Promise.all(filteredProjects.map(async (project) => {
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
            .eq("project_id", project.id);

        const { count: total_activities } = await db
            .from("activities")
            .select("id", { count: "exact", head: true })
            .eq("project_id", project.id);

        const { count: completed_activities } = await db
            .from("activities")
            .select("id", { count: "exact", head: true })
            .eq("project_id", project.id)
            .eq("status", "Completed");

        // Get unique beneficiaries count
        const { data: activityBeneficiaries } = await db
            .from("activities")
            .select("id")
            .eq("project_id", project.id);

        const activityIds = activityBeneficiaries?.map(a => a.id) || [];
        let total_beneficiaries = 0;
        if (activityIds.length > 0) {
            const { count } = await db
                .from("activity_beneficiaries")
                .select("beneficiary_id", { count: "exact", head: true })
                .in("activity_id", activityIds);
            total_beneficiaries = count || 0;
        }

        return {
            ...project,
            locations: locations || [],
            total_activities: total_activities || 0,
            completed_activities: completed_activities || 0,
            total_beneficiaries
        };
    }));

    return NextResponse.json({
        success: true,
        data: enrichedProjects,
        meta: {
            page,
            limit,
            total: count,
            total_pages: Math.ceil((count || 0) / limit),
        },
    });
}
