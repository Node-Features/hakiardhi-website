/**
 * Legal Aid Stats Endpoint
 * GET /api/public/portal/legal-aid/stats
 *
 * Returns legal aid statistics using materialized view
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';
import { apiResponse, errorResponse } from '@/lib/portal/helpers';

const db = supabase(false);

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await db
      .from('mv_legal_aid_stats')
      .select('*')
      .single();

    if (error) throw error;

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching legal aid stats:', error);
    return errorResponse('Failed to fetch legal aid statistics', 'STATS_ERROR', 500);
  }
}
