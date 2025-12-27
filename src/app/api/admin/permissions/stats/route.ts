import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";

const db = supabase(false);

/**
 * @swagger
 * /api/admin/permissions/stats:
 *   get:
 *     tags:
 *       - Admin - Permissions
 *     summary: Get permission statistics
 *     description: Retrieve aggregate statistics about permissions
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       400:
 *         description: Failed to retrieve statistics
 */
export async function GET(req: NextRequest) {
  try {
    // Get total permissions count
    const { count: totalPermissions, error: permissionsError } = await db
      .from("permissions")
      .select("*", { count: "exact", head: true });

    if (permissionsError) throw permissionsError;

    // Get assigned permissions (permissions that are in role_permissions table)
    const { data: assignedData, error: assignedError } = await db
      .from("role_permissions")
      .select("permission_id");

    if (assignedError) throw assignedError;

    // Count unique assigned permissions
    const uniqueAssignedIds = new Set(assignedData?.map(rp => rp.permission_id) || []);
    const assignedCount = uniqueAssignedIds.size;

    // Calculate unassigned
    const unassignedCount = (totalPermissions || 0) - assignedCount;

    return NextResponse.json({
      total: totalPermissions || 0,
      assigned: assignedCount,
      unassigned: Math.max(0, unassignedCount),
    });
  } catch (error: any) {
    console.error("Error fetching permission statistics:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch permission statistics" },
      { status: 400 }
    );
  }
}
