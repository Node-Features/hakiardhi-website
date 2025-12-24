/**
 * Publications List Endpoint
 * GET /api/public/portal/publications
 *
 * Returns list of publications with filtering, sorting, and pagination
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
    const parsed = PortalValidation.PublicationsFilter.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const { page, limit, sort, order, search, type, topic, year, featured } = parsed.data;
    const offset = (page - 1) * limit;

    let query = db
      .from('publications')
      .select(
        'id, title, authors, publication_date, type, topics, abstract, download_url, cover_image, downloads, views, is_featured, pdf_size, pages',
        { count: 'exact' }
      )
      .eq('is_published', true);

    if (search) {
      query = query.or(`title.ilike.%${search}%,abstract.ilike.%${search}%`);
    }
    if (type) {
      query = query.eq('type', type);
    }
    if (topic) {
      query = query.contains('topics', [topic]);
    }
    if (year) {
      query = query
        .gte('publication_date', `${year}-01-01`)
        .lte('publication_date', `${year}-12-31`);
    }
    if (featured !== undefined) {
      query = query.eq('is_featured', featured);
    }

    query = query
      .order(sort || 'publication_date', { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return apiResponse(data, getPaginationMeta(count || 0, page, limit));
  } catch (error: any) {
    console.error('Error fetching publications:', error);
    return errorResponse('Failed to fetch publications', 'PUBLICATIONS_ERROR', 500);
  }
}
