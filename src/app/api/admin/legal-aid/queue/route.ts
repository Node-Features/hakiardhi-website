import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';

const db = supabase(true);

/**
 * @swagger
 * /api/admin/legal-aid/queue:
 *   get:
 *     tags:
 *       - Admin - Legal Aid
 *     summary: Get assignment queue
 *     description: Retrieve all legal aid requests queued for assignment, sorted by priority and position
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Assignment queue retrieved successfully
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
 *                       id:
 *                         type: string
 *                       case_number:
 *                         type: string
 *                       name:
 *                         type: string
 *                       case_type:
 *                         type: string
 *                       priority:
 *                         type: string
 *                       position:
 *                         type: integer
 *                       wait_time_hours:
 *                         type: integer
 *                       has_active_court_case:
 *                         type: boolean
 *                       next_court_date:
 *                         type: string
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total_in_queue:
 *                       type: integer
 *                     urgent_cases:
 *                       type: integer
 *                     high_priority_cases:
 *                       type: integer
 *                     average_wait_time_hours:
 *                       type: integer
 *       400:
 *         description: Request error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export async function GET(req: NextRequest) {
  try {
    const { data: queue, error } = await db
      .from('legal_aid_requests')
      .select(
        `
        id, case_number, name, priority, queue_position, created_at,
        case_details, demographic_details
      `
      )
      .eq('current_stage', 'Queued for Assignment')
      .order('priority', { ascending: false })
      .order('queue_position', { ascending: true });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    // Calculate wait times
    const enrichedQueue = (queue || []).map((item, index) => {
      const waitTime = Math.floor(
        (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60)
      );

      return {
        id: item.id,
        case_number: item.case_number,
        name: item.name,
        case_type: item.case_details?.case_type,
        priority: item.priority,
        position: index + 1,
        wait_time_hours: waitTime,
        region: item.demographic_details?.region_id,
        has_active_court_case: item.case_details?.has_active_court_case || false,
        next_court_date: item.case_details?.next_court_date,
        created_at: item.created_at,
      };
    });

    return NextResponse.json({
      success: true,
      data: enrichedQueue,
      meta: {
        total_in_queue: enrichedQueue.length,
        urgent_cases: enrichedQueue.filter((c) => c.priority === 'Urgent').length,
        high_priority_cases: enrichedQueue.filter((c) => c.priority === 'High')
          .length,
        average_wait_time_hours:
          enrichedQueue.length > 0
            ? Math.round(
                enrichedQueue.reduce((sum, c) => sum + c.wait_time_hours, 0) /
                  enrichedQueue.length
              )
            : 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
