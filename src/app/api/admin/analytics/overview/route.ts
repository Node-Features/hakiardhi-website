import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/lib/services/analytics.service';
import { IntervalType } from '@/lib/types/analytics.types';

/**
 * @swagger
 * /api/admin/analytics/overview:
 *   get:
 *     tags:
 *       - Admin - Analytics
 *     summary: Get admin dashboard overview
 *     description: Retrieve dashboard analytics data with optional filters for project, region, and time interval
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: project_uuid
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by specific project (optional)
 *       - in: query
 *         name: region_uuid
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by specific region (optional)
 *       - in: query
 *         name: interval_type
 *         schema:
 *           type: string
 *           enum: [month, quarter, year, date]
 *           default: month
 *         description: Time interval for aggregation
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           minimum: 2020
 *           maximum: 2030
 *         description: Year filter (required for year, quarter, and month interval types)
 *       - in: query
 *         name: quarter
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 4
 *         description: Quarter filter (1-4, required for quarter interval type)
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Month filter (1-12, required for month interval type)
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for custom date range (required for date interval type)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for custom date range (required for date interval type)
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: object
 *                   properties:
 *                     global:
 *                       type: object
 *                       properties:
 *                         total_users:
 *                           type: integer
 *                         total_projects:
 *                           type: integer
 *                         total_regions:
 *                           type: integer
 *                         total_activities:
 *                           type: integer
 *                         total_beneficiaries:
 *                           type: integer
 *                         total_incidents:
 *                           type: integer
 *                         total_cases:
 *                           type: integer
 *                         active_projects:
 *                           type: integer
 *                         completed_projects:
 *                           type: integer
 *                     projects:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           project_id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           total_activities:
 *                             type: integer
 *                           completed_activities:
 *                             type: integer
 *                           total_beneficiaries:
 *                             type: integer
 *                           start_date:
 *                             type: string
 *                           end_date:
 *                             type: string
 *                           status:
 *                             type: string
 *                     regions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           region_id:
 *                             type: string
 *                           region_name:
 *                             type: string
 *                           beneficiaries:
 *                             type: integer
 *                           incidents:
 *                             type: integer
 *                           cases:
 *                             type: integer
 *                           projects:
 *                             type: integer
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Extract query parameters
    const project_uuid = searchParams.get('project_uuid');
    const region_uuid = searchParams.get('region_uuid');
    const interval_type = searchParams.get('interval_type') as IntervalType || 'month';

    // Extract time-specific parameters
    const yearParam = searchParams.get('year');
    const quarterParam = searchParams.get('quarter');
    const monthParam = searchParams.get('month');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');

    // Parse numeric parameters
    const year = yearParam ? parseInt(yearParam, 10) : undefined;
    const quarter = quarterParam ? parseInt(quarterParam, 10) : undefined;
    const month = monthParam ? parseInt(monthParam, 10) : undefined;

    // Validate interval_type
    const validIntervals: IntervalType[] = ['month', 'quarter', 'year', 'date'];
    if (interval_type && !validIntervals.includes(interval_type)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid interval_type. Must be one of: ${validIntervals.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate year if provided
    if (year !== undefined && (isNaN(year) || year < 2020 || year > 2030)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid year. Must be between 2020 and 2030.',
        },
        { status: 400 }
      );
    }

    // Validate quarter if provided
    if (quarter !== undefined && (isNaN(quarter) || quarter < 1 || quarter > 4)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid quarter. Must be between 1 and 4.',
        },
        { status: 400 }
      );
    }

    // Validate month if provided
    if (month !== undefined && (isNaN(month) || month < 1 || month > 12)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid month. Must be between 1 and 12.',
        },
        { status: 400 }
      );
    }

    // Call analytics service with filters
    const data = await analyticsService.getAdminDashboard({
      project_uuid: project_uuid || null,
      region_uuid: region_uuid || null,
      interval_type,
      year,
      quarter,
      month,
      start_date: start_date || undefined,
      end_date: end_date || undefined,
    });

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch dashboard data',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
