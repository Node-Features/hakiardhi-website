import { NextRequest, NextResponse } from 'next/server';
import { legalAidService } from '@/lib/legal-aid/legal-aid.service';

/**
 * @swagger
 * /api/admin/legal-aid/statistics:
 *   get:
 *     tags:
 *       - Admin - Legal Aid
 *     summary: Get legal aid statistics
 *     description: Retrieve comprehensive statistics about legal aid requests with optional filters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: region_id
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by region
 *       - name: district_id
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by district
 *       - name: date_from
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for statistics
 *       - name: date_to
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for statistics
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   description: Comprehensive statistics data
 *                 filters:
 *                   type: object
 *                   description: Applied filters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const region_id = searchParams.get('region_id');
    const district_id = searchParams.get('district_id');
    const date_from = searchParams.get('date_from');
    const date_to = searchParams.get('date_to');

    const filters = {
      region_id: region_id || undefined,
      district_id: district_id || undefined,
      date_from: date_from || undefined,
      date_to: date_to || undefined,
    };

    const stats = await legalAidService.getStatistics(filters);

    return NextResponse.json({
      success: true,
      data: stats,
      filters,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
