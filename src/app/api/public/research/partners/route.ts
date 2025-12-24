/**
 * Research Partners Endpoint
 * GET /api/public/portal/research/partners
 *
 * Returns active research partners
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';
import { apiResponse, errorResponse } from '@/lib/portal/helpers';

const db = supabase(false);

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await db
      .from('research_partners')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching research partners:', error);
    return errorResponse('Failed to fetch research partners', 'PARTNERS_ERROR', 500);
  }
}
