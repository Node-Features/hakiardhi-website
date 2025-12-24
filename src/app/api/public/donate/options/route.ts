/**
 * Payment Methods Endpoint
 * GET /api/public/portal/donate/options
 *
 * Returns available payment methods for donations
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';
import { apiResponse, errorResponse } from '@/lib/portal/helpers';

const db = supabase(false);

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await db
      .from('payment_methods')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching payment methods:', error);
    return errorResponse('Failed to fetch payment methods', 'PAYMENT_ERROR', 500);
  }
}
