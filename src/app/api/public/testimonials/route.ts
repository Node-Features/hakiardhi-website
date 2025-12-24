/**
 * Testimonials Endpoint
 * GET /api/public/portal/testimonials
 *
 * Returns published testimonials with optional featured filter
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';
import { apiResponse, errorResponse, getQueryParams, parseBoolean } from '@/lib/portal/helpers';

const db = supabase(false);

export async function GET(request: NextRequest) {
  try {
    const params = getQueryParams(request);
    const featured = parseBoolean(params.featured);

    let query = db.from('testimonials').select('*').eq('is_published', true);

    if (featured) {
      query = query.eq('is_featured', true).limit(3);
    }

    query = query.order('display_order', { ascending: true });

    const { data, error } = await query;

    if (error) throw error;

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching testimonials:', error);
    return errorResponse('Failed to fetch testimonials', 'TESTIMONIALS_ERROR', 500);
  }
}
