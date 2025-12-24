/**
 * Portfolio Item Detail Endpoint
 * GET /api/public/portal/portfolio/[slug]
 *
 * Returns detailed portfolio item information by slug
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
      .from('portfolio_items')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('Portfolio item not found', 'NOT_FOUND', 404);
      }
      throw error;
    }

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching portfolio item:', error);
    return errorResponse('Failed to fetch portfolio item', 'PORTFOLIO_ERROR', 500);
  }
}
