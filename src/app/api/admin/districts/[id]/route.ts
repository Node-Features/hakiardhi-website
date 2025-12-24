import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { DistrictUpdateValidation } from "@/lib/geography/validation";
import { formatZodError } from "@/utils/error_formatter";

const db = supabase(true);

/**
 * @swagger
 * /api/admin/districts/{id}:
 *   get:
 *     tags:
 *       - Admin - Districts
 *     summary: Get district by ID
 *     description: Retrieve a specific district with its region information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: District ID
 *     responses:
 *       200:
 *         description: District retrieved successfully
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
 *         description: District not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   put:
 *     tags:
 *       - Admin - Districts
 *     summary: Update district
 *     description: Update district information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: District ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               region_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: District updated successfully
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
 *       - Admin - Districts
 *     summary: Delete district
 *     description: Delete a district
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: District ID
 *     responses:
 *       200:
 *         description: District deleted successfully
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
// GET SINGLE DISTRICT
export async function GET(
      req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const { data, error } = await db
        .from("districts")
        .select("id, name, region_id, regions(id, name)")
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
    const parsed = DistrictUpdateValidation.safeParse(body);

    if (!parsed.success) {
        const errors = formatZodError(parsed.error);
        return NextResponse.json({ errors }, { status: 400 });
    }

    const { data, error } = await db
        .from("districts")
        .update(parsed.data)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'District updated successfully', data });
}

export async function DELETE(
      req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const { error } = await db
        .from("districts")
        .delete()
        .eq("id", id);

    if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'District deleted successfully' });
}
