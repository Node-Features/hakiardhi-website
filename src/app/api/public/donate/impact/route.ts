/**
 * Donation Impact Endpoint
 * GET /api/public/portal/donate/impact
 *
 * Returns donation impact information
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';
import { apiResponse, errorResponse } from '@/lib/portal/helpers';

const db = supabase(false);

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await db
      .from('donation_impact')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching donation impact:', error);
    return errorResponse('Failed to fetch donation impact', 'IMPACT_ERROR', 500);
  }
}
