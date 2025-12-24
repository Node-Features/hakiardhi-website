/**
 * LRM Application Endpoint
 * POST /api/public/portal/lrm/apply
 *
 * Allows public to apply to become an LRM
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';
import { apiResponse, errorResponse } from '@/lib/portal/helpers';
import { PortalValidation } from '@/lib/portal/validation';
import { formatZodError } from '@/utils/error_formatter';

const db = supabase(false);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = PortalValidation.LRMApplication.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const { data, error } = await db
      .from('lrm_applications')
      .insert({
        ...parsed.data,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) throw error;

    return apiResponse(
      {
        success: true,
        application_id: data.id,
        message: 'Your application has been submitted successfully. We will review it and contact you.',
      },
      null,
      201
    );
  } catch (error: any) {
    console.error('Error submitting LRM application:', error);
    return errorResponse('Failed to submit application', 'APPLICATION_ERROR', 500);
  }
}
