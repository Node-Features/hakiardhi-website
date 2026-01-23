import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";

const db = supabase(true);

/**
 * @swagger
 * /api/admin/cases/stats:
 *   get:
 *     tags:
 *       - Admin - Cases
 *     summary: Get case statistics
 *     description: Retrieve overall statistics for legal cases
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
 *                     totalCases:
 *                       type: integer
 *                     openCases:
 *                       type: integer
 *                     closedCases:
 *                       type: integer
 *                     resolvedCases:
 *                       type: integer
 *                     by_status:
 *                       type: object
 *                     averageResolutionTime:
 *                       type: string
 */
export async function GET(request: NextRequest) {
  try {
    // Get all cases
    const { data: cases, error } = await db
      .from("cases")
      .select("id, status, created_at, updated_at");

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    // Debug: Log all unique statuses found in the database
    const uniqueStatuses = [...new Set(cases?.map(c => c.status) || [])];
    console.log("📊 Unique case statuses found in database:", uniqueStatuses);

    // Calculate statistics with case-insensitive comparison
    const totalCases = cases?.length || 0;
    const openCases = cases?.filter(c => c.status?.toLowerCase() === "open").length || 0;
    const closedCases = cases?.filter(c => c.status?.toLowerCase() === "closed").length || 0;
    const resolvedCases = cases?.filter(c => c.status?.toLowerCase() === "resolved").length || 0;

    console.log("📊 Stats calculated:", { totalCases, openCases, closedCases, resolvedCases });

    // Calculate average resolution time (for closed and resolved cases)
    const completedCases = cases?.filter(c =>
      c.status?.toLowerCase() === "closed" || c.status?.toLowerCase() === "resolved"
    ) || [];
    let averageResolutionTime = "N/A";

    if (completedCases.length > 0) {
      const totalDays = completedCases.reduce((sum, caseItem) => {
        const created = new Date(caseItem.created_at);
        const updated = new Date(caseItem.updated_at);
        const days = Math.ceil((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);

      const avgDays = Math.ceil(totalDays / completedCases.length);
      averageResolutionTime = avgDays === 1 ? "1 day" : `${avgDays} days`;
    }

    // Count by status - using exact case from database for display
    const by_status: any = {};
    const statusesToCount = ["Open", "Under Review", "Investigation", "Legal Action", "Mediation", "Ongoing", "Resolved", "Closed"];

    statusesToCount.forEach(status => {
      // Count with case-insensitive comparison
      by_status[status] = cases?.filter(c => c.status?.toLowerCase() === status.toLowerCase()).length || 0;
    });

    return NextResponse.json({
      success: true,
      data: {
        totalCases,
        openCases,
        closedCases,
        resolvedCases,
        by_status,
        averageResolutionTime,
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
