/**
 * LRM Regions Endpoint
 * GET /api/public/portal/lrm/regions
 *
 * Returns LRM distribution by region using materialized view
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';
import { apiResponse, errorResponse } from '@/lib/portal/helpers';

const db = supabase(false);

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await db
      .from('mv_lrm_by_region')
      .select('*')
      .order('lrm_count', { ascending: false });

    if (error) throw error;

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching LRM regions:', error);
    return errorResponse('Failed to fetch LRM regions', 'LRM_ERROR', 500);
  }
}
