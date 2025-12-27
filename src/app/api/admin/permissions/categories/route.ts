import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";

const db = supabase(false);

/**
 * @swagger
 * /api/admin/permissions/categories:
 *   get:
 *     tags:
 *       - Admin - Permissions
 *     summary: Get all permission categories
 *     description: Retrieve list of unique permission categories
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *       400:
 *         description: Failed to retrieve categories
 */
export async function GET(req: NextRequest) {
  try {
    // Categories column has been removed from permissions table
    // Return empty array for backwards compatibility
    return NextResponse.json([]);
  } catch (error: any) {
    console.error("Error fetching permission categories:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch permission categories" },
      { status: 400 }
    );
  }
}
