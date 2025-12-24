/**
 * FAQs Endpoint
 * GET /api/public/portal/faqs
 *
 * Returns frequently asked questions with filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';
import { apiResponse, errorResponse, getQueryParams } from '@/lib/portal/helpers';
import { PortalValidation } from '@/lib/portal/validation';
import { formatZodError } from '@/utils/error_formatter';

const db = supabase(false);

export async function GET(request: NextRequest) {
  try {
    const params = getQueryParams(request);
    const parsed = PortalValidation.FAQFilter.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const { category, search, featured } = parsed.data;

    let query = db.from('faqs').select('*').eq('is_active', true);

    if (category) {
      query = query.eq('category', category);
    }
    if (search) {
      query = query.or(`question.ilike.%${search}%,response.ilike.%${search}%`);
    }
    if (featured !== undefined) {
      query = query.eq('is_featured', featured);
    }

    query = query.order('display_order', { ascending: true });

    const { data, error } = await query;

    if (error) throw error;

    return apiResponse(data);
  } catch (error: any) {
    console.error('Error fetching FAQs:', error);
    return errorResponse('Failed to fetch FAQs', 'FAQ_ERROR', 500);
  }
}
