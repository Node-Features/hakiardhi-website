/**
 * Organization Milestones Endpoint
 * GET /api/public/portal/about/milestones
 *
 * Returns organization milestones/timeline
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';
import { apiResponse, errorResponse } from '@/lib/portal/helpers';

const db = supabase(false);

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await db
      .from('organization_milestones')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching milestones:', error);
    return errorResponse('Failed to fetch milestones', 'MILESTONES_ERROR', 500);
  }
}
