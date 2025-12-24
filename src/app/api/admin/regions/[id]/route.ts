import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { RegionUpdateValidation } from "@/lib/geography/validation";
import { formatZodError } from "@/utils/error_formatter";

const db = supabase(true);

/**
 * @swagger
 * /api/admin/regions/{id}:
 *   get:
 *     tags:
 *       - Admin - Regions
 *     summary: Get region by ID
 *     description: Retrieve a specific region
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Region ID
 *     responses:
 *       200:
 *         description: Region retrieved successfully
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
 *         description: Region not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   put:
 *     tags:
 *       - Admin - Regions
 *     summary: Update region
 *     description: Update region information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Region ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Region updated successfully
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
 *       - Admin - Regions
 *     summary: Delete region
 *     description: Delete a region
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Region ID
 *     responses:
 *       200:
 *         description: Region deleted successfully
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
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
// GET SINGLE REGION
export async function GET(
      req: NextRequest,
      { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const { data, error } = await db
        .from("regions")
        .select("id, name")
        .eq("id", id)
        .single();

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await req.json();
    const parsed = RegionUpdateValidation.safeParse(body);

    if (!parsed.success) {
        const errors = formatZodError(parsed.error);
        return NextResponse.json({ errors }, { status: 400 });
    }

    const { data, error } = await db
        .from("regions")
        .update(parsed.data)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Region updated successfully', data });
}

export async function DELETE(
      req: NextRequest,
      { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const { error } = await db
        .from("regions")
        .delete()
        .eq("id", id);

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Region deleted successfully' });
}
