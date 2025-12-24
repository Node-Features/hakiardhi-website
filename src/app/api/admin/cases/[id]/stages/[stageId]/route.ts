import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase_client";
import { CaseStageUpdateValidation } from "@/lib/cases/validation";
import { formatZodError } from "@/utils/error_formatter";

const db = supabase(true);

/**
 * @swagger
 * /api/admin/cases/{id}/stages/{stageId}:
 *   get:
 *     tags:
 *       - Admin - Cases
 *     summary: Get a single case stage
 *     description: Retrieve detailed information about a specific case stage
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
 *       - name: stageId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Stage ID
 *     responses:
 *       200:
 *         description: Case stage retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       404:
 *         description: Case stage not found
 *       401:
 *         description: Unauthorized
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; stageId: string }> } // ✅ Changed caseId → id
) {
  const { id, stageId } = await params; // ✅ Changed caseId → id

  const { data, error } = await db
    .from("case_stages")
    .select(`
            id, case_id, name, description, status, next_stage, created_at, updated_at,
            stage_attachments(id, file_url, description)
        `)
    .eq("id", stageId)
    .eq("case_id", id) // ✅ Use id here
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }

  return NextResponse.json({ success: true, data });
}

/**
 * @swagger
 * /api/admin/cases/{id}/stages/{stageId}:
 *   put:
 *     tags:
 *       - Admin - Cases
 *     summary: Update a case stage
 *     description: Update case stage information
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
 *       - name: stageId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Stage ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Ongoing, Resolved, Pending]
 *               next_stage:
 *                 type: string
 *     responses:
 *       200:
 *         description: Case stage updated successfully
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
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; stageId: string }> } // ✅ Changed caseId → id
) {
  const { id, stageId } = await params; // ✅ Changed caseId → id
  const body = await req.json();
  const parsed = CaseStageUpdateValidation.safeParse(body);

  if (!parsed.success) {
    const errors = formatZodError(parsed.error);
    return NextResponse.json({ errors }, { status: 400 });
  }

  const { data, error } = await db
    .from("case_stages")
    .update(parsed.data)
    .eq("id", stageId)
    .eq("case_id", id) // ✅ Use id here
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    message: "Case stage updated successfully",
    data,
  });
}

/**
 * @swagger
 * /api/admin/cases/{id}/stages/{stageId}:
 *   delete:
 *     tags:
 *       - Admin - Cases
 *     summary: Delete a case stage
 *     description: Delete a case stage (cannot delete stages with attachments)
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
 *       - name: stageId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Stage ID
 *     responses:
 *       200:
 *         description: Case stage deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Request error
 *       409:
 *         description: Cannot delete stage with attachments
 *       401:
 *         description: Unauthorized
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; stageId: string }> } // ✅ Changed caseId → id
) {
  const { id, stageId } = await params; // ✅ Changed caseId → id

  // Check if stage has attachments
  const { count } = await db
    .from("stage_attachments")
    .select("id", { count: "exact", head: true })
    .eq("stage_id", stageId);

  if (count && count > 0) {
    return NextResponse.json(
      {
        message:
          "Cannot delete stage with attachments. Delete attachments first.",
      },
      { status: 409 }
    );
  }

  const { error } = await db
    .from("case_stages")
    .delete()
    .eq("id", stageId)
    .eq("case_id", id); // ✅ Use id here

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    message: "Case stage deleted successfully",
  });
}