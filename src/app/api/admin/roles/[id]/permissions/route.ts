import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";

const db = supabase(false);

/**
 * @swagger
 * /api/admin/roles/{id}/permissions:
 *   get:
 *     tags:
 *       - Admin - Roles
 *     summary: Get role permissions
 *     description: Retrieve all permissions assigned to a role
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Permissions retrieved successfully
 *       400:
 *         description: Failed to retrieve permissions
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: role_id } = await params;

    if (!role_id) {
      return NextResponse.json(
        { message: "Missing role ID" },
        { status: 400 }
      );
    }

    // Get role with permissions
    const { data: role, error } = await db
      .from("roles")
      .select(`
        id,
        name,
        role_permissions (
          permissions (
            id,
            name,
            description,
            category
          )
        )
      `)
      .eq("id", role_id)
      .single();

    if (error) throw error;

    // Extract permissions array
    const rolePerms = role?.role_permissions || [];
    const permissions = Array.isArray(rolePerms)
      ? rolePerms.map((rp: any) => rp.permissions).filter(Boolean)
      : [];

    return NextResponse.json(permissions);
  } catch (error: any) {
    console.error("Error fetching role permissions:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch permissions" },
      { status: 400 }
    );
  }
}

/**
 * @swagger
 * /api/admin/roles/{id}/permissions:
 *   post:
 *     tags:
 *       - Admin - Roles
 *     summary: Assign permissions to role
 *     description: Assign one or multiple permissions to a role
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
 *               - permission_ids
 *             properties:
 *               permission_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Permissions assigned successfully
 *       400:
 *         description: Validation error or assignment failed
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: role_id } = await params;

    if (!role_id) {
      return NextResponse.json(
        { message: "Missing role ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { permission_ids } = body;

    if (!permission_ids || !Array.isArray(permission_ids) || permission_ids.length === 0) {
      return NextResponse.json(
        { message: "permission_ids array is required" },
        { status: 400 }
      );
    }

    // First, remove all existing permissions for this role
    await db
      .from("role_permissions")
      .delete()
      .eq("role_id", role_id);

    // Then insert the new permissions
    const rolePermissions = permission_ids.map(permission_id => ({
      role_id,
      permission_id
    }));

    const { error } = await db
      .from("role_permissions")
      .insert(rolePermissions);

    if (error) throw error;

    // Fetch updated role with permissions
    const { data: role } = await db
      .from("roles")
      .select(`
        id,
        name,
        role_permissions (
          permissions (
            id,
            name,
            description
          )
        )
      `)
      .eq("id", role_id)
      .single();

    const rolePerms = role?.role_permissions || [];
    const permissions = Array.isArray(rolePerms)
      ? rolePerms.map((rp: any) => rp.permissions).filter(Boolean)
      : [];

    return NextResponse.json({
      message: "Permissions assigned successfully",
      role: {
        id: role?.id,
        name: role?.name,
        permissions,
        permissions_count: permissions.length
      }
    });
  } catch (error: any) {
    console.error("Error assigning permissions:", error);
    return NextResponse.json(
      { message: error.message || "Failed to assign permissions" },
      { status: 400 }
    );
  }
}

/**
 * @swagger
 * /api/admin/roles/{id}/permissions:
 *   delete:
 *     tags:
 *       - Admin - Roles
 *     summary: Remove permission from role
 *     description: Remove a specific permission from a role
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: permission_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Permission removed successfully
 *       400:
 *         description: Missing parameters or removal failed
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: role_id } = await params;
    const { searchParams } = new URL(req.url);
    const permission_id = searchParams.get("permission_id");

    if (!role_id) {
      return NextResponse.json(
        { message: "Missing role ID" },
        { status: 400 }
      );
    }

    if (!permission_id) {
      return NextResponse.json(
        { message: "Missing permission_id query parameter" },
        { status: 400 }
      );
    }

    const { error } = await db
      .from("role_permissions")
      .delete()
      .eq("role_id", role_id)
      .eq("permission_id", permission_id);

    if (error) throw error;

    return NextResponse.json({
      message: "Permission removed successfully"
    });
  } catch (error: any) {
    console.error("Error removing permission:", error);
    return NextResponse.json(
      { message: error.message || "Failed to remove permission" },
      { status: 400 }
    );
  }
}
