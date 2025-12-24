/**
 * Newsletter Subscription Endpoint
 * POST /api/public/portal/newsletter/subscribe
 *
 * Allows public to subscribe to newsletter
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
    const parsed = PortalValidation.Newsletter.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const { data: existing } = await db
      .from('newsletter_subscriptions')
      .select('id, status')
      .eq('email', parsed.data.email)
      .single();

    if (existing) {
      if (existing.status === 'active') {
        return errorResponse('Email already subscribed', 'ALREADY_SUBSCRIBED', 409);
      }
      // Reactivate subscription
      await db
        .from('newsletter_subscriptions')
        .update({ status: 'active', subscribed_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await db.from('newsletter_subscriptions').insert({
        ...parsed.data,
        status: 'active',
      });
    }

    return apiResponse(
      {
        success: true,
        message: 'Successfully subscribed to newsletter.',
      },
      null,
      201
    );
  } catch (error: any) {
    console.error('Error subscribing to newsletter:', error);
    return errorResponse('Failed to subscribe', 'NEWSLETTER_ERROR', 500);
  }
}
