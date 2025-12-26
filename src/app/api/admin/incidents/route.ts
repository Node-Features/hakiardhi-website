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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *         description: Filter by priority (low, medium, high, urgent)
 *       - in: query
 *         name: created_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by created date from (YYYY-MM-DD)
 *       - in: query
 *         name: created_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by created date to (YYYY-MM-DD)
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *         description: Filter by month (1-12, requires year)
 *       - in: query
 *         name: quarter
 *         schema:
 *           type: string
 *         description: Filter by quarter (Q1, Q2, Q3, Q4, requires year)
 *       - in: query
 *         name: year
 *         schema:
 *           type: string
 *         description: Filter by year (YYYY)
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
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const region_id = searchParams.get("region_id");
    const district_id = searchParams.get("district_id");
    const village_id = searchParams.get("village_id");
    const category_id = searchParams.get("category_id");
    const reported_by = searchParams.get("reported_by");
    const created_from = searchParams.get("created_from");
    const created_to = searchParams.get("created_to");
    const month = searchParams.get("month");
    const quarter = searchParams.get("quarter");
    const year = searchParams.get("year");
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = db
        .from("incidents")
        .select(`
            id, name, description, status, priority,
            region_id, district_id, village_id, category_id, reported_by,
            created_at, updated_at,
            regions(id, name),
            districts(id, name),
            villages(id, name),
            categories(id, name, type),
            beneficiaries!incidents_reported_by_fkey(id, first_name, last_name, phone_number)
        `, { count: "exact" });

    // Apply basic filters
    if (search) {
        query = query.ilike("name", `%${search}%`);
    }
    if (status) {
        query = query.eq("status", status);
    }
    if (priority) {
        query = query.eq("priority", priority);
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

    // Apply date range filters
    if (created_from) {
        query = query.gte("created_at", created_from);
    }
    if (created_to) {
        // Add one day to include the entire end date
        const endDate = new Date(created_to);
        endDate.setDate(endDate.getDate() + 1);
        query = query.lt("created_at", endDate.toISOString());
    }

    // Apply time dimension filters
    if (year) {
        const yearNum = parseInt(year);
        const yearStart = new Date(yearNum, 0, 1).toISOString();
        const yearEnd = new Date(yearNum + 1, 0, 1).toISOString();
        query = query.gte("created_at", yearStart).lt("created_at", yearEnd);
    }

    if (quarter && year) {
        const yearNum = parseInt(year);
        let startMonth, endMonth;

        switch (quarter) {
            case 'Q1':
                startMonth = 0; // January
                endMonth = 3;   // April
                break;
            case 'Q2':
                startMonth = 3; // April
                endMonth = 6;   // July
                break;
            case 'Q3':
                startMonth = 6; // July
                endMonth = 9;   // October
                break;
            case 'Q4':
                startMonth = 9;  // October
                endMonth = 12;   // January of next year
                break;
            default:
                startMonth = 0;
                endMonth = 12;
        }

        const quarterStart = new Date(yearNum, startMonth, 1).toISOString();
        const quarterEnd = new Date(yearNum, endMonth, 1).toISOString();
        query = query.gte("created_at", quarterStart).lt("created_at", quarterEnd);
    }

    if (month && year) {
        const yearNum = parseInt(year);
        const monthNum = parseInt(month) - 1; // JavaScript months are 0-indexed
        const monthStart = new Date(yearNum, monthNum, 1).toISOString();
        const monthEnd = new Date(yearNum, monthNum + 1, 1).toISOString();
        query = query.gte("created_at", monthStart).lt("created_at", monthEnd);
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
