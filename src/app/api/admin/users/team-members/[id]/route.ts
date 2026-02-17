import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { TeamMemberUpdateSchema } from "@/lib/users/team-member.validation";
import { formatZodError } from "@/utils/error_formatter";
import { toEAT } from "@/utils/utilities";

const db = supabase(true);

/**
 * @swagger
 * /api/admin/users/team-members/{id}:
 *   get:
 *     tags:
 *       - Admin - Team Members
 *     summary: Get a team member
 *     description: Retrieve a single team member by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Team member retrieved successfully
 *       400:
 *         description: Missing ID or not found
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ message: "Missing ID" }, { status: 400 });
  }

  const { data, error } = await db
    .from("team_members")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ data });
}

/**
 * @swagger
 * /api/admin/users/team-members/{id}:
 *   put:
 *     tags:
 *       - Admin - Team Members
 *     summary: Update a team member
 *     description: Update team member details
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
 *       200:
 *         description: Team member updated successfully
 *       400:
 *         description: Validation error or update failed
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ message: "Missing ID" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = TeamMemberUpdateSchema.safeParse(body);

  if (!parsed.success) {
    const errors = formatZodError(parsed.error);
    return NextResponse.json({ errors }, { status: 400 });
  }

  // Check if team member exists
  const { data: existing, error: fetchError } = await db
    .from("team_members")
    .select("id")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json(
      { message: "Team member not found" },
      { status: 404 }
    );
  }

  const { data, error } = await db
    .from("team_members")
    .update({
      ...parsed.data,
      updated_at: toEAT(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({
    message: "Team member updated successfully",
    data,
  });
}

/**
 * @swagger
 * /api/admin/users/team-members/{id}:
 *   delete:
 *     tags:
 *       - Admin - Team Members
 *     summary: Delete a team member
 *     description: Remove a team member from the system
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Team member deleted successfully
 *       400:
 *         description: Missing ID or deletion failed
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ message: "Missing ID" }, { status: 400 });
  }

  const { error } = await db.from("team_members").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: "Team member deleted successfully" });
}
