import { supabase } from "@/lib/database/supabase_client";
import { RoleSchema } from "@/lib/roles/validation";
import { formatZodError } from "@/utils/error_formatter";

const db = supabase(false)

import { NextRequest } from "next/server";

/**
 * @swagger
 * /api/admin/permissions/{id}:
 *   post:
 *     tags:
 *       - Admin - Permissions
 *     summary: Assign permission to role
 *     description: Assign a permission to a role
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Permission ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role_id
 *             properties:
 *               role_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Permission assigned successfully
 *       400:
 *         description: Missing ID
 *       404:
 *         description: Permission not found
 *       500:
 *         description: Assignment failed
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {

       const { id } = await params;

       const { role_id } = await req.json()


    if (!id || !role_id) {
      return Response.json({ message: "Missing ID" }, { status: 400 });
    }

       const { data, error } = await db.from("permissions").select("*").eq("id", id).single();

    if (error || !data) {
      return Response.json({ message: error ? error.message : 'Permission does not exists' }, { status: 404 });
    }

    const { data: assigned, error: assign_error } = await db.from('role_permissions')
    .insert({ role_id, permission_id: id}).select().single()

    if(assign_error) return Response.json({ message: 'Assignment failed', assign_error }, { status: 500 })   

    return Response.json({ message: 'Permission has successfully assigned to role', data: assigned})
}

/**
 * @swagger
 * /api/admin/permissions/{id}:
 *   get:
 *     tags:
 *       - Admin - Permissions
 *     summary: Get a permission
 *     description: Retrieve a single permission by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Permission retrieved successfully
 *       400:
 *         description: Missing ID
 *       404:
 *         description: Permission not found
 *       500:
 *         description: Server error
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

    const { data, error } = await db.from("permissions").select("*").eq("id", id).single();

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
 * /api/admin/permissions/{id}:
 *   put:
 *     tags:
 *       - Admin - Permissions
 *     summary: Update a permission
 *     description: Update permission details
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
 *         description: Permission updated successfully
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

  const { data, error } = await db.from("permissions").update({ name }).eq("id", id).select().single();

  if (error) return Response.json({ message: error.message }, { status: 400 });
  return Response.json({ message: "Role updated successfully", role: data });
}

/**
 * @swagger
 * /api/admin/permissions/{id}:
 *   delete:
 *     tags:
 *       - Admin - Permissions
 *     summary: Delete a permission
 *     description: Remove a permission from the system
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Permission deleted successfully
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

  const { error } = await db.from("permissions").delete().eq("id", id);

  if (error) return Response.json({ message: error.message }, { status: 400 });
  return Response.json({ message: "Role deleted successfully" });
}
