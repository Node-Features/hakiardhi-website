import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { VillageUpdateValidation } from "@/lib/geography/validation";
import { formatZodError } from "@/utils/error_formatter";

const db = supabase(true);
/**
 * @swagger
 * /api/admin/villages/{id}:
 *   get:
 *     tags:
 *       - Admin - Villages
 *     summary: Get village by ID
 *     description: Retrieve a specific village with its district and region information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Village ID
 *     responses:
 *       200:
 *         description: Village retrieved successfully
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
 *         description: Village not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   put:
 *     tags:
 *       - Admin - Villages
 *     summary: Update village
 *     description: Update village information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Village ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               district_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Village updated successfully
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
 *       - Admin - Villages
 *     summary: Delete village
 *     description: Delete a village
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Village ID
 *     responses:
 *       200:
 *         description: Village deleted successfully
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

// GET SINGLE VILLAGE
export async function GET(
      req: NextRequest,
      { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const { data, error } = await db
        .from("villages")
        .select("id, name, district_id, districts(id, name, regions(id, name))")
        .eq("id", id)
        .single();

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
}

// UPDATE VILLAGE
export async function PUT(
      req: NextRequest,
      { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await req.json();
    const parsed = VillageUpdateValidation.safeParse(body);

    if (!parsed.success) {
        const errors = formatZodError(parsed.error);
        return NextResponse.json({ errors }, { status: 400 });
    }

    const { data, error } = await db
        .from("villages")
        .update(parsed.data)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Village updated successfully', data });
}

// DELETE VILLAGE
export async function DELETE(
      req: NextRequest,
      { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const { error } = await db
        .from("villages")
        .delete()
        .eq("id", id);

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Village deleted successfully' });
}