import { NextRequest, NextResponse } from 'next/server';
import { StageUpdateValidation } from '@/lib/legal-aid/validation';
import { legalAidService } from '@/lib/legal-aid/legal-aid.service';
import { formatZodError } from '@/utils/error_formatter';

/**
 * @swagger
 * /api/admin/legal-aid/{id}/stage:
 *   put:
 *     tags:
 *       - Admin - Legal Aid
 *     summary: Update request stage
 *     description: Update the current stage of a legal aid request
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
 *               - new_stage
 *             properties:
 *               new_stage:
 *                 type: string
 *                 description: The new stage name
 *                 example: Under Review
 *               notes:
 *                 type: string
 *                 description: Notes about the stage change
 *     responses:
 *       200:
 *         description: Stage updated successfully
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

    const parsed = StageUpdateValidation.safeParse(body);

    if (!parsed.success) {
      const errors = formatZodError(parsed.error);
      return NextResponse.json({ errors }, { status: 400 });
    }

    const { new_stage, notes } = parsed.data;

    // Update stage using service
    await legalAidService.updateStage(id, new_stage, notes);

    return NextResponse.json({
      success: true,
      message: `Stage updated to: ${new_stage}`,
      data: {
        request_id: id,
        new_stage,
        updated_at: new Date(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
