/**
 * Gallery Endpoint
 * GET /api/public/portal/gallery
 *
 * Returns published gallery items with filtering and pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';
import { apiResponse, errorResponse, getQueryParams, getPaginationMeta } from '@/lib/portal/helpers';
import { PortalValidation } from '@/lib/portal/validation';
import { formatZodError } from '@/utils/error_formatter';

const db = supabase(false);

export async function GET(request: NextRequest) {
  try {
    const params = getQueryParams(request);
    const parsed = PortalValidation.GalleryFilter.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const { page, limit, category, project_id, featured } = parsed.data;
    const offset = (page - 1) * limit;

    let query = db
      .from('gallery_items')
      .select('*', { count: 'exact' })
      .eq('is_published', true);

    if (category) {
      query = query.eq('category', category);
    }
    if (project_id) {
      query = query.eq('project_id', project_id);
    }
    if (featured !== undefined) {
      query = query.eq('is_featured', featured);
    }

    query = query
      .order('taken_date', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return apiResponse(data, getPaginationMeta(count || 0, page, limit));
  } catch (error: any) {
    console.error('Error fetching gallery:', error);
    return errorResponse('Failed to fetch gallery', 'GALLERY_ERROR', 500);
  }
}
