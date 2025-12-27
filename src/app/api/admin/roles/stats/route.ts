import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";

const db = supabase(false);

/**
 * @swagger
 * /api/admin/roles/stats:
 *   get:
 *     tags:
 *       - Admin - Roles
 *     summary: Get role statistics
 *     description: Retrieve aggregate statistics about roles and permissions
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       400:
 *         description: Failed to retrieve statistics
 */
export async function GET(req: NextRequest) {
  try {
    // Get total roles count
    const { count: totalRoles, error: rolesError } = await db
      .from("roles")
      .select("*", { count: "exact", head: true });

    if (rolesError) throw rolesError;

    // Get total permissions count
    const { count: totalPermissions, error: permissionsError } = await db
      .from("permissions")
      .select("*", { count: "exact", head: true });

    if (permissionsError) throw permissionsError;

    // Get active assignments count (role_permissions)
    const { count: activeAssignments, error: assignmentsError } = await db
      .from("role_permissions")
      .select("*", { count: "exact", head: true });

    if (assignmentsError) throw assignmentsError;

    return NextResponse.json({
      total: totalRoles || 0,
      totalPermissions: totalPermissions || 0,
      activeAssignments: activeAssignments || 0,
    });
  } catch (error: any) {
    console.error("Error fetching role statistics:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch role statistics" },
      { status: 400 }
    );
  }
}
