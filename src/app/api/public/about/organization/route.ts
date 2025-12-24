/**
 * Organization Info Endpoint
 * GET /api/public/portal/about/organization
 *
 * Returns organization content (vision, mission, values, etc.)
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';
import { apiResponse, errorResponse } from '@/lib/portal/helpers';

const db = supabase(false);

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await db
      .from('organization_content')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    // Organize data by content type
    const organized = {
      vision: data.find((d) => d.content_type === 'vision'),
      mission: data.find((d) => d.content_type === 'mission'),
      who_we_are: data.find((d) => d.content_type === 'who_we_are'),
      core_values: data.filter((d) => d.content_type === 'value'),
      history: data.find((d) => d.content_type === 'history'),
    };

    return apiResponse(organized);
  } catch (error: any) {
    console.error('Error fetching organization info:', error);
    return errorResponse('Failed to fetch organization info', 'ORG_ERROR', 500);
  }
}
