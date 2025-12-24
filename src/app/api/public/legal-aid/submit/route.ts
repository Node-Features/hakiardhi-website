/**
 * Legal Aid Case Submission Endpoint
 * POST /api/public/portal/legal-aid/submit
 *
 * Allows public to submit legal aid requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';
import { apiResponse, errorResponse, generateReferenceNumber } from '@/lib/portal/helpers';
import { PortalValidation } from '@/lib/portal/validation';
import { formatZodError } from '@/utils/error_formatter';

const db = supabase(false);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = PortalValidation.CaseSubmission.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    // Generate reference number
    const reference_number = generateReferenceNumber('LA');

    const { data, error } = await db
      .from('cases')
      .insert({
        title: `Legal Aid Request - ${parsed.data.case_type}`,
        reference_number,
        description: parsed.data.description,
        status: 'Open',
        // Store contact info in metadata or create related contact record
      })
      .select('id, reference_number')
      .single();

    if (error) throw error;

    return apiResponse(
      {
        success: true,
        reference_number: data.reference_number,
        message: 'Your case has been submitted successfully. You will be contacted soon.',
      },
      null,
      201
    );
  } catch (error: any) {
    console.error('Error submitting legal aid case:', error);
    return errorResponse('Failed to submit case', 'SUBMISSION_ERROR', 500);
  }
}
