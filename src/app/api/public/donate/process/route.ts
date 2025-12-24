/**
 * Process Donation Endpoint
 * POST /api/public/portal/donate/process
 *
 * Initiates a donation and returns payment URL
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
    const parsed = PortalValidation.DonationRequest.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    // Create donation record
    const { data, error } = await db
      .from('donations')
      .insert({
        ...parsed.data,
        status: 'pending',
      })
      .select('id, transaction_reference')
      .single();

    if (error) throw error;

    // Get payment gateway URL from environment variable
    // The actual payment gateway integration should generate a unique payment URL
    const paymentGatewayUrl = process.env.PAYMENT_GATEWAY_URL || '';
    const payment_url = paymentGatewayUrl
      ? `${paymentGatewayUrl}/pay/${data.transaction_reference}`
      : null;

    return apiResponse(
      {
        success: true,
        transaction_reference: data.transaction_reference,
        payment_url,
        message: 'Donation initiated. Please complete payment.',
      },
      null,
      201
    );
  } catch (error: any) {
    console.error('Error processing donation:', error);
    return errorResponse('Failed to process donation', 'DONATION_ERROR', 500);
  }
}
