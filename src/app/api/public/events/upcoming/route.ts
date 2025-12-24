/**
 * Upcoming Events Endpoint
 * GET /api/public/portal/events/upcoming
 *
 * Returns upcoming events (future-dated events)
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';
import { apiResponse, errorResponse, getTodayISO } from '@/lib/portal/helpers';

const db = supabase(false);

export async function GET(request: NextRequest) {
  try {
    const today = getTodayISO();

    const { data, error } = await db
      .from('mv_news_events_list')
      .select('*')
      .eq('type', 'Event')
      .gte('date', today)
      .order('date', { ascending: true })
      .limit(10);

    if (error) throw error;

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching upcoming events:', error);
    return errorResponse('Failed to fetch upcoming events', 'EVENTS_ERROR', 500);
  }
}
