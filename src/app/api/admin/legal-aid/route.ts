import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';
import { LegalAidRequestValidation } from '@/lib/legal-aid/validation';
import { legalAidService } from '@/lib/legal-aid/legal-aid.service';
import { formatZodError } from '@/utils/error_formatter';

const db = supabase(true);

/**
 * @swagger
 * /api/admin/legal-aid:
 *   post:
 *     tags:
 *       - Admin - Legal Aid
 *     summary: Create a legal aid request
 *     description: Creates a new legal aid request with automatic priority and queue assignment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone_number
 *               - beneficiary_details
 *               - demographic_details
 *               - case_details
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               phone_number:
 *                 type: string
 *                 example: +255712345678
 *               email:
 *                 type: string
 *                 format: email
 *               beneficiary_details:
 *                 type: object
 *               demographic_details:
 *                 type: object
 *               case_details:
 *                 type: object
 *               preferred_contact_method:
 *                 type: string
 *                 enum: [Phone, Email, WhatsApp, SMS]
 *               preferred_language:
 *                 type: string
 *                 enum: [Swahili, English]
 *               consent_to_data_processing:
 *                 type: boolean
 *               how_did_you_hear_about_us:
 *                 type: string
 *     responses:
 *       201:
 *         description: Legal aid request created successfully
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
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LegalAidRequestValidation.safeParse(body);

    if (!parsed.success) {
      const errors = formatZodError(parsed.error);
      return NextResponse.json({ errors }, { status: 400 });
    }

    const data = parsed.data;

    // Generate case number
    const case_number = await legalAidService.generateCaseNumber();

    // Calculate priority
    const priority = legalAidService.calculatePriority(data.case_details);

    // Get queue position
    const queue_position = await legalAidService.getQueuePosition();

    // Determine initial stage
    const current_stage = 'Intake - Pending Review';

    // Create legal aid request
    const { data: request, error: requestError } = await db
      .from('legal_aid_requests')
      .insert([
        {
          case_number,
          name: data.name,
          phone_number: data.phone_number,
          email: data.email,
          beneficiary_details: data.beneficiary_details,
          demographic_details: data.demographic_details,
          case_details: data.case_details,
          current_stage,
          priority,
          queue_position,
          preferred_contact_method: data.preferred_contact_method,
          preferred_language: data.preferred_language,
          consent_to_data_processing: data.consent_to_data_processing,
          how_did_you_hear_about_us: data.how_did_you_hear_about_us,
        },
      ])
      .select()
      .single();

    if (requestError) {
      return NextResponse.json(
        { message: requestError.message },
        { status: 400 }
      );
    }

    // Create initial stage history
    await db.from('stage_history').insert({
      request_id: request.id,
      stage: current_stage,
      entered_at: new Date(),
      current: true,
      notes: 'Initial intake',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Legal aid request submitted successfully',
        data: {
          id: request.id,
          case_number: request.case_number,
          current_stage: request.current_stage,
          priority: request.priority,
          queue_position: request.queue_position,
          created_at: request.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/admin/legal-aid:
 *   get:
 *     tags:
 *       - Admin - Legal Aid
 *     summary: List legal aid requests
 *     description: Retrieve a paginated list of legal aid requests with optional filters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by current stage
 *       - name: region_id
 *         in: query
 *         schema:
 *           type: string
 *       - name: district_id
 *         in: query
 *         schema:
 *           type: string
 *       - name: assigned_lawyer_id
 *         in: query
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: priority
 *         in: query
 *         schema:
 *           type: string
 *           enum: [Low, Medium, High, Urgent]
 *       - name: case_type
 *         in: query
 *         schema:
 *           type: string
 *       - name: has_active_court_case
 *         in: query
 *         schema:
 *           type: string
 *           enum: [true, false]
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *         description: Search in case number, name, or phone number
 *     responses:
 *       200:
 *         description: Legal aid requests retrieved successfully
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
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     total_pages:
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
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Math.min(Number(searchParams.get('limit')) || 10, 100);
    const status = searchParams.get('status');
    const region_id = searchParams.get('region_id');
    const district_id = searchParams.get('district_id');
    const assigned_lawyer_id = searchParams.get('assigned_lawyer_id');
    const priority = searchParams.get('priority');
    const case_type = searchParams.get('case_type');
    const has_active_court_case = searchParams.get('has_active_court_case');
    const search = searchParams.get('search');
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = db
      .from('legal_aid_requests')
      .select(
        `
        id, case_number, name, phone_number, email,
        current_stage, priority, queue_position,
        beneficiary_details, demographic_details, case_details,
        assigned_lawyer_id, created_at, updated_at,
        assigned_lawyer:users!assigned_lawyer_id(id, first_name, last_name, email)
      `,
        { count: 'exact' }
      );

    // Apply filters
    if (status) {
      query = query.eq('current_stage', status);
    }

    if (assigned_lawyer_id) {
      query = query.eq('assigned_lawyer_id', assigned_lawyer_id);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    if (region_id) {
      query = query.eq('demographic_details->>region_id', region_id);
    }

    if (district_id) {
      query = query.eq('demographic_details->>district_id', district_id);
    }

    if (case_type) {
      query = query.eq('case_details->>case_type', case_type);
    }

    if (has_active_court_case === 'true') {
      query = query.eq('case_details->>has_active_court_case', true);
    }

    if (search) {
      query = query.or(
        `case_number.ilike.%${search}%,name.ilike.%${search}%,phone_number.ilike.%${search}%`
      );
    }

    const { data: requests, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    // Enrich with additional data
    const enrichedRequests = await Promise.all(
      (requests || []).map(async (request) => {
        // Get stage history count
        const { count: stage_count } = await db
          .from('stage_history')
          .select('id', { count: 'exact', head: true })
          .eq('request_id', request.id);

        // Get document progress count
        const { count: doc_count } = await db
          .from('document_progress')
          .select('id', { count: 'exact', head: true })
          .eq('request_id', request.id);

        // Calculate days in current stage
        const { data: currentStage } = await db
          .from('stage_history')
          .select('entered_at')
          .eq('request_id', request.id)
          .eq('current', true)
          .single();

        const days_in_current_stage = currentStage
          ? Math.floor(
              (Date.now() - new Date(currentStage.entered_at).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 0;

        return {
          ...request,
          stage_history_count: stage_count || 0,
          documents_count: doc_count || 0,
          days_in_current_stage,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: enrichedRequests,
      meta: {
        page,
        limit,
        total: count,
        total_pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
