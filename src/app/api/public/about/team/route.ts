/**
 * Team Members Endpoint
 * GET /api/public/portal/about/team
 *
 * Returns team members organized by member type
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';
import { apiResponse, errorResponse } from '@/lib/portal/helpers';

const db = supabase(false);

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await db
      .from('team_members')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    // Organize by member type
    const organized = {
      leadership: data.filter((m) => m.member_type === 'leadership'),
      board: data.filter((m) => m.member_type === 'board'),
      staff: data.filter((m) => m.member_type === 'staff'),
    };

    return apiResponse(organized);
  } catch (error: any) {
    console.error('Error fetching team members:', error);
    return errorResponse('Failed to fetch team members', 'TEAM_ERROR', 500);
  }
}
