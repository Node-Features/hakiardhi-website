/**
 * Program Detail Endpoint
 * GET /api/public/portal/programs/[slug]
 *
 * Returns detailed program information by slug
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';
import { apiResponse, errorResponse } from '@/lib/portal/helpers';

const db = supabase(false);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const { data, error } = await db
      .from('mv_programs_list')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('Program not found', 'NOT_FOUND', 404);
      }
      throw error;
    }

    // Optionally fetch related activities
    const { data: activities } = await db
      .from('activities')
      .select('id, name, status, start_date, end_date')
      .eq('project_id', data.id)
      .order('start_date', { ascending: false })
      .limit(10);

    return apiResponse({
      ...data,
      activities: activities || [],
    });
  } catch (error: any) {
    console.error('Error fetching program:', error);
    return errorResponse('Failed to fetch program', 'PROGRAM_ERROR', 500);
  }
}
