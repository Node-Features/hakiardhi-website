/**
 * Research Stats Endpoint
 * GET /api/public/portal/research/stats
 *
 * Returns research statistics using materialized view
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';
import { apiResponse, errorResponse } from '@/lib/portal/helpers';

const db = supabase(false);

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await db
      .from('mv_research_stats')
      .select('*')
      .single();

    if (error) throw error;

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching research stats:', error);
    return errorResponse('Failed to fetch research statistics', 'STATS_ERROR', 500);
  }
}
