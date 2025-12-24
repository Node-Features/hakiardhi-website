/**
 * LRM Roles Endpoint
 * GET /api/public/portal/lrm/roles
 *
 * Returns active LRM roles/positions
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';
import { apiResponse, errorResponse } from '@/lib/portal/helpers';

const db = supabase(false);

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await db
      .from('lrm_roles')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching LRM roles:', error);
    return errorResponse('Failed to fetch LRM roles', 'LRM_ERROR', 500);
  }
}
