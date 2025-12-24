import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { ProjectLocationValidation } from "@/lib/projects/validations";
import { formatZodError } from "@/utils/error_formatter";

const db = supabase(true);

/**
 * @swagger
 * /api/admin/projects/{id}/locations:
 *   get:
 *     tags:
 *       - Admin - Projects
 *     summary: Get project locations
 *     description: Retrieve all locations associated with a project
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
 *         description: Project locations retrieved successfully
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
 *       400:
 *         description: Request error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   post:
 *     tags:
 *       - Admin - Projects
 *     summary: Add location to project
 *     description: Add a new location to a project
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
 *             required:
 *               - region_id
 *               - district_id
 *               - village_id
 *             properties:
 *               region_id:
 *                 type: string
 *                 format: uuid
 *               district_id:
 *                 type: string
 *                 format: uuid
 *               village_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Location added successfully
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
 *         description: Validation error or location already exists
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
// GET PROJECT LOCATIONS
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;

    const { data, error } = await db
        .from("project_locations")
        .select(`
            id, project_id,
            regions(id, name),
            districts(id, name),
            villages(id, name)
        `)
        .eq("project_id", id);

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({
        success: true,
        data: data || []
    });
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id: project_id } = await context.params;
    const body = await req.json();
    const parsed = ProjectLocationValidation.safeParse(body);

    if (!parsed.success) {
        const errors = formatZodError(parsed.error);
        return NextResponse.json({ errors }, { status: 400 });
    }

    // Check for duplicate
    const { data: existing } = await db
        .from("project_locations")
        .select("id")
        .eq("project_id", project_id)
        .eq("region_id", parsed.data.region_id)
        .eq("district_id", parsed.data.district_id)
        .eq("village_id", parsed.data.village_id)
        .single();

    if (existing) {
        return NextResponse.json({
            message: "This location is already assigned to the project"
        }, { status: 400 });
    }

    const { data, error } = await db
        .from("project_locations")
        .insert([{ project_id, ...parsed.data }])
        .select(`
            id,
            regions(id, name),
            districts(id, name),
            villages(id, name)
        `)
        .single();

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({
        success: true,
        message: 'Location added to project successfully',
        data
    }, { status: 201 });
}
