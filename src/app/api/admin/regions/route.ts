import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { RegionValidation } from "@/lib/geography/validation";
import { formatZodError } from "@/utils/error_formatter";

const db = supabase(true);

/**
 * @swagger
 * /api/admin/regions:
 *   post:
 *     tags:
 *       - Admin - Regions
 *     summary: Create a new region
 *     description: Create a new region in the system
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Dodoma
 *               code:
 *                 type: string
 *                 example: DDM
 *               description:
 *                 type: string
 *                 example: Central region of Tanzania
 *     responses:
 *       201:
 *         description: Region created successfully
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
 *   get:
 *     tags:
 *       - Admin - Regions
 *     summary: List all regions
 *     description: Get paginated list of regions with optional filters and statistics
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
 *           default: 50
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search regions by name
 *       - in: query
 *         name: include_stats
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include statistics (districts, villages, projects counts)
 *       - in: query
 *         name: has_projects
 *         schema:
 *           type: boolean
 *         description: Filter regions that have or don't have projects
 *     responses:
 *       200:
 *         description: List of regions retrieved successfully
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
 *                 summary:
 *                   type: object
 *                   properties:
 *                     total_regions:
 *                       type: integer
 *                     total_districts:
 *                       type: integer
 *                     total_villages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
// CREATE REGION
export async function POST(req: NextRequest) {
    const body = await req.json();
    const parsed = RegionValidation.safeParse(body);

    if (!parsed.success) {
        const errors = formatZodError(parsed.error);
        return NextResponse.json({ errors }, { status: 400 });
    }

    const { data, error } = await db
        .from("regions")
        .insert([parsed.data])
        .select()
        .single();

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Region created successfully', data }, { status: 201 });
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 50;
    const search = searchParams.get("search");
    const include_stats = searchParams.get("include_stats") === "true";
    const has_projects = searchParams.get("has_projects");
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = db
        .from("regions")
        .select("id, name", { count: "exact" });

    // Search by name if provided
    if (search) {
        query = query.ilike("name", `%${search}%`);
    }

    const { data: regions, error, count } = await query
        .order("name", { ascending: true })
        .range(from, to);

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    // Enrich with statistics if requested
    let enrichedRegions = regions || [];
    if (include_stats) {
        enrichedRegions = await Promise.all(regions!.map(async (region) => {
            const { count: districts_count } = await db
                .from("districts")
                .select("id", { count: "exact", head: true })
                .eq("region_id", region.id);

            const { data: districts } = await db
                .from("districts")
                .select("id")
                .eq("region_id", region.id);

            const districtIds = districts?.map(d => d.id) || [];
            let villages_count = 0;
            if (districtIds.length > 0) {
                const { count } = await db
                    .from("villages")
                    .select("id", { count: "exact", head: true })
                    .in("district_id", districtIds);
                villages_count = count || 0;
            }

            const { count: projects_count } = await db
                .from("project_locations")
                .select("project_id", { count: "exact", head: true })
                .eq("region_id", region.id);

            return {
                ...region,
                districts_count: districts_count || 0,
                villages_count,
                projects_count: projects_count || 0
            };
        }));
    }

    // Filter by has_projects if specified
    if (has_projects !== null && has_projects !== undefined) {
        enrichedRegions = enrichedRegions.filter(r =>
            has_projects === "true" ? (r as any).projects_count > 0 : (r as any).projects_count === 0
        );
    }

    // Get summary statistics
    const { count: total_regions } = await db
        .from("regions")
        .select("id", { count: "exact", head: true });

    const { count: total_districts } = await db
        .from("districts")
        .select("id", { count: "exact", head: true });

    const { count: total_villages } = await db
        .from("villages")
        .select("id", { count: "exact", head: true });

    return NextResponse.json({
        success: true,
        data: enrichedRegions,
        meta: {
            page,
            limit,
            total: count,
            total_pages: Math.ceil((count || 0) / limit),
        },
        summary: {
            total_regions: total_regions || 0,
            total_districts: total_districts || 0,
            total_villages: total_villages || 0
        }
    });
}
