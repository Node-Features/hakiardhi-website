import { TeamMemberCreateSchema } from "@/lib/users/team-member.validation";
import { formatZodError } from "@/utils/error_formatter";
import { supabase } from "@/lib/database/supabase_client";
import { NextRequest, NextResponse } from "next/server";

const db = supabase(true);

/**
 * @swagger
 * /api/admin/users/team-members:
 *   get:
 *     tags:
 *       - Admin - Team Members
 *     summary: List all team members
 *     description: Get paginated list of team members
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name
 *       - in: query
 *         name: member_type
 *         schema:
 *           type: string
 *           enum: [leadership, board, staff, advisor]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by is_active status
 *     responses:
 *       200:
 *         description: Team members retrieved successfully
 *       400:
 *         description: Bad request
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const search = searchParams.get("search") || "";
  const memberType = searchParams.get("member_type") || "";
  const status = searchParams.get("status") || "";
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = db
    .from("team_members")
    .select("*", { count: "exact" });

  // Search by name
  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  // Filter by member type
  if (memberType) {
    query = query.eq("member_type", memberType);
  }

  // Filter by active/inactive
  if (status === "active") {
    query = query.eq("is_active", true);
  } else if (status === "inactive") {
    query = query.eq("is_active", false);
  }

  const { data, error, count } = await query
    .order("display_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({
    data,
    meta: {
      page,
      limit,
      total: count,
      total_pages: Math.ceil((count || 0) / limit),
    },
  });
}

/**
 * @swagger
 * /api/admin/users/team-members:
 *   post:
 *     tags:
 *       - Admin - Team Members
 *     summary: Create a new team member
 *     description: Add a new team member entry
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - role
 *               - member_type
 *             properties:
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *               department:
 *                 type: string
 *               bio:
 *                 type: string
 *               image_url:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               linkedin_url:
 *                 type: string
 *               twitter_url:
 *                 type: string
 *               member_type:
 *                 type: string
 *                 enum: [leadership, board, staff, advisor]
 *               display_order:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Team member created successfully
 *       400:
 *         description: Validation error
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = TeamMemberCreateSchema.safeParse(body);

  if (!parsed.success) {
    const errors = formatZodError(parsed.error);
    return NextResponse.json({ errors }, { status: 400 });
  }

  const { data, error } = await db
    .from("team_members")
    .insert(parsed.data)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json(
    { message: "Team member created successfully", data },
    { status: 201 }
  );
}
