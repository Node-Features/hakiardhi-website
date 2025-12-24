import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { IncidentValidation } from "@/lib/incidents/validation";
import { formatZodError } from "@/utils/error_formatter";

const db = supabase(true);

/**
 * @swagger
 * /api/admin/incidents:
 *   post:
 *     tags:
 *       - Admin - Incidents
 *     summary: Create a new incident
 *     description: Report a new incident with location and category information
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
 *               - description
 *               - region_id
 *               - district_id
 *               - village_id
 *               - category_id
 *               - reported_by
 *             properties:
 *               name:
 *                 type: string
 *                 example: Land Dispute in Kilimani
 *               description:
 *                 type: string
 *                 example: Detailed description of the incident...
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
 *               reported_by:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Incident reported successfully
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
 *         description: Validation error or incident creation failed
 *       401:
 *         description: Unauthorized
 */
export async function POST(req: NextRequest) {
    const body = await req.json();
    const parsed = IncidentValidation.safeParse(body);

    if (!parsed.success) {
        const errors = formatZodError(parsed.error);
        return NextResponse.json({ errors }, { status: 400 });
    }

    const { data, error } = await db
        .from("incidents")
        .insert([parsed.data])
        .select()
        .single();

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({
        success: true,
        message: 'Incident reported successfully',
        data
    }, { status: 201 });
}

/**
 * @swagger
 * /api/admin/incidents:
 *   get:
 *     tags:
 *       - Admin - Incidents
 *     summary: List all incidents
 *     description: Get paginated list of incidents with optional filters
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by incident name
 *       - in: query
 *         name: region_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by region ID
 *       - in: query
 *         name: district_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by district ID
 *       - in: query
 *         name: village_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by village ID
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by category ID
 *       - in: query
 *         name: reported_by
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by reporter user ID
 *     responses:
 *       200:
 *         description: Incidents retrieved successfully
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
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                       regions:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                       districts:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                       villages:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                       categories:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           type:
 *                             type: string
 *                       users:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           first_name:
 *                             type: string
 *                           last_name:
 *                             type: string
 *                           email:
 *                             type: string
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
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const search = searchParams.get("search");
    const region_id = searchParams.get("region_id");
    const district_id = searchParams.get("district_id");
    const village_id = searchParams.get("village_id");
    const category_id = searchParams.get("category_id");
    const reported_by = searchParams.get("reported_by");
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = db
        .from("incidents")
        .select(`
            id, name, description, created_at, updated_at,
            regions(id, name),
            districts(id, name),
            villages(id, name),
            categories(id, name, type),
            users!incidents_reported_by_fkey(id, first_name, last_name, email)
        `, { count: "exact" });

    // Apply filters
    if (search) {
        query = query.ilike("name", `%${search}%`);
    }
    if (region_id) {
        query = query.eq("region_id", region_id);
    }
    if (district_id) {
        query = query.eq("district_id", district_id);
    }
    if (village_id) {
        query = query.eq("village_id", village_id);
    }
    if (category_id) {
        query = query.eq("category_id", category_id);
    }
    if (reported_by) {
        query = query.eq("reported_by", reported_by);
    }

    const { data, error, count } = await query
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
