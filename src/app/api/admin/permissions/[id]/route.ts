import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { PermissionSchema } from "@/lib/roles/validation";
import { formatZodError } from "@/utils/error_formatter";

const db = supabase(false);

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
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: "Missing ID" }, { status: 400 });
    }

    const { data, error } = await db
      .from("permissions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    return NextResponse.json({ permission: data }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
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
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: "Missing ID" }, { status: 400 });
    }

    const body = await req.json();

    const parsed = PermissionSchema.safeParse(body);
    if (!parsed.success) {
      const errors = formatZodError(parsed.error);
      return NextResponse.json({ errors }, { status: 400 });
    }

    const { name } = parsed.data;
    const { description } = body;

    const { data, error } = await db
      .from("permissions")
      .update({ name, description })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({
      message: "Permission updated successfully",
      permission: data
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "Server error" },
      { status: 500 }
    );
  }
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
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: "Missing ID" }, { status: 400 });
    }

    const { error } = await db.from("permissions").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Permission deleted successfully" });
  } catch (err) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
