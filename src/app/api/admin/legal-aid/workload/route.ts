import { NextRequest, NextResponse } from 'next/server';
import { legalAidService } from '@/lib/legal-aid/legal-aid.service';

/**
 * @swagger
 * /api/admin/legal-aid/workload:
 *   get:
 *     tags:
 *       - Admin - Legal Aid
 *     summary: Get lawyer workload
 *     description: Retrieve workload information for all lawyers or a specific lawyer
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: lawyer_id
 *         in: query
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by specific lawyer ID
 *     responses:
 *       200:
 *         description: Workload data retrieved successfully
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
 *                     properties:
 *                       active_cases:
 *                         type: integer
 *                       utilization_rate:
 *                         type: number
 *                       availability:
 *                         type: string
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total_lawyers:
 *                       type: integer
 *                     total_active_cases:
 *                       type: integer
 *                     average_utilization:
 *                       type: number
 *                     lawyers_at_capacity:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lawyer_id = searchParams.get('lawyer_id');

    const workload = await legalAidService.getLawyerWorkload(
      lawyer_id || undefined
    );

    return NextResponse.json({
      success: true,
      data: workload,
      meta: {
        total_lawyers: workload.length,
        total_active_cases: workload.reduce(
          (sum, l) => sum + l.active_cases,
          0
        ),
        average_utilization:
          workload.length > 0
            ? Math.round(
                (workload.reduce((sum, l) => sum + l.utilization_rate, 0) /
                  workload.length) *
                  10
              ) / 10
            : 0,
        lawyers_at_capacity: workload.filter((l) => l.availability === 'At Capacity')
          .length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
