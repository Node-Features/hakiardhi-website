import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { CategoryValidation } from "@/lib/categories/validation";
import { formatZodError } from "@/utils/error_formatter";

const db = supabase(true);

/**
 * @swagger
 * /api/admin/categories:
 *   post:
 *     tags:
 *       - Admin - Categories
 *     summary: Create a new category
 *     description: Create a new category for blogs, incidents, or other content
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
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 example: Land Rights
 *               type:
 *                 type: string
 *                 example: blog
 *               description:
 *                 type: string
 *                 example: Articles about land rights and ownership
 *     responses:
 *       201:
 *         description: Category created successfully
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
 *                     type:
 *                       type: string
 *                     description:
 *                       type: string
 *       400:
 *         description: Validation error or category creation failed
 *       401:
 *         description: Unauthorized
 */
export async function POST(req: NextRequest) {
    const body = await req.json();
    const parsed = CategoryValidation.safeParse(body);

    if (!parsed.success) {
        const errors = formatZodError(parsed.error);
        return NextResponse.json({ errors }, { status: 400 });
    }

    const { data, error } = await db
        .from("categories")
        .insert([parsed.data])
        .select()
        .single();

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Category created successfully', data }, { status: 201 });
}

/**
 * @swagger
 * /api/admin/categories:
 *   get:
 *     tags:
 *       - Admin - Categories
 *     summary: List all categories
 *     description: Get paginated list of categories with optional type filter
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
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by category type (e.g., blog, incident)
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
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
 *                       type:
 *                         type: string
 *                       description:
 *                         type: string
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
    const type = searchParams.get("type");
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = db
        .from("categories")
        .select("id, name, type, description", { count: "exact" });

    // Filter by type if provided
    if (type) {
        query = query.eq("type", type);
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
