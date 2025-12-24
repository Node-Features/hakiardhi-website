/**
 * Portfolio List Endpoint
 * GET /api/public/portal/portfolio
 *
 * Returns list of portfolio items with filtering, sorting, and pagination
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
    const parsed = PortalValidation.PortfolioFilter.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const { page, limit, sort, order, search, category, type, year, featured } = parsed.data;
    const offset = (page - 1) * limit;

    let query = db.from('mv_portfolio_list').select('*', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (type) {
      query = query.eq('type', type);
    }
    if (year) {
      query = query.eq('year', year);
    }
    if (featured !== undefined) {
      query = query.eq('is_featured', featured);
    }

    query = query
      .order(sort || 'created_at', { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return apiResponse(data, getPaginationMeta(count || 0, page, limit));
  } catch (error: any) {
    console.error('Error fetching portfolio:', error);
    return errorResponse('Failed to fetch portfolio', 'PORTFOLIO_ERROR', 500);
  }
}
