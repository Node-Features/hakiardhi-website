import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";

const db = supabase(true);

/**
 * @swagger
 * /api/admin/types:
 *   post:
 *     tags:
 *       - Admin - Category Types
 *     summary: Create a new category type
 *     description: Create a new category type
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
 *                 example: Education
 *               description:
 *                 type: string
 *                 example: Educational content and resources
 *     responses:
 *       201:
 *         description: Type created successfully
 *       400:
 *         description: Validation error or type creation failed
 *       401:
 *         description: Unauthorized
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, description } = body;

        if (!name || !name.trim()) {
            return NextResponse.json(
                { success: false, message: 'Name is required' },
                { status: 400 }
            );
        }

        const { data, error } = await db
            .from("category_types")
            .insert([{ name: name.trim(), description: description?.trim() || null }])
            .select()
            .single();

        if (error) {
            if (error.code === '23505') { // Unique violation
                return NextResponse.json(
                    { success: false, message: 'A type with this name already exists' },
                    { status: 400 }
                );
            }
            return NextResponse.json(
                { success: false, message: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: true, message: 'Type created successfully', data },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * @swagger
 * /api/admin/types:
 *   get:
 *     tags:
 *       - Admin - Category Types
 *     summary: List all category types
 *     description: Get paginated list of category types
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
 *     responses:
 *       200:
 *         description: Types retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 10;
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, error, count } = await db
            .from("category_types")
            .select("id, name, description, created_at, updated_at", { count: "exact" })
            .order("name", { ascending: true })
            .range(from, to);

        if (error) {
            return NextResponse.json(
                { success: false, message: error.message },
                { status: 400 }
            );
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
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
