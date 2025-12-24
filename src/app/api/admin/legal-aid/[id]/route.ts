import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';
import { LegalAidRequestUpdateValidation } from '@/lib/legal-aid/validation';
import { formatZodError } from '@/utils/error_formatter';

const db = supabase(true);

/**
 * @swagger
 * /api/admin/legal-aid/{id}:
 *   get:
 *     tags:
 *       - Admin - Legal Aid
 *     summary: Get a legal aid request
 *     description: Retrieve detailed information about a specific legal aid request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Legal aid request ID
 *     responses:
 *       200:
 *         description: Legal aid request retrieved successfully
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
 *         description: Legal aid request not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: request, error } = await db
      .from('legal_aid_requests')
      .select(
        `
        *,
        assigned_lawyer:users!assigned_lawyer_id(id, first_name, last_name, email),
        stage_history(
          id, stage, entered_at, exited_at, duration_hours, notes, current
        ),
        document_progress(
          id, document_type, status, assigned_to, started_at, completed_at, notes
        )
      `
      )
      .eq('id', id)
      .single();

    if (error || !request) {
      return NextResponse.json(
        { message: 'Legal aid request not found' },
        { status: 404 }
      );
    }

    // Calculate stage durations
    const stageHistory = (request.stage_history || []).map((stage: any) => {
      if (stage.exited_at && stage.entered_at) {
        const duration = new Date(stage.exited_at).getTime() - new Date(stage.entered_at).getTime();
        stage.duration_hours = Math.round(duration / (1000 * 60 * 60) * 10) / 10;
      }
      return stage;
    });

    return NextResponse.json({
      success: true,
      data: {
        ...request,
        stage_history: stageHistory,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/admin/legal-aid/{id}:
 *   put:
 *     tags:
 *       - Admin - Legal Aid
 *     summary: Update a legal aid request
 *     description: Update legal aid request information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Legal aid request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               email:
 *                 type: string
 *               beneficiary_details:
 *                 type: object
 *               demographic_details:
 *                 type: object
 *               case_details:
 *                 type: object
 *               preferred_contact_method:
 *                 type: string
 *               preferred_language:
 *                 type: string
 *     responses:
 *       200:
 *         description: Legal aid request updated successfully
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
 *       404:
 *         description: Legal aid request not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const parsed = LegalAidRequestUpdateValidation.safeParse(body);

    if (!parsed.success) {
      const errors = formatZodError(parsed.error);
      return NextResponse.json({ errors }, { status: 400 });
    }

    const data = parsed.data;

    // Check if request exists
    const { data: existing } = await db
      .from('legal_aid_requests')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { message: 'Legal aid request not found' },
        { status: 404 }
      );
    }

    // Update request
    const { data: updated, error: updateError } = await db
      .from('legal_aid_requests')
      .update({
        ...data,
        updated_at: new Date(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { message: updateError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Legal aid request updated successfully',
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/admin/legal-aid/{id}:
 *   delete:
 *     tags:
 *       - Admin - Legal Aid
 *     summary: Delete a legal aid request
 *     description: Delete a legal aid request and all associated data
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Legal aid request ID
 *     responses:
 *       200:
 *         description: Legal aid request deleted successfully
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
 *       404:
 *         description: Legal aid request not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export async function DELETE(
   req: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if request exists
    const { data: existing } = await db
      .from('legal_aid_requests')
      .select('id, case_number')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { message: 'Legal aid request not found' },
        { status: 404 }
      );
    }

    // Delete stage history
    await db.from('stage_history').delete().eq('request_id', id);

    // Delete document progress
    await db.from('document_progress').delete().eq('request_id', id);

    // Delete request
    const { error: deleteError } = await db
      .from('legal_aid_requests')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json(
        { message: deleteError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Legal aid request ${existing.case_number} deleted successfully`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}