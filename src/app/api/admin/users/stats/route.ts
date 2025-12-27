import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";

const db = supabase(false);

/**
 * @swagger
 * /api/admin/users/stats:
 *   get:
 *     tags:
 *       - Admin - Users
 *     summary: Get user statistics
 *     description: Retrieve aggregate statistics about users
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 active:
 *                   type: integer
 *                 inactive:
 *                   type: integer
 *                 suspended:
 *                   type: integer
 *                 byRole:
 *                   type: object
 *                 recentlyAdded:
 *                   type: integer
 *       400:
 *         description: Failed to retrieve statistics
 */
export async function GET(req: NextRequest) {
  try {
    // Get total count
    const { count: totalCount, error: totalError } = await db
      .from("users")
      .select("*", { count: "exact", head: true });

    if (totalError) throw totalError;

    // Get counts by status
    const { data: statusData, error: statusError } = await db
      .from("users")
      .select("status");

    if (statusError) throw statusError;

    const statusCounts = {
      active: 0,
      inactive: 0,
      suspended: 0,
    };

    statusData?.forEach((user: any) => {
      const status = user.status?.toLowerCase();
      if (status === 'active') statusCounts.active++;
      else if (status === 'inactive') statusCounts.inactive++;
      else if (status === 'suspended') statusCounts.suspended++;
    });

    // Get counts by role
    const { data: roleData, error: roleError } = await db
      .from("user_roles")
      .select(`
        role_id,
        roles (
          id,
          name
        )
      `);

    if (roleError) throw roleError;

    const byRole: Record<string, number> = {};

    roleData?.forEach((userRole: any) => {
      const roleData = Array.isArray(userRole.roles) ? userRole.roles[0] : userRole.roles;
      const roleName = roleData?.name;
      if (roleName) {
        byRole[roleName] = (byRole[roleName] || 0) + 1;
      }
    });

    // Get recently added count (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: recentCount, error: recentError } = await db
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo.toISOString());

    if (recentError) throw recentError;

    return NextResponse.json({
      total: totalCount || 0,
      active: statusCounts.active,
      inactive: statusCounts.inactive,
      suspended: statusCounts.suspended,
      byRole,
      recentlyAdded: recentCount || 0,
    });
  } catch (error: any) {
    console.error("Error fetching user statistics:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch user statistics" },
      { status: 400 }
    );
  }
}
