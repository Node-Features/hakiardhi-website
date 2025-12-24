/**
 * Portal Stats Endpoint
 * GET /api/public/portal/stats
 *
 * Returns home page statistics using materialized view
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';
import { apiResponse, errorResponse } from '@/lib/portal/helpers';

const db = supabase(false);

export async function GET(request: NextRequest) {
  try {
    // Use materialized view for performance
    const { data, error } = await db
      .from('mv_home_page_stats')
      .select('*')
      .single();

    if (error) throw error;

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return errorResponse('Failed to fetch statistics', 'STATS_ERROR', 500);
  }
}
