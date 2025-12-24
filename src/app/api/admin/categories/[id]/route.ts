import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { CategoryUpdateValidation } from "@/lib/categories/validation";
import { formatZodError } from "@/utils/error_formatter";

const db = supabase(true);

/**
 * @swagger
 * /api/admin/categories/{id}:
 *   get:
 *     tags:
 *       - Admin - Categories
 *     summary: Get a single category
 *     description: Retrieve detailed information about a specific category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
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
 *       404:
 *         description: Category not found
 *       401:
 *         description: Unauthorized
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Changed to Promise
) {
  const { id } = await params; // ✅ Added await

  const { data, error } = await db
    .from("categories")
    .select("id, name, type, description")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }

  return NextResponse.json({ success: true, data });
}

/**
 * @swagger
 * /api/admin/categories/{id}:
 *   put:
 *     tags:
 *       - Admin - Categories
 *     summary: Update a category
 *     description: Update an existing category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated successfully
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
 *         description: Validation error or update failed
 *       404:
 *         description: Category not found
 *       401:
 *         description: Unauthorized
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Changed to Promise
) {
  const { id } = await params; // ✅ Added await
  const body = await req.json();
  const parsed = CategoryUpdateValidation.safeParse(body);

  if (!parsed.success) {
    const errors = formatZodError(parsed.error);
    return NextResponse.json({ errors }, { status: 400 });
  }

  const { data, error } = await db
    .from("categories")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    message: "Category updated successfully",
    data,
  });
}

/**
 * @swagger
 * /api/admin/categories/{id}:
 *   delete:
 *     tags:
 *       - Admin - Categories
 *     summary: Delete a category
 *     description: Delete an existing category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
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
 *         description: Delete failed
 *       404:
 *         description: Category not found
 *       401:
 *         description: Unauthorized
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Changed to Promise
) {
  const { id } = await params; // ✅ Added await

  const { error } = await db.from("categories").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    message: "Category deleted successfully",
  });
}