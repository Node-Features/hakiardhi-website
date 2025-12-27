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
    // Get all permissions with categories
    const { data: permissions, error } = await db
      .from("permissions")
      .select("category");

    if (error) throw error;

    // Extract unique categories and filter out null/empty values
    const categories = [...new Set(
      permissions
        ?.map(p => p.category)
        .filter(cat => cat && cat.trim() !== '')
    )].sort();

    return NextResponse.json(categories || []);
  } catch (error: any) {
    console.error("Error fetching permission categories:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch permission categories" },
      { status: 400 }
    );
  }
}
