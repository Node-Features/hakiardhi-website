/**
 * Contact Form Submission Endpoint
 * POST /api/public/portal/contact/submit
 *
 * Allows public to submit contact form messages
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
    const parsed = PortalValidation.ContactForm.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const { data, error } = await db
      .from('contact_submissions')
      .insert({
        ...parsed.data,
        status: 'pending',
      })
      .select('id, ticket_number')
      .single();

    if (error) throw error;

    return apiResponse(
      {
        success: true,
        ticket_id: data.ticket_number,
        message: 'Your message has been received. We will respond within 24-48 hours.',
      },
      null,
      201
    );
  } catch (error: any) {
    console.error('Error submitting contact form:', error);
    return errorResponse('Failed to submit message', 'CONTACT_ERROR', 500);
  }
}
