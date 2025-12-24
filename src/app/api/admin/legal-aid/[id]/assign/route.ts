import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';
import { AssignmentValidation } from '@/lib/legal-aid/validation';
import { legalAidService } from '@/lib/legal-aid/legal-aid.service';
import { formatZodError } from '@/utils/error_formatter';

const db = supabase(true);

/**
 * @swagger
 * /api/admin/legal-aid/{id}/assign:
 *   post:
 *     tags:
 *       - Admin - Legal Aid
 *     summary: Assign to lawyer
 *     description: Manually assign a legal aid request to a specific lawyer
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
 *             required:
 *               - assigned_lawyer_id
 *             properties:
 *               assigned_lawyer_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the lawyer to assign
 *               notes:
 *                 type: string
 *                 description: Assignment notes
 *     responses:
 *       200:
 *         description: Case assigned successfully
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
 *         description: Validation error or invalid lawyer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const parsed = AssignmentValidation.safeParse(body);

    if (!parsed.success) {
      const errors = formatZodError(parsed.error);
      return NextResponse.json({ errors }, { status: 400 });
    }

    const { assigned_lawyer_id, notes } = parsed.data;

    // Verify lawyer exists and is a legal advisor
    const { data: lawyer, error: lawyerError } = await db
      .from('users')
      .select('id, first_name, last_name, roles!inner(name)')
      .eq('id', assigned_lawyer_id)
      .eq('roles.name', 'legal_advisor')
      .single();

    if (lawyerError || !lawyer) {
      return NextResponse.json(
        { message: 'Invalid lawyer ID or lawyer is not a legal advisor' },
        { status: 400 }
      );
    }

    // Update request
    const { data: updated, error: updateError } = await db
      .from('legal_aid_requests')
      .update({
        assigned_lawyer_id,
        assigned_at: new Date(),
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

    // Update stage to "Assigned to Legal Advisor"
    await legalAidService.updateStage(
      id,
      'Assigned to Legal Advisor',
      notes || `Assigned to ${lawyer.first_name} ${lawyer.last_name}`
    );

    return NextResponse.json({
      success: true,
      message: `Case assigned to ${lawyer.first_name} ${lawyer.last_name}`,
      data: {
        request_id: id,
        case_number: updated.case_number,
        assigned_lawyer: {
          id: lawyer.id,
          name: `${lawyer.first_name} ${lawyer.last_name}`,
        },
        assigned_at: updated.assigned_at,
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
 * /api/admin/legal-aid/{id}/assign:
 *   put:
 *     tags:
 *       - Admin - Legal Aid
 *     summary: Auto-assign to best lawyer
 *     description: Automatically assign a legal aid request to the best available lawyer based on workload and case type
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
 *         description: Case auto-assigned successfully
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
 *                   properties:
 *                     assignment_method:
 *                       type: string
 *                       example: auto
 *       400:
 *         description: No available lawyers found
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

    // Get request details
    const { data: request } = await db
      .from('legal_aid_requests')
      .select('case_details')
      .eq('id', id)
      .single();

    if (!request) {
      return NextResponse.json(
        { message: 'Legal aid request not found' },
        { status: 404 }
      );
    }

    // Find best lawyer
    const bestLawyerId = await legalAidService.findBestLawyer(
      request.case_details.case_type
    );

    if (!bestLawyerId) {
      return NextResponse.json(
        { message: 'No available lawyers found' },
        { status: 400 }
      );
    }

    // Get lawyer details
    const { data: lawyer } = await db
      .from('users')
      .select('id, first_name, last_name')
      .eq('id', bestLawyerId)
      .single();

    // Assign
    const { data: updated, error: updateError } = await db
      .from('legal_aid_requests')
      .update({
        assigned_lawyer_id: bestLawyerId,
        assigned_at: new Date(),
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

    // Update stage
    await legalAidService.updateStage(
      id,
      'Assigned to Legal Advisor',
      `Auto-assigned to ${lawyer?.first_name} ${lawyer?.last_name} based on workload and case type`
    );

    return NextResponse.json({
      success: true,
      message: `Case auto-assigned to ${lawyer?.first_name} ${lawyer?.last_name}`,
      data: {
        request_id: id,
        case_number: updated.case_number,
        assigned_lawyer: {
          id: lawyer?.id,
          name: `${lawyer?.first_name} ${lawyer?.last_name}`,
        },
        assignment_method: 'auto',
        assigned_at: updated.assigned_at,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
