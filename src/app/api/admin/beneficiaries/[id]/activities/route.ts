import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";

const db = supabase(true);

// GET BENEFICIARY ACTIVITY HISTORY
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ params is now Promise
) {
  const { id } = await params; // ✅ await params
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 20;
  const project_id = searchParams.get("project_id");
  const attended = searchParams.get("attended");
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = db
    .from("activity_beneficiaries")
    .select(
      `
        id, role_in_activity, attended, feedback, created_at, updated_at,
        activities(id, name, start_date, projects(id, title))
      `,
      { count: "exact" }
    )
    .eq("beneficiary_id", id);

  // Apply filters
  if (attended !== null && attended !== undefined) {
    query = query.eq("attended", attended === "true");
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Beneficiary activities query error:', error);
    return NextResponse.json({
      message: error.message || 'Failed to fetch beneficiary activities',
      details: error.details,
      hint: error.hint,
      code: error.code
    }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    data,
    meta: {
      page,
      limit,
      total: count,
      total_pages: Math.ceil((count || 0) / limit),
    },
  });
}