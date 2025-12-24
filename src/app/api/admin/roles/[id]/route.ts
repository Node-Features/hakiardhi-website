import { supabase } from "@/lib/database/supabase_client";
import { RoleSchema } from "@/lib/roles/validation";
import { formatZodError } from "@/utils/error_formatter";

const db = supabase(false)

import { NextRequest } from "next/server";

/**
 * @swagger
 * /api/admin/roles/{id}:
 *   get:
 *     tags:
 *       - Admin - Roles
 *     summary: Get a role
 *     description: Retrieve a single role by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Role retrieved successfully
 *       400:
 *         description: Missing ID
 *       404:
 *         description: Role not found
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params
    const { id } = await params;
    if (!id) {
      return Response.json({ message: "Missing ID" }, { status: 400 });
    }

    const { data, error } = await db.from("roles").select("*").eq("id", id).single();

    if (error) {
      return Response.json({ message: error.message }, { status: 404 });
    }

    return Response.json({ role: data }, { status: 200 });
  } catch (err) {
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/admin/roles/{id}:
 *   put:
 *     tags:
 *       - Admin - Roles
 *     summary: Update a role
 *     description: Update role details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: Validation error or update failed
 */
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
    if (!id) {
      return Response.json({ message: "Missing ID" }, { status: 400 });
    }

  const body = await req.json();

  const parsed = RoleSchema.safeParse(body);
  if (!parsed.success) {
    const errors = formatZodError(parsed.error);
    return Response.json({ errors }, { status: 400 });
  }

  const { name } = parsed.data;

  const { data, error } = await db.from("roles").update({ name }).eq("id", id).select().single();

  if (error) return Response.json({ message: error.message }, { status: 400 });
  return Response.json({ message: "Role updated successfully", role: data });
}

/**
 * @swagger
 * /api/admin/roles/{id}:
 *   delete:
 *     tags:
 *       - Admin - Roles
 *     summary: Delete a role
 *     description: Remove a role from the system
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       400:
 *         description: Missing ID or deletion failed
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    
  const { id } = await params;
    if (!id) {
      return Response.json({ message: "Missing ID" }, { status: 400 });
    }

  const { error } = await db.from("roles").delete().eq("id", id);

  if (error) return Response.json({ message: error.message }, { status: 400 });
  return Response.json({ message: "Role deleted successfully" });
}
