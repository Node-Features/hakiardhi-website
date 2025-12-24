/**
 * LRM Stats Endpoint
 * GET /api/public/portal/lrm/stats
 *
 * Returns LRM impact statistics using materialized view
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';
import { apiResponse, errorResponse } from '@/lib/portal/helpers';

const db = supabase(false);

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await db
      .from('mv_lrm_impact_stats')
      .select('*')
      .single();

    if (error) throw error;

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching LRM stats:', error);
    return errorResponse('Failed to fetch LRM statistics', 'LRM_ERROR', 500);
  }
}
