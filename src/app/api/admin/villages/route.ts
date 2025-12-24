import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { VillageValidation } from "@/lib/geography/validation";
import { formatZodError } from "@/utils/error_formatter";

const db = supabase(true);
/**
 * @swagger
 * /api/admin/villages:
 *   post:
 *     tags:
 *       - Admin - Villages
 *     summary: Create a new village
 *     description: Create a new village within a district
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
 *               - district_id
 *             properties:
 *               name:
 *                 type: string
 *                 example: Mwenge
 *               district_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the parent district
 *     responses:
 *       201:
 *         description: Village created successfully
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
 *       - Admin - Villages
 *     summary: List all villages
 *     description: Get paginated list of villages with optional filters
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
 *         name: district_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by district
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search villages by name
 *     responses:
 *       200:
 *         description: List of villages retrieved successfully
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

// CREATE VILLAGE
export async function POST(req: NextRequest) {
    const body = await req.json();
    const parsed = VillageValidation.safeParse(body);

    if (!parsed.success) {
        const errors = formatZodError(parsed.error);
        return NextResponse.json({ errors }, { status: 400 });
    }

    const { data, error } = await db
        .from("villages")
        .insert([parsed.data])
        .select()
        .single();

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Village created successfully', data }, { status: 201 });
}

// LIST VILLAGES WITH PAGINATION
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 50;
    const district_id = searchParams.get("district_id");
    const search = searchParams.get("search");
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = db
        .from("villages")
        .select("id, name, district_id, districts(id, name, regions(id, name))", { count: "exact" });

    // Filter by district if provided
    if (district_id) {
        query = query.eq("district_id", district_id);
    }

    // Search by name if provided
    if (search) {
        query = query.ilike("name", `%${search}%`);
    }

    const { data, error, count } = await query
        .order("name", { ascending: true })
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
