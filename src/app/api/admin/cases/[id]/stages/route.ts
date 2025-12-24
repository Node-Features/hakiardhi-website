import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { CaseStageValidation } from "@/lib/cases/validation";
import { formatZodError } from "@/utils/error_formatter";

const db = supabase(true);

/**
 * @swagger
 * /api/admin/cases/{id}/stages:
 *   post:
 *     tags:
 *       - Admin - Cases
 *     summary: Create a case stage
 *     description: Add a new stage to a case
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Case ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - status
 *             properties:
 *               name:
 *                 type: string
 *                 example: Under Review
 *               description:
 *                 type: string
 *                 example: Case is being reviewed by legal team
 *               status:
 *                 type: string
 *                 enum: [Ongoing, Resolved, Pending]
 *                 example: Ongoing
 *               next_stage:
 *                 type: string
 *                 example: Investigation
 *     responses:
 *       201:
 *         description: Case stage created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Changed to Promise
) {
  const { id: case_id } = await params; // ✅ Added await
  const body = await req.json();

  // Add case_id to the body
  body.case_id = case_id;

  const parsed = CaseStageValidation.safeParse(body);

  if (!parsed.success) {
    const errors = formatZodError(parsed.error);
    return NextResponse.json({ errors }, { status: 400 });
  }

  const { data, error } = await db
    .from("case_stages")
    .insert([parsed.data])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json(
    {
      success: true,
      message: "Case stage created successfully",
      data,
    },
    { status: 201 }
  );
}

/**
 * @swagger
 * /api/admin/cases/{id}/stages:
 *   get:
 *     tags:
 *       - Admin - Cases
 *     summary: List case stages
 *     description: Retrieve all stages for a specific case
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Case ID
 *     responses:
 *       200:
 *         description: Case stages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total_stages:
 *                       type: integer
 *                     completed_stages:
 *                       type: integer
 *       400:
 *         description: Request error
 *       401:
 *         description: Unauthorized
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Changed to Promise
) {
  const { id: case_id } = await params; // ✅ Added await

  const { data, error, count } = await db
    .from("case_stages")
    .select(
      "id, name, description, status, next_stage, created_at, updated_at",
      { count: "exact" }
    )
    .eq("case_id", case_id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    data,
    meta: {
      total_stages: count || 0,
      completed_stages: data?.filter((s) => s.status === "Resolved").length || 0,
    },
  });
}