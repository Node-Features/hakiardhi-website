/**
 * Featured News Endpoint
 * GET /api/public/portal/news/featured
 *
 * Returns featured news items for homepage display
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';
import { apiResponse, errorResponse } from '@/lib/portal/helpers';

const db = supabase(false);

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await db
      .from('mv_news_events_list')
      .select('*')
      .eq('is_featured', true)
      .order('date', { ascending: false })
      .limit(4);

    if (error) throw error;

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching featured news:', error);
    return errorResponse('Failed to fetch featured news', 'NEWS_ERROR', 500);
  }
}
