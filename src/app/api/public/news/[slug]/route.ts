/**
 * News Detail Endpoint
 * GET /api/public/portal/news/[slug]
 *
 * Returns detailed news/event information by slug and increments view count
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
      .from('mv_news_events_list')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('News item not found', 'NOT_FOUND', 404);
      }
      throw error;
    }

    // Increment view count
    await db.rpc('increment_blog_views', { blog_id: data.id });

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching news item:', error);
    return errorResponse('Failed to fetch news item', 'NEWS_ERROR', 500);
  }
}
