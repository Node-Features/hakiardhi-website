import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";

const db = supabase(true);

/**
 * @swagger
 * /api/admin/statistics:
 *   get:
 *     tags:
 *       - Admin - Statistics
 *     summary: Get dashboard statistics
 *     description: Retrieve key statistics for the dashboard including impact numbers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
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
 *                     total_beneficiaries:
 *                       type: integer
 *                     total_projects:
 *                       type: integer
 *                     total_activities:
 *                       type: integer
 *                     total_cases:
 *                       type: integer
 *                     total_lrm_members:
 *                       type: integer
 *                     active_projects:
 *                       type: integer
 *                     completed_projects:
 *                       type: integer
 *                     active_beneficiaries:
 *                       type: integer
 *                     impact_statistics:
 *                       type: array
 *                       items:
 *                         type: object
 */
export async function GET(request: NextRequest) {
  try {
    // Get counts from various tables in parallel
    const [
      beneficiariesResult,
      projectsResult,
      activitiesResult,
      casesResult,
      lrmMembersResult,
      impactStatsResult,
    ] = await Promise.all([
      // Total beneficiaries
      db.from("beneficiaries").select("id, status", { count: "exact", head: true }),

      // Total projects
      db.from("projects").select("id, status", { count: "exact", head: true }),

      // Total activities
      db.from("activities").select("id, status", { count: "exact", head: true }),

      // Total cases
      db.from("cases").select("id, status", { count: "exact", head: true }),

      // Total LRM members
      db.from("lrm_members").select("id, is_active", { count: "exact", head: true }),

      // Impact statistics from the table
      db.from("impact_statistics")
        .select("*")
        .eq("is_public", true)
        .order("display_order", { ascending: true }),
    ]);

    // Get detailed counts for active/completed
    const [activeBeneficiaries, activeProjects, completedProjects] = await Promise.all([
      db.from("beneficiaries").select("id", { count: "exact", head: true }).eq("status", "Active"),
      db.from("projects").select("id", { count: "exact", head: true }).in("status", ["Active", "Ongoing"]),
      db.from("projects").select("id", { count: "exact", head: true }).eq("status", "Completed"),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        total_beneficiaries: beneficiariesResult.count || 0,
        total_projects: projectsResult.count || 0,
        total_activities: activitiesResult.count || 0,
        total_cases: casesResult.count || 0,
        total_lrm_members: lrmMembersResult.count || 0,
        active_beneficiaries: activeBeneficiaries.count || 0,
        active_projects: activeProjects.count || 0,
        completed_projects: completedProjects.count || 0,
        impact_statistics: impactStatsResult.data || [],
      }
    }, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
