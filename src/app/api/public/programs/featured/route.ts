/**
 * Featured Programs Endpoint
 * GET /api/public/portal/programs/featured
 *
 * Returns featured programs for homepage display
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';
import { apiResponse, errorResponse } from '@/lib/portal/helpers';

const db = supabase(false);

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await db
      .from('mv_featured_programs')
      .select('*')
      .limit(6);

    if (error) throw error;

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching featured programs:', error);
    return errorResponse('Failed to fetch featured programs', 'PROGRAMS_ERROR', 500);
  }
}
