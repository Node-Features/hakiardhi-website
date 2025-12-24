import { NextRequest, NextResponse } from 'next/server';
import { regionsService } from '@/lib/services/regions.service';

/**
 * @swagger
 * /api/admin/regions/projects_by_region:
 *   get:
 *     tags:
 *       - Admin - Regions
 *     summary: Get all projects with their associated regions
 *     description: |
 *       Retrieve a list of all projects with the regions they are linked to.
 *       This endpoint calls the Supabase RPC function `rpc_get_projects_with_regions()`
 *       which aggregates project-region relationships.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Projects with regions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       project_id:
 *                         type: string
 *                         format: uuid
 *                         description: Unique identifier for the project
 *                       project_name:
 *                         type: string
 *                         description: Name of the project
 *                       regions:
 *                         type: array
 *                         description: List of regions associated with this project
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               format: uuid
 *                               description: Region identifier
 *                             name:
 *                               type: string
 *                               description: Region name
 *                 count:
 *                   type: integer
 *                   description: Total number of projects returned
 *                   example: 25
 *             examples:
 *               successful_response:
 *                 value:
 *                   success: true
 *                   data:
 *                     - project_id: "123e4567-e89b-12d3-a456-426614174000"
 *                       project_name: "Land Rights Education Initiative"
 *                       regions:
 *                         - id: "789fcdeb-51a2-43f1-b456-987654321000"
 *                           name: "Dar es Salaam"
 *                         - id: "876ecdeb-51a2-43f1-b456-987654321001"
 *                           name: "Arusha"
 *                     - project_id: "234e5678-e89b-12d3-a456-426614174001"
 *                       project_name: "Community Legal Aid Program"
 *                       regions:
 *                         - id: "765ecdeb-51a2-43f1-b456-987654321002"
 *                           name: "Kilimanjaro"
 *                   count: 2
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to fetch projects with regions"
 *                 error:
 *                   type: string
 *                   description: Detailed error message
 */
export async function GET(req: NextRequest) {
  try {
    // Call the regions service to fetch projects with regions
    const data = await regionsService.getProjectsWithRegions();

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error) {
    console.error('Error fetching projects by region:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch projects with regions',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
