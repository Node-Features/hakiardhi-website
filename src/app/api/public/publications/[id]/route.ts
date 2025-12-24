/**
 * Publication Detail Endpoint
 * GET /api/public/portal/publications/[id]
 *
 * Returns detailed publication information by ID and increments view count
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';
import { apiResponse, errorResponse } from '@/lib/portal/helpers';

const db = supabase(false);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await db
      .from('publications')
      .select('*')
      .eq('id', id)
      .eq('is_published', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('Publication not found', 'NOT_FOUND', 404);
      }
      throw error;
    }

    // Increment view count
    await db.rpc('increment_publication_views', { pub_id: id });

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching publication:', error);
    return errorResponse('Failed to fetch publication', 'PUBLICATION_ERROR', 500);
  }
}
